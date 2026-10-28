import * as THREE from 'three';

// ──────────────── Fold Configuration ────────────────
// The grid is one sheet of paper. While it scrolls, it folds like an accordion along its column
// lines, deepest in the middle of the window and flat at its top and bottom edges.
const maxFold = 0.62; // Fold angle (radians) the sheet eases towards on a fast scroll
const speedScale = 2200; // Scroll speed (px/s) that takes the fold to about 0.76 of maxFold (tanh(1))
const stiffness = 70; // Spring stiffness: how fast the sheet flattens again
const damping = 8; // Spring damping: lower wobbles longer (it overshoots into the opposite folds)
const perspective = 800; // px, like CSS perspective: how strongly the folds come towards the viewer
const sheen = 0.28; // Strength of the highlight along the ridges

// Images are baked into one texture array at this size (the box's 128/160 ratio); they never show much bigger
const textureWidth = 480;
const textureHeight = 600;

// Shader array sizes: more columns than any layout has, and at least as many images as the page
const maxColumns = 12;
const maxItems = 128;
const extraColumns = 2; // Columns wrapped in on each side, so the folded sheet still fills the window
const rows = 64; // Mesh rows down the window, for the curved fold lines

const vertexShader = /* glsl */ `
  #define PI 3.141592653589793

  uniform float uFold; // Fold angle in the middle of the window (radians): > 0 folds one way, < 0 the other
  uniform vec2 uViewport; // CSS px
  uniform float uColumnWidth;
  uniform float uCenter; // Where the sheet folds around (px across the grid): the window's middle
  uniform float uLeft; // The grid's left edge on screen (px)
  varying vec2 vSheet;
  varying float vFold;

  void main() {
    // position.xy is a point of the flat sheet: x in px across the grid (from its left edge), y in screen px down
    vec2 sheet = position.xy;
    float fold = uFold * sin(PI * clamp(sheet.y / uViewport.y, 0.0, 1.0)); // Flat at the window's top and bottom

    // Folding pulls the columns together around the middle; every other column line comes forward,
    // so each column is a rigid panel tilted by the fold angle
    float x = uCenter + (sheet.x - uCenter) * cos(fold);
    float line = floor(sheet.x / uColumnWidth + 0.5); // The mesh has a vertex column on every column line
    float z = mod(line, 2.0) * uColumnWidth * sin(fold);

    vSheet = sheet;
    vFold = fold;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(uLeft + x - uViewport.x * 0.5, uViewport.y * 0.5 - sheet.y, z, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  #define MAX_COLUMNS ${maxColumns}
  #define MAX_ITEMS ${maxItems}

  uniform highp sampler2DArray uImages; // One layer per image
  uniform vec3 uBackground; // The page's background color, past the grid's ends
  uniform float uPixelRatio;
  uniform vec2 uTextureSize;
  uniform float uColumnWidth;
  uniform float uImageHeight; // px; every image has the same size, and a column's images touch
  uniform float uSheen;
  uniform int uColumnCount;
  uniform vec4 uColumns[MAX_COLUMNS]; // top (px on screen, lag included), first item, item count
  uniform vec4 uLayers[MAX_ITEMS / 4]; // Which image each item shows, four to a vec4
  varying vec2 vSheet;
  varying float vFold;

  float layerOf(int item) {
    vec4 four = uLayers[item / 4];
    int k = item - (item / 4) * 4;
    return k == 0 ? four.x : k == 1 ? four.y : k == 2 ? four.z : four.w;
  }

  void main() {
    // The sheet's column here; the extra ones on each side wrap round to the other end of the grid
    float column = floor(vSheet.x / uColumnWidth);
    int c = int(mod(column, float(uColumnCount)));
    vec4 data = uColumns[c];
    float y = vSheet.y - data.x;
    float row = floor(y / uImageHeight);

    vec3 color = uBackground;
    if (row >= 0.0 && row < data.z) {
      vec2 uv = vec2(vSheet.x / uColumnWidth - column, y / uImageHeight - row);
      // The mipmap level from the image's size on screen: this is read inside a branch, where the GPU can't pick it
      float lod = max(log2(uTextureSize.x / (uColumnWidth * uPixelRatio)) - 0.5, 0.0);
      color = textureLod(uImages, vec3(uv, layerOf(int(data.y) + int(row))), lod).rgb;
    }

    // Light from the top left: each panel is lit by how it faces it, 1 when the sheet is flat
    float facing = mod(column, 2.0) < 0.5 ? -1.0 : 1.0; // Panels rise to the right, then fall
    vec3 normal = vec3(facing * sin(vFold), 0.0, cos(vFold));
    vec3 light = normalize(vec3(-0.55, 0.3, 1.0));
    color *= dot(normal, light) / light.z;

    // A soft sheen where a panel turns towards the light, like satin paper
    vec3 halfway = normalize(light + vec3(0.0, 0.0, 1.0));
    color += uSheen * max(pow(max(dot(normal, halfway), 0.0), 30.0) - pow(halfway.z, 30.0), 0.0);

    // Creases, like folded paper: the valleys darken into the fold. It grows with the fold, so the flat sheet is untouched.
    float across = vSheet.x / uColumnWidth - column; // 0 to 1 across the panel
    float fromValley = facing < 0.0 ? across : 1.0 - across; // Panels rising to the right start in a valley
    float depth = abs(sin(vFold));
    color *= 1.0 - 0.55 * depth * (1.0 - smoothstep(0.0, 0.4, fromValley));

    gl_FragColor = vec4(color, 1.0);
  }
`;

