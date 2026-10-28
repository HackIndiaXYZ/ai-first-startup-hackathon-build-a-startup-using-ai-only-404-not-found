import * as THREE from 'three';

// ──────────────── Whirlpool Configuration ────────────────
// Scrolling swirls the grid into a whirlpool around a center (the pointer, or the middle of the window):
// the center turns furthest and pulls in, fading out towards the window's edges. When the scroll slows,
// nothing turns back: the outer grid keeps turning the same way until it catches up with the center,
// and the whole grid lines up again after a whole number of turns.
const maxTwist = 10.55; // Twist (radians, at the center) the whirlpool eases towards on a fast scroll
const speedScale = 2200; // Scroll speed (px/s) that takes the twist to about 0.76 of maxTwist (tanh(1))
const windUp = 0.12; // Seconds the twist takes to follow a faster scroll
const windDown = 0.3; // Seconds it takes to settle once the scroll slows (no spring, so no bounce the other way)
const reach = 0.36; // How far the twist reaches, as a share of the window's diagonal
const pinch = 0.18; // How much it pulls in towards the center as it winds
const blur = 0.022; // Seconds of rotational motion blur: the spin's speed times this is the blurred angle
const maxBlur = 0.12; // Blurred angle limit (radians), so fast flicks stay readable
const shade = 0.35; // How much darker the grid gets where the twist stretches it most
const follow = 0.3; // Seconds the twist's center takes to catch up with the pointer

// Images are baked into one texture array at this size (the box's 128/160 ratio); they never show much bigger
const textureWidth = 400;
const textureHeight = 500;

// Shader array sizes: more columns than any layout has, and at least as many images as the page
const maxColumns = 12;
const maxItems = 256;

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0); // A plane covering the whole canvas
  }
