# Aesthetics

Each profile is a complete system. Pick one, or fuse two layers. Three sources muddies.

---

## Void Terminal

Hacker cave. CRT phosphor. SSH at 2 AM.

| Layer | Spec |
|-------|------|
| Fonts | Fira Code (all), IBM Plex Mono (secondary) |
| Palette | `--bg-deep: #0a0a0a` `--bg-surface: #111` `--text-primary: #33ff33` `--text-muted: #1a7a1a` `--accent: #00ff41` `--accent-glow: #33ff77` `--danger: #ff3333` `--border: #1a331a` |
| Texture | 2px scanline overlay, grain, CRT vignette |
| Motion | Cursor blink (`step-end`), typewriter, flicker on hover |
| Layout | `max-width: 80ch`, left-aligned, `>_` prompts, square corners |

## Brutalist Concrete

Raw structure. Exposed construction.

| Layer | Spec |
|-------|------|
| Fonts | Cinzel (headings), Space Mono (body), Impact (numbers) |
| Palette | `--bg-deep: #e8e4de` `--bg-surface: #d4cfc7` `--text-primary: #1a1a1a` `--text-muted: #666` `--accent: #c41e1e` `--accent-glow: #ff2d2d` `--border: #1a1a1a` |
| Texture | 3–4px solid black borders, paper grain at 2% |
| Motion | Hard cuts. Slam-in with `steps(3)`. Hover inverts instantly. |
| Layout | Overlapping blocks, `mix-blend-mode: difference`, `-90deg` labels, all-caps |

## Tokyo Drift

Neon Shibuya. Rain on glass.

| Layer | Spec |
|-------|------|
| Fonts | Rajdhani (headings), Noto Sans JP (body), Fira Code (data) |
| Palette | `--bg-deep: #0d0f18` `--bg-surface: #141829` `--text-primary: #e4e6f0` `--text-muted: #6b7094` `--accent: #ff2d7b` `--accent-glow: #ff6ba4` `--danger: #ff4444` `--success: #39ffb0` `--border: #1e2340` |
| Texture | Navy→charcoal mesh, neon halos, rain-streak overlay |
| Motion | Drift-in from the right, neon flicker, pulse glow, staggered cards |
| Layout | Neon left-border cards, `3fr 1fr`, sticky floats |

## Solarpunk Dawn

Warm sunrise. Tech in service of nature.

| Layer | Spec |
|-------|------|
| Fonts | Playfair Display (headings), Nunito (body), JetBrains Mono (code) |
| Palette | `--bg-deep: #faf6f0` `--bg-surface: #fff8ee` `--text-primary: #2d3a2d` `--text-muted: #6b7a6b` `--accent: #e8833a` `--accent-glow: #ffaa55` `--success: #4a9e6b` `--border: #d4ccb8` |
| Texture | Cream→peach linen, botanical SVG at 3%, `12px 12px 0` long shadows |
| Motion | 0.8s ease-out grow-in, hover lift + warm shadow |
| Layout | Golden-ratio columns, 12–16px radius, uneven card heights |

## Dracula's Study

Gothic intellect. Purple-black depth.

| Layer | Spec |
|-------|------|
| Fonts | Cinzel Decorative (hero), Crimson Text (body), Fira Code (mono) |
| Palette | `--bg-deep: #282a36` `--bg-surface: #343746` `--text-primary: #f8f8f2` `--text-muted: #6272a4` `--accent: #bd93f9` `--accent-glow: #d4b0ff` `--danger: #ff5555` `--success: #50fa7b` `--warning: #f1fa8c` `--border: #44475a` |
| Texture | Purple-grey gradient, 2% noise, edge vignette |
| Motion | Fade + 16px rise, 0.3s cubic-bezier, pulse-glow on focus |
| Layout | Centered, icon+label sidebar, code-block surfaces, 8px cards, pill tags |

## Bauhaus Machine

Primary color. Geometric purity.

| Layer | Spec |
|-------|------|
| Fonts | Bungee (display), Rajdhani (body), Space Mono (data) |
| Palette | `--bg-deep: #f5f0e8` `--bg-surface: #ffffff` `--text-primary: #1a1a1a` `--accent: #d62828` `--accent-secondary: #003566` `--accent-tertiary: #fcbf49` `--border: #1a1a1a` |
| Texture | Flat geometry as CSS backgrounds, hard `4px 4px 0 #000` shadows |
| Motion | `clip-path` circle/polygon reveals, rotate-in icons, linear timing |
| Layout | Strict grid with oversized breakers, 2px borders, left-heavy |

## Vapor Lounge

Pink sunset, chrome, Miami Vice / Win95.

