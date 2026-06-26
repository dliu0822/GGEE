function scrapeGeminiUsage() {
  const bar = document.querySelector('.progress-indicator-luminous');
  if (!bar) return null;

  const width = bar.style.width || '0%';
  const percentUsed = parseFloat(width) || 0;

  const resetEl = document.querySelector('.reset-time-luminous');
  const resetsAt = resetEl ? resetEl.textContent.trim() : null;

  return { percentUsed, resetsAt, updatedAt: Date.now() };
}

function update() {
  const data = scrapeGeminiUsage();
  if (data) {
    chrome.storage.local.set({ gemini: data });
  }
}

update();
const observer = new MutationObserver(() => update());
observer.observe(document.body, { childList: true, subtree: true });
setInterval(update, 30000);
