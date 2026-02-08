# Picasso Aesthetic Catalog

Each profile is a complete design system. Pick one, fuse two, or use as springboard.

---

## 1. Void Terminal

**Vibe**: Hacker cave. CRT phosphor glow. You're SSH'd into the mainframe at 2 AM.

| Layer | Spec |
|-------|------|
| Fonts | Fira Code (all), IBM Plex Mono (secondary) |
| Palette | `--bg-deep: #0a0a0a` `--bg-surface: #111` `--text-primary: #33ff33` `--text-muted: #1a7a1a` `--accent: #00ff41` `--accent-glow: #33ff77` `--danger: #ff3333` `--border: #1a331a` |
| Texture | Scanline overlay (repeating-linear-gradient, 2px), subtle noise, CRT vignette (radial-gradient dark edges) |
| Motion | Cursor blink (`step-end`), text typing animation, terminal scroll, flicker on hover |
| Layout | Fixed-width container (max 80ch), left-aligned, `>_` prompt decorations, no rounded corners |

---

## 2. Brutalist Concrete

**Vibe**: Raw. Architectural. A building made of code. Exposed structure is the aesthetic.

| Layer | Spec |
|-------|------|
| Fonts | Cinzel (headings), Space Mono (body), Impact (accent numbers) |
| Palette | `--bg-deep: #e8e4de` `--bg-surface: #d4cfc7` `--text-primary: #1a1a1a` `--text-muted: #666` `--accent: #c41e1e` `--accent-glow: #ff2d2d` `--border: #1a1a1a` |
| Texture | Flat with thick borders (3-4px solid black). Paper grain noise at 2% opacity |
| Motion | Hard cuts (no easing). Elements slam into place. `transform: translateY(-100%)` → `0` with `steps(3)`. Hover: invert colors instantly. |
| Layout | Overlapping blocks. `mix-blend-mode: difference`. Rotated labels (`transform: rotate(-90deg)`). Thick black dividers. All-caps headings |

---

## 3. Tokyo Drift

**Vibe**: Neon-soaked Shibuya crossing. Rain on glass. Japanese typography influence. Night city.

| Layer | Spec |
|-------|------|
| Fonts | Rajdhani (headings), Noto Sans JP (body), Fira Code (data) |
| Palette | `--bg-deep: #0d0f18` `--bg-surface: #141829` `--text-primary: #e4e6f0` `--text-muted: #6b7094` `--accent: #ff2d7b` `--accent-glow: #ff6ba4` `--danger: #ff4444` `--success: #39ffb0` `--border: #1e2340` |
| Texture | Multi-layer gradient (deep navy → charcoal). Neon glow halos around accent elements. Rain-streak SVG overlay at low opacity |
| Motion | Slide-in from right (like a car drifting). Neon flicker on accent text. Pulse glow on buttons. Staggered card reveals |
| Layout | Cards with neon left-border (`border-left: 3px solid var(--accent)`). Asymmetric 2-column (3fr 1fr). Floating UI elements with `position: sticky` |

---

## 4. Solarpunk Dawn

**Vibe**: Warm sunrise. Organic growth. Technology serving nature. Optimistic futurism.

| Layer | Spec |
|-------|------|
| Fonts | Playfair Display (headings), Nunito (body), JetBrains Mono (code) |
| Palette | `--bg-deep: #faf6f0` `--bg-surface: #fff8ee` `--text-primary: #2d3a2d` `--text-muted: #6b7a6b` `--accent: #e8833a` `--accent-glow: #ffaa55` `--success: #4a9e6b` `--border: #d4ccb8` |
| Texture | Warm linen gradient (cream → soft peach). Botanical line-art SVG pattern at 3% opacity. Soft long shadows (`box-shadow: 12px 12px 0 rgba(0,0,0,0.06)`) |
| Motion | Gentle ease-out entrances (0.8s). Elements grow in (`scale(0.95)` → `1`). Hover: lift + warm shadow expansion. Organic bezier curves |
| Layout | Generous whitespace. Golden ratio columns. Rounded corners (12-16px). Card grid with uneven heights. Flowing, non-rigid alignment |

---

## 5. Dracula's Study

**Vibe**: The Dracula IDE theme as an interior design movement. Gothic intellect. Purple-black depth.

