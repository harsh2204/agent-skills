#!/usr/bin/env node
// Thin wrapper: the audit now lives in tools/pl.mjs (see tools.md).
//   node verify.mjs            -> audits every library design and the demo page
//   node verify.mjs --seed N   -> demo seed
// Any other flags are passed through to `node tools/pl.mjs verify`.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
if (!args.some((a) => a === '--library' || a === '--demo')) args.push('--library', '--demo');
const r = spawnSync(process.execPath, [path.join(here, 'tools', 'pl.mjs'), 'verify', ...args], { stdio: 'inherit' });
process.exit(r.status ?? 1);
