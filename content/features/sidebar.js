/**
 * ModeTube — Feature: Hide Sidebar Recommendations
 * Hides the "Up Next" / related video sidebar.
 * Supports watch-only mode and global hide mode.
 */

function applyHideSidebar(settings) {
  if (!settings.focusMode) {
    removeStyle('zen-hide-sidebar');
    return;
  }

  const isWatchPage = window.location.pathname === '/watch';

  if (settings.hideSidebarAll) {
    injectStyle('zen-hide-sidebar', `
      #related,
      ytd-watch-next-secondary-results-renderer { display: none !important; }
    `);
  } else if (settings.hideSidebarWatch && isWatchPage) {
    injectStyle('zen-hide-sidebar', `
      #related,
      ytd-watch-next-secondary-results-renderer { display: none !important; }
    `);
  } else {
    removeStyle('zen-hide-sidebar');
  }
}
