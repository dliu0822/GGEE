function bar(label, percentUsed, resetsAt) {
  return `
    <div class="row">
      <div class="label"><span>${label}</span><span>${percentUsed}%</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${percentUsed}%"></div></div>
      ${resetsAt ? `<div class="reset">${resetsAt}</div>` : ''}
    </div>
  `;
}

function timeAgo(ts) {
  if (!ts) return '';
  const sec = Math.round((Date.now() - ts) / 1000);
  if (sec < 60) return `${sec}s ago`;
  return `${Math.round(sec / 60)}m ago`;
}

chrome.storage.local.get(['claude', 'gemini'], (data) => {
  const app = document.getElementById('app');
  let html = '';

  html += '<h2>Claude</h2>';
  if (data.claude) {
    if (data.claude.session) {
      html += bar('Session', data.claude.session.percentUsed, data.claude.session.resetsAt);
    }
    if (data.claude.weekly) {
      html += bar('Weekly', data.claude.weekly.percentUsed, data.claude.weekly.resetsAt);
    }
    html += `<div class="updated">Updated ${timeAgo(data.claude.updatedAt)}</div>`;
  } else {
    html += '<div class="empty">Open claude.ai to load data</div>';
  }

  html += '<h2>Gemini</h2>';
  if (data.gemini) {
    html += bar('Usage', data.gemini.percentUsed, data.gemini.resetsAt);
    html += `<div class="updated">Updated ${timeAgo(data.gemini.updatedAt)}</div>`;
  } else {
    html += '<div class="empty">Open gemini.google.com to load data</div>';
  }

  app.innerHTML = html;
});
