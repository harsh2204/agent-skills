# Texture

Backgrounds are stacked. Order, bottom to top: base gradient → pattern at low opacity → grain at 2–4% (`mix-blend-mode: overlay`) → vignette → content. Overlays: `position: fixed; pointer-events: none;` plus a high `z-index`.

## Grain

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#grain)" opacity="0.4"/>
</svg>
```

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
}
```

Opacity `0.02` (whisper) to `0.08` (grit).

## Scanlines

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

Phosphor: `rgba(0, 255, 65, 0.03)`.

## Dot grid / crosshair

```css
.dot-grid {
  background-image: radial-gradient(circle, var(--border) 1px, transparent 1px);
  background-size: 24px 24px;
}

.cross-grid {
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 40px 40px;
}
```

## Mesh

```css
.mesh-gradient {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(255, 45, 123, 0.25) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(0, 212, 255, 0.2) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(189, 147, 249, 0.2) 0%, transparent 50%),
    var(--bg-deep);
}
```

Shift `background-position` slowly for a living field.

## CRT vignette

```css
.crt-vignette::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9997;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.5) 100%);
}
```

## Halftone

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
  <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.1"/>
</svg>
```

## Stripes

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

Hazard: `var(--accent)` at higher opacity, 20px bands.

## Frost

```css
.frost {
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  background: rgba(17, 25, 40, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

Sits on a mesh or an image.

## Noise dots

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

## Living gradient

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
