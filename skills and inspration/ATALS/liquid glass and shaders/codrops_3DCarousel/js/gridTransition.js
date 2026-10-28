/**
 * WebGL transition for the preview grids.
 *
 * Warp: as the carousel ring flies through the camera, a shockwave of bent space bursts
 * from the grid's center and races out to the edges, a thin prismatic rim of light with a
 * wobbling front. The images ride in behind it, one by one, from the edges to the center: each flies
 * in from far away to its own place, decelerating, with light-speed streaks (motion blur
 * along its rush towards the viewer) and a focus pull. Like a stone dropped in water, the
 * wave leaves space rippling behind it, and the images fly in through those ripples: they
 * bulge towards the viewer and their pictures refract, until the ripples calm down as the
 * last image lands. Closing plays it all backwards, faster: the
 * images rush back into the distance and the wave collapses into the center.
 * At rest (progress 1, wave gone) an image is flat and in place with untouched colors,
 * exactly over its DOM image, so the handoff doesn't show.
 */

/**
 * Settings of the transition. Times in seconds, distances in CSS px.
 * Change them here and reload the page.
 */
const settings = {
  duration: 0.7, // How long each image takes to fly in
  stagger: 0.28, // Delay between the outermost images (first) and the center ones (last)
  delay: 0.15, // How long the images wait for the wave to lead
  closeSpeed: 1.5, // Closing plays the opening backwards, this much faster
  depth: 100, // How far behind the screen the images start
  blur: 0.08, // Motion blur: how long the "shutter" stays open (0 = none)
  fringe: 0.95, // Color fringe in the blur streaks (0 = none)
  focus: 8, // How out of focus far away images are (0 = always sharp)
  wave: {
    duration: 1.6, // How long the warp wave takes to cross the screen
    width: 200, // Width of the wavefront (the ripples behind it are about 3x as far apart)
    ripples: 3, // How strongly space keeps rippling behind the wave as the images fly in (0 = calm)
    bend: 240, // How far the ripples push the images towards the viewer
    refraction: 6, // How far they bend the pictures inside the images
    glow: 0.16, // Brightness of the wavefront's light (0 = a wave you only see in the images)
  },
};

// Shared by both programs: the warp wave around the grid's center
const waveGlsl = `
uniform float uWave; // Radius of the wavefront (px on screen)
uniform float uWaveAmount; // Strength of the front: 1 when it bursts out, 0 when it's gone
uniform float uWake; // Strength of the ripples it leaves behind, 0 once they've calmed down
uniform float uWaveWidth;

// The front: a bump around the wavefront
float waveFront(float r) {
  float x = (r - uWave) / uWaveWidth;
  return exp(-x * x) * uWaveAmount;
}

// The ripples behind it, fading the further behind they are
float waveRipples(float r) {
  float x = (r - uWave) / uWaveWidth;
  if (x > 0.0) return 0.0;
  return sin(x * 2.2) * exp(x / 4.0) * (1.0 - smoothstep(-1.0, 0.0, x)) * uWake;
}

float waveAt(float r) {
  return waveFront(r) + waveRipples(r);
}

// Its slope, which is how much it refracts (like a lens)
float waveSlope(float r) {
  return (waveAt(r + 1.0) - waveAt(r - 1.0)) * 0.5 * uWaveWidth;
}
`;

