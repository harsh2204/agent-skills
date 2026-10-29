#!/usr/bin/env node
// procedural-lettering agent toolkit. Usage: node tools/pl.mjs <command> [options]
// Commands: render · frames · sheet · gallery · save · list · find · seed-library · verify
// See tools.md for the full reference.

import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TOOLS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(TOOLS);
const CACHE = path.join(TOOLS, '.cache');
const LIB = path.join(ROOT, 'library');
const DESIGNS = path.join(LIB, 'designs');
const THUMBS = path.join(LIB, 'thumbs');
const AXES = ['style', 'fill', 'fillOptions', 'outline', 'outlineOptions', 'frame', 'ornament', 'palette', 'texture', 'animate'];
const FLAG_AXES = [...AXES, 'letter', 'text', 'recipe', 'seed', 'size', 'duration', 'gap', 'maxPaths'];

// ---------------------------------------------------------------- args

function parseArgs(argv) {
  const flags = {}, _ = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq > 0) flags[a.slice(2, eq)] = parseValue(a.slice(eq + 1));
      else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) flags[a.slice(2)] = parseValue(argv[++i]);
      else flags[a.slice(2)] = true;
    } else _.push(a);
  }
  return { _, flags };
}
function parseValue(s) {
  if (/^[\[{]/.test(s)) { try { return JSON.parse(s); } catch { return s; } }
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(s)) return +s;
  return s;
}
const list = (v) => v == null ? [] : Array.isArray(v) ? v : String(v).split(',').map((s) => s.trim()).filter(Boolean);

// ---------------------------------------------------------------- specs

let engine;
async function loadEngine() { return engine ??= await import(pathToFileURL(path.join(ROOT, 'src', 'index.js')).href); }

/** Builds a design spec from a JSON file / library id (positional or --spec) plus axis flags. */
async function specFromArgs(args, { required = true } = {}) {
  const src = args.flags.spec ?? args._[0];
  let base = {};
  if (src) {
    const file = fs.existsSync(src) ? src : path.join(DESIGNS, `${src}.json`);
    if (!fs.existsSync(file)) die(`spec not found: ${src}`);
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    base = j.spec ? { ...j.spec, letter: j.letter ?? j.spec.letter } : j;
  } else if (required && !args.flags.letter && !args.flags.recipe && !args.flags.text) die('give a spec file, a library id, or --letter/--recipe flags');
  const over = {};
  for (const k of FLAG_AXES) if (args.flags[k] !== undefined) over[k] = args.flags[k];
  if (typeof over.ornament === 'string' && over.ornament.includes(',')) over.ornament = list(over.ornament);
  if (over.texture !== undefined) over.texture = list(over.texture);
  if (over.text && !over.letter) over.letter = over.text;
  return resolveSpec({ ...base, ...over });
}

/** Resolves a spec to canonical axes: recipe applied, frame/ornament normalised, defaults filled. */
async function resolveSpec(spec) {
  const m = await loadEngine();
  const s = { ...spec };
  if (s.recipe) { if (!m.RECIPES[s.recipe]) die(`unknown recipe: ${s.recipe}`); Object.assign(s, m.applyRecipe(s.recipe), spec); }
  const letter = String(s.letter ?? s.text ?? 'A');
  const o = { ...m.DEFAULTS, ...s };
  const frame = m.normalizeFrame(o.frame);
  const ornament = m.normalizeOrnament(o.ornament).map(({ name, params }) => { const p = { ...params }; delete p.name; return { name, ...p }; });
  const out = {
    letter, style: o.style, fill: o.fill, outline: o.outline, frame, ornament, palette: o.palette,
    texture: list(o.texture), animate: o.animate === true ? 'auto' : o.animate, seed: o.seed ?? 1, size: o.size ?? 160, duration: o.duration ?? 2500,
  };
  for (const k of ['fillOptions', 'outlineOptions', 'gap', 'maxPaths', 'letterColor', 'ornamentColor', 'misregister', 'tracking', 'fontScale']) if (o[k] != null) out[k] = o[k];
  if (s.recipe) out.recipe = s.recipe;
  if (!m.MODULES || ornament.some((l) => !m.MODULES[l.name])) die(`unknown ornament module in ${JSON.stringify(ornament.map((l) => l.name))}`);
  return out;
}

const ornNames = (spec) => (spec.ornament || []).map((l) => l.name);
function baseName(spec) { return `${spec.letter}-${spec.recipe || ornNames(spec).join('+') || spec.style}-${spec.seed}`.replace(/[^\w.+-]+/g, '_'); }
function describe(spec) { return `${spec.style} · ${spec.fill}/${spec.outline} · ${spec.frame.shape}:${spec.frame.style} · ${ornNames(spec).join('+') || 'plain'} · ${spec.palette}`; }

// ---------------------------------------------------------------- server + browser

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.md': 'text/markdown' };
function serve() {
  const srv = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(ROOT, url === '/' ? 'tools/harness.html' : url);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok({ srv, port: srv.address().port })));
}

