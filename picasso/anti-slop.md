# Anti-Slop Detection Guide

This is the blacklist. These are the patterns that make AI-generated UIs instantly recognizable as generic machine output. **Detect and reject every one.**

---

## The Generic AI Aesthetic (What We're Fighting)

You know it when you see it: a purple-to-blue gradient hero, Inter font at 400 weight, `border-radius: 9999px` on everything, a grid of 3 identical feature cards with emoji icons, a "Get Started" button in a rounded pill, and just... nothing. No opinion. No identity. No soul.

That's slop. Here's the specific anatomy:

---

## Typography Slop

| Pattern | Why It's Slop | Instead |
|---------|---------------|---------|
| Inter, Arial, Roboto, Helvetica as sole font | Default. Invisible. Says nothing. | Pick a font with *character* from [fonts.md](fonts.md) |
| Single font weight (400 or 700 only) | No visual hierarchy | Use 300+800 or 100+900 extremes |
| System font stack as hero text | Lazy | Display font for hero, always |
| Default letter-spacing everywhere | Undesigned | Tight headlines, tracked labels |
| Space Grotesk as the "unique" choice | It's the #1 AI crutch font. Everyone uses it now. | Literally anything else |
| Poppins/Outfit as the "friendly" choice | Overused to meaninglessness | Nunito, Quicksand, Josefin Sans |
| `font-size: 48px` hero, `16px` body, nothing else | Two-size typography is a wireframe | Build a full type scale with `clamp()` |

---

## Color Slop

| Pattern | Why It's Slop | Instead |
|---------|---------------|---------|
| Purple-to-blue gradient background | THE AI signature. Instant tell. | Derive palette from project context |
| `#1a1a2e` or `#0f0f23` dark backgrounds | The three most common AI dark BGs | Deep browns, greens, warm blacks, navy |
| Indigo-500 (`#6366f1`) as primary accent | Tailwind default. Everyone uses it. | Pick from aesthetic profile palettes |
| Blue CTA button on white background | SaaS template #1 | Any color that isn't default blue |
| Grey text on white (`#666 on #fff`) | Zero commitment to a palette | Warm or cool-tinted greys that match your palette |
| Rainbow gradient text on everything | Gimmick without taste | One gradient, one element, earned |
| Dark mode = `#000000` or `#111111` flat | Depthless void | Layered backgrounds, textures, subtle gradients |

---

## Layout Slop

| Pattern | Why It's Slop | Instead |
|---------|---------------|---------|
| 3-column feature grid with equal cards | Every landing page generator | Asymmetric, varied card sizes, break the grid |
| Perfect 12-column symmetry | Safe and boring | 2fr/1fr, overlapping, offset elements |
| Hero → Features → Testimonials → CTA → Footer | The SaaS template assembly line | Surprise the scroll. Interrupt the pattern. |
| `max-width: 1200px` centered container for everything | One-note layout | Vary container widths per section. Full-bleed + narrow |
| Equal padding/margin everywhere (e.g., `p-8` on everything) | No rhythm, no hierarchy | Vary spacing: tight clusters, generous breaks |
| Cards with `border-radius: 12px` + light shadow | The Tailwind UI default | Sharp corners, thick borders, or larger radius with intent |

---

## Component Slop

| Pattern | Why It's Slop | Instead |
|---------|---------------|---------|
| Pill-shaped buttons everywhere | The "modern" default | Buttons that match the aesthetic (sharp brutalist, underlined editorial) |
| Emoji as feature icons (✨ 🚀 💡) | Zero design effort | Custom SVG, CSS shapes, or stylized icon sets |
| Avatar circles in a row for "social proof" | Generic trust signal | Real design for testimonials or skip them |
| Gradient border + blur card combo | AI's favorite trick | Pick ONE technique and commit to it |
| Toggle switches that all look like iOS | Platform mimicry is not design | Custom toggles styled to your aesthetic |
| Hamburger menu on desktop | Mobile pattern forced everywhere | Creative desktop nav (sidebar, top links, command palette) |

---

## Motion Slop

| Pattern | Why It's Slop | Instead |
|---------|---------------|---------|
| `fade-in` on everything | The minimum viable animation | Staggered, directional, clip-based reveals |
| `transition: all 0.3s ease` globally | Undifferentiated. Every element moves the same | Different durations and easings per element type |
| Floating/bobbing hero illustration | Trendy in 2023, stale now | Motion that responds to content (scroll-driven, interaction-driven) |
| Parallax for the sake of parallax | If it doesn't serve the content, it's decoration | Parallax only if it creates meaningful depth |
| No motion at all | Equally bad — feels static, dead | At minimum: staggered entrance + hover states |

---

## Content/Copy Slop

| Pattern | Why It's Slop | Instead |
|---------|---------------|---------|
| "Welcome to [App]" as hero text | Says nothing | A statement that conveys the product's personality |
| "Get Started" / "Learn More" / "Sign Up" buttons | Generic CTA | Action-specific: "Start Building", "See the Code", "Enter the Void" |
| "Fast. Secure. Reliable." three-word features | Meaningless triad | Real benefits or skip feature lists entirely |
| Lorem ipsum in any shipped output | Unfinished is not a style | Real or realistic placeholder content that fits the theme |

---

## The Smell Test

Before shipping, ask:

1. **"Have I seen this exact layout on a Vercel template?"** → If yes, change it.
2. **"Could I swap in Inter and Tailwind Indigo and nobody would notice?"** → If yes, your aesthetic isn't strong enough.
3. **"Would a designer look at this and say 'AI made this'?"** → If yes, find the generic parts and kill them.
4. **"Does this look like it was made FOR this specific project?"** → If no, the design intelligence step was skipped.
5. **"If I remove the content, does the design itself have identity?"** → If no, the styling is just a container, not a design.

---

## Rehabilitation Techniques

If you catch yourself slipping into slop mid-build:

1. **Font swap**: Replace the safe font with something from the display category in [fonts.md](fonts.md). Immediately transforms the feel.
2. **Background surgery**: Replace flat color with a layered technique from [patterns.md](patterns.md). Add grain or gradient.
3. **Break one thing**: Take the most symmetrical element and make it asymmetric. Overlap something. Rotate a label.
4. **Add a surprise**: One element the user doesn't expect — a custom cursor, an ASCII art comment, a hover easter egg, a loading animation, a scroll-triggered shift.
5. **Commit to the bit**: If the aesthetic is "terminal", go ALL IN. Prompt characters, monospace everything, green on black, scanlines. Half-measures create blandness.
