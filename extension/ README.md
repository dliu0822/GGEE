# AI Usage Tracker (Chrome Extension)

Reads the usage bars already shown on claude.ai and gemini.google.com while you're
logged in, and shows them together in one popup.

## Install (unpacked)

1. Open `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select this `extension/` folder
5. Open claude.ai and/or gemini.google.com in a tab so the content script can read
   the usage bars, then click the extension icon to see the popup

## Notes

- Data only updates while the relevant tab is open and the usage UI is visible
  on screen (e.g. on Claude, open the usage indicator in the sidebar).
- These are unofficial DOM selectors. If Anthropic or Google change their page
  markup, the selectors in `content-claude.js` / `content-gemini.js` will need
  updating.
