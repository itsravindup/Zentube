/**
 * ModeTube — Feature: Hide Comments
 * Hides the entire comments section on watch pages.
 */

function applyHideComments(settings) {
  if (!settings.focusMode) {
    removeStyle('zen-hide-comments');
    return;
  }
  if (settings.hideComments) {
    injectStyle('zen-hide-comments', `
      #comments,
      ytd-comments,
      ytd-comment-thread-renderer { display: none !important; }
    `);
  } else {
    removeStyle('zen-hide-comments');
  }
}