function sh(cmd, argv, cwd) { const r = spawnSync(cmd, argv, { cwd, stdio: 'inherit', shell: process.platform === 'win32' }); return r.status === 0; }

async function loadPlaywright() {
  try { return await import('playwright'); } catch { /* not resolvable from here */ }
  const local = path.join(CACHE, 'node_modules', 'playwright', 'index.mjs');
  if (!fs.existsSync(local)) {
    const cmds = `  npm i --prefix "${CACHE}" --no-audit --no-fund playwright\n  cd "${CACHE}" && npx playwright install chromium`;
    if (process.env.PL_NO_INSTALL) die(`playwright is missing. Run:\n${cmds}`);
    console.error('playwright not found; installing into tools/.cache …');
    fs.mkdirSync(CACHE, { recursive: true });
    if (!sh('npm', ['i', '--prefix', CACHE, '--no-audit', '--no-fund', 'playwright'], CACHE) || !fs.existsSync(local)) die(`install failed. Run manually:\n${cmds}`);
  }
  return import(pathToFileURL(local).href);
}

function expectedRevision() {
  for (const p of [path.join(CACHE, 'node_modules', 'playwright-core', 'browsers.json'), path.join(ROOT, 'node_modules', 'playwright-core', 'browsers.json')]) {
    try { return JSON.parse(fs.readFileSync(p, 'utf8')).browsers.find((b) => b.name === 'chromium')?.revision; } catch { /* next */ }
  }
  return null;
}

/** Finds an existing Chromium: PLAYWRIGHT_BROWSERS_PATH, ~/.cache/ms-playwright, then system chrome. */
function findChromium() {
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, path.join(os.homedir(), '.cache', 'ms-playwright'), path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright')].filter(Boolean);
  const rel = ['chrome-linux64/chrome', 'chrome-linux/chrome', 'chrome-linux64/headless_shell', 'chrome-linux/headless_shell', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium', 'chrome-mac/headless_shell'];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    // prefer the revision this playwright expects, then the most recently installed
    const want = expectedRevision();
    const mtime = (d) => fs.statSync(path.join(root, d)).mtimeMs;
    const dirs = fs.readdirSync(root).filter((d) => /^chromium(_headless_shell)?-\d+/.test(d))
      .sort((a, b) => (b.endsWith('-' + want) - a.endsWith('-' + want)) || (mtime(b) - mtime(a)));
    for (const d of dirs) for (const r of rel) { const p = path.join(root, d, r); if (fs.existsSync(p)) return p; }
  }
  for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'chrome']) {
    const r = spawnSync('which', [name], { encoding: 'utf8' });
    if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  }
  return null;
}

