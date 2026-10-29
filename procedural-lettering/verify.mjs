#!/usr/bin/env node
// Verification: serves this directory, loads demo.html in headless Chromium,
// fails on console errors / failed requests, checks that ornament geometry
// stays out of the letter mask and inside the frame, and writes screenshots
// to screenshots/.  Usage: node verify.mjs [--seed N] [--keep]

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '/workspace/pw/node_modules/playwright/index.mjs';

const EXECUTABLE = '/home/box/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, 'screenshots');
const SEED = process.argv.includes('--seed') ? process.argv[process.argv.indexOf('--seed') + 1] : '4242';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.md': 'text/markdown' };

function serve() {
  const srv = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(DIR, url === '/' ? 'demo.html' : url);
    if (!file.startsWith(DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok({ srv, port: srv.address().port })));
}

const problems = [];
const note = (s) => { problems.push(s); console.error('  ✗ ' + s); };

// Runs inside the page: samples every ornament element and tests the samples
// against the raster field the SVG was generated from.
function auditInPage() {
  const out = [];
  for (const svg of document.querySelectorAll('svg.pl-svg')) {
    const f = svg.field;
    if (!f) continue;
    const label = svg.options?.recipe || svg.options?.ornament?.name || JSON.stringify(svg.options?.ornament) || '?';
    const res = { label: `${label}/${svg.options?.text}/${svg.seed}`, samples: 0, inLetter: 0, inGlyph: 0, outside: 0, elements: 0, worst: [] };
    let cur = null;
    // a sample is judged by the worst-case-free cell within EPS cells of it, so
    // the 2-decimal rounding of path data cannot push a point across a cell edge
    const EPS = 0.05;
    const test = (x, y) => {
      res.samples++;
      let outside = 1, letter = 1, inner = 1;
      for (const dx of [-EPS, EPS]) for (const dy of [-EPS, EPS]) {
        const i = Math.floor(x / f.cell + dx), j = Math.floor(y / f.cell + dy);
        if (i < 0 || j < 0 || i >= f.cols || j >= f.rows) continue;
        const k = j * f.cols + i;
        outside &= f.outside[k]; letter &= f.letter[k]; inner &= f.inner[k];
      }
      if (outside) res.outside++;
      if (letter) res.inLetter++;
      if (inner) res.inGlyph++;
      if (outside || letter || inner) cur.bad++;
    };
    for (const e of svg.querySelectorAll('.pl-ornament path, .pl-ornament circle, .pl-ornament polygon, .pl-ornament line')) {
      res.elements++;
      if (typeof e.getTotalLength !== 'function') continue;
      let L = 0;
      try { L = e.getTotalLength(); } catch { continue; }
      cur = { bad: 0, desc: `${e.tagName} ${(e.getAttribute('d') || `r=${e.getAttribute('r')} @${e.getAttribute('cx')},${e.getAttribute('cy')}`).slice(0, 48)}` };
      if (!isFinite(L) || L <= 0) { if (e.tagName === 'circle') test(+e.getAttribute('cx'), +e.getAttribute('cy')); }
      else {
        const n = Math.max(2, Math.min(400, Math.ceil(L / 1.5)));
        for (let s = 0; s <= n; s++) { const p = e.getPointAtLength((L * s) / n); test(p.x, p.y); }
      }
      if (cur.bad) { res.worst.push(cur); res.worst.sort((a, b) => b.bad - a.bad); res.worst.length = Math.min(res.worst.length, 3); }
    }
    out.push(res);
  }
  return out;
}

