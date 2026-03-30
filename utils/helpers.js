/**
 * ZenTube — DOM Helpers
 * Shared utility functions used by all feature modules.
 * MUST be loaded before feature modules in manifest.json.
 */

/**
 * Inject or update a named <style> tag into document head.
 * @param {string} id  - Unique style tag id
 * @param {string} css - CSS rules to inject
 */
function injectStyle(id, css) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('style');
    el.id = id;
    (document.head || document.documentElement).appendChild(el);
  }
  el.textContent = css;
}

/**
 * Remove a previously injected style tag by id.
 * @param {string} id - Unique style tag id to remove
 */
function removeStyle(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}
