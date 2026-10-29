# Review

How Picasso critiques a frontend: the identity first, then the finish. Use `full` mode unless the request says `quick`.

| Mode | Covers | Reports | Max findings |
|------|--------|---------|--------------|
| `quick` | Primary path, hero, highest-traffic states | `HIGH`, `MEDIUM` | 5 |
| `full` | Whole scope: identity, motion, states, surfaces, type, performance | All | 15 |

## Protocol

1. Name the stack: framework, styling system, motion library. Write every finding in that system.
2. **Identity pass.** Run [anti-slop.md](anti-slop.md) and the smell test. Can you name the aesthetic? Would this survive swapping in Inter and indigo?
3. **Budget pass.** List what moves and check it against the [motion budget](SKILL.md#motion-budget). Look for showpieces on frequent paths and dead air on once-moments.
4. **State pass.** For each component: rest, hover, focus-visible, active, pending, success, error, disabled, empty, overflow.
5. **Slow pass.** Play animations at 10% and step frames. Look for wrong origins, exits that cut, crossfades that read as two objects, and properties that finish out of sync.
6. Reduced motion on, then a touch viewport, then keyboard only.
7. Write down what you actually did. Report anything you skipped as **Not verified**.

## Severity

- `HIGH`: breaks access or trust, or costs attention on every repeat. Examples: a removed focus ring, a 500ms animation on a keyboard action, unreadable contrast, text over an animated background, a page that's generic slop.
- `MEDIUM`: a visible usability or consistency problem. Examples: `transition: all` on a hot path, a missing pending or error state, mismatched nested radii, hover stuck on touch.
- `LOW`: isolated polish. `full` mode only.

## Report

**Scope.** One paragraph covering mode, scope, stack, and the aesthetic as you read it (or "unnameable"). Then a coverage table that lists every category, including clean ones:

| Category | Inspected | Result |
|----------|-----------|--------|
| Identity | | n findings / Clear / Not reviewed: why |
| Motion | | |
| States | | |
| Surfaces | | |
| Typography | | |
| Performance | | |

**Findings.** One table, most severe first.

| Severity | Location | Now | Change | Why |
|----------|----------|-----|--------|-----|
| HIGH | `app/page.tsx:18` | Inter + `#6366f1` gradient hero | Cormorant Garamond display over a warm-black grain stack | Reads as a template, with no identity left once the copy is stripped |
| HIGH | `Search.tsx:30` | 350ms scale-in when ⌘K opens | Open instantly; fade out on close only | Opened dozens of times an hour, so the wait adds up |
| MEDIUM | `Button.tsx:12` | No pending state; double submits possible | Spinner flip in the same footprint, `aria-busy`, ignore repeat presses | People retry when nothing responds |
| LOW | `Stats.tsx:9` | Proportional digits on a live counter | `tabular-nums` | The number jitters sideways on every tick |

- **Location** is `path:line`, or the screen and component when there's no source.
- **Now** and **Change** are concrete code or values, not adjectives.
- **Why** names the effect on the person, not a rule.
- A systemic issue gets one row that lists every location. Don't pad to the cap.

**Left alone.** Two to five candidates (one to three in `quick`) that you considered and rejected, each with a reason. If there were fewer, say so.

**Verified.** What you ran, opened, and toggled, and what you saw. List skipped steps as **Not verified**.

**Verdict.** `Block` while any `HIGH` remains. `Needs changes` for only `MEDIUM`/`LOW`. `Approve` when nothing actionable is left. Put unverified checks next to the verdict.
