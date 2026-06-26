function scrapeClaudeUsage() {
  const bars = Array.from(
    document.querySelectorAll('div[role="progressbar"][aria-label="Usage"]')
  );
  if (bars.length === 0) return null;

  const resetSpans = Array.from(document.querySelectorAll('span')).filter((el) =>
    el.textContent.trim().startsWith('Resets')
  );

  const entries = bars.map((bar, i) => ({
    percentUsed: Number(bar.getAttribute('aria-valuenow')) || 0,
    resetsAt: resetSpans[i] ? resetSpans[i].textContent.trim() : null
  }));

  return {
    session: entries[0] || null,
    weekly: entries[1] || null,
    updatedAt: Date.now()
  };
}

function update() {
  const data = scrapeClaudeUsage();
  if (data) {
    chrome.storage.local.set({ claude: data });
  }
}

update();
const observer = new MutationObserver(() => update());
observer.observe(document.body, { childList: true, subtree: true });
setInterval(update, 30000);
