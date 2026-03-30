/**
 * ZenTube — Main Content Script Orchestrator
 * Loads settings, applies all features, and watches for YouTube SPA navigation.
 * Helpers (injectStyle, removeStyle) are provided by utils/helpers.js (loaded first).
 */

/* ─── Core Application Logic ──────────────────────────────────── */

let _currentSettings = null;
let _lastUrl = location.href;

/**
 * Apply all active features based on current settings.
 */
function applyAllFeatures(settings) {
  if (!settings.focusMode) {
    // Focus mode off — remove all zen styles
    removeStyle('zen-hide-homepage');
    removeStyle('zen-hide-sidebar');
    removeStyle('zen-hide-shorts');
    removeStyle('zen-hide-comments');
    removeStyle('zen-blur-thumbnails');
    removeStyle('zen-header-timer-style');
    _stopTracking();
    _removeZenHeaderTimer();
    applyZenTheme(settings); // This will handle logo removal
    return;
  }

  applyHideHomepage(settings);
  applyHideSidebar(settings);
  applyHideShorts(settings);
  applyHideComments(settings);
  applyBlurThumbnails(settings);
  applyZenTheme(settings); // Branding & Logo
  applyTimeTracker(settings);
  _handleVisibleTimer(settings);
  applyKeywordBlocking(settings);
  applyChannelBlocking(settings);
}

/* ─── Visible Timer Logic ─────────────────────────────────────── */

let _timerUpdateInterval = null;

function _handleVisibleTimer(settings) {
  if (settings.timeTracker && settings.focusMode) {
    _injectZenHeaderTimer();
    if (!_timerUpdateInterval) {
      _timerUpdateInterval = setInterval(_updateZenHeaderTimer, 1000);
    }
  } else {
    _removeZenHeaderTimer();
  }
}

function _injectZenHeaderTimer() {
  const headerEnd = document.querySelector('ytd-masthead #end');
  if (!headerEnd || document.getElementById('zen-header-timer')) return;

  injectStyle('zen-header-timer-style', `
    #zen-header-timer {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      margin-right: 12px;
      background: rgba(0, 200, 150, 0.08);
      border: 1px solid rgba(0, 200, 150, 0.2);
      border-radius: 20px;
      color: #00C896;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 500;
      user-select: none;
    }
  `);

  const timerEl = document.createElement('div');
  timerEl.id = 'zen-header-timer';
  timerEl.innerHTML = `<span>🧘</span><span id="zen-timer-display">00:00:00</span>`;
  
  // Insert before the buttons
  headerEnd.insertBefore(timerEl, headerEnd.firstChild);
  _updateZenHeaderTimer();
}

async function _updateZenHeaderTimer() {
  const display = document.getElementById('zen-timer-display');
  if (!display) return;

  const secondsTotal = await getTodayUsage();
  
  // Format as HH:MM:SS
  const h = Math.floor(secondsTotal / 3600);
  const m = Math.floor((secondsTotal % 3600) / 60);
  const s = secondsTotal % 60;
  
  const formatted = [h, m, s]
    .map(v => v < 10 ? '0' + v : v)
    .join(':');
  
  display.textContent = formatted;
}

function _removeZenHeaderTimer() {
  clearInterval(_timerUpdateInterval);
  _timerUpdateInterval = null;
  const el = document.getElementById('zen-header-timer');
  if (el) el.remove();
}

/**
 * Block videos whose title contains any blocked keyword.
 */
function applyKeywordBlocking(settings) {
  const keywords = settings.blockedKeywords || [];
  if (keywords.length === 0) return;

  const lowerKeywords = keywords.map(k => k.toLowerCase());

  const titleEls = document.querySelectorAll(
    'ytd-video-renderer #video-title, ytd-rich-item-renderer #video-title, ytd-compact-video-renderer #video-title'
  );

  titleEls.forEach(el => {
    const title = (el.textContent || '').toLowerCase();
    const matched = lowerKeywords.some(kw => title.includes(kw));
    const card = el.closest('ytd-video-renderer, ytd-rich-item-renderer, ytd-compact-video-renderer');
    if (card) {
      card.style.setProperty('display', matched ? 'none' : '', 'important');
    }
  });
}

/**
 * Block videos from blocked channels.
 */
function applyChannelBlocking(settings) {
  const channels = settings.blockedChannels || [];
  if (channels.length === 0) return;

  const lowerChannels = channels.map(c => c.toLowerCase());

  const channelEls = document.querySelectorAll(
    'ytd-video-renderer #channel-name a, ytd-rich-item-renderer #channel-name a, ytd-compact-video-renderer #channel-name a'
  );

  channelEls.forEach(el => {
    const name = (el.textContent || '').toLowerCase().trim();
    const matched = lowerChannels.some(ch => name.includes(ch));
    const card = el.closest('ytd-video-renderer, ytd-rich-item-renderer, ytd-compact-video-renderer');
    if (card) {
      card.style.setProperty('display', matched ? 'none' : '', 'important');
    }
  });
}

/* ─── Initialization ──────────────────────────────────────────── */

async function init() {
  _currentSettings = await getSettings();
  applyAllFeatures(_currentSettings);
  startMutationObserver();
}

/* ─── MutationObserver for SPA navigation ─────────────────────── */

let _observerDebounce = null;

function startMutationObserver() {
  const observer = new MutationObserver(() => {
    // Detect URL changes (YouTube SPA)
    if (location.href !== _lastUrl) {
      _lastUrl = location.href;
      clearTimeout(_observerDebounce);
      _observerDebounce = setTimeout(() => {
        applyAllFeatures(_currentSettings);
      }, 300);
      return;
    }

    // Reapply features on DOM mutations (new content loaded)
    clearTimeout(_observerDebounce);
    _observerDebounce = setTimeout(() => {
      applyAllFeatures(_currentSettings);
    }, 200);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/* ─── Live Settings Update from Popup ─────────────────────────── */

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;

  // Merge updated keys into current settings
  Object.keys(changes).forEach(key => {
    _currentSettings[key] = changes[key].newValue;
  });

  applyAllFeatures(_currentSettings);
});

/* ─── Boot ─────────────────────────────────────────────────────── */
init();
