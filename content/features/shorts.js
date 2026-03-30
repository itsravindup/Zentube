/**
 * ZenTube — Feature: Hide Shorts
 * Hides YouTube Shorts shelf and any Shorts links.
 */

function applyHideShorts(settings) {
  if (!settings.focusMode) {
    removeStyle('zen-hide-shorts');
    _showShortsLinks();
    _showShortsShelves();
    return;
  }
  if (settings.hideShorts) {
    injectStyle('zen-hide-shorts', `
      ytd-reel-shelf-renderer,
      ytd-rich-shelf-renderer,
      ytd-guide-entry-renderer a[href="/shorts"],
      a[href^="/shorts/"],
      [tab-identifier="FEshorts"],
      #shorts-container { display: none !important; }

      /* Hide shorts chip/tab in search filters */
      yt-chip-cloud-chip-renderer[chip-style="STYLE_HASHTAG"] { display: none !important; }
    `);

    /* Enhanced dynamic hiding for titled shorts shelves */
    _hideShortsShelves();
    _hideShortsLinks();
  } else {
    removeStyle('zen-hide-shorts');
    _showShortsLinks();
    _showShortsShelves();
  }
}

function _hideShortsShelves() {
  const shelfTitles = document.querySelectorAll('span#title, #title-text, #rich-shelf-header');
  shelfTitles.forEach(el => {
    const text = (el.textContent || '').toLowerCase();
    if (text.includes('shorts')) {
      const shelf = el.closest('ytd-shelf-renderer, ytd-rich-shelf-renderer, ytd-rich-section-renderer, ytd-item-section-renderer');
      if (shelf) {
        shelf.style.setProperty('display', 'none', 'important');
      }
    }
  });
}

function _showShortsShelves() {
  const shelfTitles = document.querySelectorAll('span#title, #title-text, #rich-shelf-header');
  shelfTitles.forEach(el => {
    const text = (el.textContent || '').toLowerCase();
    if (text.includes('shorts')) {
      const shelf = el.closest('ytd-shelf-renderer, ytd-rich-shelf-renderer, ytd-rich-section-renderer, ytd-item-section-renderer');
      if (shelf) {
        shelf.style.removeProperty('display');
      }
    }
  });
}

function _hideShortsLinks() {
  document.querySelectorAll('a[href^="/shorts/"]').forEach(el => {
    const card = el.closest('ytd-video-renderer, ytd-rich-item-renderer, ytd-compact-video-renderer');
    if (card) card.style.setProperty('display', 'none', 'important');
  });
}

function _showShortsLinks() {
  document.querySelectorAll('a[href^="/shorts/"]').forEach(el => {
    const card = el.closest('ytd-video-renderer, ytd-rich-item-renderer, ytd-compact-video-renderer');
    if (card) card.style.removeProperty('display');
  });
}
