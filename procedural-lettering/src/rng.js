// Seeded RNG and small random helpers. Everything in the library draws from
// one of these so that (seed, options) -> identical output.

export function mulberry32(seed) {
  let a = (seed >>> 0) || 0x9e3779b9;
  return function rng() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Deterministic 32-bit hash of a string (for seeding from text, style names...).
export function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export function seedFrom(seed, ...extra) {
  const base = typeof seed === 'string' ? hashString(seed) : (seed >>> 0);
  let h = base;
  for (const e of extra) h = (Math.imul(h ^ hashString(String(e)), 0x45d9f3b) ^ (h >>> 13)) >>> 0;
  return h >>> 0;
}

export function makeRandom(rng) {
  const r = rng;
  return {
    next: r,
    range: (a, b) => a + (b - a) * r(),
    int: (a, b) => a + Math.floor(r() * (b - a + 1)),
    pick: (arr) => arr[Math.floor(r() * arr.length)],
    chance: (p) => r() < p,
    sign: () => (r() < 0.5 ? -1 : 1),
    gauss: () => {
      // Box–Muller, clamped to +-3
      const u = Math.max(1e-9, r()), v = r();
      return Math.max(-3, Math.min(3, Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)));
    },
    shuffle: (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
  };
}
