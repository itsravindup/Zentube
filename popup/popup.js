/**
 * ZenTube — Popup Controller
 * Manages UI state, settings sync, and all interactions.
 */

/* ── DOM references ───────────────────────────────────────────── */
const body          = document.body;
const masterToggle  = document.getElementById('focusMode');
const keywordInput  = document.getElementById('keywordInput');
const addKeywordBtn = document.getElementById('addKeyword');
const keywordTags   = document.getElementById('keywordTags');
const keywordCount  = document.getElementById('keywordCount');

const channelInput  = document.getElementById('channelInput');
const addChannelBtn = document.getElementById('addChannel');
const channelTags   = document.getElementById('channelTags');
const channelCount  = document.getElementById('channelCount');

const todayUsageDesc = document.getElementById('todayUsageDesc');
const openOptionsBtn = document.getElementById('openOptions');

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
  masterToggle.checked = !!_settings.focusMode;
  updateFocusModeAppearance(_settings.focusMode);

  // Feature toggles
  TOGGLE_KEYS.forEach(key => {
    const el = document.getElementById(key);
    if (el) el.checked = !!_settings[key];
  });

  // Tags
  renderTags(keywordTags, _settings.blockedKeywords || [], 'keyword');
  renderTags(channelTags, _settings.blockedChannels || [], 'channel');
  
  // Update counts
  updateCounts();
}

/* ── Focus Mode visual state ──────────────────────────────────── */
function updateFocusModeAppearance(active) {
  if (active) {
    body.classList.remove('focus-mode-off');
  } else {
    body.classList.add('focus-mode-off');
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
    const tag = document.createElement('div');
    tag.className = 'zen-tag';

    const label = document.createElement('span');
    label.textContent = item;

    const removeBtn = document.createElement('span');
    removeBtn.className = 'material-symbols-outlined tag-remove';
    removeBtn.textContent = 'close';
    removeBtn.title = `Remove "${item}"`;
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeItem(type, idx);
    });

    tag.appendChild(label);
    tag.appendChild(removeBtn);
    container.appendChild(tag);
  });
  updateCounts();
}

function updateCounts() {
  if (keywordCount) {
    const count = (_settings.blockedKeywords || []).length;
    keywordCount.textContent = `${count} active`;
  }
  if (channelCount) {
    const count = (_settings.blockedChannels || []).length;
    channelCount.textContent = `${count} active`;
  }
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

  // Feature toggles + Row Click
  TOGGLE_KEYS.forEach(key => {
    const el = document.getElementById(key);
    const row = document.getElementById(`row-${key}`);
    
    if (el) {
      el.addEventListener('change', () => {
        _settings[key] = el.checked;
        persist();
      });
    }
    
    if (row && el) {
      row.addEventListener('click', (e) => {
        // Prevent recursive clicks if the checkbox itself was clicked
        if (e.target.tagName !== 'INPUT' && !e.target.closest('.zen-switch')) {
          el.checked = !el.checked;
          el.dispatchEvent(new Event('change'));
        }
      });
    }
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

  // Options page
  if (openOptionsBtn) {
    openOptionsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }
}

/* ── Save to storage ──────────────────────────────────────────── */
async function persist() {
  await saveSettings(_settings);
}

/* ── Boot ──────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', init);
