/**
 * Preloads images specified by the CSS selector, then waits for the fonts.
 * @function
 * @param {string} [selector='img'] - CSS selector for target images.
 * @returns {Promise} - Resolves when all specified images are decoded and the fonts are ready.
 */
const preloadImages = (selector = 'img') => {
  // Each distinct URL once, from an <img> or a CSS background image
  const urls = new Set();
  document.querySelectorAll(selector).forEach((el) => {
    const url =
      el.tagName === 'IMG' ? el.currentSrc || el.src : getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];
    if (url) urls.add(url);
  });

  // decode() resolves once an image is loaded and ready to paint. A broken image shouldn't hold up the page.
  const images = Array.from(urls, (url) => {
    const img = new Image();
    img.src = url;
    return img.decode().catch(() => {});
  });

  // The fonts too, so the text doesn't swap fonts after the loader lifts
  return Promise.all([...images, document.fonts.ready]);
};

// Exporting utility functions for use in other modules.
export {
  preloadImages
};