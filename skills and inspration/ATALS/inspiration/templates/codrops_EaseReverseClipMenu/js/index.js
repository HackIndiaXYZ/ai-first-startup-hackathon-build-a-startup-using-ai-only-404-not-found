import {
  preloadImages,
  map,
  clamp,
  getDistanceFromViewportCenter,
  getRadialPosition,
} from './utils.js';

// ------------------------------------------------------------
// DOM REFERENCES
// ------------------------------------------------------------
const toggleButton = document.querySelector('.toggle button');
const easeReverseCheckbox = document.querySelector('#easeReverse');
const exitSpeedSlider = document.querySelector('#exitSpeed');
const exitSpeedValue = document.querySelector('#exitSpeedValue');
const menu = document.querySelector('.menu');
const bgVideo = document.querySelector('.bg-video');
const menuItems = [...document.querySelectorAll('.menu__item')];
const coverItems = [...document.querySelectorAll('.cover__item')];

// ------------------------------------------------------------
// STATE
// ------------------------------------------------------------
let isMenuOpen = false;
let menuTimeline;
let interruptReverseTimeScale = parseFloat(exitSpeedSlider.value);

// ------------------------------------------------------------
// CONFIG
// ------------------------------------------------------------
const RADIAL_DISTANCE = 600;
const NORMAL_TIMESCALE = 1;
const FULL_CLOSE_EASE_REVERSE = 'elastic.out(0.3)';
const COVER_ITEM_MAX_DELAY = 0.3;
const MENU_CLIP_DELAY = 0.3;

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

/**
 * Demo-style easeReverse helper.
 *
 * When the checkbox is enabled, this returns the passed reverse ease.
 * When disabled, it returns false so the tween falls back to normal
 * reversed easing behavior.
 */
const er = (value) => {
  return easeReverseCheckbox.checked ? value || true : false;
};

/**
 * Keeps the menu hidden from assistive tech and keyboard navigation
 * while it is visually closed.
 */
const updateMenuInteractivity = () => {
  menu.setAttribute('aria-hidden', String(!isMenuOpen));

  menuItems.forEach((item) => {
    item.tabIndex = isMenuOpen ? 0 : -1;
  });
};

/**
 * Keeps the toggle button's accessible state in sync with the menu state.
 */
const updateToggleA11y = () => {
  toggleButton.setAttribute('aria-expanded', String(isMenuOpen));
  toggleButton.setAttribute('aria-label', isMenuOpen ? 'Close menu' : 'Open menu');

  updateMenuInteractivity();
};

/**
 * Reads the slider value and uses it as the timeScale for interrupted closes.
 */
const updateExitSpeedValue = () => {
  interruptReverseTimeScale = parseFloat(exitSpeedSlider.value);
  exitSpeedValue.textContent = `${interruptReverseTimeScale}×`;
};

/**
 * Starts the background video when the menu begins opening.
 */
const playBgVideo = () => {
  bgVideo.play();
};

/**
 * Pauses the background video once the menu has fully closed.
 */
const pauseBgVideo = () => {
  bgVideo.pause();
};

// ------------------------------------------------------------
// TIMELINE
// ------------------------------------------------------------

/**
 * Creates the menu timeline.
 *
 * The timeline is recreated when the easeReverse checkbox changes,
 * so each tween is built with the correct easeReverse value from the start.
 *
 * reverseEase can be:
 * - true: adaptive reverse ease, used for interrupted closes
 * - FULL_CLOSE_EASE_REVERSE: custom reverse ease, used for full closes
 * - false: no easeReverse behavior
 */
