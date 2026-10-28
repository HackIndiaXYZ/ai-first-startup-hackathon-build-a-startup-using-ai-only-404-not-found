/**
 * Preloads and decodes the images of the elements matched by the CSS selector.
 * @function
 * @param {string} [selector='img'] - CSS selector for target images (img elements or elements with a background image).
 * @returns {Promise} - Resolves when all specified images are loaded.
 */
const preloadImages = (selector = 'img') => {
  // Image URLs, from the src of img elements or the computed background image of other elements
  const urls = new Set();
  document.querySelectorAll(selector).forEach((el) => {
    const src =
      el.currentSrc ||
      el.src ||
      getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];
    if (src) urls.add(src);
  });

  return Promise.all(
    [...urls].map((src) => {
      const img = new Image();
      img.src = src;
      return img.decode().catch(() => {}); // A failed image shouldn't block the page
    })
  );
};

// Exporting utility functions for use in other modules.
export {
  preloadImages
};
