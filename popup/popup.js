/**
 * ZenTube — Popup Controller
 * Manages UI state, settings sync, and all interactions.
 */

/* ── DOM references ───────────────────────────────────────────── */
const panel         = document.getElementById('zenPanel');
const masterToggle  = document.getElementById('focusMode');
const masterSection = document.getElementById('masterSection');
const featureControls = document.getElementById('featureControls');
const feedbackBanner  = document.getElementById('feedbackBanner');
const statusDot     = document.getElementById('statusDot');
const statusLabel   = document.getElementById('statusLabel');
const todayUsageDesc = document.getElementById('todayUsageDesc');

const keywordInput  = document.getElementById('keywordInput');
const addKeywordBtn = document.getElementById('addKeyword');
const keywordTags   = document.getElementById('keywordTags');

const channelInput  = document.getElementById('channelInput');
const addChannelBtn = document.getElementById('addChannel');
const channelTags   = document.getElementById('channelTags');

/* ── Toggle keys bound to checkboxes ─────────────────────────── */
const TOGGLE_KEYS = [
  'hideHomepage',
  'hideSidebarWatch',
  'hideShorts',
  'hideComments',
  'blurThumbnails',
  'timeTracker'
];

let _settings = {};
let _feedbackTimer = null;

/* ── Initialize popup ─────────────────────────────────────────── */
async function init() {
  _settings = await getSettings();
  renderUI();
  loadTodayUsage();
  bindListeners();
}

/* ── Render UI from settings ──────────────────────────────────── */
function renderUI() {
  // Master toggle
  masterToggle.checked = _settings.focusMode;
  updateFocusModeAppearance(_settings.focusMode);

  // Feature toggles
  TOGGLE_KEYS.forEach(key => {
    const el = document.getElementById(key);
    if (el) el.checked = !!_settings[key];
  });

  // Tags
  renderTags(keywordTags, _settings.blockedKeywords || [], 'keyword');
  renderTags(channelTags, _settings.blockedChannels || [], 'channel');
}

/* ── Focus Mode visual state ──────────────────────────────────── */
function updateFocusModeAppearance(active) {
  if (active) {
    panel.classList.remove('focus-off');
    masterSection.classList.add('is-active');
    statusDot.classList.add('is-active');
    statusLabel.textContent = 'Focus Active';
  } else {
    panel.classList.add('focus-off');
    masterSection.classList.remove('is-active');
    statusDot.classList.remove('is-active');
    statusLabel.textContent = 'Focus Off';
  }
}

/* ── Load and display today's usage ───────────────────────────── */
function loadTodayUsage() {
  const key = _getTodayKey();
  chrome.storage.local.get({ [key]: 0 }, (data) => {
    const seconds = data[key];
    if (seconds > 0) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      const label = mins > 0
        ? `Today: ${mins}m ${secs}s`
        : `Today: ${secs}s`;
      todayUsageDesc.textContent = label;
    }
  });
}

function _getTodayKey() {
  const d = new Date();
  return `zen_usage_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
}

/* ── Render tag pills ─────────────────────────────────────────── */
function renderTags(container, items, type) {
  container.innerHTML = '';
  items.forEach((item, idx) => {
    const tag = document.createElement('span');
    tag.className = 'zen-tag';

    const label = document.createElement('span');
    label.textContent = item;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'zen-tag__remove';
    removeBtn.innerHTML = '&times;';
    removeBtn.title = `Remove "${item}"`;
    removeBtn.addEventListener('click', () => removeItem(type, idx));

    tag.appendChild(label);
    tag.appendChild(removeBtn);
    container.appendChild(tag);
  });
}

/* ── Add / Remove items ────────────────────────────────────────── */
function addItem(type) {
  const input = type === 'keyword' ? keywordInput : channelInput;
  const key   = type === 'keyword' ? 'blockedKeywords' : 'blockedChannels';
  const container = type === 'keyword' ? keywordTags : channelTags;

  const value = input.value.trim();
  if (!value) return;

  const list = [...(_settings[key] || [])];
  if (list.includes(value)) {
    input.value = '';
    return;
  }

  list.push(value);
  _settings[key] = list;
  input.value = '';

  renderTags(container, list, type);
  persist();
}

function removeItem(type, idx) {
  const key = type === 'keyword' ? 'blockedKeywords' : 'blockedChannels';
  const container = type === 'keyword' ? keywordTags : channelTags;

  const list = [...(_settings[key] || [])];
  list.splice(idx, 1);
  _settings[key] = list;

  renderTags(container, list, type);
  persist();
}

/* ── Bind all event listeners ─────────────────────────────────── */
function bindListeners() {
  // Master toggle
  masterToggle.addEventListener('change', () => {
    _settings.focusMode = masterToggle.checked;
    updateFocusModeAppearance(_settings.focusMode);
    persist();
  });

  // Feature toggles
  TOGGLE_KEYS.forEach(key => {
    const el = document.getElementById(key);
    if (!el) return;
    el.addEventListener('change', () => {
      _settings[key] = el.checked;
      persist();
    });
  });

  // Keyword / Channel add buttons
  addKeywordBtn.addEventListener('click', () => addItem('keyword'));
  addChannelBtn.addEventListener('click', () => addItem('channel'));

  // Enter key on inputs
  keywordInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') addItem('keyword');
  });
  channelInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') addItem('channel');
  });
}

/* ── Save to storage + show feedback ──────────────────────────── */
async function persist() {
  await saveSettings(_settings);
  showFeedback();
}

function showFeedback() {
  feedbackBanner.classList.add('is-visible');
  clearTimeout(_feedbackTimer);
  _feedbackTimer = setTimeout(() => {
    feedbackBanner.classList.remove('is-visible');
  }, 2000);
}

/* ── Boot ──────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', init);
