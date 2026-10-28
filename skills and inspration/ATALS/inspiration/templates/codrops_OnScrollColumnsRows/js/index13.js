// Import the necessary function for preloading images
import { preloadImages } from './utils.js';
// three.js (its WebGPU build, which falls back to WebGL 2) and its shading language, TSL
import * as THREE from 'three/webgpu';
import { Fn, uniform, texture, uv, vec2, vec3, vec4, positionGeometry, modelWorldMatrix, cos, sin, min, smoothstep } from 'three/tsl';

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

// The columns come in like flags: waves run up them as they rise, twisting them back and forth and swaying them a little
// sideways and in depth, and fade as they reach the middle of the screen, so they settle into the flat grid by waving
// less and less. How far they twist at the most, in radians:
const MAX_TWIST = THREE.MathUtils.degToRad(55);
// The waves' length along a column, in viewport heights
const WAVE_LENGTH = 0.7;
// How far a column sways sideways at the most, as a share of a picture's width, and in depth, in pixels
const SWAY = 0.12;
const BULGE = 50;
// How far above the middle of the screen the columns are still (in viewport heights), and how far below it the waves are
// at their strongest
const STILL_ABOVE = 0.25;
const STRONGEST_BELOW = 0.5;
// The light comes from straight in front, so the pictures darken as they turn away, down to AMBIENT
const AMBIENT = 0.25;
// Rows of vertices down each picture, enough for its twist to look smooth
const SEGMENTS = 32;

// Texture coordinates that frame an image like the pictures' `background-size: cover` at their
// `background-position: 50% 20%` (20% from the top is 80% up in texture coordinates)
const cover = Fn(([uv, size, image]) => {
	const ratio = vec2(
		min(size.x.div(size.y).div(image.x.div(image.y)), 1),
		min(size.y.div(size.x).div(image.y.div(image.x)), 1)
	);
	return uv.mul(ratio).add(vec2(0.5, 0.8).mul(ratio.oneMinus()));
});

// Whether the browser draws on the CPU (no GPU, or a blocklisted one), too slow for this
const isSoftware = renderer => {
	const { backend } = renderer;
	if ( backend.isWebGPUBackend ) return backend.device.adapterInfo?.isFallbackAdapter === true;
	const { gl } = backend;
	const info = gl.getExtension('WEBGL_debug_renderer_info');
	const name = gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER);
	return /swiftshader|llvmpipe|software/i.test(name);
};

