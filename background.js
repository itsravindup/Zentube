/**
 * ModeTube — Background Service Worker
 * Minimal background script required by MV3.
 * Initializes default settings on first install.
 */

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    const defaults = {
      focusMode: true,
      hideHomepage: true,
      hideSidebarWatch: true,
      hideSidebarAll: false,
      hideShorts: true,
      hideComments: true,
      blurThumbnails: false,
      timeTracker: true,
      blockedKeywords: [],
      blockedChannels: []
    };
    chrome.storage.sync.set(defaults, () => {
      console.log('[ModeTube] Default settings initialized.');
    });
  }
});
