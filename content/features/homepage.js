const QUOTES = [
  "Focus on the step, not the mountain.",
  "Breathe. One intention at a time.",
  "Quality is pride of workmanship.",
  "Silence is the sleep that nourishes wisdom.",
  "Don't busy yourself, focus yourself.",
  "A journey of a thousand miles begins with a single step."
];

function applyHideHomepage(settings) {
  const isHomePage = window.location.pathname === '/' || window.location.pathname === '/index.html';
  
  if (settings.focusMode && settings.hideHomepage && isHomePage) {
    _injectFocusHomepage();
  } else {
    _removeFocusHomepage();
  }
}

function _injectFocusHomepage() {
  if (document.getElementById('zen-focus-iframe')) return;

  // 1. Hide the entire YouTube App container to remove ALL native UI
  injectStyle('zen-hide-all-yt', `
    ytd-app { display: none !important; }
    
    #zen-focus-iframe {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      border: none;
      z-index: 999999;
      background: #0e0e0e; /* Match lowest surface */
    }
  `);

  const iframe = document.createElement('iframe');
  iframe.id = 'zen-focus-iframe';
  iframe.src = chrome.runtime.getURL('focus-homepage/index.html');
  
  document.body.appendChild(iframe);
}

function _removeFocusHomepage() {
  removeStyle('zen-hide-all-yt');
  const el = document.getElementById('zen-focus-iframe');
  if (el) el.remove();
}