// The WebGL grid: a canvas over the page that draws every picture as a plane in its DOM element's place,
// waving like cloth below the middle of the screen. One world unit is one CSS pixel on the z = 0 plane.
// Resolves to { show, hide }, or rejects if the browser can't draw it on a GPU.
const createStage = async () => {
	const renderer = new THREE.WebGPURenderer({ alpha: true, antialias: true });
	await renderer.init();
	if ( isSoftware(renderer) ) {
		renderer.dispose();
		throw new Error('software rendering only');
	}
	renderer.setClearColor(0x000000, 0);
	renderer.domElement.classList.add('grid-canvas');
	document.body.append(renderer.domElement);

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(30, 1, 1, 10000);
	// The viewport's size, shared with the shaders
	const viewport = uniform(new THREE.Vector2(1, 1));
	const geometry = new THREE.PlaneGeometry(1, 1, 1, SEGMENTS);
	const loader = new THREE.TextureLoader();

	const meshes = await Promise.all(mergedItems.map(async item => {
		const map = await loader.loadAsync(getComputedStyle(item.image).backgroundImage.slice(5, -2));
		map.colorSpace = THREE.SRGBColorSpace;
		map.anisotropy = 4;

		// The picture's size on the page, in CSS pixels
		const size = uniform(new THREE.Vector2(1, 1));
		// Every other column twists the other way, and each column's waves are a little out of step with its neighbors'
		const direction = item.column % 2 ? -1 : 1;
		const offset = item.column * 1.3;
		// How far below the middle of the screen a point of the picture is, in viewport heights (negative above it; from
		// the plane's own geometry: once the material moves the points, positionLocal is the moved one in the fragment
		// shader)
		const below = modelWorldMatrix.mul(vec4(positionGeometry, 1)).y.negate().div(viewport.y);
		// How strong the waves are there: none from a little above the middle up, growing smoothly toward the bottom
		const strength = smoothstep(-STILL_ABOVE, STRONGEST_BELOW, below);
		// Where the point is along the waves
		const phase = below.mul(Math.PI * 2 / WAVE_LENGTH).add(offset);
		// How far it turns: back and forth along the column
		const angle = strength.mul(cos(phase)).mul(MAX_TWIST * direction);

		const material = new THREE.MeshBasicNodeMaterial();
		// Each row of vertices turns around the picture's vertical middle line by its angle, and moves sideways and in
		// depth with the waves, so the column ripples like a piece of cloth
		material.positionNode = Fn(() => {
			const sway = strength.mul(sin(phase.add(0.8))).mul(SWAY);
			const bulge = strength.mul(sin(phase)).mul(BULGE);
			return vec3(
				positionGeometry.x.mul(cos(angle)).add(sway),
				positionGeometry.y,
				positionGeometry.x.mul(size.x).mul(sin(angle)).add(bulge)
			);
		})();
		// The picture, framed as on the page, darker the more it turns away from the viewer. The shade is how bright it
		// looks, so it's raised to 2.2 before it darkens the picture: the shader works in linear colour.
		material.colorNode = Fn(() => {
			const shade = cos(angle).abs().mul(1 - AMBIENT).add(AMBIENT).pow(2.2);
			return vec4(texture(map, cover(uv(), size, vec2(map.image.width, map.image.height))).rgb.mul(shade), 1);
		})();

		const mesh = new THREE.Mesh(geometry, material);
		mesh.userData = { item, size };
		scene.add(mesh);
		return mesh;
	}));

	// Put every plane where its picture is on the page
	const place = () => {
		const { innerWidth: width, innerHeight: height } = window;
		meshes.forEach(mesh => {
			const rect = mesh.userData.item.element.getBoundingClientRect();
			mesh.position.set(rect.left + rect.width / 2 - width / 2, height / 2 - rect.top - rect.height / 2, 0);
			mesh.scale.set(rect.width, rect.height, 1);
			mesh.userData.size.value.set(rect.width, rect.height);
		});
	};

	// Match the canvas and camera to the viewport, with the z = 0 plane exactly the viewport's size
	const resize = () => {
		const { innerWidth: width, innerHeight: height } = window;
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(width, height, false);
		camera.aspect = width / height;
		camera.position.z = height / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
		camera.near = camera.position.z / 10;
		camera.far = camera.position.z * 10;
		camera.updateProjectionMatrix();
		viewport.value.set(width, height);
	};

	// Draw only when something moved: the page scrolled, or the window changed size
	let lastScroll = null;
	let needsResize = true;
	const onResize = () => needsResize = true;
	const render = () => {
		if ( needsResize ) {
			resize();
			needsResize = false;
			lastScroll = null;
		}
		if ( window.scrollY === lastScroll ) return;
		lastScroll = window.scrollY;
		place();
		renderer.render(scene, camera);
	};

	// Swap the DOM pictures for the canvas, drawing on GSAP's ticker (after Lenis has scrolled)
	const show = () => {
		document.documentElement.classList.add('is-webgl');
		needsResize = true;
		window.addEventListener('resize', onResize);
		gsap.ticker.add(render);
		render();
	};
	// And back
	const hide = () => {
		gsap.ticker.remove(render);
		window.removeEventListener('resize', onResize);
		document.documentElement.classList.remove('is-webgl');
	};

	// If the GPU drops the canvas (a driver reset, for one), show the DOM pictures again
	renderer.onDeviceLost = (info) => {
		console.warn(`The ${info.api} device was lost, the grid is shown without WebGL.`, info.message);
		hide();
	};

	// Compile the shaders now, so the first frames don't stutter
	resize();
	place();
	await renderer.compileAsync(scene, camera);

	return { show, hide };
};

// Preload images and fonts, set up the WebGL grid, initialize smooth scrolling, and remove loading class from body
Promise.all([preloadImages('.column__item-img'), document.fonts.ready]).then(async () => {
	// Without a GPU (or if anything goes wrong), the plain grid stays and the page simply scrolls
	const stage = await createStage().catch(error => {
		console.warn(`The grid is shown without WebGL (${error.message}).`);
		return null;
	});
	// Only when the visitor hasn't asked for reduced motion: otherwise the grid stays still and the page scrolls natively
	gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
		const stopSmoothScrolling = initSmoothScrolling();
		stage?.show();
		// Undo it all if the setting changes
		return () => {
			stopSmoothScrolling();
			stage?.hide();
		};
	});
	document.body.classList.remove('loading');
});
