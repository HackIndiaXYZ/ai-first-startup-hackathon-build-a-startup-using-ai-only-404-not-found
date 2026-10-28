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
	// Set perspective
	gsap.set([grid, mergedItems.map(item => item.element)], {
		perspective: 600
	});

	// Define GSAP timeline with ScrollTrigger
	gsap.timeline({
		defaults: { ease: 'power2' },
		scrollTrigger: {
			trigger: grid,
			start: 'clamp(top bottom)',
			end: 'clamp(bottom top)',
			scrub: true
		}
	})
	.to(columns[0], {
		startAt: {transformOrigin: '100% 50%'},
		rotationY: 8,
		z: 20
	}, 0)
	.to(columns[1], {
		startAt: {transformOrigin: '100% 50%'},
		rotationY: 4
	}, 0)
	.to(columns[2], {
		startAt: {transformOrigin: '0% 50%'},
		rotationY: -3
	}, 0)
	.to(columns[3], {
		startAt: {transformOrigin: '0% 50%'},
		rotationY: -6,
		z: 20
	}, 0)
	
	mergedItems.forEach(item => {
		gsap.fromTo(item.wrapper, {
			opacity: 0,
			rotationX: -90,
			transformOrigin: '50% 0%'
		}, {
			scrollTrigger: {
				trigger: item.element,
				start: 'top bottom',
				end: 'clamp(center center-=25%)',
				scrub: true
			},
			opacity: 1,
			rotationX: 0
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