import { preloadImages } from '../utils.js'; // Utility function to preload images before layout
import { ElasticTwist } from './ElasticTwist.js'; // The three.js layer that twists the grid as it scrolls

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// Visitors who prefer reduced motion get a still grid: no smoothing, no lag and no WebGL
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The WebGL layer, made below. Without WebGL (or with reduced motion) it stays null and the DOM images stay visible.
let elasticTwist = null;

// Create a ScrollSmoother instance for smooth scrolling with lag effects
const smoother = ScrollSmoother.create({
  smooth: prefersReducedMotion ? 0 : 1, // Smoothing factor for scroll (0 = no smoothing, 1 = full smoothing)
  effects: true, // Enable lag/scroll-based effects
  normalizeScroll: true, // Prevents mobile address bar resizing, disables overscroll bounce, and ensures scroll value consistency
  onUpdate: () => elasticTwist?.sync(), // Touch scrolling moves the page outside the ticker too: keep the canvas in step
});

// Get the grid container
const grid = document.querySelector('.grid');
// Capture original .grid__item order before any DOM changes
const originalItems = Array.from(grid.querySelectorAll('.grid__item'));
// Lag effects of the current columns, killed before every rebuild
let lagEffects = [];

// Make the WebGL layer
if (!prefersReducedMotion) {
  try {
    elasticTwist = new ElasticTwist();
  } catch (error) {
    elasticTwist = null; // No WebGL 2: the page works as a plain lag grid
  }
}

// Lag configuration constants
const baseLag = 0.3; // Minimum starting lag
const lagFactor = 0.15; // Used to compute lag based on distance from center

/**
 * Group grid items into columns based on computed CSS grid-template-columns
 * @returns {Object} An object containing the grouped columns and total column count
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
  // Kill the old columns' lag effects, or they keep running on the detached elements
  lagEffects.forEach((effect) => effect.kill());
  lagEffects = [];

  // Remove column wrappers
  grid.querySelectorAll('.grid__column').forEach((col) => col.remove());

  // Restore original .grid__item order
  originalItems.forEach((item) => grid.appendChild(item));
};

/**
 * Build the DOM layout with column wrappers and grid items
 * @param {Array[]} columns - Array of item groups per column
 * @param {number} numColumns - Total number of columns
 * @returns {Array} Array of objects containing column elements and lag values
 */
const buildGrid = (columns, numColumns) => {
  const fragment = document.createDocumentFragment(); // Efficient DOM batch insertion
  const mid = (numColumns - 1) / 2; // Center index (can be fractional)
  const maxDistance = numColumns % 2 === 1 ? Math.floor(numColumns / 2) : numColumns / 2;

  const columnContainers = [];

  // Loop over each column
  columns.forEach((column, i) => {
    const distance = Math.abs(i - mid); // Distance from center
    const lag = baseLag + (maxDistance - distance + 1) * lagFactor; // Lag increases toward center

    const columnContainer = document.createElement('div'); // New column wrapper
    columnContainer.className = 'grid__column';

    // Append items to column container
    column.forEach((item) => columnContainer.appendChild(item));

    fragment.appendChild(columnContainer); // Add to fragment
    columnContainers.push({ element: columnContainer, lag }); // Store for ScrollSmoother
  });

  grid.appendChild(fragment); // Insert all at once
  return columnContainers;
};

/**
 * Apply ScrollSmoother lag effects to each column
 * @param {Array} columnContainers - Array of column elements and lag values
 */
const applyLagEffects = (columnContainers) => {
  columnContainers.forEach(({ element, lag }) => {
    lagEffects.push(...smoother.effects(element, { speed: 1, lag })); // Apply per-column lag
  });
};

/**
 * Initialize layout and scroll effects
 */
const init = () => {
  clearGrid(); // Safely clear grid content
  const { columns, numColumns } = groupItemsByColumn(); // Group items and get column count
  currentColumnCount = numColumns; // Store for layout change detection
  const columnContainers = buildGrid(columns, numColumns); // Build new layout
  if (!prefersReducedMotion) applyLagEffects(columnContainers); // Apply scroll effects
  elasticTwist?.setColumns(grid, columnContainers.map(({ element }) => element)); // Hand the new columns to the WebGL layer
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

// Track current column count for detecting changes
let currentColumnCount = null;

// Rebuild the layout only if the number of columns has changed on window resize,
// otherwise just measure it again for the WebGL layer
window.addEventListener('resize', () => {
  const newColumnCount = getColumnCount();
  if (newColumnCount !== currentColumnCount) {
    init();
  } else {
    elasticTwist?.measure();
  }
});

// ─────────────── Entry Point ───────────────

// Wait for all images to preload (and, with WebGL, the texture) before initializing layout and scroll effects
const images = Array.from(grid.querySelectorAll('.grid__item-img'));
Promise.all([preloadImages('.grid__item-img'), elasticTwist?.load(images)]).then(() => {
  document.body.classList.remove('loading'); // Remove loading state
  init(); // Initialize layout and effects

  if (elasticTwist) {
    document.body.classList.add('is-webgl'); // Hides the DOM images; the canvas draws them from here on
    elasticTwist.update(0, 16); // First frame now, so there's never a frame without images
    gsap.ticker.add(elasticTwist.update); // Then follow the scroll on every frame
  }
});
