gsap.registerPlugin(ScrollTrigger);

let lenis;
let items = [];
let wraps = [];
const marqueeInner = document.querySelector('.mark > .mark__inner'); // Select the inner element of the marquee
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let scrollVelocity = 0;
let blurAmount = 0;
let saturation = 1;
let filterSetters = [];

const preloadImages = (selector) => {
  return Promise.all(
    gsap.utils.toArray(selector).map((item) => {
      const image = new Image();
      image.src = item.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)[1];
      return image.decode().catch(() => {}); // A broken image never blocks the page
    })
  );
};

// --------------------------------
// Smooth Scrolling
// --------------------------------

function initSmoothScrolling() {
  lenis = new Lenis();

  lenis.on('scroll', ({ velocity }) => {
    scrollVelocity = Math.abs(velocity);
    ScrollTrigger.update();
  });

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
    updateFilters();
  });

  gsap.ticker.lagSmoothing(0);
}

// --------------------------------
// Velocity Filters
// --------------------------------

function updateFilters() {
  // Nothing to update once the filters have settled.
  if (!scrollVelocity && !blurAmount) return;

  // Velocity based, eased the same at any frame rate:
  const velocityNorm = Math.min(scrollVelocity / 40, 1);
  const ease = 1 - Math.pow(1 - 0.45, gsap.ticker.deltaRatio());
  blurAmount = gsap.utils.interpolate(blurAmount, velocityNorm * 15, ease);
  saturation = gsap.utils.interpolate(saturation, 1 - velocityNorm, ease);

  if (!scrollVelocity && blurAmount < 0.05) {
    blurAmount = 0;
    saturation = 1;
    filterSetters.forEach((setFilter) => setFilter('none'));
    return;
  }

  const filter = `blur(${blurAmount}px) saturate(${saturation})`;
  filterSetters.forEach((setFilter) => setFilter(filter));
}

// --------------------------------
// Gallery Structure
// --------------------------------

function createGalleryWrappers() {
  items = gsap.utils.toArray('.gallery__item');

  items.forEach((item) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('gallery__item-wrap');

    item.parentNode.insertBefore(wrapper, item);
    wrapper.appendChild(item);
  });

  wraps = gsap.utils.toArray('.gallery__item-wrap');
  filterSetters = items.map((item) => gsap.quickSetter(item, 'filter'));
}

// --------------------------------
// Gallery Layout
// --------------------------------

function positionGalleryItems() {
  const freeSpace = (window.innerWidth - wraps[0].offsetWidth) / 2;
  const amplitude = Math.min(window.innerWidth * 0.2, freeSpace);

  wraps.forEach((wrap, i) => {
    gsap.set(wrap, {
      x: Math.sin(i) * amplitude,
    });
  });
}

// --------------------------------
// Gallery Animation
// --------------------------------

function initGalleryAnimation() {
  items.forEach((item) => {
    const rotationX = gsap.utils.random(-10, 10);
    const rotationY = gsap.utils.random(200, 290);
    const rotationZ = gsap.utils.random(-10, 10);
    const setTransform = gsap.quickSetter(item, 'css');

    ScrollTrigger.create({
      trigger: item,
      start: 'top bottom+=20%',
      end: 'bottom top-=20%',
      scrub: true,

      onUpdate(self) {
        const p = self.progress;
        const z = Math.sin(p * Math.PI) * -150;

        setTransform({
          rotationX: gsap.utils.interpolate(rotationX, -rotationX, p),
          rotationY: gsap.utils.interpolate(rotationY, -rotationY, p),
          rotationZ: gsap.utils.interpolate(rotationZ, -rotationZ, p),
          z,
        });
      },
    });
  });
}

// --------------------------------
// Marquee Animation
// --------------------------------
const animateMarquee = () => {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: document.querySelector('.gallery'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
      },
    })
    .fromTo(
      marqueeInner,
      {
        x: '100vw',
      },
      {
        x: '-100%',
        ease: 'none',
      }
    );
};

// --------------------------------
// Events
// --------------------------------

function initEvents() {
  window.addEventListener('resize', positionGalleryItems);
}

// ------------------------------------------------------------
// INITIALIZATION
// ------------------------------------------------------------

function init() {
  createGalleryWrappers();
  positionGalleryItems();
  animateMarquee();
  initEvents();

  // Keep native scrolling and flat images when reduced motion is preferred.
  if (reduceMotion) return;

  initSmoothScrolling();
  initGalleryAnimation();
}

document.addEventListener('DOMContentLoaded', async () => {
  await preloadImages('.gallery__item');
  document.body.classList.remove('loading');
  init();
});
