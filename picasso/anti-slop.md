# Slop checks

Run every row before ship. A hit means iterate that layer, then rescore the rubric in [SKILL.md](SKILL.md).

## Typography

| Detect | Replace with |
|--------|----------------|
| Inter, Arial, Roboto, Helvetica as the only face | A charactered pairing from [fonts.md](fonts.md) |
| One weight (400 or 700) | 300 with 800, or 100 with 900 |
| System stack on the hero | A display face at hero size |
| Default letter-spacing everywhere | Tight headlines (`-0.03em`), tracked labels (`0.15em`) |
| Space Grotesk, Poppins, or Outfit as the "distinctive" pick | Anything else in [fonts.md](fonts.md) |
| Two sizes only (`48px` / `16px`) | A full `clamp()` scale |

## Color

| Detect | Replace with |
|--------|----------------|
| Purple-to-blue hero gradient | A palette derived from this project's DNA |
| `#1a1a2e` / `#0f0f23` / indigo-500 (`#6366f1`) | Deep brown, green, warm black, or navy from the aesthetic |
| Blue CTA on white | An accent that belongs to this palette |
| `#666` on `#fff` | Warm or cool greys tinted to the palette |
| Rainbow gradient text on every heading | One gradient, one element |
| Flat `#000` or `#111` as the whole page | Layered surfaces, texture, a subtle gradient |

## Layout

| Detect | Replace with |
|--------|----------------|
| Three equal feature cards | Asymmetric sizes, a broken grid |
| Perfect 12-column symmetry | `2fr 1fr`, overlap, offset |
| Hero → Features → Testimonials → CTA → Footer | An interrupted scroll — one section that breaks the pattern |
| One `max-width: 1200px` for every section | Full-bleed next to narrow |
| Uniform `p-8` rhythm | Tight clusters, generous breaks |
| `border-radius: 12px` + light shadow on every card | Sharp, thick-bordered, or a larger radius with intent |

## Components

| Detect | Replace with |
|--------|----------------|
| Pill buttons on every action | Buttons that match the aesthetic (sharp, underlined, block) |
| Emoji as feature icons (✨ 🚀 💡) | Custom SVG, CSS shapes, or a stylized set |
| Avatar-row social proof | Designed testimonials, or omit |
| Gradient-border + blur on the same card | One technique, committed |
| iOS-clone toggles | Toggles styled to this aesthetic |
| Hamburger on desktop | Sidebar, top links, or a command palette |

## Motion

| Detect | Replace with |
|--------|----------------|
| The same `fade-in` on every node | Staggered, directional, or clip-based reveals |
| Global `transition: all 0.3s ease` | Duration and easing per element type |
| Bobbing hero illustration | Scroll-driven or interaction-driven motion |
| Parallax with no depth job | Parallax only when it creates depth |
| Still page | Staggered entrance plus hover states, minimum |

## Copy

| Detect | Replace with |
|--------|----------------|
| "Welcome to [App]" | A line that carries this product's personality |
| "Get Started" / "Learn More" / "Sign Up" | An action this product owns |
| "Fast. Secure. Reliable." | A real benefit, or skip the triad |
| Lorem ipsum in shipped output | Real or realistic copy that fits the theme |

## Smell test

Every answer is yes:

1. Swap Inter and Tailwind indigo in — does the page become a different site?
2. Strip the copy — does the design still have a nameable identity?
3. Would a designer name this project, not a template?

## If a check fails mid-build

1. Swap the display face from [fonts.md](fonts.md).
2. Replace the flat background with a stack from [patterns.md](patterns.md).
3. Break the most symmetrical element — overlap, offset, or rotate a label.
4. Add one surprise the aesthetic owns.
5. Commit to the bit: if it is terminal, it is prompts, mono, phosphor, scanlines.
