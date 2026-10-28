# 🏎️ Lando Norris 3D WebGL Clone

Live 1:1 clone of the official [Lando Norris Website](https://landonorris.com/) featuring the complete 3D WebGL / Three.js engine, Rive state machine animations, custom PBR materials, HDRI lighting, and offline asset resolution.

## 🚀 Features

- **3D WebGL Engine (Three.js):**
  - Fully interactive 3D helmet meshes (`helmet-21.glb`, `disco-02.glb`, `sotd.glb`, `tracks.glb`)
  - Draco 3D mesh compression & Basis Universal GPU texture transcoders (`.wasm` + `.ktx2`)
  - Multi-variant PBR shader materials (Gold, Disco, Dark, Lime, Google variants)
  - Custom fluid dye simulation and background noise shaders
  - Studio HDRI spherical environment reflection maps

- **Rive 2D Animation State Machines:**
  - Interactive signature animation (`signature.riv`)
  - Interactive UI buttons & hover physics (`btn-ui.riv`)
  - Circuit tracks visualizer (`circuits.riv`)
  - Ambient reef & phrases animations (`reef.riv`, `phrases.riv`, `ln4.riv`)
  - Full-bleed page transition curtains (`page-transition.riv`)

- **Full Offline Asset Bundling:**
  - 130+ optimized WebP/SVG images, logos, and helmet gallery assets
  - Custom variable typography (`Mona Sans Variable`, `Brier Bold`)
  - Local Python CORS & MIME streaming server (`server.py`)

## 🛠️ Quick Start

```bash
# 1. Clone repository
git clone https://github.com/vinay3254/landonorris-clone.git
cd landonorris-clone

# 2. Run local server
python3 server.py

# 3. Open in browser
# Navigate to http://localhost:8765/
```

## 📁 Project Structure

```
├── gl/                   # 3D WebGL assets, GLB models, HDRIs, MSDF fonts, Draco & Basis transcoders
├── rive/                 # Rive animation runtime state machines (.riv)
├── css/                  # Compiled stylesheets and responsive design tokens
├── js/                   # OFF+BRAND runtime scripts, Three.js engine, Webflow bundle
├── images/               # High-res WebP gallery, brand vectors, helmet textures
├── fonts/                # Mona Sans Variable & Brier Bold webfonts
├── index.html            # Primary post-JS hydrated & rewritten markup
├── index.source.html     # Raw upstream source
├── index.rendered.html   # Post-render DOM capture
├── elements.json         # 1,687 DOM elements with computed styles & bounding boxes
├── dom.tree.json         # Nested DOM hierarchy
├── server.py             # Custom local streaming server with proper MIME types
└── README.md             # Project documentation
```

## 📄 License

MIT License — For educational and portfolio demonstration purposes. Upstream assets belong to Lando Norris & OFF+BRAND.