`;

const fragmentShader = /* glsl */ `
  #define MAX_COLUMNS ${maxColumns}
  #define MAX_ITEMS ${maxItems}

  uniform highp sampler2DArray uImages; // One layer per image
  uniform vec3 uBackground; // The page's background color: the canvas is opaque, behind the page
  uniform vec2 uViewport; // CSS px
  uniform float uPixelRatio;
  uniform vec2 uTextureSize;
  uniform float uColumnWidth;
  uniform float uImageHeight; // px; every image has the same size, and a column's images touch
  uniform float uSheetLeft; // Where the first column's images start (px, past the window's left edge)
  uniform int uColumnCount;
  uniform vec4 uColumns[MAX_COLUMNS]; // top (px on screen, lag included), first item, item count
  uniform vec4 uLayers[MAX_ITEMS / 4]; // Which image each item shows, four to a vec4
  uniform vec2 uCenter; // The twist's center (px)
  uniform float uTwist; // Twist at the center, on top of the phase (radians)
  uniform float uPhase; // Turn of the whole grid (radians): how far the outer grid has caught up
  uniform float uSpinTwist; // How much of the twist the motion blur spreads over (radians)
  uniform float uSpinPhase; // …and of the phase
  uniform float uRadius; // px
  uniform float uPinch;
  uniform float uShade;

  float layerOf(int item) {
    vec4 four = uLayers[item / 4];
    int k = item - (item / 4) * 4;
    return k == 0 ? four.x : k == 1 ? four.y : k == 2 ? four.z : four.w;
  }

  // The grid's color at a point (px on screen, before the twist). It wraps round both ways: columns past
  // either side, and rows past a column's ends, since the whirlpool turns the whole grid near the page's ends too.
  vec3 gridAt(vec2 q, float lod) {
    float x = (q.x - uSheetLeft) / uColumnWidth;
    float column = floor(x);
    vec4 data = uColumns[int(mod(column, float(uColumnCount)))];
    float y = q.y - data.x;
    float row = mod(floor(y / uImageHeight), data.z);
    // The mipmap level is passed in: this runs inside branches, where the GPU can't pick it
    return textureLod(uImages, vec3(x - column, y / uImageHeight - row, layerOf(int(data.y) + int(row))), lod).rgb;
  }

  // Where the content shown at p comes from, for this twist (at the center) and phase (everywhere)
  vec2 untwist(vec2 p, float twist, float phase) {
    vec2 d = p - uCenter;
    float falloff = exp(-dot(d, d) / (uRadius * uRadius)); // 1 at the center, fading out
    float a = -(phase + twist * falloff);
    return uCenter + mat2(cos(a), sin(a), -sin(a), cos(a)) * d * (1.0 + uPinch * abs(twist) * falloff);
  }

  void main() {
    vec2 p = vec2(gl_FragCoord.x, uViewport.y * uPixelRatio - gl_FragCoord.y) / uPixelRatio; // CSS px, y down
    float lod = max(log2(uTextureSize.x / (uColumnWidth * uPixelRatio)) - 0.5, 0.0);

    vec3 color;
    if (abs(uTwist) < 0.0001 && abs(uPhase) < 0.0001 && abs(uSpinTwist) + abs(uSpinPhase) < 0.0001) {
      color = gridAt(p, lod); // At rest: exactly the DOM images
    } else {
      // Rotational motion blur: nine samples across the angle the grid turned through, so it reads as blur, not copies
      color = vec3(0.0);
      for (int k = 0; k < 9; k++) {
        float t = float(k) / 8.0 - 0.5;
        color += gridAt(untwist(p, uTwist + t * uSpinTwist, uPhase + t * uSpinPhase), lod);
      }
      color /= 9.0;

      // Wrung: darker where the twist stretches the grid most (its shear, r × dθ/dr)
      vec2 d = p - uCenter;
      float r2 = dot(d, d) / (uRadius * uRadius);
      float shear = abs(uTwist) * 2.0 * r2 * exp(-r2);
      color *= 1.0 - uShade * min(shear, 1.0);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

/**
 * Draws the grid with three.js on a canvas behind the page, swirling it into a whirlpool as it scrolls. At rest
 * it's exactly the DOM images. While the grid scrolls, it twists around the pointer (or the middle of the
 * window): the center turns furthest and pulls in, the twist fades out towards the edges, a rotational blur
 * follows the spin, and the stretched parts darken. Every point only ever turns the way the scroll turns it:
 * as the scroll slows, the twist hands over to a turn of the whole grid (the phase), so the outer grid keeps
 * turning until it has caught up with the center, at a whole number of turns, where the grid is back as it was.
 * Columns wrap round at the sides, so the window never shows a gap.
 */
export class Whirlpool {
  /**
   * Throws if WebGL 2 isn't available, so the caller can keep the DOM images instead
   */
  constructor() {
    // Opaque, painted with the page's background: nothing here depends on how the browser composites
    // a transparent canvas
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Sharp, without paying for 3x screens

    // The page's background as raw sRGB, like the images (THREE.Color would convert it to linear)
    const [red, green, blue] = getComputedStyle(document.body)
      .backgroundColor.match(/[\d.]+/g)
      .map(Number);
    this.renderer.setClearColor(
      new THREE.Color().setRGB(red / 255, green / 255, blue / 255, THREE.SRGBColorSpace),
    );
    this.renderer.domElement.className = 'webgl';
    document.body.prepend(this.renderer.domElement); // Before the smooth wrapper and the frame, so they draw on top

    this.uniforms = {
      uImages: { value: null },
      uBackground: { value: new THREE.Vector3(red / 255, green / 255, blue / 255) },
      uViewport: { value: new THREE.Vector2(1, 1) },
      uPixelRatio: { value: 1 },
      uTextureSize: { value: new THREE.Vector2(textureWidth, textureHeight) },
      uColumnWidth: { value: 1 },
      uImageHeight: { value: 1 },
      uSheetLeft: { value: 0 },
      uColumnCount: { value: 0 },
      uColumns: { value: Array.from({ length: maxColumns }, () => new THREE.Vector4()) },
      uLayers: { value: Array.from({ length: maxItems / 4 }, () => new THREE.Vector4()) },
      uCenter: { value: new THREE.Vector2() },
      uTwist: { value: 0 },
      uPhase: { value: 0 },
      uSpinTwist: { value: 0 },
      uSpinPhase: { value: 0 },
      uRadius: { value: 1 },
      uPinch: { value: pinch },
      uShade: { value: shade },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      blending: THREE.NoBlending, // The shader writes the final pixel
      depthTest: false,
      depthWrite: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    quad.frustumCulled = false;
    this.scene = new THREE.Scene();
    this.scene.add(quad);
    this.camera = new THREE.Camera(); // Unused: the vertex shader covers the canvas directly

    this.layers = new Map(); // .grid__item-img element → its layer in the texture array
    this.columns = [];
    this.twist = 0; // Twist at the center, on top of…
    this.phase = 0; // …the turn of the whole grid (radians)
    this.settle = null; // While settling: where the phase started, the twist it started from, and the turn it ends at
    this.gridTop = null; // Where the grid was at the last update(), for the scroll speed
    this.center = null; // The twist's center, following…
    this.target = null; // …the pointer (null: the middle of the window)
    this.needsRender = true;

    window.addEventListener(
      'pointermove',
      (event) => (this.target = { x: event.clientX, y: event.clientY }),
    );
    document.documentElement.addEventListener('pointerleave', () => (this.target = null));

    this.update = this.update.bind(this);
    this.sync = this.sync.bind(this);
  }

  /**
   * Bake every distinct image into one texture array (a layer each), cropped like background-size: cover
   * @param {Element[]} elements - The .grid__item-img elements
   * @returns {Promise} - Resolves when the texture is ready
   */
  async load(elements) {
    const urlOf = (el) => getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/)[1];
    const urls = [...new Set(elements.map(urlOf))];
    elements.forEach((el) => this.layers.set(el, urls.indexOf(urlOf(el))));

    const images = await Promise.all(
      urls.map(async (url) => {
        const img = new Image();
        img.src = url;
        await img.decode();
        return img;
      }),
    );

    const canvas = document.createElement('canvas');
    canvas.width = textureWidth;
    canvas.height = textureHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const layerSize = textureWidth * textureHeight * 4;
    const data = new Uint8Array(layerSize * images.length);

    images.forEach((img, i) => {
      const scale = Math.max(textureWidth / img.naturalWidth, textureHeight / img.naturalHeight);
      const width = img.naturalWidth * scale;
      const height = img.naturalHeight * scale;
      context.drawImage(
        img,
        (textureWidth - width) / 2,
        (textureHeight - height) / 2,
        width,
        height,
      );
      data.set(context.getImageData(0, 0, textureWidth, textureHeight).data, i * layerSize);
    });

    // Rows go in top first, which is uv.y = 0 in the shader, where y points down too.
    // Left in its own color space, like the DOM images, so the colors match them exactly.
    const texture = new THREE.DataArrayTexture(data, textureWidth, textureHeight, images.length);
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
    this.uniforms.uImages.value = texture;
  }

  /**
   * Take over a new set of columns (after the grid is rebuilt)
   * @param {Element} grid - The .grid element
   * @param {Element[]} columnElements - The .grid__column elements, left to right
   */
  setColumns(grid, columnElements) {
    const { uColumnCount, uLayers } = this.uniforms;
    this.grid = grid;
    let item = 0;
    this.columns = columnElements.slice(0, maxColumns).map((element) => {
      const images = [...element.querySelectorAll('.grid__item-img')].slice(0, maxItems - item);
      const first = item;
      images.forEach((el) => {
        uLayers.value[Math.floor(item / 4)].setComponent(item % 4, this.layers.get(el));
        item++;
      });
      return { element, images, first };
    });
    uColumnCount.value = this.columns.length;
    this.measure();
  }

  /**
   * Measure the layout. Call after the grid is built and on every resize.
   */
  measure() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    const { uViewport, uPixelRatio, uColumnWidth, uImageHeight, uSheetLeft, uRadius } =
      this.uniforms;
    uViewport.value.set(width, height);
    uPixelRatio.value = this.renderer.getPixelRatio();
    uRadius.value = reach * Math.hypot(width, height);

    // Measured from the images, not the columns: the outer columns are narrower and only show half of theirs,
    // so the sheet starts at the first column's images, past the window's left edge
    const [first, second] = this.columns[0].images.map((el) => el.getBoundingClientRect());
    uColumnWidth.value = first.width;
    uImageHeight.value = second ? second.top - first.top : first.height; // Images touch, so this is also the height
    uSheetLeft.value = first.left;
    this.columns.forEach(
      (column) =>
        (column.offset =
          column.images[0].getBoundingClientRect().top -
          column.element.getBoundingClientRect().top),
    );

    this.gridTop = null; // Start the speed over
    // Draw right away: resizing clears the canvas, and it mustn't show empty for a frame
    this.needsRender = true;
    this.sync();
  }

  /**
   * Runs on every frame (gsap.ticker): follow the scroll speed with the twist, hand the twist over to the
   * phase as it settles, let the center follow the pointer, then draw
   * @param {number} time - Unused
   * @param {number} deltaTime - ms since the last frame
   */
  update(time, deltaTime) {
    const elapsed = deltaTime / 1000;
    if (!elapsed) return;
    const dt = Math.min(elapsed, 1 / 30); // Capped, so a hidden tab coming back doesn't jump

    // The grid itself doesn't lag (its columns do), so it moves exactly with the scroll
    const top = this.grid.getBoundingClientRect().top;
    const speed = this.gridTop === null ? 0 : (top - this.gridTop) / elapsed; // px/s, negative while scrolling down
    this.gridTop = top;

    // The twist follows a target that grows with the speed (easing towards maxTwist): quickly as it winds up,
    // slower as it settles, and never past it, so it doesn't bounce into a whirlpool the other way
    const target = maxTwist * Math.tanh(-speed / speedScale);
    const previousTwist = this.twist;
    const previousPhase = this.phase;
    const reversing = target * previousTwist < 0; // Scrolling the other way: the whirlpool turns back with it
    const winding = reversing || Math.abs(target) > Math.abs(previousTwist);
    this.twist += (target - this.twist) * (1 - Math.exp(-dt / (winding ? windUp : windDown)));

    if (winding) {
      this.settle = null; // The phase holds: the center turns on, the outer grid waits
    } else if (this.twist !== previousTwist) {
      // Settling: the phase turns on as the twist lets go, so no point ever turns back. It ends on the next
      // whole turn past where the center is, where the grid is back as it was.
      if (!this.settle) {
        const center = this.phase + previousTwist;
        const turns = previousTwist > 0 ? Math.ceil(center / (2 * Math.PI)) : Math.floor(center / (2 * Math.PI));
        this.settle = { phase: this.phase, twist: previousTwist, goal: turns * 2 * Math.PI };
      }
      const { phase, twist, goal } = this.settle;
      this.phase = phase + (goal - phase) * (1 - this.twist / twist);
    }

    // At rest once every point is within half a pixel of where it ends (the corners move furthest)
    const left = Math.abs(this.twist) + (this.settle ? Math.abs(this.settle.goal - this.phase) : 0);
    const resting = !target && left * Math.hypot(window.innerWidth, window.innerHeight) < 0.5;
    if (resting) {
      if (this.twist || this.phase || this.uniforms.uSpinTwist.value || this.uniforms.uSpinPhase.value) this.needsRender = true;
      this.twist = 0;
      this.phase = 0; // A whole number of turns is the same as none
      this.settle = null;
    } else {
      this.needsRender = true;
    }

    // The center drifts after the pointer (or back to the middle of the window), but holds while the whole grid
    // is turned: moving it then would slide the grid around
    const goal = this.target ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.center ??= { ...goal };
    if (!this.phase) {
      const ease = 1 - Math.exp(-dt / follow);
      this.center.x += (goal.x - this.center.x) * ease;
      this.center.y += (goal.y - this.center.y) * ease;
    }

    // Motion blur across the angle the grid turned through this frame, capped where it turns most
    let spinTwist = ((this.twist - previousTwist) / dt) * blur;
    let spinPhase = ((this.phase - previousPhase) / dt) * blur;
    const scale = Math.min(1, maxBlur / (Math.abs(spinTwist) + Math.abs(spinPhase) || 1));
    spinTwist *= scale;
    spinPhase *= scale;

    const { uTwist, uPhase, uSpinTwist, uSpinPhase, uCenter } = this.uniforms;
    uTwist.value = this.twist;
    uPhase.value = this.phase;
    uSpinTwist.value = resting ? 0 : spinTwist;
    uSpinPhase.value = resting ? 0 : spinPhase;
    uCenter.value.set(this.center.x, this.center.y);

    this.sync();
  }

  /**
   * Hand the shader where every column is and draw, if anything moved. Runs after update(), and also
   * whenever ScrollSmoother moves the page outside the ticker (touch scrolling does), so the canvas is
   * never a frame behind the page.
   */
  sync() {
    const { uColumns } = this.uniforms;
    this.columns.forEach((column, c) => {
      const top = column.element.getBoundingClientRect().top + column.offset;
      if (top !== uColumns.value[c].x) this.needsRender = true;
      uColumns.value[c].set(top, column.first, column.images.length, 0);
    });

    if (!this.needsRender) return;
    this.needsRender = false;
    this.renderer.render(this.scene, this.camera);
  }
}
