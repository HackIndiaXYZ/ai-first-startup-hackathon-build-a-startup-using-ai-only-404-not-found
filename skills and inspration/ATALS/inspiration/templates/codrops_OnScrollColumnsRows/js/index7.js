// Import the necessary function for preloading images
import { preloadImages, getGrid } from './utils.js';

// Define a variable that will store the Lenis smooth scrolling object
let lenis;

// Element with class .columns
const grid = document.querySelector('.columns');
// All the columns class .column
const columns = [...grid.querySelectorAll('.column')];
// Map each column to its array of items and keep a reference of the image, its wrapper and the column
const items = columns.map((column, pos) => {
	return [...column.querySelectorAll('.column__item')].map(item => ({
		element: item,
		column: pos,
		wrapper: item.querySelector('.column__item-imgwrap'),
		image: item.querySelector('.column__item-img')
	}));
});
// All itemms
const mergedItems = items.flat();

// Function to initialize Lenis for smooth scrolling
const initSmoothScrolling = () => {
	// Instantiate the Lenis object with specified properties
	lenis = new Lenis({
		lerp: 0.15, // Lower values create a smoother scroll effect
		smoothWheel: true // Enables smooth scrolling for mouse wheel events
	});

	// Update ScrollTrigger each time the user scrolls
	lenis.on('scroll', () => ScrollTrigger.update());

	// Drive Lenis from GSAP's ticker, so the scroll and the animations update in the same frame
	const update = (time) => lenis.raf(time * 1000); // GSAP's time is in seconds, Lenis' in milliseconds
	gsap.ticker.add(update);
	// Turn off GSAP's lag smoothing, so the scroll never jumps after a slow frame
	gsap.ticker.lagSmoothing(0);

	// Return a function that stops the smooth scrolling again
	return () => {
		gsap.ticker.remove(update);
		lenis.destroy();
	};
};

const scroll = () => {
	const gridObj = getGrid(mergedItems.map(item => item.element));
	
	const rowMapping = {
		even: {
			skewX: 2,
			xPercent: -50,
			transformOrigin: '0% 50%'
		},
		odd: {
			skewX: -2,
			xPercent: 50,
			transformOrigin: '100% 50%'
		}
	};
	
	['even', 'odd'].forEach(type => {
		gridObj.rows(type).flat().forEach(row => {
			gsap
			.timeline({
				defaults: { ease: 'none' },
				scrollTrigger: {
					trigger: row,
					start: 'top bottom',
					end: 'bottom top',
					scrub: true
				}
			})
			.to(row.querySelector('.column__item-imgwrap'), {
				xPercent: rowMapping[type].xPercent,
				skewX: rowMapping[type].skewX
			}, 0)
			.to(row.querySelector('.column__item-img'), {
				ease: 'power1.in',
				startAt: {transformOrigin: rowMapping[type].transformOrigin},
				scaleX: 1.4
			}, 0)

		});
	});
}

// Preload images and fonts, initialize smooth scrolling, apply scroll-triggered animations, and remove loading class from body
Promise.all([preloadImages('.column__item-img'), document.fonts.ready]).then(() => {
	// Only when the visitor hasn't asked for reduced motion: otherwise the grid stays still and the page scrolls natively
	gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
		const stopSmoothScrolling = initSmoothScrolling();
		scroll();
		// Undo it all if the setting changes (GSAP reverts the animations itself)
		return stopSmoothScrolling;
	});
	document.body.classList.remove('loading');
});