| Layer | Spec |
|-------|------|
| Fonts | Cinzel Decorative (hero), Crimson Text (body), Fira Code (mono) |
| Palette | `--bg-deep: #282a36` `--bg-surface: #343746` `--text-primary: #f8f8f2` `--text-muted: #6272a4` `--accent: #bd93f9` `--accent-glow: #d4b0ff` `--danger: #ff5555` `--success: #50fa7b` `--warning: #f1fa8c` `--border: #44475a` |
| Texture | Subtle gradient (deep purple-grey → slightly lighter). Noise overlay at 2%. Vignette shadow at edges |
| Motion | Fade + slight upward drift (16px). Smooth transitions (0.3s cubic-bezier). Accent elements pulse-glow on focus. Hover: brighten + subtle scale |
| Layout | Centered containers. Sidebar navigation with icon + label. Code-block styling everywhere. Pill-shaped tags. Soft rounded cards (8px) |

---

## 6. Bauhaus Machine

**Vibe**: 1920s Bauhaus school. Primary colors. Geometric purity. Form follows function taken literally.

| Layer | Spec |
|-------|------|
| Fonts | Bungee (display), Rajdhani (body), Space Mono (data) |
| Palette | `--bg-deep: #f5f0e8` `--bg-surface: #ffffff` `--text-primary: #1a1a1a` `--accent: #d62828` `--accent-secondary: #003566` `--accent-tertiary: #fcbf49` `--border: #1a1a1a` |
| Texture | Flat with geometric shape decorations. Circles and rectangles as pure CSS backgrounds. Hard shadows (no blur: `4px 4px 0 #000`) |
| Motion | Geometric transitions: `clip-path` reveals (circle/polygon). Rotate-in for icons. Strict linear timing. No bounce. |
| Layout | Strict grid but with intentionally oversized elements breaking it. Large colored blocks as section dividers. Thick 2px borders everywhere. Left-heavy layouts |

---

## 7. Vapor Lounge

**Vibe**: 80s/90s fever dream. Pink sunsets, chrome text, palm trees in pixel art. Miami Vice meets Windows 95.

| Layer | Spec |
|-------|------|
| Fonts | Monoton (display), Orbitron (headings), Quicksand (body) |
| Palette | `--bg-deep: #1a0a2e` `--bg-surface: #2d1b4e` `--text-primary: #f0e6ff` `--text-muted: #9b72cf` `--accent: #ff6ec7` `--accent-glow: #ff9de0` `--accent-secondary: #00d4ff` `--border: #4a2d7a` |
| Texture | Sunset gradient (hot pink → deep purple → navy). Grid-line overlay (1px lines, 50px apart, 5% opacity). Chrome text effect (linear-gradient on text) |
| Motion | Slow float animations. Elements bob up/down (3px, 4s infinite). Text shimmer (gradient animation on clip). Neon pulse on hover |
| Layout | Centered, spacious. Large hero sections. Text over gradient backgrounds. Retro window-frame borders (double border, outset style). `image-rendering: pixelated` for retro images |

---

## 8. Arctic Interface

**Vibe**: Scandinavian design meets sci-fi HUD. Cold, precise, minimal but not empty. Research station in Iceland.

| Layer | Spec |
|-------|------|
| Fonts | Josefin Sans (headings), Inter Tight (body — note: Inter Tight is distinct from Inter), DM Mono (data) |
| Palette | `--bg-deep: #f0f4f8` `--bg-surface: #ffffff` `--bg-elevated: #e2e8f0` `--text-primary: #1e293b` `--text-muted: #64748b` `--accent: #0ea5e9` `--accent-glow: #38bdf8` `--danger: #ef4444` `--border: #cbd5e1` |
| Texture | Clean with subtle blue-grey gradient. Thin 1px borders. Frosted glass panels (`backdrop-filter: blur(8px)`). Hairline dividers |
| Motion | Precise, fast (0.2s). Slide from specific direction based on element position. No overshoot. Hover: subtle brightness shift + crisp shadow |
| Layout | Dense data grids. Compact cards. Tight vertical rhythm. Status indicators (colored dots). Sidebar + main + detail three-panel. Small text sizes (14px body) |

---

## 9. Obsidian Forge

**Vibe**: Dark smithy. Ember glow. Heavy and warm. A creative tool that means business.

