/**
 * ZenTube — Feature: Time Tracker
 * Tracks time spent on YouTube per session and per day.
 * Stores data in chrome.storage.local (not synced, stays local).
 */

let _sessionStart = null;
let _trackingActive = false;

function applyTimeTracker(settings) {
  if (settings.timeTracker) {
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
  _sessionStart = Date.now();

  document.addEventListener('visibilitychange', _handleVisibility);
  window.addEventListener('beforeunload', _flushSession);

  console.log('[ZenTube] Time tracking started.');
}

function _stopTracking() {
  if (!_trackingActive) return;
  _flushSession();
  _trackingActive = false;
  document.removeEventListener('visibilitychange', _handleVisibility);
  window.removeEventListener('beforeunload', _flushSession);
}

function _handleVisibility() {
  if (document.hidden) {
    _flushSession();
    _sessionStart = null;
  } else {
    _sessionStart = Date.now();
  }
}

function _flushSession() {
  if (!_sessionStart) return;

  const elapsed = Math.floor((Date.now() - _sessionStart) / 1000); // seconds
  _sessionStart = null;

  if (elapsed < 2) return;

  const key = _getTodayKey();
  chrome.storage.local.get({ [key]: 0, 'zen_session_seconds': 0 }, (data) => {
    chrome.storage.local.set({
      [key]: data[key] + elapsed,
      'zen_session_seconds': data['zen_session_seconds'] + elapsed,
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
      let total = data[key];
      // Add time spent in current active session for live updates
      if (_sessionStart) {
        total += Math.floor((Date.now() - _sessionStart) / 1000);
      }
      resolve(total);
    });
  });
}
