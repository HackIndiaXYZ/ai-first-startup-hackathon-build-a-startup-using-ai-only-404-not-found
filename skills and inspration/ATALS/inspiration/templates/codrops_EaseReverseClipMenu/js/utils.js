/**
 * Preloads images specified by the CSS selector.
 * Useful for regular images and CSS background images.
 *
 * @param {string} [selector='img'] - CSS selector for target images.
 * @returns {Promise} Resolves when all specified images are loaded.
 */
const preloadImages = (selector = 'img') => {
  return new Promise((resolve) => {
    imagesLoaded(document.querySelectorAll(selector), { background: true }, resolve);
  });
};

/**
 * Maps a number from one range to another.
 */
const map = (value, inMin, inMax, outMin, outMax) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

/**
 * Clamps a number between a minimum and maximum value.
 */
const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Gets the center point of an element relative to the viewport.
 */
const getElementCenter = (element) => {
  const rect = element.getBoundingClientRect();

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
};

/**
 * Distance from the element's center point to the center of the viewport.
 */
const getDistanceFromViewportCenter = (element) => {
  const center = getElementCenter(element);

  const viewportCenter = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };

  return Math.hypot(center.x - viewportCenter.x, center.y - viewportCenter.y);
};

/**
 * Calculates an x/y translation that moves the element radially
 * away from the center of the viewport by a fixed distance.
 */
const getRadialPosition = (element, distance = 400) => {
  const center = getElementCenter(element);

  const viewportCenter = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };

  let dx = center.x - viewportCenter.x;
  let dy = center.y - viewportCenter.y;

  // Safety fallback in case an element is exactly centered.
  if (dx === 0 && dy === 0) {
    dx = 1;
    dy = 1;
  }

  const length = Math.hypot(dx, dy);

  return {
    x: (dx / length) * distance,
    y: (dy / length) * distance,
  };
};

export {
  preloadImages,
  map,
  clamp,
  getElementCenter,
  getDistanceFromViewportCenter,
  getRadialPosition,
};
