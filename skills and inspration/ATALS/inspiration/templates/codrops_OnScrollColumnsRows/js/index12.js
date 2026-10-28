// Import the necessary function for preloading images
import { preloadImages } from './utils.js';
// three.js (its WebGPU build, which falls back to WebGL 2) and its shading language, TSL
import * as THREE from 'three/webgpu';
import { Fn, uniform, texture, uv, vec2, vec3, vec4, positionGeometry, mix, min } from 'three/tsl';

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

// How far a row folds at most, in degrees
const MAX_FOLD = 70;
// Where on the screen the strip is fully open: from there up, the rows are flat (0 is the top, 1 the bottom)
const FLAT_AT = 0.5;

// The light comes from the front, a little from above (in degrees), plus some light from everywhere
const LIGHT_ANGLE = 15;
const AMBIENT = 0.33;
// How lit a row is at a fold angle, relative to lying flat (at most 1): rows tilted up (positive angles, top edge back)
// face the light more than rows tilted down, so the zigzag has a lit side and a shaded side, and lightens as it opens
const lit = angle => {
	const light = degrees => AMBIENT + (1 - AMBIENT) * Math.max(0, Math.cos((degrees - LIGHT_ANGLE) * Math.PI / 180));
	return Math.min(1, light(angle) / light(0));
};

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

// The WebGL grid: a canvas over the page that draws the rows as one strip, each row a flat panel hanging from the
// bottom edge of the row above: folded into a zigzag below the middle of the screen, flat from there up. Neighboring
// panels share the exact same edges, so the strip has no seams. One world unit is one CSS pixel on the z = 0 plane.
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
	// Each picture stays flat, so its two corners down each side are enough
	const geometry = new THREE.PlaneGeometry(1, 1);
	// The grid's left edge and a column's width, shared by every picture so neighbors meet exactly
	const gridLeft = uniform(0);
	const columnWidth = uniform(1);
	const loader = new THREE.TextureLoader();

	const meshes = await Promise.all(mergedItems.map(async item => {
		const map = await loader.loadAsync(getComputedStyle(item.image).backgroundImage.slice(5, -2));
		map.colorSpace = THREE.SRGBColorSpace;
		map.anisotropy = 4;

		// The picture's size, for framing it
		const size = uniform(new THREE.Vector2(1, 1));
		// Its row's top and bottom edges (height, depth), worked out in place(): the bottom edge is the next row's top
		const hingeTop = uniform(new THREE.Vector2(0, 0));
		const hingeBottom = uniform(new THREE.Vector2(0, 0));
		// How lit its row is (see lit()), as it looks
		const shade = uniform(1);

		const material = new THREE.MeshBasicNodeMaterial();
		// Across, the picture spans its column; down, it runs from its row's top edge to its bottom edge, so it lies in
		// the row's folded plane
		material.positionNode = Fn(() => {
			const x = gridLeft.add(columnWidth.mul(positionGeometry.x.add(0.5 + item.column)));
			const edge = mix(hingeTop, hingeBottom, positionGeometry.y.negate().add(0.5));
			return vec3(x, edge.x, edge.y);
		})();
		// The picture, framed as on the page, shaded by its row's light. The shade is how bright it looks, so it's raised
		// to 2.2 before it darkens the picture: the shader works in linear colour.
		material.colorNode = Fn(() => {
			return vec4(texture(map, cover(uv(), size, vec2(map.image.width, map.image.height))).rgb.mul(shade.pow(2.2)), 1);
		})();

		// The shader places it from the page's layout, so it stays at the origin and is never culled
		const mesh = new THREE.Mesh(geometry, material);
		mesh.frustumCulled = false;
		mesh.userData = { item, size, hingeTop, hingeBottom, shade };
		scene.add(mesh);
		return mesh;
	}));

	// The rows, each one the meshes of the pictures at the same height in every column
	const rows = items[0].map((_, row) => items.map(columnItems => meshes[mergedItems.indexOf(columnItems[row])]));

	// Hand the shaders the grid's place and every row's edges, worked out from the top down: rows from the middle of
	// the screen up stay where they are on the page; below it, each hangs from the bottom edge of the row above,
	// folded more the further down it is, every other one the other way, so the strip zigzags into the screen and back
	const place = () => {
		const { innerWidth: width, innerHeight: height } = window;
		const gridRect = grid.getBoundingClientRect();
		gridLeft.value = gridRect.left - width / 2;
		columnWidth.value = gridRect.width / columns.length;

		const flatLine = height * FLAT_AT;
		// Every row's top edge (height, depth), and the last row's bottom edge after them
		const edges = [];
		const angles = [];
		const heights = [];
		let top = 0;
		let depth = 0;
		rows.forEach((row, pos) => {
			const rect = row[0].userData.item.element.getBoundingClientRect();
			// Folded more the further below the flat line it would be, and flat from there up
			const amount = gsap.utils.clamp(0, 1, (rect.top - flatLine) / (height - flatLine));
			// Flat rows stay where they are on the page
			if ( pos === 0 || amount === 0 ) {
				top = height / 2 - rect.top;
				depth = 0;
			}
			const angle = (pos % 2 ? 1 : -1) * MAX_FOLD * amount;
			edges.push([top, depth]);
			angles.push(angle);
			heights.push(rect.height);
			// Its bottom edge, where the next row hangs from
			const radians = angle * Math.PI / 180;
			top -= rect.height * Math.cos(radians);
			depth += rect.height * Math.sin(radians);
		});
		edges.push([top, depth]);

		rows.forEach((row, pos) => row.forEach(mesh => {
			mesh.userData.size.value.set(columnWidth.value, heights[pos]);
			mesh.userData.hingeTop.value.set(...edges[pos]);
			mesh.userData.hingeBottom.value.set(...edges[pos + 1]);
			mesh.userData.shade.value = lit(angles[pos]);
		}));
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
