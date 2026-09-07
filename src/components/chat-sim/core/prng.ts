// Positional PRNG (architecture-v1.md §1): rand(seed, stepIdx, slot) = sfc32(hash(seed, stepIdx, slot)).
// The draw for step N does NOT depend on how many draws step N-1 made — compilation is
// reorderable/parallelizable and editing step 3 never shifts the jitter of step 40.
// Pure: only Math.imul (allowed) — never Math.random.

function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function next(): number {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function sfc32(a: number, b: number, c: number, d: number): () => number {
  let sa = a >>> 0;
  let sb = b >>> 0;
  let sc = c >>> 0;
  let sd = d >>> 0;
  return function next(): number {
    let t = (sa + sb) | 0;
    sa = sb ^ (sb >>> 9);
    sb = (sc + (sc << 3)) | 0;
    sc = (sc << 21) | (sc >>> 11);
    sd = (sd + 1) | 0;
    t = (t + sd) | 0;
    sc = (sc + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

/** Deterministic float in [0,1). Same (seed, stepIdx, slot) => same output, always. */
export function rand(seed: number, stepIdx: number, slot: number): number {
  const seedWords = xmur3(`${seed}:${stepIdx}:${slot}`);
  const gen = sfc32(seedWords(), seedWords(), seedWords(), seedWords());
  // sfc32 warm-up (standard practice: first outputs correlate with the seed words)
  gen();
  gen();
  gen();
  return gen();
}