const tileVertexShader = `#version 300 es
in vec2 aUv;

uniform vec2 uViewport; // Viewport size in CSS px
uniform float uPerspective; // Same as the scenes' CSS perspective
uniform vec2 uOrigin; // The grid's center: the vanishing point and where the wave starts (px from the viewport center, y up)
uniform vec4 uRect; // Image center (px from the viewport center, y up) and size
uniform float uProgress; // 0 = far away, 1 = at rest
uniform float uShutter; // How far back in progress the motion blur reaches (negative when closing)
uniform float uDepth;
uniform float uBend;
${waveGlsl}

out vec2 vRest; // Position at rest, from the grid's center

#define EASE(p) (1.0 - pow(1.0 - (p), 3.0)) // power3.out: rushes in, then settles

float scaleAt(float p) {
  return uPerspective / (uPerspective + uDepth * (1.0 - EASE(p)));
}

void main() {
  float p = clamp(uProgress, 0.0, 1.0);
  float before = clamp(p - uShutter, 0.0, 1.0);
  vec2 center = uRect.xy - uOrigin;

  // Grow the quad so it covers the image's streak (and the wave's bulge)
  float reach = length(center) + 0.5 * length(uRect.zw);
  float margin = reach * abs(1.0 - scaleAt(p) / scaleAt(before)) + uWaveAmount * uWaveWidth * 0.5 + 2.0;
  vec2 uv = (aUv - 0.5) * (1.0 + 2.0 * margin / uRect.zw) + 0.5;
  vec2 rest = center + (uv - 0.5) * uRect.zw;

  // Flying in from far away, and pushed towards the viewer where the wave rolls through
  float z = -uDepth * (1.0 - EASE(p));
  z += waveAt(length(rest) * scaleAt(p)) * uBend;

  // Same projection as CSS perspective around the grid's center, so z = 0 is pixel for pixel
  float w = (uPerspective - z) / uPerspective;
  gl_Position = vec4(
    (rest.x + uOrigin.x * w) / (uViewport.x * 0.5),
    (rest.y + uOrigin.y * w) / (uViewport.y * 0.5),
    -z / 8000.0 * w,
    w
  );

  vRest = rest;
}
`;

const tileFragmentShader = `#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uOrigin;
uniform vec4 uRect;
uniform float uPerspective;
uniform float uProgress;
uniform float uShutter;
uniform float uDepth;
uniform float uRadius; // Border radius of the DOM tile (px)
uniform float uAlpha; // The DOM image's opacity (it's lower on hover)
uniform float uFringe;
uniform float uFocus;
uniform float uRefraction;
uniform float uGlow;
uniform vec3 uBg; // Page background color
${waveGlsl}

in vec2 vRest;

out vec4 outColor;

const int MAX_SAMPLES = 16;

#define EASE(p) (1.0 - pow(1.0 - (p), 3.0))

float scaleAt(float p) {
  return uPerspective / (uPerspective + uDepth * (1.0 - EASE(p)));
}

// The image (with its rounded corners) at a position from the grid's center
vec4 image(vec2 rest, float bias) {
  vec2 local = rest - (uRect.xy - uOrigin);
  vec2 q = abs(local) - uRect.zw * 0.5 + uRadius;
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
  float mask = clamp(0.5 - d, 0.0, 1.0);
  vec3 color = texture(uTexture, local / uRect.zw + 0.5, bias).rgb;
  return vec4(color * mask, mask);
}

void main() {
  float p = clamp(uProgress, 0.0, 1.0);
  float far = 1.0 - EASE(p);
  float bias = uFocus * far; // Focus pull: far away images are sampled from smaller mipmaps
  float scale = scaleAt(p);
  float r = length(vRest) * scale; // On screen, from the center
  vec2 outwards = r > 0.001 ? vRest / length(vRest) : vec2(0.0);

  // The wave refracts the picture as its front passes (in px at rest)
  vec2 refraction = outwards * waveSlope(r) * uRefraction / scale;

  // Motion blur along the rush towards the viewer: the point at this pixel was further out
  // earlier, so average the image along that streak, with as many samples as it's long
  float before = clamp(p - uShutter, 0.0, 1.0);
  float streak = length(vRest) * abs(scale / scaleAt(before) - 1.0) * scale; // px on screen
  int samples = int(clamp(ceil(streak / 2.0), 1.0, float(MAX_SAMPLES)));

  vec4 sum = vec4(0.0);
  vec2 fringe = vec2(0.0); // Red leans towards the end of the streak, blue towards its start
  vec2 weights = vec2(0.0);
  for (int i = 0; i < MAX_SAMPLES; i++) {
    if (i >= samples) break;
    float t = samples > 1 ? float(i) / float(samples - 1) : 0.5;
    float q = mix(p, before, t);
    vec4 c = image(vRest * scale / scaleAt(q) + refraction, bias);
    vec2 w = vec2(1.0) + vec2(1.0, -1.0) * uFringe * (2.0 * t - 1.0);
    sum += c;
    fringe += vec2(c.r, c.b) * w;
    weights += w;
  }
  vec3 color = vec3(fringe.x / weights.x, sum.g / float(samples), fringe.y / weights.y);
  float alpha = sum.a / float(samples);

  // The wavefront lights the images up as it passes
  color += waveFront(r) * uGlow * alpha;

  // Far away images sink into the background
  color = mix(color, uBg * alpha, 0.7 * far);

  float fade = uAlpha * smoothstep(0.0, 0.15, p);
  outColor = vec4(color * fade, alpha * fade);
}
`;

