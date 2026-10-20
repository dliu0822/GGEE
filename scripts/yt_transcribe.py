#!/usr/bin/env python3
"""把 YouTube 影片的語音轉成文字檔（.txt）與 Markdown（.md）。

流程：
  1. 先嘗試抓 YouTube 既有字幕（人工字幕優先，其次自動字幕）—— 快、免費、不需 GPU。
  2. 沒有字幕（或加上 --whisper）時，下載音檔並用 faster-whisper 在本機語音辨識。

安裝：
  pip install yt-dlp faster-whisper
  （另需 ffmpeg：macOS `brew install ffmpeg`、Windows `winget install ffmpeg`）

用法：
  python scripts/yt_transcribe.py "https://www.youtube.com/watch?v=K6B-imCYvO0"
  python scripts/yt_transcribe.py URL --whisper --model medium --lang zh
  python scripts/yt_transcribe.py URL -o transcripts
  python scripts/yt_transcribe.py URL1 URL2 URL3   # 一次轉多支
"""

import argparse
import glob
import os
import re
import sys
import tempfile

SUB_LANGS = ["zh-TW", "zh-Hant", "zh", "zh-Hans", "zh-CN", "en"]


def fmt_ts(seconds: float) -> str:
    s = int(seconds)
    return f"{s // 3600:02d}:{s % 3600 // 60:02d}:{s % 60:02d}"


def parse_vtt_ts(ts: str) -> float:
    parts = ts.replace(",", ".").split(":")
    parts = [0.0] * (3 - len(parts)) + [float(p) for p in parts]
    return parts[0] * 3600 + parts[1] * 60 + parts[2]


def parse_vtt(path: str):
    """回傳 [(start_seconds, text), ...]，並去除自動字幕常見的逐字重複。"""
    segments, seen = [], set()
    with open(path, encoding="utf-8") as f:
        blocks = f.read().split("\n\n")
    for block in blocks:
        lines = block.strip().splitlines()
        ts_line = next((l for l in lines if "-->" in l), None)
        if not ts_line:
            continue
        start = parse_vtt_ts(ts_line.split("-->")[0].strip())
        for line in lines[lines.index(ts_line) + 1:]:
            text = re.sub(r"<[^>]+>", "", line).strip()
            if text and text not in seen:
                seen.add(text)
                segments.append((start, text))
    return segments


def fetch_info(url: str):
    import yt_dlp

    with yt_dlp.YoutubeDL({"quiet": True, "skip_download": True}) as ydl:
        return ydl.extract_info(url, download=False)


def try_subtitles(url: str, info: dict, workdir: str):
    import yt_dlp

    manual = info.get("subtitles") or {}
    auto = info.get("automatic_captions") or {}
    for source, auto_flag in ((manual, False), (auto, True)):
        lang = next((l for l in SUB_LANGS if l in source), None)
        if not lang:
            continue
        opts = {
            "quiet": True,
            "skip_download": True,
            "writesubtitles": not auto_flag,
            "writeautomaticsub": auto_flag,
            "subtitleslangs": [lang],
            "subtitlesformat": "vtt",
            "outtmpl": os.path.join(workdir, "sub.%(ext)s"),
        }
        with yt_dlp.YoutubeDL(opts) as ydl:
            ydl.download([url])
        files = glob.glob(os.path.join(workdir, "sub*.vtt"))
        if files:
            kind = "YouTube 自動字幕" if auto_flag else "YouTube 字幕"
            return parse_vtt(files[0]), f"{kind}（{lang}）"
    return None, None


def whisper_transcribe(url: str, workdir: str, model_size: str, lang: str | None):
    import yt_dlp
    from faster_whisper import WhisperModel

    opts = {
        "quiet": True,
        "format": "bestaudio/best",
        "outtmpl": os.path.join(workdir, "audio.%(ext)s"),
        "postprocessors": [{"key": "FFmpegExtractAudio", "preferredcodec": "mp3"}],
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        ydl.download([url])
    audio = glob.glob(os.path.join(workdir, "audio.*"))[0]

    print(f"語音辨識中（faster-whisper {model_size}），長影片需要一些時間…", file=sys.stderr)
    model = WhisperModel(model_size, device="auto", compute_type="auto")
    segs, detected = model.transcribe(audio, language=lang, vad_filter=True)
    segments = [(s.start, s.text.strip()) for s in segs if s.text.strip()]
    return segments, f"Whisper {model_size}（語言：{detected.language}）"


def write_outputs(info: dict, url: str, segments, source: str, outdir: str):
    os.makedirs(outdir, exist_ok=True)
    title = info.get("title") or info.get("id", "transcript")
    safe = re.sub(r'[\\/:*?"<>|]+', "_", title).strip()[:80] or "transcript"
    base = os.path.join(outdir, safe)

    with open(base + ".txt", "w", encoding="utf-8") as f:
        f.write("\n".join(text for _, text in segments) + "\n")

    video_id = info.get("id", "")
    md = [
        f"# {title}",
        "",
        f"- 來源：{url}",
        f"- 頻道：{info.get('channel') or info.get('uploader', '')}",
        f"- 長度：{fmt_ts(info.get('duration') or 0)}",
        f"- 轉錄方式：{source}",
        "",
        "## 逐字稿",
        "",
    ]
    for start, text in segments:
        link = f"https://youtu.be/{video_id}?t={int(start)}"
        md.append(f"- [{fmt_ts(start)}]({link}) {text}")
    with open(base + ".md", "w", encoding="utf-8") as f:
        f.write("\n".join(md) + "\n")

    return base + ".txt", base + ".md"


def main():
    p = argparse.ArgumentParser(description="YouTube 影片轉文字（.txt + .md）")
    p.add_argument("urls", nargs="+", metavar="URL")
    p.add_argument("-o", "--outdir", default="transcripts")
    p.add_argument("--whisper", action="store_true", help="略過 YouTube 字幕，強制用 Whisper 辨識")
    p.add_argument("--model", default="small", help="Whisper 模型：tiny/base/small/medium/large-v3")
    p.add_argument("--lang", default=None, help="語言代碼，例如 zh、en（預設自動偵測）")
    args = p.parse_args()

    failed = []
    for url in args.urls:
        print(f"處理：{url}", file=sys.stderr)
        try:
            info = fetch_info(url)
            with tempfile.TemporaryDirectory() as workdir:
                segments, source = (None, None) if args.whisper else try_subtitles(url, info, workdir)
                if not segments:
                    segments, source = whisper_transcribe(url, workdir, args.model, args.lang)
            txt, md = write_outputs(info, url, segments, source, args.outdir)
            print(f"完成（{source}）：\n  {txt}\n  {md}")
        except Exception as e:
            print(f"失敗：{url}：{e}", file=sys.stderr)
            failed.append(url)
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
