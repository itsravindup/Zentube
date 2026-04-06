/**
 * ModeTube — Feature: Time Tracker
 * Tracks time spent on YouTube per session and per day.
 * Stores data in chrome.storage.local (not synced, stays local).
 */

let _trackingActive = false;
let _trackerInterval = null;
let _flushInterval = null;
let _pendingSeconds = 0;

function applyTimeTracker(settings) {
  if (settings.focusMode && settings.timeTracker) {
    _startTracking();
  } else {
    _stopTracking();
  }
}

function _getTodayKey() {
  const d = new Date();
  return `zen_usage_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
}

function _startTracking() {
  if (_trackingActive) return;
  _trackingActive = true;

  // Precisely measure active seconds by polling
  _trackerInterval = setInterval(() => {
    // Only accumulate time if strictly active and focused
    if (!document.hidden && document.hasFocus()) {
      _pendingSeconds++;
    }
  }, 1000);

  // Flush accumulated time to storage periodically
  _flushInterval = setInterval(() => {
    if (_pendingSeconds > 0) {
      _flushSession();
    }
  }, 3000); // Flush every 3 seconds for tight sync

  window.addEventListener('beforeunload', _flushSession);
  console.log('[ModeTube] Robust Time tracking started.');
}

function _stopTracking() {
  if (!_trackingActive) return;
  _flushSession();
  
  clearInterval(_trackerInterval);
  clearInterval(_flushInterval);
  _trackerInterval = null;
  _flushInterval = null;
  _trackingActive = false;
  
  window.removeEventListener('beforeunload', _flushSession);
}

function _flushSession() {
  if (_pendingSeconds === 0) return;
  
  const toAdd = _pendingSeconds;
  _pendingSeconds = 0; // Reset immediately to prevent double flush

  const key = _getTodayKey();
  chrome.storage.local.get({ [key]: 0, 'zen_session_seconds': 0 }, (data) => {
    chrome.storage.local.set({
      [key]: data[key] + toAdd,
      'zen_session_seconds': data['zen_session_seconds'] + toAdd,
      'zen_last_updated': Date.now()
    });
  });
}

/**
 * Retrieve today's usage in seconds.
 * @returns {Promise<number>} seconds spent today
 */
function getTodayUsage() {
  return new Promise((resolve) => {
    const key = _getTodayKey();
    chrome.storage.local.get({ [key]: 0 }, (data) => {
      resolve(data[key] + _pendingSeconds);
    });
  });
}