const waveVertexShader = `#version 300 es
uniform vec2 uViewport;

out vec2 vPos; // px from the viewport center, y up

void main() {
  // One triangle covering the screen
  vec2 v = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(v * 2.0 - 1.0, 0.0, 1.0);
  vPos = (v * 2.0 - 1.0) * uViewport * 0.5;
}
`;

const waveFragmentShader = `#version 300 es
precision highp float;

uniform vec2 uOrigin;
uniform float uGlow;
${waveGlsl}

in vec2 vPos;

out vec4 outColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vec2 d = vPos - uOrigin;
  float r = length(d);
  vec2 around = r > 0.001 ? d / r : vec2(0.0);

  // The front wobbles a little, so it reads as bent space rather than a perfect circle
  float wobble = (noise(around * 1.6 + uWave * 0.003) - 0.5) * min(uWaveWidth * 0.5, uWave * 0.12);
  float x = (r + wobble - uWave) / (uWaveWidth * 0.5);

  // A thin bright rim with its colors slightly apart, and a soft halo
  vec3 rim = vec3(
    exp(-pow(x - 0.15, 2.0) * 6.0),
    exp(-x * x * 6.0),
    exp(-pow(x + 0.15, 2.0) * 6.0)
  );
  vec3 halo = vec3(exp(-x * x * 0.4)) * 0.2;

  // Light added on top of what's behind (alpha 0 with premultiplied blending)
  vec3 light = (rim + halo) * uWaveAmount;

  // and the ripples behind it, barely
  light += vec3(max(waveRipples(r + wobble), 0.0)) * 0.12;

  outColor = vec4(light * uGlow, 0.0);
}
`;

const SEGMENTS = 24; // Subdivisions per side of an image, enough for the wave's bulge
const PERSPECTIVE = 900; // Same as the scenes' perspective in base.css
const BG = [15 / 255, 14 / 255, 14 / 255]; // --color-bg

/**
 * Compiles and links a shader program and finds its uniforms
 *
 * @param {WebGL2RenderingContext} gl
 * @param {string} vertexShader
 * @param {string} fragmentShader
 * @returns {{ program: WebGLProgram, uniforms: Object }}
 */
const createProgram = (gl, vertexShader, fragmentShader) => {
  const program = gl.createProgram();
  [
    [gl.VERTEX_SHADER, vertexShader],
    [gl.FRAGMENT_SHADER, fragmentShader],
  ].forEach(([type, source]) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader));
    }
    gl.attachShader(program, shader);
  });
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }

  const uniforms = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const { name } = gl.getActiveUniform(program, i);
    uniforms[name] = gl.getUniformLocation(program, name);
  }
  return { program, uniforms };
};

/**
 * Creates a subdivided plane (uvs only, positions come from the vertex shader)
 *
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLProgram} program
 * @returns {{ vao: WebGLVertexArrayObject, count: number }}
 */
const createPlane = (gl, program) => {
  const uvs = [];
  const indices = [];
  for (let y = 0; y <= SEGMENTS; y++) {
    for (let x = 0; x <= SEGMENTS; x++) {
      uvs.push(x / SEGMENTS, y / SEGMENTS);
    }
  }
  for (let y = 0; y < SEGMENTS; y++) {
    for (let x = 0; x < SEGMENTS; x++) {
      const i = y * (SEGMENTS + 1) + x;
      indices.push(i, i + 1, i + SEGMENTS + 1, i + 1, i + SEGMENTS + 2, i + SEGMENTS + 1);
    }
  }

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
  const location = gl.getAttribLocation(program, 'aUv');
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return { vao, count: indices.length };
};