async function launchBrowser() {
  const { chromium } = await loadPlaywright();
  const launch = (opts) => chromium.launch({ headless: true, ...opts });
  if (process.env.PL_CHROME) return launch({ executablePath: process.env.PL_CHROME });
  try { return await launch({}); } catch (e) {
    const found = findChromium();
    if (found) { console.error(`bundled chromium unavailable; using ${found}`); return launch({ executablePath: found }); }
    if (!process.env.PL_NO_INSTALL && sh('npx', ['playwright', 'install', 'chromium'], CACHE)) return launch({});
    die(`no Chromium found. Run:\n  cd "${CACHE}" && npx playwright install chromium\nor set PL_CHROME=/path/to/chrome\n(${String(e.message).split('\n')[0]})`);
  }
}

/** One server + browser + harness page. `errors` collects console/page/network errors. */
async function openSession({ scale = 2, viewport = { width: 1400, height: 1000 } } = {}) {
  const { srv, port } = await serve();
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error' || msg.type() === 'warning') errors.push(`console.${msg.type()}: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('requestfailed', (req) => errors.push(`requestfailed: ${req.url()} ${req.failure()?.errorText}`));
  page.on('response', (res) => { if (res.status() >= 400) errors.push(`http ${res.status()}: ${res.url()}`); });
  const base = `http://127.0.0.1:${port}`;
  await page.goto(`${base}/tools/harness.html`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.plReady === true);
  const renderSpec = async (spec, opts = {}) => page.evaluate(([s, o]) => window.plRender(s, o), [spec, opts]);
  const shot = (file) => page.locator('#stage').screenshot({ path: file, scale: 'device' });
  const close = async () => { await browser.close(); srv.close(); };
  return { page, base, errors, renderSpec, shot, close };
}

// ---------------------------------------------------------------- commands

async function cmdRender(args, session) {
  const spec = await specFromArgs(args);
  const out = args.flags.out || path.join(ROOT, 'out');
  const name = args.flags.name || baseName(spec);
  fs.mkdirSync(out, { recursive: true });
  const own = !session; session ??= await openSession({ scale: args.flags.scale ?? 2 });
  const r = await session.renderSpec(spec, { bg: args.flags.bg, pad: args.flags.pad });
  await session.page.evaluate(() => window.plFinish());
  const svgFile = path.join(out, `${name}.svg`), pngFile = path.join(out, `${name}.png`);
  fs.writeFileSync(svgFile, r.svg);
  await session.shot(pngFile);
  if (args.flags['save-spec'] !== false) fs.writeFileSync(path.join(out, `${name}.json`), JSON.stringify(spec, null, 2));
  console.log(`${rel(svgFile)}\n${rel(pngFile)}\n${describe(spec)} · seed ${spec.seed} · ${r.elements} ornament elements`);
  if (own) { report(session.errors); await session.close(); }
  return { spec, files: [svgFile, pngFile] };
}

