import { preloadImages } from '../utils.js'; // Utility function to preload images before layout

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// Visitors who prefer reduced motion get a still grid: no smoothing, no lag and no tilt
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Create a ScrollSmoother instance for smooth scrolling with lag effects
const smoother = ScrollSmoother.create({
  smooth: prefersReducedMotion ? 0 : 1, // Smoothing factor for scroll (0 = no smoothing, 1 = full smoothing)
  effects: true, // Enable lag/scroll-based effects
  normalizeScroll: true, // Prevents mobile address bar resizing, disables overscroll bounce, and ensures scroll value consistency
});

// Get the grid container
const grid = document.querySelector('.grid');
// Capture original .grid__item order before any DOM changes
const originalItems = Array.from(grid.querySelectorAll('.grid__item'));
// Lag effects of the current items, killed before every rebuild
let lagEffects = [];
// One entry per item: its neighbours and a setter for its tilt
let tilts = [];
// Horizontal distance between two neighbouring columns, in px
let columnPitch = 1;

// ──────────────── Wave Configuration ────────────────
// Every item gets its own lag, read off a wave that runs diagonally across the grid,
// so the grid ripples while it scrolls and settles flat when it stops
const baseLag = 0.1; // Lag in the wave's troughs
const waveLag = 1.45; // Extra lag on the wave's crests
const columnFrequency = 0.8; // How fast the wave turns from one column to the next
const rowFrequency = 0.35; // How fast it turns from one row to the next
// Each item's lag only runs while it's near the screen. Released at the screen's edge, a trailing item
// would catch up all at once and shoot out, so it keeps running this far (px) beyond the edges
const effectsPadding = 900;

// ──────────────── Tilt Configuration ────────────────
const tiltStrength = 1; // How much of the wave's slope each item follows (1 = all of it)
const maxTilt = 15; // Tilt limit in degrees, approached softly on very fast scrolls

/**
 * Group grid items into columns based on computed CSS grid-template-columns
 * @returns {Object} An object containing the grouped columns and column count
 */
const groupItemsByColumn = () => {
  const gridStyles = window.getComputedStyle(grid);
  const columnsRaw = gridStyles.getPropertyValue('grid-template-columns');
  const numColumns = columnsRaw.split(' ').filter(Boolean).length;

  const columns = Array.from({ length: numColumns }, () => []); // Initialize column arrays

  // Distribute grid items into column buckets
  grid.querySelectorAll('.grid__item').forEach((item, index) => {
    columns[index % numColumns].push(item);
  });

  return { columns, numColumns };
};

/**
 * Reset the grid
 */
const clearGrid = () => {
  // Kill the old lag effects, or they keep running on the rebuilt items
  lagEffects.forEach((effect) => effect.kill());
  lagEffects = [];
  tilts = [];
  gsap.set(originalItems, { clearProps: 'transform' }); // Drop any offset or tilt left from the old layout

  // Remove column wrappers
  grid.querySelectorAll('.grid__column').forEach((col) => col.remove());

  // Restore original .grid__item order
  originalItems.forEach((item) => grid.appendChild(item));
};

/**
 * Build the DOM structure by wrapping items into column containers
 * @param {Array[]} columns - Array of columns with grid items
 */
const buildGrid = (columns) => {
  const fragment = document.createDocumentFragment(); // Efficient DOM batch insertion

  // Loop over each column
  columns.forEach((column) => {
    const columnContainer = document.createElement('div'); // New column wrapper
    columnContainer.className = 'grid__column';

    // Append items to column container
    column.forEach((item) => columnContainer.appendChild(item));

    fragment.appendChild(columnContainer); // Add to fragment
  });

  grid.appendChild(fragment); // Add all columns to DOM at once
};

/**
 * Measure the distance between two neighbouring columns
 */
const measureColumnPitch = () => {
  const [first, second] = grid.querySelectorAll('.grid__column');
  columnPitch = second ? second.offsetLeft - first.offsetLeft : 1;
};

/**
 * Apply a lag effect to every item, following the wave
 * @param {Array[]} columns - Array of columns with grid items
 */
const applyLagEffects = (columns) => {
  columns.forEach((column, c) => {
    column.forEach((item, r) => {
      const wave = 0.5 + 0.5 * Math.sin(c * columnFrequency + r * rowFrequency); // 0 in a trough, 1 on a crest
      const lag = baseLag + wave * waveLag;
      lagEffects.push(...smoother.effects(item, { speed: 1, lag, effectsPadding })); // Apply individual lag per item
    });
  });
};

/**
 * Remember each item's left and right neighbours in its row, for the tilt
 * @param {Array[]} columns - Array of columns with grid items
 */
const setupTilts = (columns) => {
  columns.forEach((column, c) => {
    column.forEach((item, r) => {
      tilts.push({
        left: columns[c - 1]?.[r] ?? item, // First column: the item itself
        right: columns[c + 1]?.[r] ?? item, // Last column, or a short last row: the item itself
        span: (columns[c - 1]?.[r] ? 1 : 0) + (columns[c + 1]?.[r] ? 1 : 0), // Columns between left and right
        setRotation: gsap.quickSetter(item, 'rotation', 'deg'),
        rotation: 0,
      });
    });
  });
};

/**
 * Tilt every item along the wave: the slope between where its left and right
 * neighbours currently are. Runs on every frame, but only writes what changed.
 */
const updateTilts = () => {
  tilts.forEach((tilt) => {
    if (!tilt.span) return; // A lone item has no slope to follow

    const rise = gsap.getProperty(tilt.right, 'y') - gsap.getProperty(tilt.left, 'y'); // Current lag offsets, in px
    const angle = (Math.atan2(rise, tilt.span * columnPitch) * 180) / Math.PI;
    const eased = maxTilt * Math.tanh((angle * tiltStrength) / maxTilt); // Leans into the limit softly instead of stopping hard
    const rotation = Math.round(eased * 100) / 100;

    if (rotation === tilt.rotation) return; // Nothing changed since last frame (like when idle)
    tilt.rotation = rotation;
    tilt.setRotation(rotation);
  });
};

/**
 * Initialize layout and scroll effects
 */
const init = () => {
  clearGrid(); // Clear existing grid content
  const { columns, numColumns } = groupItemsByColumn(); // Group items and get column count
  currentColumnCount = numColumns; // Store current layout
  buildGrid(columns); // Build DOM
  measureColumnPitch(); // Needed by the tilt
  if (!prefersReducedMotion) {
    applyLagEffects(columns); // Apply scroll lag effects
    setupTilts(columns); // Prepare the tilt
  }
};

/**
 * Helper to get current column count from computed CSS
 * @returns {number} Number of columns
 */
const getColumnCount = () => {
  const styles = getComputedStyle(grid);
  return styles.getPropertyValue('grid-template-columns').split(' ').filter(Boolean).length;
};

// ─────────────── Resize Handling ───────────────

// Store current column count for comparison
let currentColumnCount = null;

// Rebuild the layout only if the number of columns has changed on window resize,
// otherwise just measure the columns again for the tilt
window.addEventListener('resize', () => {
  const newColumnCount = getColumnCount();
  if (newColumnCount !== currentColumnCount) {
    init();
  } else {
    measureColumnPitch();
  }
});

// ─────────────── Entry Point ───────────────

// Wait for all images to preload before initializing layout and scroll effects
preloadImages('.grid__item-img').then(() => {
  document.body.classList.remove('loading'); // Remove loading state
  init(); // Start layout initialization
  if (!prefersReducedMotion) gsap.ticker.add(updateTilts); // Tilt the items on every frame
});
