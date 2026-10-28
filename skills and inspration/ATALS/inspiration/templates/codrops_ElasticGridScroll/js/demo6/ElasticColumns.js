import * as THREE from 'three';

// ──────────────── Elastic Configuration ────────────────
// Each column is a strip pinned to the top and bottom of the window. Its middle trails behind the
// scroll on a spring, so the strip stretches on one side and squeezes on the other, without gaps.
const pull = 2; // How far a column's middle can trail, as a share of the most it takes without folding over (1)
const frequency = 2.9; // Spring frequency, over the column's lag in seconds: higher follows tighter
const damping = 0.45; // Spring damping ratio: under 1 overshoots, so the columns wobble when they stop
const smear = 36; // px of motion smear where a column is stretched furthest
const split = 3.5; // px the color channels part where a column is stretched furthest
const shade = 0.3; // How much darker the squeezed parts get

// Images are baked into one texture array at this size (the box's 128/160 ratio); they never show much bigger
const textureWidth = 400;
const textureHeight = 500;

// Shader array sizes: more columns than any layout has, and at least as many images as the page
const maxColumns = 12;
const maxItems = 128;

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0); // A plane covering the whole canvas
  }
`;

const fragmentShader = /* glsl */ `
  #define MAX_COLUMNS ${maxColumns}
  #define MAX_ITEMS ${maxItems}
  #define PI 3.141592653589793

  uniform highp sampler2DArray uImages; // One layer per image
  uniform vec3 uBackground; // The page's background color: the canvas is opaque, behind the page
  uniform vec2 uViewport; // CSS px
  uniform float uPixelRatio;
  uniform vec2 uTextureSize;
  uniform float uImageHeight; // px; every image has the same size, and a column's images touch
  uniform float uSmear;
  uniform float uSplit;
  uniform float uShade;
  uniform int uColumnCount;
  uniform vec4 uColumns[MAX_COLUMNS]; // left, width, top (where the column would be without the pull, px), first item
  uniform vec4 uPulls[MAX_COLUMNS]; // item count, pull (px the column's middle trails: > 0 below, < 0 above)
  uniform vec4 uLayers[MAX_ITEMS / 4]; // Which image each item shows, four to a vec4

  float layerOf(int item) {
    vec4 four = uLayers[item / 4];
    int k = item - (item / 4) * 4;
    return k == 0 ? four.x : k == 1 ? four.y : k == 2 ? four.z : four.w;
  }

  // A column's color at a point of its content (y in px from the column's top), or the background past its ends.
  // The mipmap level is passed in: this runs inside branches, where the GPU can't pick it.
  vec3 columnAt(int first, int count, float u, float y, float lod) {
    float row = floor(y / uImageHeight);
    if (row < 0.0 || row >= float(count)) return uBackground;
    vec2 uv = vec2(u, y / uImageHeight - row);
    return textureLod(uImages, vec3(uv, layerOf(first + int(row))), lod).rgb;
  }

  void main() {
    vec2 p = vec2(gl_FragCoord.x, uViewport.y * uPixelRatio - gl_FragCoord.y) / uPixelRatio; // CSS px, y down
    gl_FragColor = vec4(uBackground, 1.0);

    for (int c = 0; c < MAX_COLUMNS; c++) {
      if (c >= uColumnCount) break;
      vec4 column = uColumns[c];
      if (p.x < column.x || p.x >= column.x + column.y) continue;

      int first = int(column.w);
      int count = int(uPulls[c].x);
      float pull = uPulls[c].y;

      // Pinned at the window's top and bottom edges, trailing by the full pull in the middle
      float along = clamp(p.y / uViewport.y, 0.0, 1.0);
      float y = p.y - column.z - pull * pow(sin(PI * along), 2.0);

      // How much the strip is stretched here: 1 minus the content px per screen px.
      // Positive where it's stretched, negative where it's squeezed, 0 at rest.
      float stretch = pull * PI / uViewport.y * sin(2.0 * PI * along);

      float u = (p.x - column.x) / column.y;
      float lod = max(log2(max(uTextureSize.x / (column.y * uPixelRatio), uTextureSize.y / (uImageHeight * uPixelRatio) * (1.0 - stretch))) - 0.5, 0.0);

      vec3 color;
      if (abs(stretch) < 0.004) {
        color = columnAt(first, count, u, y, lod); // At rest: exactly the DOM images
      } else {
        // Stretched parts smear along the pull: seven samples spread evenly, so it reads as motion, not copies
        float reach = max(stretch, 0.0) * uSmear;
        color = vec3(0.0);
        for (int k = 0; k < 7; k++) color += columnAt(first, count, u, y + (float(k) / 6.0 - 0.5) * reach, lod);
        color /= 7.0;

        // …and their color channels part a little
        float apart = stretch * uSplit;
        color.r = mix(color.r, columnAt(first, count, u, y - apart, lod).r, 0.5);
        color.b = mix(color.b, columnAt(first, count, u, y + apart, lod).b, 0.5);

        // Squeezed parts pack denser, and darken a little
        color *= 1.0 + uShade * min(stretch, 0.0);
      }

      gl_FragColor = vec4(color, 1.0);
      break;
    }
  }
