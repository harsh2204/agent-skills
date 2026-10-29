import { vines } from './vines.js';
import { porcelain } from './porcelain.js';
import { contour } from './contour.js';
import { hatch } from './hatch.js';
import { interlace } from './interlace.js';
import { mosaic, voronoiGlass } from './mosaic.js';
import { halftone, stipple, tiling, florets } from './dots.js';
import { knotwork } from './knotwork.js';
import { nouveau } from './nouveau.js';
import { circuit } from './circuit.js';
import { colonization } from './colonization.js';

export const MODULES = {
  vines, porcelain, contour, hatch, interlace, mosaic, voronoi: voronoiGlass, halftone, stipple, tiling, florets,
  knotwork, nouveau, circuit, colonization,
};
export function registerModule(mod) { MODULES[mod.name] = mod; }
