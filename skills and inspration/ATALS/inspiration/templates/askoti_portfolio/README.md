# 3D Portfolio Showcase – Immersive Web Experience

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?logo=next.js)](https://nextjs.org)
[![Three.js](https://img.shields.io/badge/Three.js-r128+-black?logo=javascript)](https://threejs.org)
[![React Three Fiber](https://img.shields.io/badge/React%20Three%20Fiber-Latest-0085FF)](https://docs.pmnd.rs/react-three-fiber)
[![Drei](https://img.shields.io/badge/Drei-Latest-FF6B6B)](https://github.com/pmndrs/drei)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4+-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel)](https://askoti.vercel.app)

[Live Demo](https://askoti.vercel.app) • [GitHub](https://github.com/askoti/portfolio) • [Main Portfolio](https://kastriotaliu.com)

</div>

---

## Project Overview

**3D Portfolio Showcase** is an immersive web experience showcasing a full-stack developer's expertise through interactive 3D visualizations. Built with Next.js, Three.js, React Three Fiber, and Drei, it features scroll-driven camera animations, dynamic project cards, and a professional presentation of engineering capabilities.

This project demonstrates advanced 3D graphics, smooth scroll choreography, and professional portfolio design.

---

## Key Features

### Hero Section
- Full-name introduction: **KASTRIOT ALIU**
- Professional role display
- Technology stack badges (React, Next.js, Node.js, Python, Three.js)
- Personal tagline: "I build fast, scalable web applications with clean architecture and real-world performance."
- CTA buttons for engagement

### 3D Showroom Environment
- Custom Three.js scene with professional lighting
- Realistic material rendering
- Dynamic camera positioning
- Smooth lighting and shadows
- Professional 3D staging
- Performance-optimized rendering

### Scroll-Driven Interactions
- **Scroll Choreography**: Camera moves and rotates based on scroll position
- **Dynamic Transitions**: Smooth movement between project sections
- **Position-Locked Content**: Text appears/disappears as you scroll
- **Card Animations**: Project cards slide and rotate in sync
- **Real-Time Rendering**: 60 FPS smooth animations
- **Responsive Scroll**: Works across all devices

### Field Operations (Project Showcase)
Projects displayed with full details:

#### 1. 3D Showroom
- **Tech**: React, Three.js
- **Focus**: Interactive 3D experience with custom shaders
- **Status**: SYSTEM_READY()
- **Performance**: SCALABLE_V2.0

#### 2. E-Commerce Platform
- **Tech**: Next.js, Node.js
- **Focus**: High-performance storefront with real-time inventory
- **Status**: Production-ready
- **Features**: Real-time data, responsive design

#### 3. Data Dashboard
- **Tech**: Django, Python
- **Focus**: Analytical platform for complex visualization
- **Status**: SYSTEM_READY()
- **Capabilities**: Advanced data analytics

#### 4. SaaS Platform
- **Tech**: TypeScript, Tailwind
- **Focus**: Scalable full-stack app with clean architecture
- **Status**: DEPLOYMENT_READY
- **Scale**: Enterprise-ready

### Engineering Approach Section
- **Frontend Stack**: React, Next.js, Tailwind, Three.js
  - Pixel-perfect interfaces
  - Smooth animations
  - Component systems built to scale

- **Backend Stack**: Node.js, Python, APIs, DBS
  - Secure, efficient services
  - Clean logic
  - Systems designed to grow

- **DevOps**: Git, Docker, Testing, CI/CD
  - Clean architecture
  - Performance-driven
  - Reliable delivery

### Execution Strategy
Three core pillars:

1. **Performance-First Frontend**
   - Optimized React & Next.js applications
   - Clean component architecture
   - SEO-conscious structure

2. **Full-Stack Architecture**
   - API-driven platforms
   - Secure authentication
   - Scalable backend logic for high-traffic

3. **Data & Automation**
   - Modern storefronts
   - Real-time data interfaces
   - Automation-driven workflows for business growth

### Contact & Engagement Section
- **LinkedIn**: Professional networking
- **GitHub**: Source code showcase
- **Upwork**: Freelance availability
- **Email**: Direct contact

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 15+** | React framework with modern app architecture |
| **Three.js (r128)** | 3D graphics engine |
| **React Three Fiber** | React renderer for Three.js |
| **Drei** | Useful helpers for React Three Fiber |
| **Tailwind CSS** | Production-grade styling |
| **Vercel** | Edge deployment and hosting |

---

## Project Structure

```
portfolio/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main portfolio page
│   └── components/
│       ├── Hero.tsx             # Hero section
│       ├── ScrollContainer.tsx  # Scroll wrapper
│       ├── Scene.tsx            # Three.js scene
│       ├── Camera.tsx           # Scroll-driven camera
│       ├── Lighting.tsx         # Scene lighting
│       ├── ProjectCard.tsx      # Project card display
│       ├── EngineeringApproach.tsx  # Stack showcase
│       ├── ExecutionStrategy.tsx    # Strategy section
│       └── ContactSection.tsx   # Contact info
├── lib/
│   ├── three-setup.ts      # Three.js utilities
│   ├── scroll-handler.ts   # Scroll calculations
│   └── animations.ts       # Animation helpers
├── styles/                 # Global styles
└── public/                 # Assets
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/askoti/portfolio.git
cd portfolio

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the 3D portfolio.

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel deploy --prod
```

---

## Scroll Choreography

The portfolio uses sophisticated scroll-driven animations:

```javascript
// Conceptual pseudo-code
const scrollProgress = window.scrollY / (document.height - window.innerHeight);

// Camera positioning
camera.position.z = initialZ + scrollProgress * zTravel;
camera.position.x = Math.sin(scrollProgress * Math.PI) * offsetX;

// Card animations
cards.forEach((card, index) => {
  card.position.y = scrollProgress * cardDistance - (index * spacing);
  card.rotation.z = scrollProgress * rotationAmount;
});

// Text fades
projectText.opacity = calculateOpacityBasedOnScroll(scrollProgress);
```

---

## Design Highlights

- **Dark Professional Theme**: Modern, sophisticated aesthetic
- **3D Depth**: Professional 3D staging and camera work
- **Smooth Animations**: 60 FPS scroll-driven interactions
- **Clear Hierarchy**: Information flows naturally with scroll
- **Professional Typography**: Clean, readable text
- **Color Accent**: Blue highlights for important elements
- **Responsive Design**: Works perfectly on all devices

---

## Technical Achievements

✅ **Advanced Three.js Integration**: Custom 3D scenes with React  
✅ **Scroll Choreography**: Perfectly synchronized animations  
✅ **React Three Fiber Mastery**: Complex 3D component system  
✅ **Drei Helpers**: Smart use of utility components  
✅ **Performance Optimization**: 60 FPS on most devices  
✅ **Responsive 3D**: Scales across screen sizes  
✅ **Professional Design**: Fintech-grade presentation  
✅ **Smooth Interactions**: Polish throughout  

---

## Use Cases

This project is perfect for:
- Developer portfolios
- Agency showcases
- Product launches
- Technical demonstrations
- 3D visualization platforms
- Immersive web experiences
- High-end portfolio presentations

---

## Performance Metrics

- **Hero Load Time**: <1 second
- **3D Scene Performance**: 60 FPS on modern devices
- **Scroll Performance**: Smooth 60 FPS interactions
- **Mobile Optimization**: Adaptive quality settings
- **Bundle Size**: Optimized for fast delivery
- **Lighthouse Score**: 90+ performance

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

---

## Future Enhancements

- Interactive project detail views
- 3D model customization
- Real-time project updates
- Advanced analytics
- Email contact integration
- Dynamic project loading
- Multi-language support
- Dark/Light theme toggle

---

## Key Differentiators

This portfolio stands out because:
1. **3D Visual Experience**: Goes beyond standard portfolios
2. **Smooth Scroll Choreography**: Professional animation synchronization
3. **Full Tech Stack Showcase**: Demonstrates both frontend and backend expertise
4. **Professional Design**: Enterprise-level presentation
5. **Performance Focus**: Optimized for speed and smoothness
6. **Responsive Implementation**: 3D that works on all devices
7. **Modular Architecture**: Well-organized codebase

---

## License

This project is licensed under the MIT License – see the LICENSE file for details.

---

## Connect With Me

- GitHub: [@askoti](https://github.com/askoti)
- Main Portfolio: [kastriotaliu.com](https://kastriotaliu.com)
- LinkedIn: [linkedin.com/in/kastriootaliiu/](https://www.linkedin.com/in/kastriootaliiu/)
- Email: [kastriootaliiu@gmail.com](mailto:kastriootaliiu@gmail.com)
- Upwork: [Freelance availability](https://www.upwork.com)

---

## Acknowledgments

- Three.js community for incredible 3D capabilities
- React Three Fiber team for React integration
- Poimandres (Drei team) for helpful utilities
- Next.js team for excellent framework
- Vercel for world-class deployment

---

<div align="center">

Immersive 3D Portfolio Experience

Engineering Web Experiences That Stand Out

Made with by [@askoti](https://github.com/askoti)

</div>