// Builds a labelled grid of every recipe (plus the headline) for a close-up.
async function buildGridInPage(seed) {
  const m = await import('/lettering.js');
  const names = [...m.VIDEO_RECIPES, ...m.EXTRA_RECIPES];
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const grid = document.createElement('div');
  grid.id = 'verify-grid';
  grid.style.cssText = 'position:fixed;inset:0;z-index:99;overflow:auto;background:#F4F0E6;padding:16px;display:grid;grid-template-columns:repeat(6,200px);gap:14px 16px;justify-content:start;align-content:start;font:12px/1.3 system-ui';
  let k = 0;
  for (const name of names) {
    const r = m.RECIPES[name];
    const fig = document.createElement('figure');
    fig.style.cssText = `margin:0;padding:8px;background:${m.PAGE_THEMES[r.theme]?.page || '#fff'};color:${m.PAGE_THEMES[r.theme]?.text || '#000'}`;
    const svg = m.createDropCap({ letter: letters[(k * 7 + 2) % 26], recipe: name, seed: +seed + k * 7, size: 184, animate: false });
    svg.dataset.recipe = name;
    const cap = document.createElement('figcaption');
    cap.textContent = name;
    cap.style.cssText = 'margin-top:4px;opacity:.7';
    fig.append(svg, cap);
    grid.appendChild(fig);
    k++;
  }
  document.body.appendChild(grid);
  return names.length;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const { srv, port } = await serve();
  const base = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ executablePath: EXECUTABLE, headless: true });
  const consoleErrors = [];
  const newPage = async (dpr) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: dpr });
    const page = await ctx.newPage();
    page.on('console', (msg) => { if (msg.type() === 'error' || msg.type() === 'warning') { const l = msg.location(); consoleErrors.push(`console.${msg.type()}: ${msg.text()} (${l?.url || ''}:${l?.lineNumber ?? ''})`); } });
    page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));
    page.on('requestfailed', (req) => consoleErrors.push(`requestfailed: ${req.url()} ${req.failure()?.errorText}`));
    page.on('response', (res) => { if (res.status() >= 400) consoleErrors.push(`http ${res.status()}: ${res.url()}`); });
    return { ctx, page };
  };

  // ---- 1. demo at 2x: mid-animation and final hero close-ups
  console.log('demo.html (seed ' + SEED + ')');
  const t0 = Date.now();
  {
    const { ctx, page } = await newPage(4);
    await page.goto(`${base}/demo.html?seed=${SEED}`, { waitUntil: 'load' });
    await page.waitForSelector('.dropcap svg.pl-svg');
    const hero = page.locator('.chapter').first().locator('.dropcap');
    // restart the hero's choreography and capture it 1.2 s in
    await page.evaluate(() => { document.querySelector('.chapter .dropcap svg').replay(); });
    await page.waitForTimeout(1200);
    await hero.screenshot({ path: path.join(OUT, 'hero-mid.png'), scale: 'device' });
    await page.waitForTimeout(3200);
    await hero.screenshot({ path: path.join(OUT, 'hero-final.png'), scale: 'device' });
    // geometry audit on every cap of the demo
    const audit = await page.evaluate(auditInPage);
    report(audit);
    await ctx.close();
  }

  // ---- 2. full gallery at 1x after every animation has finished
  {
    const { ctx, page } = await newPage(1);
    await page.goto(`${base}/demo.html?seed=${SEED}`, { waitUntil: 'load' });
    await page.waitForSelector('.dropcap svg.pl-svg');
    // trigger every in-view replay by scrolling through, then wait out the longest choreography
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
    await page.waitForTimeout(3500);
    await page.screenshot({ path: path.join(OUT, 'gallery-final.png'), fullPage: true });
    await ctx.close();
  }

  // ---- 3. every recipe at 2x in one grid, plus the geometry audit on them
  {
    const { ctx, page } = await newPage(2);
    await page.setViewportSize({ width: 1340, height: 1000 });
    await page.goto(`${base}/demo.html?seed=${SEED}`, { waitUntil: 'load' });
    await page.waitForSelector('.dropcap svg.pl-svg');
    const n = await page.evaluate(buildGridInPage, SEED);
    console.log(`recipe grid: ${n} recipes`);
    await page.waitForTimeout(300);
    const grid = page.locator('#verify-grid');
    const h = await grid.evaluate((g) => g.scrollHeight);
    await page.setViewportSize({ width: 1340, height: h + 8 });
    await grid.screenshot({ path: path.join(OUT, 'recipes-grid.png') });
    const audit = await page.evaluate(() => { document.querySelectorAll('.chapter, .headline').forEach((e) => e.remove()); return undefined; }).then(() => page.evaluate(auditInPage));
    report(audit);
    await ctx.close();
  }

  await browser.close();
  srv.close();
  for (const e of consoleErrors) note(e);
  console.log(`\n${problems.length ? problems.length + ' problem(s)' : 'clean'} · ${((Date.now() - t0) / 1000).toFixed(1)}s · screenshots in ${path.relative(process.cwd(), OUT) || '.'}`);
  process.exit(problems.length ? 1 : 0);
}

function report(audit) {
  let bad = 0;
  for (const r of audit) {
    const flag = r.inGlyph || r.outside || r.inLetter > r.samples * 0.002 ? '✗' : '✓';
    if (flag === '✗') bad++;
    console.log(`  ${flag} ${r.label.padEnd(34)} ${String(r.elements).padStart(5)} el ${String(r.samples).padStart(6)} pts  glyph:${r.inGlyph} gap:${r.inLetter} outside:${r.outside}`);
    if (flag === '✗') {
      problems.push(`${r.label}: ${r.inGlyph} samples in glyph, ${r.inLetter} in gap band, ${r.outside} outside frame`);
      for (const w of r.worst) console.log(`        ${w.bad} bad · ${w.desc}`);
    }
  }
  return bad;
}

main().catch((e) => { console.error(e); process.exit(2); });
