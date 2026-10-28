// Import the necessary function for preloading images
import { preloadImages } from './utils.js';
// three.js (its WebGPU build, which falls back to WebGL 2) and its shading language, TSL
import * as THREE from 'three/webgpu';
import { Fn, uniform, texture, uv, vec2, vec3, vec4, positionGeometry, cos, sin, min, dot, select, abs } from 'three/tsl';

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

// Below the middle of the screen the columns hang like strips of paper and swing toward and away from the viewer as the
// page scrolls, each out of step with its neighbors. How far a strip bends at the bottom of the screen at the most, in
// radians, and how much the swing differs from one column to the next
const MAX_BEND = THREE.MathUtils.degToRad(45);
const COLUMN_OFFSET = 1.1;
// How many viewport heights of scrolling one full swing takes
const SWING_PERIOD = 1.6;
// Rows of vertices down each picture, enough for the bend to look smooth
const SEGMENTS = 24;
// The light: from the front and from above, plus some light from everywhere
const LIGHT = new THREE.Vector3(0, 0.45, 1).normalize();
const AMBIENT = 0.3;

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

// The WebGL grid: a canvas over the page that draws every picture where its DOM element is, flat from the middle of
// the screen up, and below it bending each column toward or away from the viewer like a hanging strip of paper, swinging
// as the page scrolls. One world unit is one CSS pixel on the z = 0 plane. Resolves to { show, hide }, or rejects if the
// browser can't draw it on a GPU.
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
	// The grid's middle (x) and half its width, worked out in place()
	const gridCenter = uniform(0);
	const halfWidth = uniform(1);
	const geometry = new THREE.PlaneGeometry(1, 1, 1, SEGMENTS);
	const loader = new THREE.TextureLoader();

	const meshes = await Promise.all(mergedItems.map(async item => {
		const map = await loader.loadAsync(getComputedStyle(item.image).backgroundImage.slice(5, -2));
		map.colorSpace = THREE.SRGBColorSpace;
		map.anisotropy = 4;

		// The picture's middle and size on the page, flat, in world units
		const center = uniform(new THREE.Vector2(0, 0));
		const size = uniform(new THREE.Vector2(1, 1));
		// A point of the picture as it lies flat on the page (from the plane's own geometry: once the material moves the
		// points, positionLocal is the moved one in the fragment shader), how far across from the grid's middle it is,
		// and how far below the middle of the screen (negative above it)
		const flatX = center.x.add(positionGeometry.x.mul(size.x));
		const flatY = center.y.add(positionGeometry.y.mul(size.y));
		const across = flatX.sub(gridCenter);
		const below = flatY.negate();
		// How lit a surface facing a direction is, compared with one facing the viewer (at most as bright). It's how
		// bright it looks, so it's raised to 2.2 before it darkens the picture: the shader works in linear colour.
		const lit = normal => min(dot(normal, vec3(LIGHT.x, LIGHT.y, LIGHT.z)).max(0).mul(1 - AMBIENT).add(AMBIENT).div(AMBIENT + (1 - AMBIENT) * LIGHT.z), 1).pow(2.2);
		// The picture, framed as on the page
		const picture = () => texture(map, cover(uv(), size, vec2(map.image.width, map.image.height))).rgb;

		const material = new THREE.MeshBasicNodeMaterial();
		// How far this column swings right now, from 1 (toward the viewer) to -1 (away), set in place()
		const swing = uniform(0);
		// The strip bends evenly from the middle of the screen to its bottom, as much as its swing says, and runs straight
		// on below that: how far down the strip the point is, how much of that is on the bend, how tightly it bends (kept off
		// zero so the curve below stays defined), and how far round it has turned
		const along = below.max(0);
		const onBend = along.min(viewport.y.mul(0.5));
		const beyond = along.sub(onBend);
		const bend = swing.mul(MAX_BEND).div(viewport.y.mul(0.5));
		const curvature = select(abs(bend).lessThan(1e-7), 1e-7, bend);
		const angle = onBend.mul(curvature);
		// Down the curve from the middle of the screen: it drops and moves toward (or away from) the viewer, then carries
		// straight on in the direction it ended up
		material.positionNode = Fn(() => vec3(
			flatX,
			flatY.add(along).sub(sin(angle).div(curvature)).sub(beyond.mul(cos(angle))),
			cos(angle).oneMinus().div(curvature).add(beyond.mul(sin(angle)))
		))();
		// Lit by which way it faces as it bends: lighter tipped up toward the light, darker tipped down
		material.colorNode = Fn(() => vec4(picture().mul(lit(vec3(0, sin(angle), cos(angle)))), 1))();

		// The shader places it from the page's layout, so it stays at the origin and is never culled
		const mesh = new THREE.Mesh(geometry, material);
		mesh.frustumCulled = false;
		mesh.userData = { item, center, size, swing };
		scene.add(mesh);
		return mesh;
	}));

	// Hand the shaders every picture's place on the page
	const place = () => {
		const { innerWidth: width, innerHeight: height } = window;
		const gridRect = grid.getBoundingClientRect();
		gridCenter.value = gridRect.left + gridRect.width / 2 - width / 2;
		halfWidth.value = gridRect.width / 2;
		// Each column's swing follows the scroll, a little out of step with the one before
		meshes.forEach(mesh => {
			mesh.userData.swing.value = Math.sin(window.scrollY / (height * SWING_PERIOD) * Math.PI * 2 + mesh.userData.item.column * COLUMN_OFFSET);
		});
		meshes.forEach(mesh => {
			const rect = mesh.userData.item.element.getBoundingClientRect();
			mesh.userData.center.value.set(rect.left + rect.width / 2 - width / 2, height / 2 - rect.top - rect.height / 2);
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
