# Agent toolkit (`tools/pl.mjs`)

One Node ESM CLI, no dependencies beyond Playwright (auto-installed into `tools/.cache/` on first run; Chromium is downloaded, or an existing one is picked up from `PLAYWRIGHT_BROWSERS_PATH`, `~/.cache/ms-playwright`, or the system `google-chrome`/`chromium`; `PL_CHROME=/path` forces a binary, `PL_NO_INSTALL=1` prints the commands instead of installing). Every command starts a tiny HTTP server on the skill folder so ES modules load, drives `tools/harness.html` in headless Chromium, and exits.

```
node tools/pl.mjs <command> [spec.json | library-id] [--flags]
```

## Describing a design

Any command that takes a design accepts one of:

- a JSON file: either a raw options object (`{"letter":"A","recipe":"hero","seed":7}`) or a saved library record;
- a library id (`hero`, `copper-knot-q`);
- flags: `--letter A --recipe hero`, plus any axis: `--style --fill --outline --frame --ornament --palette --texture --animate --seed --size --duration --fillOptions '{json}' --outlineOptions '{json}'`.

Flags override the file/recipe. Values that start with `{` or `[` are parsed as JSON (`--frame '{"shape":"circle","style":"stroked"}'`, `--ornament '[{"name":"vines","leaves":1.6}]'`); comma lists work for `--ornament hatch,vines` and `--texture grain,inkspread`. A letter longer than one character renders as a headline. The spec is resolved (recipe applied, frame/ornament normalised, defaults filled) before use, and that resolved spec is what gets written next to renders and stored in the library.

## Commands

| command | what it does | main flags |
|---|---|---|
| `render` | one design → `<name>.svg` (engine stylesheet embedded, so it animates standalone), `<name>.png` (final state) and `<name>.json` (resolved spec) | `--out out/` `--name` `--scale 2` `--bg palette\|#hex\|transparent` `--pad 0` |
| `frames` | animation as PNG frames by seeking the CSS animations, deterministic | `--fps 10` `--duration 2.8` (capture seconds) `--choreo 2500` (override the spec's choreography ms) `--out out/<name>-frames/` `--mp4` `--gif` (ffmpeg if present; otherwise the command is printed) |
| `sheet <dir\|glob>` | labelled contact sheet of PNGs tiled in a browser canvas | `--out out/sheet.png` `--tile 200` `--cols N` `--labels false` |
| `gallery` | renders every library design and tiles them | `--out out/gallery.png` `--size 200` `--cols N` |
| `save` | stores the resolved design in `library/designs/<id>.json` + `library/thumbs/<id>.png` | `--name` `--id` `--tags a,b` `--notes` `--force` |
| `list` | every library design: id, letter, seed, axes, tags | |
| `find <terms>` | AND-search over id, name, letter (single-char term), tags and every axis value | `--letter --style --fill --outline --frame --ornament --palette --animate --tag` (exit 1 when nothing matches) |
| `seed-library` | saves all named recipes (+hero) with thumbnails; skips existing ids | `--seed 4242` `--force` |
| `verify` | console/page/network errors + geometry audit (no ornament sample inside the glyph, in the gap band, or outside the frame) | design (file/id/flags), `--library` (default when no design is given), `--demo [--seed N]` |

Exit codes: 0 clean, 1 verify problems / rejected save / no find hits, 2 usage or crash.

## Library

`library/designs/<id>.json`:

```json
{ "id": "copper-knot-q", "name": "Copper knot Q", "letter": "Q",
  "spec": { "letter": "Q", "style": "uncial", "fill": "gradient", "outline": "halo",
            "frame": { "shape": "rounded", "style": "solid" }, "ornament": [{ "name": "knotwork" }],
            "palette": "copper", "texture": [], "animate": "fade", "seed": 1917, "size": 200, "duration": 2500 },
  "tags": ["demo", "knotwork", "uncial", "copper", "rounded"], "created": "2026-10-29T02:05:11.000Z", "notes": "" }
```

Tags always include the ornament module names, style, palette and frame shape, so `find vines`, `find copper` and `find --frame circle` work without manual tagging.

**Dedupe on save.** The design is compared with every stored design that has the same letter:

- exact duplicate = identical axes and seed (size and duration ignored) → rejected;
- near duplicate = same ornament modules, frame shape and style, palette and glyph style → rejected with a similarity score (Jaccard over all flattened axis values, so a seed-only change scores ~80 %);
- `--force` saves anyway (near-dup still prints a warning); ids are suffixed `-2`, `-3` if taken.

`verify` on the library re-renders every design from its stored spec, so a library that passes is a library whose specs still reproduce.
