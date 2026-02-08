# Picasso Animation Library

Motion is meaning. Every animation must communicate — entrance, state, feedback, or atmosphere.

---

## Entrance Animations

### Fade + Slide Up (Default workhorse)

```css
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.enter { animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
```

### Staggered Children (Cascade reveal)

```css
.stagger > * {
  opacity: 0;
  animation: fadeSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Generate with: nth-child(n) { animation-delay: calc(n * 0.06s) } */
.stagger > *:nth-child(1)  { animation-delay: 0.06s; }
.stagger > *:nth-child(2)  { animation-delay: 0.12s; }
.stagger > *:nth-child(3)  { animation-delay: 0.18s; }
.stagger > *:nth-child(4)  { animation-delay: 0.24s; }
.stagger > *:nth-child(5)  { animation-delay: 0.30s; }
.stagger > *:nth-child(6)  { animation-delay: 0.36s; }
.stagger > *:nth-child(7)  { animation-delay: 0.42s; }
.stagger > *:nth-child(8)  { animation-delay: 0.48s; }
.stagger > *:nth-child(9)  { animation-delay: 0.54s; }
.stagger > *:nth-child(10) { animation-delay: 0.60s; }
```

### Scale Pop (Cards, modals)

```css
@keyframes scalePop {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}
```

### Clip Reveal (Dramatic, geometric)

```css
@keyframes clipRevealDown {
  from { clip-path: inset(0 0 100% 0); }
  to   { clip-path: inset(0 0 0 0); }
}

@keyframes clipRevealCircle {
  from { clip-path: circle(0% at 50% 50%); }
  to   { clip-path: circle(100% at 50% 50%); }
}
```

### Typewriter (Terminal aesthetic)

```css
@keyframes typewriter {
  from { width: 0; }
  to   { width: 100%; }
}

@keyframes blinkCursor {
  50% { border-color: transparent; }
}

.typewriter {
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid var(--accent);
  width: fit-content;
  animation:
    typewriter 2s steps(40) forwards,
    blinkCursor 0.75s step-end infinite;
}
```

### Slam Down (Brutalist)

```css
@keyframes slamDown {
  0%   { opacity: 0; transform: translateY(-100%) scaleY(1.3); }
  60%  { opacity: 1; transform: translateY(5%) scaleY(0.95); }
  100% { transform: translateY(0) scaleY(1); }
}
```

---

## Hover & Interaction

### Lift + Glow

```css
.card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 8px 30px rgba(var(--accent-rgb), 0.15),
    0 2px 8px rgba(0, 0, 0, 0.2);
}
```

### Border Bloom

```css
.btn {
  position: relative;
  overflow: hidden;
}
.btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px solid var(--accent);
  border-radius: inherit;
  opacity: 0;
  transform: scale(1.1);
  transition: opacity 0.3s, transform 0.3s;
}
.btn:hover::before {
  opacity: 1;
  transform: scale(1);
}
```

### Color Invert (Brutalist)

```css
.brutalist-link {
  transition: color 0s, background-color 0s; /* instant */
}
.brutalist-link:hover {
  color: var(--bg-deep);
  background-color: var(--text-primary);
}
```

### Underline Slide

```css
.nav-link {
  position: relative;
}
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--accent);
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.nav-link:hover::after { width: 100%; }
```

### Neon Pulse

```css
@keyframes neonPulse {
  0%, 100% { box-shadow: 0 0 8px var(--accent), 0 0 20px rgba(var(--accent-rgb), 0.3); }
  50%      { box-shadow: 0 0 16px var(--accent), 0 0 40px rgba(var(--accent-rgb), 0.5); }
}

.neon { animation: neonPulse 2s ease-in-out infinite; }
```

---

## Atmospheric / Ambient

### Floating Drift (Vaporwave, dreamy)

```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

.float { animation: float 4s ease-in-out infinite; }
```

### Ember Rise (Obsidian Forge)

```css
@keyframes emberRise {
  0%   { opacity: 0; transform: translateY(20px) scale(0.5); }
  20%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(-100px) scale(0.2); }
}

.ember {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--accent);
  border-radius: 50%;
  animation: emberRise 3s ease-out infinite;
}
```

### Glitch Jitter

```css
@keyframes glitch {
  0%   { transform: translate(0); }
  20%  { transform: translate(-2px, 1px); }
  40%  { transform: translate(2px, -1px); }
  60%  { transform: translate(-1px, -2px); }
  80%  { transform: translate(1px, 2px); }
  100% { transform: translate(0); }
}

@keyframes rgbSplit {
  0%   { text-shadow: -2px 0 #ff0040, 2px 0 #00ff88; }
  50%  { text-shadow: 2px 0 #ff0040, -2px 0 #00ff88; }
  100% { text-shadow: -2px 0 #ff0040, 2px 0 #00ff88; }
}

.glitch-text {
  animation: glitch 0.3s ease-in-out infinite alternate,
             rgbSplit 0.5s ease-in-out infinite;
}
```

### Slow Rotate (Decorative elements)

```css
@keyframes slowSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.deco-spin { animation: slowSpin 30s linear infinite; }
```

---

## Loading States

### Pulse Dot Trio

```css
@keyframes pulseDot {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40%           { transform: scale(1); opacity: 1; }
}

.loading-dots span {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulseDot 1.4s ease-in-out infinite;
}
.loading-dots span:nth-child(2) { animation-delay: 0.16s; }
.loading-dots span:nth-child(3) { animation-delay: 0.32s; }
```

### Skeleton Shimmer

```css
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-surface) 25%,
    var(--bg-elevated) 50%,
    var(--bg-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}
```

---

## Scroll-Triggered (CSS-only with scroll-timeline)

```css
/* Modern browsers: scroll-driven animations */
@supports (animation-timeline: scroll()) {
  @keyframes scrollReveal {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .scroll-reveal {
    animation: scrollReveal linear;
    animation-timeline: view();
    animation-range: entry 0% entry 30%;
  }

  @keyframes parallaxShift {
    from { transform: translateY(-20%); }
    to   { transform: translateY(20%); }
  }

  .parallax-bg {
    animation: parallaxShift linear;
    animation-timeline: scroll();
  }
}
```

**Fallback**: For older browsers, use `IntersectionObserver` in JS to add `.visible` class.

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
```

---

## Easing Reference

Don't use `ease` or `linear` for entrances. Pick with intent:

| Easing | CSS | Feel |
|--------|-----|------|
| Snappy out | `cubic-bezier(0.16, 1, 0.3, 1)` | Quick start, smooth land |
| Bouncy | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful overshoot |
| Heavy | `cubic-bezier(0.7, 0, 0.3, 1)` | Slow start, authoritative |
| Mechanical | `steps(N)` | Brutalist, digital, typewriter |
| Elastic | `cubic-bezier(0.68, -0.55, 0.27, 1.55)` | Springy, cartoon |

**Duration guide**: Micro (hover, toggle): 0.15-0.25s. Entrance: 0.4-0.7s. Page transition: 0.6-1s. Atmospheric: 3-30s.