| Layer | Spec |
|-------|------|
| Fonts | Uncial Antiqua (display), Merriweather (body), JetBrains Mono (code) |
| Palette | `--bg-deep: #1a1410` `--bg-surface: #241e18` `--text-primary: #e8dcc8` `--text-muted: #8a7a66` `--accent: #e67e22` `--accent-glow: #f0a050` `--danger: #c0392b` `--success: #4a7a4a` `--border: #3a3028` |
| Texture | Dark warm gradient (deep brown-black). Ember particle effect (CSS animation, floating dots). Subtle leather/paper noise texture. Inner glow on containers |
| Motion | Slow, heavy (0.5s ease-out). Elements rise from below like embers. Glow intensifies on hover. Fire-flicker on accent elements (opacity oscillation) |
| Layout | Centered, medium-width. Deep padding. Card-heavy with inner shadows. Dividers as ornamental lines (border-image or SVG). Heavy visual weight at top |

---

## 10. Glitch Protocol

**Vibe**: Corrupted data. Matrix rain. The system is alive and slightly broken. Digital punk.

| Layer | Spec |
|-------|------|
| Fonts | Share Tech Mono (all text), Bungee Shade (hero), VT323 (labels) |
| Palette | `--bg-deep: #0a0a0a` `--bg-surface: #111111` `--text-primary: #e0e0e0` `--text-muted: #555` `--accent: #00ff88` `--accent-glow: #66ffbb` `--danger: #ff0040` `--accent-secondary: #ff00ff` `--border: #222` |
| Texture | Pure black with chromatic aberration effect (offset colored shadows on text). Scanlines. Random pixel-noise blocks |
| Motion | Glitch animation (random `clip-path` + `transform: skew()` at intervals). Text scramble on hover. RGB split on focus. Jitter micro-movements |
| Layout | Monospace grid aligned. Status bars and progress indicators. Terminal-window framing. ASCII art decorations. `overflow: hidden` with content peeking out |

---

## 11. Manuscript

**Vibe**: Aged paper. Library of Alexandria. Scholarly but alive. The web as illuminated text.

| Layer | Spec |
|-------|------|
| Fonts | Cormorant Garamond (headings), Lora (body), Inconsolata (mono) |
| Palette | `--bg-deep: #f4efe4` `--bg-surface: #faf7f0` `--text-primary: #2c2416` `--text-muted: #7a6e5c` `--accent: #8b4513` `--accent-glow: #b8621a` `--danger: #8b0000` `--border: #d4c9b0` |
| Texture | Parchment gradient. Paper-grain noise at 4% opacity. Torn-edge effect via `clip-path: polygon()` on sections. Inset shadows on containers |
| Motion | Minimal and slow. Page-turn feel: `translateX` with subtle `rotateY`. Fade-in text as if ink drying. Hover: warm glow like candlelight |
| Layout | Single column, 65ch max-width. Large `::first-letter` drop caps. Pull quotes with decorative borders. Generous line-height (1.8). Margin notes via `position: absolute` on wide screens |

---

## 12. Neon Brutalism

**Vibe**: If brutalism went to a rave. Raw structure + electric color. Aggressive beauty.

| Layer | Spec |
|-------|------|
| Fonts | Bungee (headings), Space Mono (body), Bungee Hairline (accents) |
| Palette | `--bg-deep: #000000` `--bg-surface: #111111` `--text-primary: #ffffff` `--text-muted: #888` `--accent: #ffff00` `--accent-glow: #ffff66` `--danger: #ff0000` `--accent-secondary: #00ffff` `--border: #ffffff` |
| Texture | Flat black + white borders. No gradients — hard color blocks only. Neon glow via `box-shadow` (colored, large blur radius) |
| Motion | Instant state changes (0s transition, or 0.05s). Hard snap. Hover: elements jump (`translateY(-4px)` instant). Border-color flash on click |
| Layout | Overlapping elements. Thick white borders (3px). Rotated text labels. `z-index` battles. Explicit `grid-row` / `grid-column` overlaps. Max visual tension |

---

## Fusion Rules

Combine aesthetics by taking layers from different profiles:

- **Typography** from one + **Color** from another = instant hybrid.
- Mix a dark profile's palette with a light profile's layout = unique contrast.
- Take **Motion** from Glitch Protocol + everything else from Manuscript = digital corruption of classical.

**Golden rule of fusion**: Keep **max 2 sources**. Three or more = mud.