async function cmdFrames(args) {
  const fps = args.flags.fps ?? 10, secs = args.flags.duration ?? 2.8;   // capture seconds, not choreography ms
  delete args.flags.duration;
  if (args.flags.choreo) args.flags.duration = args.flags.choreo;
  const spec = await specFromArgs(args);
  if (spec.animate === false || spec.animate === 'none') spec.animate = 'auto';
  const n = Math.max(1, Math.round(fps * secs));
  const out = args.flags.out || path.join(ROOT, 'out', `${baseName(spec)}-frames`);
  fs.mkdirSync(out, { recursive: true });
  const session = await openSession({ scale: args.flags.scale ?? 2 });
  await session.renderSpec(spec, { bg: args.flags.bg, pad: args.flags.pad });
  for (let i = 0; i < n; i++) {
    await session.page.evaluate((ms) => window.plSeek(ms), (i / fps) * 1000);
    await session.shot(path.join(out, `frame-${String(i).padStart(3, '0')}.png`));
  }
  console.log(`${n} frames (${fps} fps, ${secs}s, choreography ${spec.duration}ms) → ${rel(out)}/frame-###.png`);
  report(session.errors);
  await session.close();
  const ff = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' }).status === 0;
  for (const kind of ['mp4', 'gif']) {
    if (!args.flags[kind]) continue;
    const file = typeof args.flags[kind] === 'string' ? args.flags[kind] : path.join(path.dirname(out), `${path.basename(out)}.${kind}`);
    if (!ff) { console.error(`ffmpeg not found; to build ${kind}: ffmpeg -framerate ${fps} -i ${out}/frame-%03d.png ${file}`); continue; }
    const vf = kind === 'gif' ? ['-vf', 'split[a][b];[a]palettegen[p];[b][p]paletteuse'] : ['-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-pix_fmt', 'yuv420p'];
    const ok = sh('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(out, 'frame-%03d.png'), ...vf, file]);
    console.log(ok ? rel(file) : `ffmpeg failed for ${kind}`);
  }
}

function collectPngs(pattern) {
  const pats = list(pattern);
  const files = [];
  for (const p of pats) {
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) { files.push(...fs.readdirSync(p).filter((f) => f.endsWith('.png')).sort().map((f) => path.join(p, f))); continue; }
    const dir = path.dirname(p), re = new RegExp('^' + path.basename(p).replace(/[.+^${}()|\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
    if (fs.existsSync(dir)) files.push(...fs.readdirSync(dir).filter((f) => re.test(f)).sort().map((f) => path.join(dir, f)));
  }
  return files;
}

async function buildSheet(session, tiles, out, flags) {
  const cols = flags.cols ?? Math.min(tiles.length, Math.max(4, Math.ceil(Math.sqrt(tiles.length))));
  const data = await session.page.evaluate(([t, o]) => window.plSheet(t, o), [tiles.map((t) => ({ label: t.label, src: 'data:image/png;base64,' + fs.readFileSync(t.file).toString('base64') })), { cols, tile: flags.tile ?? 200, labels: flags.labels !== false, bg: flags.bg }]);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(data.split(',')[1], 'base64'));
  console.log(`${tiles.length} tiles, ${cols} columns → ${rel(out)}`);
}

async function cmdSheet(args) {
  const files = collectPngs(args._[0] || args.flags.in || path.join(ROOT, 'out'));
  if (!files.length) die('no PNG files matched');
  const out = args.flags.out || path.join(ROOT, 'out', 'sheet.png');
  const session = await openSession({ scale: 1 });
  await buildSheet(session, files.map((f) => ({ file: f, label: path.basename(f, '.png') })), out, args.flags);
  await session.close();
}

async function cmdGallery(args) {
  const designs = readLibrary();
  if (!designs.length) die('library is empty; run seed-library or save first');
  const out = args.flags.out || path.join(ROOT, 'out', 'gallery.png');
  const tmp = path.join(CACHE, 'gallery');
  fs.mkdirSync(tmp, { recursive: true });
  const session = await openSession({ scale: 1 });
  const tiles = [];
  for (const d of designs) {
    await session.renderSpec({ ...d.spec, letter: d.letter, size: args.flags.size ?? 200, animate: false });
    const file = path.join(tmp, `${d.id}.png`);
    await session.shot(file);
    tiles.push({ file, label: `${d.id} · ${d.letter} · ${d.spec.seed}` });
  }
  await buildSheet(session, tiles, out, { tile: args.flags.size ?? 200, ...args.flags });
  report(session.errors);
  await session.close();
}

// ---------------------------------------------------------------- library

function readLibrary() {
  if (!fs.existsSync(DESIGNS)) return [];
  return fs.readdirSync(DESIGNS).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(fs.readFileSync(path.join(DESIGNS, f), 'utf8')));
}
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'design';

/** Canonical axes used for dedupe: everything that changes the picture except size/duration. */
function axesOf(spec) { const a = { ...spec }; delete a.size; delete a.duration; delete a.recipe; return a; }
function flatten(v, prefix = '', out = []) {
  if (v && typeof v === 'object') { for (const k of Object.keys(v).sort()) flatten(v[k], prefix ? `${prefix}.${k}` : k, out); }
  else out.push(`${prefix}=${JSON.stringify(v)}`);
  return out;
}
function similarity(a, b) {
  const A = new Set(flatten(axesOf(a))), B = new Set(flatten(axesOf(b)));
  let inter = 0; for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}
function findDuplicates(spec, designs) {
  const exact = [], near = [];
  const key = JSON.stringify(flatten(axesOf(spec)));
  for (const d of designs) {
    if (d.letter !== spec.letter) continue;
    if (JSON.stringify(flatten(axesOf(d.spec))) === key) { exact.push(d); continue; }
    const same = (k) => JSON.stringify(spec[k]) === JSON.stringify(d.spec[k]);
    if (ornNames(spec).join() === ornNames(d.spec).join() && spec.frame.shape === d.spec.frame.shape && spec.frame.style === d.spec.frame.style && same('palette') && same('style')) near.push({ design: d, score: similarity(spec, d.spec) });
  }
  near.sort((x, y) => y.score - x.score);
  return { exact, near };
}

async function saveDesign(spec, { id, name, tags, notes, force }, session, designs) {
  const { exact, near } = findDuplicates(spec, designs);
  if (exact.length && !force) { console.error(`✗ exact duplicate of "${exact[0].id}" (same letter, axes and seed); not saved. Use --force to save anyway.`); return null; }
  if (near.length && !force) {
    console.error(`✗ near-duplicate: same letter/ornament/frame/palette/style as ${near.map((n) => `"${n.design.id}" (similarity ${(n.score * 100).toFixed(0)}%)`).join(', ')}; not saved. Change an axis or pass --force.`);
    return null;
  }
  if (near.length) console.error(`⚠ saving despite near-duplicate ${near.map((n) => `"${n.design.id}" (${(n.score * 100).toFixed(0)}%)`).join(', ')}`);
  id = slug(id || name || baseName(spec));
  let unique = id; for (let k = 2; designs.some((d) => d.id === unique); k++) unique = `${id}-${k}`;
  id = unique;
  const design = { id, name: name || id, letter: spec.letter, spec, tags: [...new Set([...list(tags), ...ornNames(spec), spec.style, spec.palette, spec.frame.shape])], created: new Date().toISOString(), notes: notes || '' };
  fs.mkdirSync(DESIGNS, { recursive: true }); fs.mkdirSync(THUMBS, { recursive: true });
  await session.renderSpec({ ...spec, animate: false, size: 240 }, { pad: 8 });
  await session.shot(path.join(THUMBS, `${id}.png`));
  fs.writeFileSync(path.join(DESIGNS, `${id}.json`), JSON.stringify(design, null, 2));
  designs.push(design);
  console.log(`saved ${id} · ${spec.letter} · ${describe(spec)} · seed ${spec.seed} → library/designs/${id}.json + thumbs/${id}.png`);
  return design;
}

async function cmdSave(args) {
  const spec = await specFromArgs(args);
  const designs = readLibrary();
  const session = await openSession({ scale: 1 });
  const d = await saveDesign(spec, { id: args.flags.id, name: args.flags.name, tags: args.flags.tags, notes: args.flags.notes, force: !!args.flags.force }, session, designs);
  report(session.errors);
  await session.close();
  if (!d) process.exit(1);
}

async function cmdSeedLibrary(args) {
  const m = await loadEngine();
  const names = [...m.VIDEO_RECIPES, ...m.EXTRA_RECIPES];
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const designs = readLibrary();
  const session = await openSession({ scale: 1 });
  let k = 0, n = 0;
  for (const recipe of names) {
    const letter = recipe === 'hero' ? 'C' : letters[(k * 7 + 2) % 26];
    const seed = (args.flags.seed ?? 4242) + k * 7;
    k++;
    if (designs.some((d) => d.id === slug(recipe)) && !args.flags.force) { console.log(`skip ${recipe} (exists)`); continue; }
    const spec = await resolveSpec({ recipe, letter, seed, size: 160 });
    const d = await saveDesign(spec, { id: recipe, name: m.RECIPES[recipe].title, tags: ['recipe', recipe], notes: `seeded from recipe "${recipe}"`, force: true }, session, designs.filter((d) => d.id !== recipe));
    if (d) n++;
  }
  report(session.errors);
  await session.close();
  console.log(`${n} designs seeded, library has ${readLibrary().length}`);
}

function printDesigns(ds) {
  if (!ds.length) { console.log('(none)'); return; }
  for (const d of ds) console.log(`${d.id.padEnd(22)} ${d.letter.padEnd(2)} seed ${String(d.spec.seed).padEnd(7)} ${describe(d.spec).padEnd(70)} [${d.tags.join(', ')}]`);
}
function cmdList() { printDesigns(readLibrary()); }

function cmdFind(args) {
  const terms = args._.map((t) => t.toLowerCase());
  const f = args.flags;
  const hits = readLibrary().filter((d) => {
    const hay = [d.id, d.name, d.letter, ...d.tags, ...flatten(d.spec).map((s) => s.toLowerCase())].join(' ').toLowerCase();
    if (f.letter && d.letter.toLowerCase() !== String(f.letter).toLowerCase()) return false;
    for (const k of ['style', 'fill', 'outline', 'palette', 'animate']) if (f[k] && String(d.spec[k]) !== String(f[k])) return false;
    if (f.frame && d.spec.frame.shape !== f.frame) return false;
    if (f.ornament && !ornNames(d.spec).includes(f.ornament)) return false;
    if (f.tag && !list(f.tag).every((t) => d.tags.includes(t))) return false;
    return terms.every((t) => t.length === 1 ? d.letter.toLowerCase() === t : hay.includes(t));
  });
  printDesigns(hits);
  if (!hits.length) process.exitCode = 1;
}

// ---------------------------------------------------------------- verify

async function cmdVerify(args) {
  const problems = [];
  const session = await openSession({ scale: 1 });
  const audit = async (label) => {
    const [r] = await session.page.evaluate(() => window.plAudit());
    const bad = r.inGlyph || r.outside || r.inLetter > r.samples * 0.002;
    console.log(`  ${bad ? '✗' : '✓'} ${label.padEnd(30)} ${String(r.elements).padStart(5)} el ${String(r.samples).padStart(6)} pts  glyph:${r.inGlyph} gap:${r.inLetter} outside:${r.outside}`);
    if (bad) { problems.push(`${label}: ${r.inGlyph} in glyph, ${r.inLetter} in gap band, ${r.outside} outside frame`); for (const w of r.worst) console.log(`        ${w.bad} bad · ${w.desc}`); }
  };
  const wholeLibrary = args.flags.library || (!args._[0] && !args.flags.spec && !args.flags.letter && !args.flags.recipe);
  if (wholeLibrary && !args.flags.demo || args.flags.library) {
    const designs = readLibrary();
    console.log(`library: ${designs.length} designs`);
    for (const d of designs) { await session.renderSpec({ ...d.spec, letter: d.letter, animate: false }); await audit(`${d.id}/${d.letter}/${d.spec.seed}`); }
  }
  if (!wholeLibrary) {
    const spec = await specFromArgs(args);
    await session.renderSpec({ ...spec, animate: false });
    await audit(`${baseName(spec)}`);
  }
  if (args.flags.demo) {
    const seed = args.flags.seed ?? 4242;
    console.log(`demo.html (seed ${seed})`);
    await session.page.goto(`${session.base}/demo.html?seed=${seed}`, { waitUntil: 'load' });
    await session.page.waitForSelector('.dropcap svg.pl-svg');
    await session.page.waitForTimeout(500);
    const all = await session.page.evaluate(() => window.plAudit ? window.plAudit() : null);
    if (!all) {
      // the demo page has no harness; inject the audit from the harness source
      const src = fs.readFileSync(path.join(TOOLS, 'harness.html'), 'utf8').match(/window\.plAudit = (\(\) => \{[\s\S]*?\n  \});/)[1];
      const res = await session.page.evaluate(`(${src})()`);
      const labels = await session.page.evaluate(() => [...document.querySelectorAll('svg.pl-svg')].map((s) => `${s.options?.recipe || s.options?.ornament?.name || JSON.stringify(s.options?.ornament) || '?'}/${s.options?.text}/${s.seed}`));
      res.forEach((r, i) => {
        const bad = r.inGlyph || r.outside || r.inLetter > r.samples * 0.002;
        console.log(`  ${bad ? '✗' : '✓'} ${(labels[i] || '?').padEnd(30)} ${String(r.elements).padStart(5)} el ${String(r.samples).padStart(6)} pts  glyph:${r.inGlyph} gap:${r.inLetter} outside:${r.outside}`);
        if (bad) problems.push(`${labels[i]}: ${r.inGlyph} in glyph, ${r.inLetter} in gap band, ${r.outside} outside frame`);
      });
    }
  }
  for (const e of session.errors) { problems.push(e); console.error('  ✗ ' + e); }
  await session.close();
  console.log(problems.length ? `${problems.length} problem(s)` : 'clean');
  process.exit(problems.length ? 1 : 0);
}

// ---------------------------------------------------------------- main

const rel = (p) => path.relative(process.cwd(), p) || '.';
function report(errors) { for (const e of errors) console.error('  ✗ ' + e); }
function die(msg) { console.error(msg); process.exit(2); }

const HELP = `usage: node tools/pl.mjs <command> [spec.json | library-id] [--flags]

  render        one design -> SVG + final-state PNG (+ resolved .json) into --out (default out/)
  frames        animation as PNG frames: --fps 10 --duration 2.8 [--mp4] [--gif] (ffmpeg)
  sheet <dir|glob>  labelled contact sheet of PNGs: --out out/sheet.png --tile 200 --cols N
  gallery       every library design in one contact sheet: --out out/gallery.png --size 200
  save          add a design to library/ (dedupe: exact and near-duplicates are blocked; --force overrides) --name --tags --notes --id
  list          all library designs
  find <terms>  search letter/tags/axis values; filters --letter --style --fill --outline --frame --ornament --palette --tag
  seed-library  save every named recipe (+hero) with thumbnails
  verify        geometry audit + console errors for a design, the whole library (default), or --demo

design input: a JSON file, a library id, or flags --letter A --recipe hero --style --fill --outline --frame --ornament
  --palette --texture --animate --seed --size --duration --fillOptions '{json}' --outlineOptions '{json}'
env: PL_CHROME=/path/to/chrome · PLAYWRIGHT_BROWSERS_PATH · PL_NO_INSTALL=1`;

const COMMANDS = { render: cmdRender, frames: cmdFrames, sheet: cmdSheet, gallery: cmdGallery, save: cmdSave, list: cmdList, find: cmdFind, 'seed-library': cmdSeedLibrary, verify: cmdVerify };
const [cmd, ...rest] = process.argv.slice(2);
if (!cmd || cmd === '--help' || cmd === '-h' || !COMMANDS[cmd]) { console.log(HELP); process.exit(cmd && COMMANDS[cmd] === undefined && cmd !== '--help' && cmd !== '-h' ? 2 : 0); }
Promise.resolve().then(() => COMMANDS[cmd](parseArgs(rest))).catch((e) => { console.error(e); process.exit(2); });
