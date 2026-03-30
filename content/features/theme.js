/**
 * ZenTube — Feature: Theme & Branding
 * Replaces YouTube logo with ZenTube and applies green accents.
 */

function applyZenTheme(settings) {
  if (settings.focusMode) {
    // 1. Loading bar and other green accents
    injectStyle('zen-theme-colors', `
      /* Loading bar */
      yt-page-navigation-progress #progress {
        background-color: #00C896 !important;
      }

      /* Logo replacement hiding original */
      ytd-logo svg, 
      ytd-logo .ytd-logo,
      #logo-icon,
      #country-code {
        display: none !important;
      }

      /* Custom ZenTube logo container */
      .zen-logo-replacement {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-left: 16px;
        cursor: pointer;
        user-select: none;
      }

      .zen-logo-z-box {
        width: 32px;
        height: 32px;
        background-color: #00C896;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Inter', sans-serif;
        font-weight: 900;
        font-size: 20px;
        color: #fff;
        line-height: 1;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        margin-right: 2px;
      }

      .zen-logo-text {
        font-family: 'Inter', sans-serif;
        font-weight: 700;
        font-size: 18px;
        letter-spacing: -0.5px;
        color: #00C896;
      }

      /* Badge / Count dots */
      .yt-spec-badge-shape--active,
      .ytd-notification-topbar-button-renderer .yt-spec-badge-shape {
        background-color: #00C896 !important;
        color: #000 !important;
      }

      /* Primary Buttons */
      .yt-spec-button-shape-next--filled.yt-spec-button-shape-next--mono {
        background-color: #00C896 !important;
        color: #000 !important;
      }

      /* Search Chips / Filters */
      yt-chip-cloud-chip-renderer[chip-style="STYLE_DEFAULT"][selected],
      yt-chip-cloud-chip-renderer[chip-style="STYLE_HOME_FILTER"][selected] {
        background-color: #00C896 !important;
        color: #000 !important;
      }

      /* Progress bars in thumbnails */
      #progress.ytd-thumbnail-overlay-resume-playback-renderer {
        background-color: #00C896 !important;
      }

      /* Toggle switches (YouTube's own) */
      tp-yt-paper-toggle-button[checked] .active.tp-yt-paper-toggle-button {
        background-color: #00C896 !important;
      }

      /* Custom logo text needs Inter font */
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap');
    `);

    _injectZenLogo();
  } else {
    removeStyle('zen-theme-colors');
    _removeZenLogo();
  }
}

function _injectZenLogo() {
  const logoContainer = document.querySelector('ytd-logo') || document.querySelector('#logo');
  if (!logoContainer || document.querySelector('.zen-logo-replacement')) return;

  const zenLogo = document.createElement('div');
  zenLogo.className = 'zen-logo-replacement';
  zenLogo.innerHTML = `
    <div class="zen-logo-z-box">Z</div>
    <span class="zen-logo-text">ZenTube</span>
  `;

  // Click logo to go home
  zenLogo.onclick = () => window.location.href = '/';

  logoContainer.appendChild(zenLogo);
}

function _removeZenLogo() {
  const zenLogo = document.querySelector('.zen-logo-replacement');
  if (zenLogo) zenLogo.remove();
}
