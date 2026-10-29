// procedural-lettering — dependency-free generative ornamental lettering.
// This is the entry module; the engine lives in ./src (see src/index.js).
//
//   import { createDropCap, createHeadline, mulberry32 } from './lettering.js';
//   const svg = createDropCap({ letter: 'A', style: 'blackletter', ornament: 'vines', seed: 7 });
//
// See SKILL.md for the workflow, styles.md for the named recipes.
export * from './src/index.js';
