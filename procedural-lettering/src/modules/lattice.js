// Lattice utilities shared by maze, knotwork, circuit and tiling modules:
// coarse cells of `m` fine cells, free only when the whole block is free.

export function latticeOf(field, m, margin = 0) {
  const lc = Math.floor(field.cols / m), lr = Math.floor(field.rows / m);
  const ox = (field.cols - lc * m) / 2, oy = (field.rows - lr * m) / 2;
  const free = new Uint8Array(lc * lr);
  for (let j = 0; j < lr; j++) for (let i = 0; i < lc; i++) {
    let ok = true;
    for (let y = -margin; y < m + margin && ok; y++) for (let x = -margin; x < m + margin; x++) {
      if (!field.isFree(Math.floor(ox + i * m + x), Math.floor(oy + j * m + y))) { ok = false; break; }
    }
    free[j * lc + i] = ok ? 1 : 0;
  }
  return {
    m, lc, lr, ox, oy, free,
    isFree: (i, j) => i >= 0 && j >= 0 && i < lc && j < lr && free[j * lc + i] === 1,
    centre: (i, j) => ({ x: (ox + (i + 0.5) * m) * field.cell, y: (oy + (j + 0.5) * m) * field.cell }),
    corner: (i, j) => ({ x: (ox + i * m) * field.cell, y: (oy + j * m) * field.cell }),
    mark: (i, j) => { for (let y = 0; y < m; y++) for (let x = 0; x < m; x++) { const fi = Math.floor(ox + i * m + x), fj = Math.floor(oy + j * m + y); if (field.inBounds(fi, fj)) field.occ[field.idx(fi, fj)] = 1; } },
  };
}
