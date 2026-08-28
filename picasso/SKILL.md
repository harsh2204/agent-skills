---
name: picasso
description: Authored frontends with unique typography, inevitable palettes, atmospheric texture, and communicative motion. Use when generating or restyling a UI, landing page, dashboard, or frontend.
---

# Picasso

Build a frontend that looks authored for this project.

## Workflow

1. **Extract DNA** — Name domain, audience, mood, density, and era, plus the visual language each implies. Done when all five are written down.
2. **Pick aesthetic** — Match DNA to [aesthetics.md](aesthetics.md). Fuse at most two profiles, or name a hybrid. Done when you can say: *Aesthetic: Name — fonts, palette, texture, motion.*
3. **Lay foundation** — Semantic HTML5, the token set below in `:root`, mobile-first. Done when every token has a value from this aesthetic.
4. **Build the five layers** — Typography → Color → Texture → Motion → Layout. Load the matching reference as you go. Done when each layer would fail its slop check if removed.
5. **The 10%** — One surprise the aesthetic owns: cursor, loader, hover, scroll reveal, or 404.
6. **Slop check** — Score the rubric. Under 35/50, iterate. Then ship complete runnable files.

Example: "CLI dashboard for server monitoring" → ops, engineers, vigilant, dense, none → *Void Terminal — Fira Code + IBM Plex Mono, phosphor on CRT black, scanlines, cursor-blink.*

## Tokens

```css
:root {
  --bg-deep: ; --bg-surface: ; --bg-elevated: ;
  --text-primary: ; --text-muted: ;
  --accent: ; --accent-glow: ;
  --danger: ; --success: ; --border: ;
}
```

Background is a gradient, layered, or textured. Accent meets 4.5:1 against its surface.

## Five layers

| Layer | Do | Reference |
|-------|-----|-----------|
| Typography | Contrast pairing (display + body + mono). Fluid `clamp()`. Tight headlines, tracked labels. Weights 300 with 800. | [fonts.md](fonts.md) |
| Color | Palette as the tokens above, inevitable for this DNA. | [aesthetics.md](aesthetics.md) |
| Texture | Grain, mesh, scanlines, frost — stacked. | [patterns.md](patterns.md) |
| Motion | Entrance, hover, state, or atmosphere. Removing it loses meaning. | [animations.md](animations.md) |
| Layout | Personality: brutalist, editorial, terminal, glass, neo-geo. `clip-path`, `mix-blend-mode`, `mask-image`. | [aesthetics.md](aesthetics.md) |

## Rubric

Rate 1–10. Ship at 35/50.

| Criterion | 10 |
|-----------|-----|
| Typography | Custom pairing, expressive scale, deliberate spacing |
| Color | Rich palette, textured background, glowing accents |
| Motion | Staggered entrance, meaningful hovers, scroll-aware |
| Layout | Broken grid, overlaps, asymmetry, tension |
| Character | Unmistakably this project |

Pass every check in [anti-slop.md](anti-slop.md) before ship.
