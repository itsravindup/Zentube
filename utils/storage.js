/**
 * ZenTube — Storage Utility
 * Handles reading/writing settings to chrome.storage.sync
 */

const ZEN_DEFAULTS = {
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

/**
 * Get all ZenTube settings, merged with defaults.
 * @returns {Promise<Object>} Resolved settings object
 */
function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(ZEN_DEFAULTS, (result) => {
      resolve(result);
    });
  });
}

/**
 * Save partial or full settings to chrome.storage.sync.
 * @param {Object} data - Key/value pairs to save
 * @returns {Promise<void>}
 */
function saveSettings(data) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(data, () => {
      resolve();
    });
  });
}