/**
 * Draws the grid with three.js on a canvas behind the page, as a folding sheet. At rest it's exactly the
 * DOM images. While the grid scrolls, the sheet folds like an accordion along its column lines, deepest in
 * the middle of the window, lit from the top left; a spring follows the scroll speed and overshoots when it
 * stops, so the folds flip the other way before the sheet lies flat. Columns wrap in at the sides as the
 * folds pull it together, so the window never shows a gap.
 */
export class AccordionFold {
  /**
   * Throws if WebGL 2 isn't available, so the caller can keep the DOM images instead
   */
  constructor() {
    // Opaque, painted with the page's background: nothing here depends on how the browser composites
    // a transparent canvas
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
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
      uCenter: { value: 0 },
      uLeft: { value: 0 },
      uFold: { value: 0 },
      uSheen: { value: sheen },
      uColumnCount: { value: 0 },
      uColumns: { value: Array.from({ length: maxColumns }, () => new THREE.Vector4()) },
      uLayers: { value: Array.from({ length: maxItems / 4 }, () => new THREE.Vector4()) },
    };

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
    });
    this.mesh = new THREE.Mesh(new THREE.BufferGeometry(), this.material);
    this.mesh.frustumCulled = false;
    this.scene = new THREE.Scene();
    this.scene.add(this.mesh);
    this.camera = new THREE.PerspectiveCamera();

    this.layers = new Map(); // .grid__item-img element → its layer in the texture array
    this.columns = [];
    this.fold = 0; // The spring…
    this.foldVelocity = 0; // …and how fast it's changing
    this.gridTop = null; // Where the grid was at the last update(), for the scroll speed
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
   * Measure the layout and build the sheet's mesh: a vertex column on every column line (the extra
   * wrapped columns included), and rows down the window. Call after the grid is built and on every resize.
   */
  measure() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    const { uViewport, uPixelRatio, uColumnWidth, uImageHeight, uCenter, uLeft } = this.uniforms;
    uViewport.value.set(width, height);
    uPixelRatio.value = this.renderer.getPixelRatio();

    // A camera that shows the flat sheet (z = 0) at exactly 1 unit per CSS px
    Object.assign(this.camera, {
      fov: (2 * Math.atan(height / 2 / perspective) * 180) / Math.PI,
      aspect: width / height,
      near: 10,
      far: perspective * 3,
    });
    this.camera.position.set(0, 0, perspective);
    this.camera.updateProjectionMatrix();

    // Measured from the images, not the columns: the outer columns are narrower and only show half of theirs,
    // so the sheet starts at the first column's images, past the window's left edge
    const [first, second] = this.columns[0].images.map((el) => el.getBoundingClientRect());
    const columnWidth = first.width;
    uColumnWidth.value = columnWidth;
    uImageHeight.value = second ? second.top - first.top : first.height; // Images touch, so this is also the height
    uCenter.value = width / 2 - first.left;
    uLeft.value = first.left;
    this.columns.forEach(
      (column) =>
        (column.offset =
          column.images[0].getBoundingClientRect().top -
          column.element.getBoundingClientRect().top),
    );

    // The mesh: x across the grid in px, y down the window in px, with a margin past both edges
    const lines = this.columns.length + 1 + 2 * extraColumns;
    const margin = height * 0.1;
    const positions = [];
    for (let r = 0; r <= rows; r++) {
      const y = -margin + ((height + 2 * margin) * r) / rows;
      for (let l = 0; l < lines; l++) positions.push((l - extraColumns) * columnWidth, y, 0);
    }
    const indices = [];
    for (let r = 0; r < rows; r++) {
      for (let l = 0; l < lines - 1; l++) {
        const a = r * lines + l;
        const b = a + lines;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
    this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.BufferGeometry();
    this.mesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this.mesh.geometry.setIndex(indices);

    this.gridTop = null; // Start the speed over
    // Draw right away: resizing clears the canvas, and it mustn't show empty for a frame
    this.needsRender = true;
    this.sync();
  }

  /**
   * Runs on every frame (gsap.ticker): move the fold's spring by how fast the grid scrolls, then draw
   * @param {number} time - Unused
   * @param {number} deltaTime - ms since the last frame
   */
  update(time, deltaTime) {
    const elapsed = deltaTime / 1000;
    if (!elapsed) return;
    const dt = Math.min(elapsed, 1 / 30); // For the spring: capped, so a hidden tab coming back doesn't explode it

    // The grid itself doesn't lag (its columns do), so it moves exactly with the scroll
    const top = this.grid.getBoundingClientRect().top;
    const speed = this.gridTop === null ? 0 : (top - this.gridTop) / elapsed; // px/s, negative while scrolling down
    this.gridTop = top;

    // The spring chases a fold that grows with the speed (and eases towards maxFold), and overshoots when it stops
    const target = maxFold * Math.tanh(-speed / speedScale);
    const force = (target - this.fold) * stiffness - this.foldVelocity * damping;
    this.foldVelocity += force * dt;
    this.fold += this.foldVelocity * dt;
    if (Math.abs(this.fold) < 0.0002 && Math.abs(this.foldVelocity) < 0.0002 && !target) {
      if (this.fold) this.needsRender = true;
      this.fold = this.foldVelocity = 0; // At rest
    } else {
      this.needsRender = true;
    }
    this.uniforms.uFold.value = this.fold;

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