/**
 * Returns the URL of an element's background image
 *
 * @param {Element} el
 * @returns {string}
 */
const getBackgroundUrl = (el) =>
  getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];

/**
 * Creates the grid transition, or returns null when WebGL2 isn't available
 *
 * @returns {{ prepare: Function, animate: Function } | null}
 */
const createGridTransition = () => {
  const canvas = document.createElement('canvas');
  canvas.className = 'grid-canvas';
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: true });
  if (!gl) return null;

  let tileProgram;
  let waveProgram;
  try {
    tileProgram = createProgram(gl, tileVertexShader, tileFragmentShader);
    waveProgram = createProgram(gl, waveVertexShader, waveFragmentShader);
  } catch (error) {
    console.warn(error);
    return null;
  }
  // First in the page, so the carousel (flying through the camera) passes in front of the grid
  document.body.prepend(canvas);

  const plane = createPlane(gl, tileProgram.program);
  const emptyVao = gl.createVertexArray(); // The wave's triangle needs no attributes

  // Values that don't change
  gl.useProgram(tileProgram.program);
  const tu = tileProgram.uniforms;
  gl.uniform1f(tu.uPerspective, PERSPECTIVE);
  gl.uniform3fv(tu.uBg, BG);
  gl.uniform1f(tu.uFringe, settings.fringe);
  gl.uniform1f(tu.uFocus, settings.focus);
  gl.uniform1f(tu.uBend, settings.wave.bend);
  gl.uniform1f(tu.uRefraction, settings.wave.refraction);
  gl.uniform1f(tu.uGlow, settings.wave.glow);
  gl.uniform1f(tu.uWaveWidth, settings.wave.width);
  gl.useProgram(waveProgram.program);
  const wu = waveProgram.uniforms;
  gl.uniform1f(wu.uGlow, settings.wave.glow);
  gl.uniform1f(wu.uWaveWidth, settings.wave.width);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  const anisotropy = gl.getExtension('EXT_texture_filter_anisotropic');

  const textures = new Map(); // Texture per image of the open preview, keyed by its DOM element
  let tiles = []; // Tiles being animated
  const wave = { radius: 0, amount: 0, wake: 0 };
  let origin = [0, 0];

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 2); // Cap the resolution
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();
  window.addEventListener('resize', resize);

  /**
   * Uploads an image at the size it's shown at, so it's as sharp as the DOM one
   *
   * @param {HTMLImageElement} img - Decoded image
   * @param {number} width - Width it's drawn at (device px)
   * @param {number} height - Height it's drawn at (device px)
   * @returns {WebGLTexture}
   */
  const createTexture = (img, width, height) => {
    const source = document.createElement('canvas');
    source.width = width;
    source.height = height;
    const ctx = source.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    // background-size: 100%, centered (the images have the tiles' aspect ratio)
    const drawHeight = (img.naturalHeight / img.naturalWidth) * width;
    ctx.drawImage(img, 0, (height - drawHeight) / 2, width, drawHeight);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.generateMipmap(gl.TEXTURE_2D); // Also what the focus blur samples from
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (anisotropy) {
      gl.texParameterf(gl.TEXTURE_2D, anisotropy.TEXTURE_MAX_ANISOTROPY_EXT, 4);
    }
    return texture;
  };

  const render = () => {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const viewport = [window.innerWidth, window.innerHeight];

    // The wave's light, behind the images
    gl.useProgram(waveProgram.program);
    gl.bindVertexArray(emptyVao);
    gl.uniform2fv(wu.uViewport, viewport);
    gl.uniform2fv(wu.uOrigin, origin);
    gl.uniform1f(wu.uWave, wave.radius);
    gl.uniform1f(wu.uWaveAmount, wave.amount);
    gl.uniform1f(wu.uWake, wave.wake);
    if (wave.amount > 0 || wave.wake > 0) gl.drawArrays(gl.TRIANGLES, 0, 3);

    // The images, farthest first
    gl.useProgram(tileProgram.program);
    gl.bindVertexArray(plane.vao);
    gl.uniform2fv(tu.uViewport, viewport);
    gl.uniform2fv(tu.uOrigin, origin);
    gl.uniform1f(tu.uWave, wave.radius);
    gl.uniform1f(tu.uWaveAmount, wave.amount);
    gl.uniform1f(tu.uWake, wave.wake);
    [...tiles]
      .sort((a, b) => a.progress - b.progress)
      .forEach((tile) => {
        gl.bindTexture(gl.TEXTURE_2D, tile.texture);
        gl.uniform4fv(tu.uRect, tile.rect);
        gl.uniform1f(tu.uDepth, settings.depth);
        gl.uniform1f(tu.uProgress, tile.progress);
        gl.uniform1f(tu.uShutter, tile.shutter);
        gl.uniform1f(tu.uAlpha, tile.alpha);
        gl.uniform1f(tu.uRadius, tile.radius);
        gl.drawElements(gl.TRIANGLES, plane.count, gl.UNSIGNED_SHORT, 0);
      });
  };

  /**
   * Loads a preview's images into textures (and frees the previous preview's)
   *
   * @param {HTMLElement} preview - The preview container
   * @returns {Promise}
   */
  const prepare = (preview) => {
    textures.forEach((texture) => gl.deleteTexture(texture));
    textures.clear();
    const dpr = Math.min(window.devicePixelRatio, 2);

    return Promise.all(
      [...preview.querySelectorAll('.grid__item-image')].map((el) => {
        const img = new Image();
        img.src = getBackgroundUrl(el);
        return img
          .decode()
          .then(() => {
            const { width, height } = el.getBoundingClientRect();
            textures.set(el, createTexture(img, Math.ceil(width * dpr), Math.ceil(height * dpr)));
          })
          .catch(() => {}); // A failed image is left to the DOM
      }),
    ).then(() => {
      // Draw everything once, invisibly, so the GPU sets up the shaders and textures now
      // and the first frame of the transition doesn't stall (and freeze the carousel mid-flight)
      tiles = [...textures.values()].map((texture) => ({
        texture,
        rect: [0, 0, 1, 1],
        progress: 1,
        shutter: 0,
        alpha: 0,
        radius: 0,
      }));
      Object.assign(wave, { radius: 0, amount: 0.0001, wake: 0 });
      render();
      tiles = [];
      wave.amount = 0;
      render();
    });
  };

  // The transition that's running, if any: { preview, isIn, tl, captions, onComplete, end }
  let current = null;

  /**
   * Animates a preview's grid in or out
   *
   * @param {HTMLElement} preview - The preview container
   * @param {'in' | 'out'} direction - Animation direction
   * @param {Function} [onComplete] - Callback when the animation finishes
   * @returns {GSAPTimeline}
   */
  const animate = (preview, direction, onComplete) => {
    const isIn = direction === 'in';
    const items = [...preview.querySelectorAll('.grid__item')];
    const captions = items.map((item) => item.querySelector('.grid__item-caption'));

    if (current) {
      // Closing while the opening still plays: play that opening backwards from where it is
      if (!isIn && current.isIn && current.preview === preview) {
        current.captions.kill();
        gsap.to(captions, { autoAlpha: 0, duration: 0.25, ease: 'sine.in' });
        tiles.forEach((tile) => (tile.shutter = -Math.abs(tile.shutter))); // The blur trails the other way
        Object.assign(current, { isIn: false, onComplete });
        current.tl.timeScale(settings.closeSpeed).reverse();
        return current.tl;
      }
      // Anything else that's still running ends right away, so two transitions never overlap
      current.tl.kill();
      current.captions?.kill();
      current.end();
    }

    // The grid's center: the vanishing point and where the wave starts
    const grid = preview.querySelector('.grid').getBoundingClientRect();
    origin = [
      grid.left + grid.width / 2 - window.innerWidth / 2,
      window.innerHeight / 2 - (grid.top + grid.height / 2),
    ];

    // Measure each image (px from the viewport center, y up)
    tiles = items
      .map((item) => {
        const image = item.querySelector('.grid__item-image');
        const texture = textures.get(image);
        if (!texture) return null;
        const rect = image.getBoundingClientRect();
        const x = rect.left + rect.width / 2 - window.innerWidth / 2;
        const y = window.innerHeight / 2 - (rect.top + rect.height / 2);
        return {
          image,
          texture,
          rect: [x, y, rect.width, rect.height],
          distance: Math.hypot(x - origin[0], y - origin[1]),
          // The blur reaches back as far as the shutter stays open (forwards in progress when closing)
          shutter: ((isIn ? 1 : -1) * settings.blur) / settings.duration,
          alpha: isIn ? 1 : parseFloat(getComputedStyle(image).opacity),
          radius: parseFloat(getComputedStyle(item).borderRadius) || 0,
          progress: isIn ? 0 : 1,
        };
      })
      .filter(Boolean);

    // The wave travels until it's past the farthest corner of the screen
    const farthest =
      Math.hypot(
        window.innerWidth / 2 + Math.abs(origin[0]),
        window.innerHeight / 2 + Math.abs(origin[1]),
      ) +
      settings.wave.width * 2;

    // Draw the tiles in the same frame the DOM images are hidden
    tiles.forEach(({ image }) => image.classList.add('is-drawn'));
    Object.assign(
      wave,
      isIn ? { radius: 0, amount: 0, wake: 0 } : { radius: farthest, amount: 0, wake: 0 },
    );
    render();
    gsap.ticker.add(render);

    const transition = { preview, isIn, onComplete, captions: null };
    transition.end = () => {
      gsap.ticker.remove(render);
      transition.onComplete?.();
      tiles.forEach(({ image }) => image.classList.remove('is-drawn'));
      tiles = [];
      Object.assign(wave, { amount: 0, wake: 0 });
      render();
      if (current === transition) current = null;
    };

    // The opening: the wave bursts out, and the images fly in behind it, center ones first.
    // The shaders ease the images; the wave is eased here
    const maxDistance = Math.max(...tiles.map(({ distance }) => distance)) || 1;
    const total = settings.delay + settings.stagger + settings.duration; // When the last image lands
    // Outer images come in first, the center ones last
    const arrival = (i) =>
      (1 - (tiles[i]?.distance ?? maxDistance) / maxDistance) * settings.stagger;
    transition.tl = gsap
      .timeline({
        paused: true,
        onComplete: transition.end,
        onReverseComplete: transition.end,
      })
      .fromTo(
        wave,
        { radius: 0 },
        { radius: farthest, duration: settings.wave.duration, ease: 'power2.out' },
        0,
      )
      // Its light comes up quickly and fades as it travels (so it also fades when it collapses)
      .fromTo(wave, { amount: 0 }, { amount: 1, duration: 0.12, ease: 'power1.out' }, 0)
      .to(wave, { amount: 0, duration: settings.wave.duration - 0.12, ease: 'power1.in' }, 0.12)
      // The ripples it leaves behind calm down exactly as the last image lands
      .fromTo(
        wave,
        { wake: 0 },
        { wake: settings.wave.ripples, duration: 0.2, ease: 'power1.out' },
        0,
      )
      .to(wave, { wake: 0, duration: total - 0.2, ease: 'sine.inOut' }, 0.2)
      .fromTo(
        tiles,
        { progress: 0 },
        {
          progress: 1,
          duration: settings.duration,
          ease: 'none',
          stagger: arrival,
        },
        settings.delay,
      );
    current = transition;

    if (isIn) {
      transition.tl.play();
      transition.captions = gsap.fromTo(
        captions,
        { autoAlpha: 0, y: 8 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          ease: 'sine',
          stagger: arrival,
          delay: settings.delay + settings.duration * 0.8, // As each image lands
        },
      );
    } else {
      // Closing is the opening backwards: the images rush back, then the wave collapses
      transition.captions = gsap.to(captions, { autoAlpha: 0, duration: 0.25, ease: 'sine.in' });
      transition.tl.progress(1, true).timeScale(settings.closeSpeed).reverse(); // Jump to the end silently
    }

    return transition.tl;
  };

  return { prepare, animate };
};

export { createGridTransition };
