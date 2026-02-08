# Picasso Font Library

## The Arsenal

### Display / Headlines (Impact fonts — use LARGE)

| Font | Character | Use When |
|------|-----------|----------|
| **Playfair Display** | Elegant serif, high contrast | Editorial, luxury, manuscript |
| **Cinzel** | Roman inscriptions, authority | Brutalist, gothic, formal |
| **Cinzel Decorative** | Cinzel but ornate | Hero text only, sparingly |
| **Bungee** | Bold block, industrial | Brutalist, neon, loud statements |
| **Bungee Shade** | Bungee + 3D shadow | Retro, vaporwave, glitch |
| **Monoton** | Neon sign, single-line | Vaporwave, nightlife, one word heroes |
| **Uncial Antiqua** | Medieval uncial | Fantasy, forge, manuscript, RPG |
| **Cormorant Garamond** | Refined, literary | Manuscript, editorial, scholarly |
| **Orbitron** | Geometric, sci-fi | Futuristic, HUD, space, data |
| **Righteous** | Retro rounded, friendly-bold | 70s retro, fun apps, creative tools |
| **Rubik Mono One** | Heavy mono display | Industrial, dense, impactful |

### Body / Reading (Legible at 14-18px)

| Font | Character | Use When |
|------|-----------|----------|
| **Crimson Text** | Warm serif, book-like | Long-form, editorial, manuscript |
| **Lora** | Sturdy serif, contemporary | Balanced readability, warm |
| **Merriweather** | Thick serif, screen-optimized | Dark backgrounds, dense text |
| **Nunito** | Rounded sans, friendly | Light themes, approachable, organic |
| **Rajdhani** | Geometric, condensed | Tech, futuristic, compact UI |
| **Quicksand** | Soft geometric | Playful, light, vaporwave body |
| **Josefin Sans** | Elegant geometric | Scandinavian, minimal, arctic |
| **Inter Tight** | Compact, neutral-but-distinct | Dense UIs, data-heavy (NOT plain Inter) |

### Monospace (Code, data, terminal vibes)

| Font | Character | Use When |
|------|-----------|----------|
| **Fira Code** | Ligatures, polished | Code displays, terminal aesthetics |
| **JetBrains Mono** | Tall x-height, crisp | Dev tools, IDE-inspired |
| **Space Mono** | Quirky, editorial mono | Brutalist, editorial data |
| **IBM Plex Mono** | Corporate-clean mono | Professional terminal, void |
| **DM Mono** | Compact, humanist mono | Data tables, compact layouts |
| **Inconsolata** | Lightweight, classic | Manuscript code, light themes |
| **VT323** | Pixel/retro terminal | Glitch, retro, 8-bit, CRT |
| **Share Tech Mono** | Narrow, techy | Glitch, cyberpunk, dense data |

## Pairing Matrix

**Principle**: Pair by **maximum contrast** — serif + mono, geometric + humanist, heavy + light.

| Aesthetic | Display | Body | Mono |
|-----------|---------|------|------|
| Void Terminal | — | — | Fira Code + IBM Plex Mono |
| Brutalist Concrete | Cinzel | Space Mono | Space Mono |
| Tokyo Drift | Rajdhani | Noto Sans JP | Fira Code |
| Solarpunk Dawn | Playfair Display | Nunito | JetBrains Mono |
| Dracula's Study | Cinzel Decorative | Crimson Text | Fira Code |
| Bauhaus Machine | Bungee | Rajdhani | Space Mono |
| Vapor Lounge | Monoton | Quicksand | — |
| Arctic Interface | Josefin Sans | Inter Tight | DM Mono |
| Obsidian Forge | Uncial Antiqua | Merriweather | JetBrains Mono |
| Glitch Protocol | Bungee Shade | — | Share Tech Mono + VT323 |
| Manuscript | Cormorant Garamond | Lora | Inconsolata |
| Neon Brutalism | Bungee | Space Mono | Space Mono |

## Weight Strategy

**Never use default 400/700.** Prefer extremes for visual tension:

- **Light (300)** + **ExtraBold (800)**: Modern editorial contrast.
- **Thin (100)** + **Black (900)**: Maximum drama. Hero text only.
- **Medium (500)** for body if font has it — avoids "regular" blandness.
- Use `font-variation-settings` for variable fonts — animate weight on hover.

## Letter-Spacing Guide

| Context | Value | Effect |
|---------|-------|--------|
| Hero headline (large) | `-0.03em` to `-0.05em` | Premium, tight, impactful |
| Section heading | `-0.01em` to `-0.02em` | Slightly refined |
| Body text | `0` (normal) | Don't touch body spacing |
| Labels / captions | `0.08em` to `0.15em` | Authority, uppercase labels |
| Navigation links | `0.05em` to `0.1em` | Airy, spacious |
| Monospace data | `0` | Natural mono spacing |

## Google Fonts Quick-Load

One link to rule them all (trim to what you need):

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Cinzel:wght@400;700;900&family=Cinzel+Decorative:wght@400;700;900&family=Bungee&family=Bungee+Shade&family=Monoton&family=Uncial+Antiqua&family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300&family=Orbitron:wght@400;700;900&family=Righteous&family=Rubik+Mono+One&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Lora:ital,wght@0,400;0,700;1,400&family=Merriweather:wght@300;400;700;900&family=Nunito:wght@300;400;600;700&family=Rajdhani:wght@300;400;500;600;700&family=Quicksand:wght@300;400;500;700&family=Josefin+Sans:wght@100;300;400;600;700&family=Fira+Code:wght@300;400;500;700&family=JetBrains+Mono:wght@100;300;400;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@300;400;500;700&family=DM+Mono:wght@300;400;500&family=Inconsolata:wght@300;400;700&family=VT323&family=Share+Tech+Mono&display=swap">
```

**Always subset**: Only load the weights and families you actually use. The full link above is reference — trim aggressively.
