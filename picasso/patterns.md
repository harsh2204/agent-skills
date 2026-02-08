# Picasso Texture & Pattern Library

Backgrounds are never flat. Every Picasso output has depth. Pick technique(s) from below.

---

## 1. Film Grain Noise (SVG)

Organic texture. Works on any background. Apply as pseudo-element overlay.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#grain)" opacity="0.4"/>
</svg>
```

**CSS usage** (inline as data URI or reference file):

```css
.grain-overlay::after {
  content: '';
  position: fixed;
  inset: 0;
  opacity: 0.035;
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: overlay;
  background: url('data:image/svg+xml,...') repeat;
  /* or background: url('assets/grain.svg') repeat; */
}
```

Dial `opacity` from `0.02` (barely there) to `0.08` (gritty).

---

## 2. Scanlines

CRT / retro monitor feel. Pure CSS.

```css
.scanlines::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 1px,
    rgba(0, 0, 0, 0.08) 1px,
    rgba(0, 0, 0, 0.08) 2px
  );
}
```

For colored scanlines (green phosphor): replace `rgba(0,0,0,0.08)` with `rgba(0,255,65,0.03)`.

---

## 3. Dot Grid

Engineering paper / blueprint / grid feel. Pure CSS.

```css
.dot-grid {
  background-image: radial-gradient(circle, var(--border) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

For a crosshair grid:

```css
.cross-grid {
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 40px 40px;
}
```

---

## 4. Mesh Gradient

Organic, blobby color blending. Use multiple radial-gradients positioned differently.

```css
.mesh-gradient {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(255, 45, 123, 0.25) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(0, 212, 255, 0.2) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(189, 147, 249, 0.2) 0%, transparent 50%),
    var(--bg-deep);
}
```

Animate with slow `background-position` shifts for living backgrounds.

---

## 5. CRT Vignette

Dark edges, bright center. Simulates curved CRT glass.

```css
.crt-vignette::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9997;
  background: radial-gradient(
    ellipse at center,
    transparent 50%,
    rgba(0, 0, 0, 0.5) 100%
  );
}
```

---

## 6. Halftone Dots

Print / pop-art texture. SVG-based.

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
  <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.1"/>
</svg>
```

For comic-book halftone, vary `r` based on position (use multiple circles with different radii).

---

## 7. Diagonal Stripes

Warning / industrial / construction tape feel.

```css
.stripes {
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.03) 10px,
    rgba(255, 255, 255, 0.03) 20px
  );
}
```

For thick hazard stripes, use `var(--accent)` at higher opacity with 20px bands.

---

## 8. Frosted Glass (Glassmorphism)

Depth through blur. Requires layered content behind.

```css
.frost {
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  background: rgba(17, 25, 40, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}
```

Layer over a mesh gradient or image for best effect.

---

## 9. Noise Dots (Original SVG Pattern)

Simple tileable noise via SVG pattern.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <pattern id="noise" width="100" height="100" patternUnits="userSpaceOnUse">
      <rect width="100" height="100" fill="#000"/>
      <circle cx="10" cy="10" r="1" fill="#fff" opacity="0.1"/>
      <circle cx="45" cy="22" r="0.8" fill="#fff" opacity="0.08"/>
      <circle cx="78" cy="15" r="1.2" fill="#fff" opacity="0.06"/>
      <circle cx="30" cy="55" r="0.6" fill="#fff" opacity="0.12"/>
      <circle cx="65" cy="70" r="1" fill="#fff" opacity="0.07"/>
      <circle cx="88" cy="48" r="0.9" fill="#fff" opacity="0.09"/>
      <circle cx="15" cy="85" r="1.1" fill="#fff" opacity="0.05"/>
      <circle cx="52" cy="90" r="0.7" fill="#fff" opacity="0.11"/>
    </pattern>
  </defs>
  <rect width="100" height="100" fill="url(#noise)"/>
</svg>
```

---

## 10. Animated Gradient Shift

Living background that slowly morphs.

```css
@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.living-bg {
  background: linear-gradient(-45deg, #0d0f18, #141829, #1e0a2e, #0a1628);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}
```

---

## Layering Strategy

Stack multiple textures for richness. Order (bottom to top):

1. **Base gradient** (mesh or linear)
2. **Pattern overlay** (dots, grid, stripes) — low opacity
3. **Noise / grain** — 2-4% opacity, `mix-blend-mode: overlay`
4. **Vignette** — edges only
5. **Content** — your actual UI

Use `position: fixed` + `pointer-events: none` + high `z-index` for overlays that cover everything.