`;

/**
 * Draws the grid with three.js on a canvas behind the page, as elastic columns. At rest it's exactly
 * the DOM images. While the grid scrolls, each column is a strip pinned to the window's top and bottom
 * whose middle trails behind on a spring (longer for the center columns, like variation 4), so its
 * images stretch on one side and squeeze on the other, never opening a gap. The stretched parts
 * smear with a slight color split, the squeezed parts darken, and the columns wobble when they stop.
 */
export class ElasticColumns {
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
      uImageHeight: { value: 1 },
      uSmear: { value: smear },
      uSplit: { value: split },
      uShade: { value: shade },
      uColumnCount: { value: 0 },
      uColumns: { value: Array.from({ length: maxColumns }, () => new THREE.Vector4()) },
      uPulls: { value: Array.from({ length: maxColumns }, () => new THREE.Vector4()) },
      uLayers: { value: Array.from({ length: maxItems / 4 }, () => new THREE.Vector4()) },
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
    this.needsRender = true;

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
   * @param {Array} columns - { element, lag } per column, left to right; lag in seconds
   */
  setColumns(columns) {
    const { uColumnCount, uLayers } = this.uniforms;
    let item = 0;
    this.columns = columns.slice(0, maxColumns).map(({ element, lag }) => {
      const images = [...element.querySelectorAll('.grid__item-img')].slice(0, maxItems - item);
      const first = item;
      images.forEach((el) => {
        uLayers.value[Math.floor(item / 4)].setComponent(item % 4, this.layers.get(el));
        item++;
      });
      return {
        element,
        images,
        first,
        omega: frequency / lag, // The spring: its angular frequency…
        position: null, // …where the column's middle is (screen px)…
        velocity: 0, // …and how fast it's moving
        pull: 0, // Shown pull, px
      };
    });
    uColumnCount.value = this.columns.length;
    this.measure();
  }

  /**
   * Measure the layout: canvas size, image size, and where each column's images start.
   * Call after the grid is built and on every resize.
   */
  measure() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.uniforms.uViewport.value.set(window.innerWidth, window.innerHeight);
    this.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();

    this.columns.forEach((column) => {
      const columnRect = column.element.getBoundingClientRect();
      const [first, second] = column.images.map((el) => el.getBoundingClientRect());
      column.offset = first.top - columnRect.top; // Where its first image starts
      column.position = null; // Start the spring over, at rest
      this.uniforms.uImageHeight.value = second ? second.top - first.top : first.height; // Images touch, so this is also the height
    });

    // Draw right away: resizing clears the canvas, and it mustn't show empty for a frame
    this.needsRender = true;
    this.sync();
  }

  /**
   * Runs on every frame (gsap.ticker): move each column's spring after where the column really is, then draw
   * @param {number} time - Unused
   * @param {number} deltaTime - ms since the last frame
   */
  update(time, deltaTime) {
    const dt = Math.min(deltaTime / 1000, 1 / 30); // Seconds, capped so a hidden tab coming back doesn't explode the springs
    if (!dt) return;
    const limit = (pull * window.innerHeight) / Math.PI; // Past H / PI, the strip would fold over

    this.columns.forEach((column) => {
      const target = column.element.getBoundingClientRect().top + column.offset;
      if (column.position === null) column.position = target;

      // A damped spring: the column's middle follows where the column is, a little late, and overshoots
      const { omega } = column;
      const acceleration =
        omega * omega * (target - column.position) - 2 * damping * omega * column.velocity;
      column.velocity += acceleration * dt;
      column.position += column.velocity * dt;

      const trail = column.position - target;
      const shown = limit * Math.tanh(trail / limit); // Eased towards the limit
      if (Math.abs(trail) < 0.05 && Math.abs(column.velocity) < 0.05) {
        column.position = target; // At rest
        column.velocity = 0;
        if (column.pull) this.needsRender = true;
        column.pull = 0;
      } else {
        column.pull = shown;
        this.needsRender = true;
      }
    });

    this.sync();
  }

  /**
   * Hand the shader where every column is and draw, if anything moved. Runs after update(), and also
   * whenever ScrollSmoother moves the page outside the ticker (touch scrolling does), so the canvas is
   * never a frame behind the page.
   */
  sync() {
    const { uColumns, uPulls } = this.uniforms;

    this.columns.forEach((column, c) => {
      const rect = column.element.getBoundingClientRect();
      const top = rect.top + column.offset;
      if (top !== uColumns.value[c].z) this.needsRender = true;
      uColumns.value[c].set(rect.left, rect.width, top, column.first);
      uPulls.value[c].set(column.images.length, column.pull, 0, 0);
    });

    if (!this.needsRender) return;
    this.needsRender = false;
    this.renderer.render(this.scene, this.camera);
  }
}
