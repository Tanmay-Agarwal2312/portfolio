# Tanmay Agarwal — Technical Monograph Portfolio

A high-fidelity, interactive personal portfolio website designed around a **Dark Precision / Technical Editorial** aesthetic. Inspired by technical instrument readouts and printed monographs, this website showcases software engineering expertise, ML research, and complex user interfaces.

---

## 📐 Design Philosophy & Aesthetics

- **Color Tokens**: Near-black background (`#080809`), warm off-white typography (`#E8E6E1`), card surfaces (`#0F0F11`), and hairline rules (`#1E1E24`). 
- **The Teal Accent (`#00F5C4`)**: Electric teal is used selectively as the *sole* accent color—appearing only on visual anchor elements (custom cursor rings, nav active states, skill tracks filling, and timeline nodes).
- **Typography Scale**:
  - *Display Headings*: **Instrument Serif** (Google Fonts) — featuring elegant italic emphasis terms.
  - *Body / UI Text*: **Inter** (Google Fonts) — utilizing lightweight Inter-300 for premium readability.
  - *Technical / Code / Numbers*: **Geist Mono** (Google Fonts) — for timestamps, progress numbers, and section monograms.
- **Layout Stance**: Asymmetric 7-column grid offset where text sits left and premium interactive visuals sit on the right, bleeding into full-bleed canvases. Parallax scrolling creates dimensional layers at locked 60fps+ rendering.

---

## ⚡ Key Interactive Experiences

1. **Draggable 3D Wireframe Sphere**:
   A vector projection panel calculated mathematically inside `src/App.jsx` using spherical coordinates ($x, y, z$) and perspective scaling: `scale = 1 + z / (R * 1.4)`. The SVG paths render natively at crisp Retina resolution. Auto-rotation slows on mouse hover, and **users can click and drag on the sphere** to manually spin it in 3D.
2. **Physics-Lag Custom Cursor**:
   A 6px dot inside a 24px outer ring that tracks mouse coordinates using a physical delay interpolation: `ringX += (mouseX - ringX) * 0.16`. On hovering links, buttons, or project cards, the cursor ring expands into a glassmorphic teal halo. The cursor hides smoothly when exiting the browser viewport.
3. **Mouse-Parallax Dot Grid**:
   A custom dot grid background shifts based on mouse movement relative to the screen center, adding depth behind the hero headline.
4. **Scroll Active Navigation Line**:
   An Intersection Observer tracks the active page viewport and slides a 2px teal indicator line under navigation links.

---

## 🛠️ Technology Stack

- **Core**: React 19 + JavaScript (Vite boilerplate)
- **Styling**: 100% Vanilla CSS (`src/index.css`) with custom variables and grids (no Tailwind, per precise layout needs).
- **Icons**: `lucide-react` (with custom inline SVG brand components for build safety).
- **Animations**: Framer Motion (`motion/react`) for fluid layout transitions.

---

## 📂 File Map

```
portfolio/
├── public/
│   └── favicon.svg      # Customized technical Geist Mono vector brand icon
├── src/
│   ├── assets/          # Project assets
│   ├── App.jsx          # Draggable 3D sphere, cursor tracking, data arrays & section markup
│   ├── index.css        # Typography styling, resets, media queries, asymmetric grid properties
│   └── main.jsx         # React mounting portal
├── index.html           # Target HTML index with preconnected fonts & SEO descriptions
├── package.json         # Package scripts & dependencies
└── vite.config.js       # Vite bundler parameters
```

---
