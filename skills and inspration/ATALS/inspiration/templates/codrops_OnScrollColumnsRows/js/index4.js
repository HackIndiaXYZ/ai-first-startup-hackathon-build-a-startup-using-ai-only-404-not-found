// Import the necessary function for preloading images
import { preloadImages } from './utils.js';

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
	const maxColumns = columns.length;
	const middleColumn = Math.floor(maxColumns / 2);
	const xIncrement = (maxColumns > 1) ? 400 / (maxColumns - 1) : 0;

	mergedItems.forEach(item => {
		gsap.set(item.element, {
			perspective: 1500
		});

		let xPercentValue = 0;

		if (item.column === 0) {
			xPercentValue = -200;
		} else if (item.column === middleColumn) {
			xPercentValue = 0;
		} else if (item.column === maxColumns - 1) {
			xPercentValue = 200;
		} else {
			xPercentValue = -200 + (item.column * xIncrement);
		}

		const rotationXValue = -25*(item.column+1);
		const zValue = 30*(item.column+1);
		
		gsap
		.timeline({
			defaults: {
				ease: 'power2'
			},
			scrollTrigger: {
				trigger: item.element,
				start: 'top bottom',
				end: 'clamp(center top)',
				scrub: true
			}
		})
		.fromTo(item.wrapper, {
			rotationX: rotationXValue,
			z: zValue,
			yPercent: 30,
			xPercent: xPercentValue
		}, {
			startAt: {transformOrigin: '50% 100%'},
			rotationX: 0,
			z: 0,
			yPercent: 0,
			xPercent: 0
		}, 0)
		.fromTo(item.image, {
			filter: 'hue-rotate(90deg)',
			scale: 3
		}, {
			filter: 'hue-rotate(0deg)',
			scale: 1
		}, 0);
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