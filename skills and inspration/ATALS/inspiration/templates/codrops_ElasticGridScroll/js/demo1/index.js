import { preloadImages } from '../utils.js'; // Utility function to preload images before layout

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// Visitors who prefer reduced motion get a still grid: no smoothing and no lag
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
// Lag effects of the current columns, killed before every rebuild
let lagEffects = [];

// Lag configuration constants
const baseLag = 0.5; // Lag applied to the center column
const lagScale = 0.1; // How much additional lag is applied per column away from center

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
  // Kill the old columns' lag effects, or they keep running on the detached elements
  lagEffects.forEach((effect) => effect.kill());
  lagEffects = [];

  // Remove column wrappers
  grid.querySelectorAll('.grid__column').forEach((col) => col.remove());

  // Restore original .grid__item order
  originalItems.forEach((item) => grid.appendChild(item));
};

/**
 * Build the DOM structure by wrapping items into column containers
 * @param {Array[]} columns - Array of columns with grid items
 * @param {number} numColumns - Total number of columns
 * @returns {Array} Array of columnContainers with lag data
 */
const buildGrid = (columns, numColumns) => {
  const fragment = document.createDocumentFragment(); // Efficient DOM batch insertion
  const mid = (numColumns - 1) / 2; // Center index (can be fractional)
  const columnContainers = [];

  // Loop over each column
  columns.forEach((column, i) => {
    const distance = Math.abs(i - mid); // Distance from center column
    const lag = baseLag + distance * lagScale; // Lag based on distance from center

    const columnContainer = document.createElement('div'); // New column wrapper
    columnContainer.className = 'grid__column';

    // Append items to column container
    column.forEach((item) => columnContainer.appendChild(item));

    fragment.appendChild(columnContainer); // Add to fragment
    columnContainers.push({ element: columnContainer, lag }); // Save for lag effect setup
  });

  grid.appendChild(fragment); // Add all columns to DOM at once
  return columnContainers;
};

/**
 * Apply lag effects to each column using ScrollSmoother
 * @param {Array} columnContainers - Array of objects with column DOM elements and lag values
 */
const applyLagEffects = (columnContainers) => {
  columnContainers.forEach(({ element, lag }) => {
    lagEffects.push(...smoother.effects(element, { speed: 1, lag })); // Apply individual lag per column
  });
};

/**
 * Initialize layout and scroll effects
 */
const init = () => {
  clearGrid(); // Clear existing grid content
  const { columns, numColumns } = groupItemsByColumn(); // Group items and get column count
  currentColumnCount = numColumns; // Store current layout
  const columnContainers = buildGrid(columns, numColumns); // Build DOM
  if (!prefersReducedMotion) applyLagEffects(columnContainers); // Apply scroll lag effects
};

/**
 * Helper to get current column count from computed CSS
 * @returns {number} Number of columns
 */
const getColumnCount = () => {
  const styles = getComputedStyle(grid);
  return styles
    .getPropertyValue('grid-template-columns')
    .split(' ')
    .filter(Boolean).length;
};

// ─────────────── Resize Handling ───────────────

// Store current column count for comparison
let currentColumnCount = null;

// Rebuild the layout only if the number of columns has changed on window resize
window.addEventListener('resize', () => {
  const newColumnCount = getColumnCount();
  if (newColumnCount !== currentColumnCount) {
    init();
  }
});

// ─────────────── Entry Point ───────────────

// Wait for all images to preload before initializing layout and scroll effects
preloadImages('.grid__item-img').then(() => {
  document.body.classList.remove('loading'); // Remove loading state
  init(); // Start layout initialization
});