| Layer | Spec |
|-------|------|
| Fonts | Monoton (display), Orbitron (headings), Quicksand (body) |
| Palette | `--bg-deep: #1a0a2e` `--bg-surface: #2d1b4e` `--text-primary: #f0e6ff` `--text-muted: #9b72cf` `--accent: #ff6ec7` `--accent-glow: #ff9de0` `--accent-secondary: #00d4ff` `--border: #4a2d7a` |
| Texture | Pink→purple→navy sunset, 50px grid at 5%, chrome text gradient |
| Motion | 3px / 4s float, text shimmer, neon pulse |
| Layout | Centered heroes, double outset window-frames, `image-rendering: pixelated` |

## Arctic Interface

Scandi HUD. Research station.

| Layer | Spec |
|-------|------|
| Fonts | Josefin Sans (headings), Inter Tight (body), DM Mono (data) |
| Palette | `--bg-deep: #f0f4f8` `--bg-surface: #ffffff` `--bg-elevated: #e2e8f0` `--text-primary: #1e293b` `--text-muted: #64748b` `--accent: #0ea5e9` `--accent-glow: #38bdf8` `--danger: #ef4444` `--border: #cbd5e1` |
| Texture | Blue-grey wash, 1px hairlines, `backdrop-filter: blur(8px)` |
| Motion | 0.2s directional slides, brightness + crisp shadow on hover |
| Layout | Three-panel (sidebar + main + detail), 14px body, status dots |

## Obsidian Forge

Dark smithy. Ember. Heavy and warm.

| Layer | Spec |
|-------|------|
| Fonts | Uncial Antiqua (display), Merriweather (body), JetBrains Mono (code) |
| Palette | `--bg-deep: #1a1410` `--bg-surface: #241e18` `--text-primary: #e8dcc8` `--text-muted: #8a7a66` `--accent: #e67e22` `--accent-glow: #f0a050` `--danger: #c0392b` `--success: #4a7a4a` `--border: #3a3028` |
| Texture | Warm black gradient, ember particles, leather noise, inner glow |
| Motion | 0.5s rise-from-below, hover glow, fire-flicker on accents |
| Layout | Medium width, deep padding, ornamental dividers, weight at the top |

## Glitch Protocol

Corrupted data. Digital punk.

| Layer | Spec |
|-------|------|
| Fonts | Share Tech Mono (body), Bungee Shade (hero), VT323 (labels) |
| Palette | `--bg-deep: #0a0a0a` `--bg-surface: #111111` `--text-primary: #e0e0e0` `--text-muted: #555` `--accent: #00ff88` `--accent-glow: #66ffbb` `--danger: #ff0040` `--accent-secondary: #ff00ff` `--border: #222` |
| Texture | Chromatic-aberration text shadows, scanlines, pixel-noise blocks |
| Motion | `clip-path` + `skew` glitch, scramble on hover, RGB split, jitter |
| Layout | Mono grid, status bars, terminal frames, ASCII, content peeking past `overflow: hidden` |

## Manuscript

Aged paper. Illuminated text.

| Layer | Spec |
|-------|------|
| Fonts | Cormorant Garamond (headings), Lora (body), Inconsolata (mono) |
| Palette | `--bg-deep: #f4efe4` `--bg-surface: #faf7f0` `--text-primary: #2c2416` `--text-muted: #7a6e5c` `--accent: #8b4513` `--accent-glow: #b8621a` `--danger: #8b0000` `--border: #d4c9b0` |
| Texture | Parchment gradient, 4% paper grain, `clip-path` torn edges, inset shadows |
| Motion | Slow `translateX` + `rotateY` page-turn, ink-dry fade, candlelight hover |
| Layout | `65ch` column, `::first-letter` drop caps, pull quotes, 1.8 line-height, margin notes |

## Neon Brutalism

Raw structure at a rave.

| Layer | Spec |
|-------|------|
| Fonts | Bungee (headings), Space Mono (body), Bungee Hairline (accents) |
| Palette | `--bg-deep: #000000` `--bg-surface: #111111` `--text-primary: #ffffff` `--text-muted: #888` `--accent: #ffff00` `--accent-glow: #ffff66` `--danger: #ff0000` `--accent-secondary: #00ffff` `--border: #ffffff` |
| Texture | Flat black, white 3px borders, neon via large-blur `box-shadow` — hard blocks, no gradients |
| Motion | Instant snap (`0`–`0.05s`). Hover jumps `-4px`. Border flash on click. |
| Layout | Overlaps, rotated labels, `z-index` battles, explicit grid-area collisions |

## Fusion

Typography from one + color from another. Dark palette + light layout. Motion from Glitch + everything else from Manuscript. Two sources maximum.