const createMenuTimeline = (reverseEase = FULL_CLOSE_EASE_REVERSE) => {
  const maxDistance = Math.hypot(window.innerWidth / 2, window.innerHeight / 2);

  const tl = gsap.timeline({
    paused: true,
    onReverseComplete: pauseBgVideo,
  });

  tl.addLabel('start', 0);

  // Reveal the menu slightly after the cover items begin moving.
  tl.to(
    menu,
    {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      duration: 0.8,
      ease: 'expo',
      easeReverse: er('expo'),
    },
    `start+=${MENU_CLIP_DELAY}`
  );

  coverItems.forEach((item) => {
    const distanceFromCenter = getDistanceFromViewportCenter(item);
    const progress = clamp(distanceFromCenter / maxDistance, 0, 1);

    // Items closer to the center wait slightly longer.
    // Items farther from the center leave sooner.
    const delay = map(progress, 0, 1, COVER_ITEM_MAX_DELAY, 0);

    const { x, y } = getRadialPosition(item, RADIAL_DISTANCE);

    tl.to(
      item,
      {
        x,
        y,
        opacity: 0,
        rotation: gsap.utils.random(-30, 30),
        duration: 0.7,
        ease: 'expo',
        easeReverse: er(reverseEase),
      },
      `start+=${delay}`
    );
  });

  return tl;
};

/**
 * Rebuilds the timeline with a chosen reverse ease.
 *
 * The current visual progress is preserved so the animation does not jump
 * when the timeline is recreated mid-animation.
 */
const rebuildMenuTimeline = ({ progress = 0, reverseEase = FULL_CLOSE_EASE_REVERSE } = {}) => {
  const safeProgress = clamp(progress, 0, 1);

  if (menuTimeline) {
    menuTimeline.revert();
  }

  gsap.set(coverItems, {
    x: 0,
    y: 0,
    rotation: 0,
    opacity: 1,
  });

  gsap.set(menu, {
    clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
  });

  menuTimeline = createMenuTimeline(reverseEase);

  // Move the new timeline to the same visual point as the old one,
  // then pause it until play() or reverse() is called.
  menuTimeline.progress(safeProgress).pause();
};

// ------------------------------------------------------------
// TOGGLE
// ------------------------------------------------------------
const toggleMenu = () => {
  const currentProgress = menuTimeline.progress();
  const isFullyOpen = currentProgress >= 0.999;

  isMenuOpen = !isMenuOpen;
  updateToggleA11y();

  if (isMenuOpen) {
    // Opening always plays normally.
    playBgVideo();
    menuTimeline.timeScale(NORMAL_TIMESCALE).play();
    return;
  }

  if (isFullyOpen) {
    // Normal close:
    // the opening animation has completed, so reverse with the custom
    // easeReverse value and normal speed.
    rebuildMenuTimeline({
      progress: 1,
      reverseEase: FULL_CLOSE_EASE_REVERSE,
    });

    menuTimeline.timeScale(NORMAL_TIMESCALE).reverse();
    return;
  }

  // Interrupted close:
  // the user clicked again before the opening animation finished.
  // Reverse quickly and use easeReverse: true when the checkbox is enabled.
  rebuildMenuTimeline({
    progress: currentProgress,
    reverseEase: true,
  });

  menuTimeline.timeScale(interruptReverseTimeScale).reverse();
};

// ------------------------------------------------------------
// INIT EVENTS
// ------------------------------------------------------------
function initEvents() {
  toggleButton.addEventListener('click', toggleMenu);

  easeReverseCheckbox.addEventListener('change', () => {
    const currentProgress = menuTimeline ? menuTimeline.progress() : 0;

    // Rebuild so the new checkbox value is baked into the timeline's tweens.
    rebuildMenuTimeline({
      progress: currentProgress,
      reverseEase: FULL_CLOSE_EASE_REVERSE,
    });
  });

  exitSpeedSlider.addEventListener('input', () => {
    updateExitSpeedValue();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isMenuOpen) {
      toggleMenu();
      toggleButton.focus();
    }
  });
}

function init() {
  updateToggleA11y();
  updateExitSpeedValue();

  rebuildMenuTimeline({
    progress: 0,
    reverseEase: FULL_CLOSE_EASE_REVERSE,
  });

  initEvents();
}

// ------------------------------------------------------------
// INITIALIZATION
// ------------------------------------------------------------

// Wait for the cover background images before measuring positions
// and building the timeline.
preloadImages('.cover__image').then(() => {
  document.body.classList.remove('loading');
  init();
});
