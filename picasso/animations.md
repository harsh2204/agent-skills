# Motion

Every animation earns a job: entrance, state, feedback, or atmosphere. Then it earns its place in the [motion budget](SKILL.md#motion-budget): the loud pieces below (slam-in, glitch, clip reveals, typewriter) belong on once-moments, and hovers and presses stay under 200ms.

## Entrance

```css
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.enter { animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

.stagger > * {
  opacity: 0;
  animation: fadeSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
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

@keyframes scalePop {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes clipRevealDown {
  from { clip-path: inset(0 0 100% 0); }
  to   { clip-path: inset(0 0 0 0); }
}

@keyframes clipRevealCircle {
  from { clip-path: circle(0% at 50% 50%); }
  to   { clip-path: circle(100% at 50% 50%); }
}

@keyframes typewriter {
  from { width: 0; }
  to   { width: 100%; }
}
@keyframes blinkCursor { 50% { border-color: transparent; } }

.typewriter {
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid var(--accent);
  width: fit-content;
  animation: typewriter 2s steps(40) forwards, blinkCursor 0.75s step-end infinite;
}

@keyframes slamDown {
  0%   { opacity: 0; transform: translateY(-100%) scaleY(1.3); }
  60%  { opacity: 1; transform: translateY(5%) scaleY(0.95); }
  100% { transform: translateY(0) scaleY(1); }
}
```

## Hover

```css
.card {
  transition: transform 0.18s var(--ease-out), box-shadow 0.18s var(--ease-out);
}
@media (hover: hover) and (pointer: fine) {
  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(var(--accent-rgb), 0.15), 0 2px 8px rgba(0, 0, 0, 0.2);
  }
}

.btn { position: relative; overflow: hidden; }
.btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px solid var(--accent);
  border-radius: inherit;
  opacity: 0;
  transform: scale(1.1);
  transition: opacity 0.18s, transform 0.18s var(--ease-out);
}
.btn:hover::before { opacity: 1; transform: scale(1); }

.brutalist-link { transition: color 0s, background-color 0s; }
.brutalist-link:hover {
  color: var(--bg-deep);
  background-color: var(--text-primary);
}

.nav-link { position: relative; }
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--accent);
  transition: transform 0.2s var(--ease-out);
  transform: scaleX(0);
  transform-origin: left;
}
.nav-link:hover::after { transform: scaleX(1); }

@keyframes neonPulse {
  0%, 100% { box-shadow: 0 0 8px var(--accent), 0 0 20px rgba(var(--accent-rgb), 0.3); }
  50%      { box-shadow: 0 0 16px var(--accent), 0 0 40px rgba(var(--accent-rgb), 0.5); }
}
.neon { animation: neonPulse 2s ease-in-out infinite; } /* one hero element, never a whole nav */
```

Gate every `:hover` above behind `@media (hover: hover) and (pointer: fine)`, the way `.card` is. They're shown ungated here to keep them short.

## Press

```css
.btn {
  transition: transform var(--dur-press) var(--ease-out);
}
.btn:active { transform: scale(0.97); }
.btn-icon:active { transform: scale(0.96); }

/* Brutalist: the offset shadow collapses */
.btn-brutal { box-shadow: 4px 4px 0 var(--border); transition: transform 100ms, box-shadow 100ms; }
.btn-brutal:active { transform: translate(4px, 4px); box-shadow: 0 0 0 var(--border); }
```

Use a transition, not keyframes, so a release mid-press glides back. Skip the press on menu triggers, where the menu opening is the feedback.

## Exit

Exits are quieter than entrances: a short drop and a fade, on their own curve, at 60–75% of the enter duration.

```css
.toast {
  transition: opacity var(--dur-overlay) var(--ease-out), translate var(--dur-overlay) var(--ease-out);
  @starting-style { opacity: 0; translate: 0 16px; }
}
.toast.leaving {
  opacity: 0;
  translate: 0 8px;
  transition-duration: 160ms;
  transition-timing-function: var(--ease-exit);
}
```

Popovers grow from their trigger (`transform-origin` on the trigger side) from `scale(0.96)`. Dialogs scale from center.

## Atmosphere

```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
.float { animation: float 4s ease-in-out infinite; }

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

@keyframes glitch {
  0%   { transform: translate(0); }
  20%  { transform: translate(-2px, 1px); }
  40%  { transform: translate(2px, -1px); }
  60%  { transform: translate(-1px, -2px); }
  80%  { transform: translate(1px, 2px); }
  100% { transform: translate(0); }
}
@keyframes rgbSplit {
  0%, 100% { text-shadow: -2px 0 #ff0040, 2px 0 #00ff88; }
  50%      { text-shadow: 2px 0 #ff0040, -2px 0 #00ff88; }
}
.glitch-text {
  animation: glitch 0.3s ease-in-out infinite alternate, rgbSplit 0.5s ease-in-out infinite;
}

@keyframes slowSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.deco-spin { animation: slowSpin 30s linear infinite; }
```

## Loading

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

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-elevated) 50%, var(--bg-surface) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

## Scroll

```css
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

Fallback: `IntersectionObserver` adds `.visible` at `threshold: 0.1`.

## Easing

| Job | Value |
|-----|-------|
| Snappy out | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Bouncy | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Heavy | `cubic-bezier(0.7, 0, 0.3, 1)` |
| Mechanical | `steps(N)` |
| Elastic | `cubic-bezier(0.68, -0.55, 0.27, 1.55)` |
| Exit | `cubic-bezier(0.4, 0, 0.6, 1)` |

Bouncy and Elastic are for once-moments only. Overshoot on a label or a state change looks like a bug. Never use ease-in on anything the person is waiting for.

Durations: press 0.1–0.16s · hover 0.12–0.2s · overlay 0.2–0.3s · hero entrance 0.4–0.7s · page 0.6–1s · atmosphere 3–30s.

## Reduced motion

Reduced motion means fewer and gentler, not none. Keep fades and color changes. Drop travel, scale, 3D, parallax, glitch, and ambient loops.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
  .stagger > *, .enter, .scroll-reveal { animation: none; opacity: 1; transform: none; }
  .float, .ember, .deco-spin, .glitch-text, .neon, .parallax-bg { animation: none; }
}
```

Then check that every state still reads with nothing moving.

## Performance

- Animate `transform`, `opacity`, `filter`, and `clip-path`. Never animate `width`, `height`, `top`, `left`, `margin`, or `padding`.
- Name every transitioned property. `transition: all` animates things you didn't mean to and makes the browser track everything.
- Use `will-change` only on an element with a first-frame hitch you've actually seen, and never as a blanket.
- Keep `backdrop-filter` and large blurs at rest. Don't animate their radius. Keep transition blur at 2–4px.
- Fixed overlays (grain, scanlines) are static images, not animated noise. Particle fields cap at a few dozen nodes and pause offscreen.
- Don't write a pointer-driven value into a CSS variable on a big container, because every descendant recalculates. Set `transform` on the element that moves.
- Motion that plays during navigation or hydration is CSS or `element.animate()`, not a JS rAF loop on a busy main thread.
- Switch themes instantly or with a view transition, never `transition: all` at the root.
