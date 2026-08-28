# Fonts

Load only the families and weights this aesthetic uses. Pair by contrast: serif + mono, geometric + humanist, heavy + light.

## Display

| Font | Character | Use when |
|------|-----------|----------|
| Playfair Display | High-contrast serif | Editorial, luxury, manuscript |
| Cinzel | Roman inscription | Brutalist, gothic, formal |
| Cinzel Decorative | Ornate Cinzel | Hero only |
| Bungee | Industrial block | Brutalist, neon, loud |
| Bungee Shade | Bungee with 3D shadow | Retro, vaporwave, glitch |
| Monoton | Neon single-line | Vaporwave, one-word heroes |
| Uncial Antiqua | Medieval uncial | Forge, manuscript, RPG |
| Cormorant Garamond | Literary serif | Manuscript, editorial |
| Orbitron | Geometric sci-fi | HUD, space, data |
| Righteous | Retro rounded | 70s, playful tools |
| Rubik Mono One | Heavy mono display | Industrial, impact |

## Body

| Font | Character | Use when |
|------|-----------|----------|
| Crimson Text | Warm book serif | Long-form, editorial |
| Lora | Sturdy contemporary serif | Warm, balanced |
| Merriweather | Thick, screen-ready | Dark backgrounds, dense text |
| Nunito | Rounded sans | Light, organic |
| Rajdhani | Condensed geometric | Tech, compact UI |
| Quicksand | Soft geometric | Playful, vaporwave body |
| Josefin Sans | Elegant geometric | Scandinavian, arctic |
| Inter Tight | Compact, distinct from Inter | Dense data UIs |

## Mono

| Font | Character | Use when |
|------|-----------|----------|
| Fira Code | Ligatures | Code, terminal |
| JetBrains Mono | Tall x-height | Dev tools |
| Space Mono | Quirky editorial mono | Brutalist, editorial data |
| IBM Plex Mono | Clean corporate mono | Professional terminal |
| DM Mono | Compact humanist | Tables, tight layouts |
| Inconsolata | Lightweight classic | Manuscript code, light themes |
| VT323 | Pixel terminal | Glitch, CRT, 8-bit |
| Share Tech Mono | Narrow tech | Glitch, dense data |

Per-aesthetic pairings live in [aesthetics.md](aesthetics.md).

## Weight

| Pair | Effect |
|------|--------|
| 300 + 800 | Editorial contrast |
| 100 + 900 | Hero drama |
| 500 body | Avoids "regular" blandness |

Animate variable-font weight on hover via `font-variation-settings`.

## Tracking

| Context | Value |
|---------|-------|
| Hero | `-0.03em` to `-0.05em` |
| Section heading | `-0.01em` to `-0.02em` |
| Body | `0` |
| Labels / captions | `0.08em` to `0.15em` |
| Nav links | `0.05em` to `0.1em` |
| Mono data | `0` |

## Load

Trim this to the faces you actually use:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Cinzel:wght@400;700;900&family=Cinzel+Decorative:wght@400;700;900&family=Bungee&family=Bungee+Shade&family=Monoton&family=Uncial+Antiqua&family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300&family=Orbitron:wght@400;700;900&family=Righteous&family=Rubik+Mono+One&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Lora:ital,wght@0,400;0,700;1,400&family=Merriweather:wght@300;400;700;900&family=Nunito:wght@300;400;600;700&family=Rajdhani:wght@300;400;500;600;700&family=Quicksand:wght@300;400;500;700&family=Josefin+Sans:wght@100;300;400;600;700&family=Fira+Code:wght@300;400;500;700&family=JetBrains+Mono:wght@100;300;400;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@300;400;500;700&family=DM+Mono:wght@300;400;500&family=Inconsolata:wght@300;400;700&family=VT323&family=Share+Tech+Mono&display=swap">
```
