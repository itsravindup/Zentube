/**
 * ZenTube — Feature: Blur Thumbnails
 * Applies a blur filter to all YouTube video thumbnails.
 * Removes blur on hover for intentional browsing.
 */

function applyBlurThumbnails(settings) {
  if (!settings.focusMode) {
    removeStyle('zen-blur-thumbnails');
    return;
  }
  if (settings.blurThumbnails) {
    injectStyle('zen-blur-thumbnails', `
      ytd-thumbnail img,
      ytd-thumbnail yt-img-shadow img {
        filter: blur(8px) !important;
        transition: filter 0.3s ease !important;
      }

      ytd-thumbnail:hover img,
      ytd-thumbnail:hover yt-img-shadow img {
        filter: blur(3px) !important;
      }
    `);
  } else {
    removeStyle('zen-blur-thumbnails');
  }
}
