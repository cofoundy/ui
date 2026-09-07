// T-007 follow-up (team-lead, post-review): a real circular import — `chat-sim/index.ts ->
// react/index.ts -> react/ChatSim.tsx -> react/MessageThread.tsx -> react/engine.ts ->
// ../index` — was LATENT until [core] exported `ChatSim` through the subpath barrel; `madge`
// couldn't see it before that, because nothing importing the barrel back existed yet. Fixed by
// importing leaf modules directly (`../core/seek`, `../core/draft-intervals`) instead of the
// barrel — same rule `adapters/caps.ts` vs `registry.ts` already encodes: a leaf module imports
// leaves, never the barrel.
//
// "A cycle that only appears once someone exports something new is exactly the class of thing to
// instrument, not remember" (team-lead) — so this is `npx madge --circular` reimplemented as a
// static-scan vitest test, same convention no-tailwind.test.ts / core/purity.test.ts already use
// for "no CI/lint infra exists here": no new devDependency, no package.json touch (that field is
// [core]'s write cell), runs in the same `npm test` everything else does.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const CHAT_SIM_DIR = resolve(__dirname, '..', '..'); // src/components/chat-sim

const IMPORT_RE = /\bimport(?:\s+type)?\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g;
const EXPORT_FROM_RE = /\bexport(?:\s+type)?\s+(?:\*|\{[^}]*\})\s+from\s+['"]([^'"]+)['"]/g;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '__tests__') continue;
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith('.d.ts')) out.push(p);
  }
  return out;
}

/** Resolves a relative import specifier to one of this package's own source files, trying the
 * same extension/index candidates a bundler would. Returns null for anything that doesn't
 * resolve to a real file here (a bare package specifier, or a non-.ts/.tsx asset). */
function resolveSpecifier(fromFile: string, specifier: string, allFiles: ReadonlySet<string>): string | null {
  if (!specifier.startsWith('.')) return null; // bare specifier (react, node:fs, ...) — not internal
  const base = resolve(dirname(fromFile), specifier);
  const candidates = [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), join(base, 'index.tsx')];
  return candidates.find((c) => allFiles.has(c)) ?? null;
}

function buildGraph(files: readonly string[]): Map<string, string[]> {
  const fileSet = new Set(files);
  const graph = new Map<string, string[]>();
  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    const deps = new Set<string>();
    for (const re of [IMPORT_RE, EXPORT_FROM_RE]) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(src))) {
        const resolved = resolveSpecifier(file, m[1], fileSet);
        if (resolved && resolved !== file) deps.add(resolved);
      }
    }
    graph.set(file, [...deps]);
  }
  return graph;
}

/** DFS cycle detection with a recursion stack — returns the first cycle found, as a list of
 * paths from the offending back-edge, or null if the graph is acyclic. */
function findCycle(graph: ReadonlyMap<string, string[]>): string[] | null {
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();
  const stack: string[] = [];

  function visit(node: string): string[] | null {
    color.set(node, GRAY);
    stack.push(node);
    for (const dep of graph.get(node) ?? []) {
      const c = color.get(dep) ?? WHITE;
      if (c === GRAY) {
        const cycleStart = stack.indexOf(dep);
        return [...stack.slice(cycleStart), dep];
      }
      if (c === WHITE) {
        const found = visit(dep);
        if (found) return found;
      }
    }
    stack.pop();
    color.set(node, BLACK);
    return null;
  }

  for (const node of graph.keys()) {
    if ((color.get(node) ?? WHITE) === WHITE) {
      const found = visit(node);
      if (found) return found;
    }
  }
  return null;
}

describe('chat-sim has no circular internal imports (T-007 follow-up, team-lead)', () => {
  it('src/components/chat-sim/**/*.{ts,tsx} — zero cycles', () => {
    const files = walk(CHAT_SIM_DIR);
    const graph = buildGraph(files);
    const cycle = findCycle(graph);
    const readable = cycle?.map((f) => relative(CHAT_SIM_DIR, f)).join(' -> ');
    expect(readable, `circular import found: ${readable}`).toBeUndefined();
  });

  it('positive twin — the detector actually catches a real cycle (in-memory graph, no real files touched)', () => {
    const graph = new Map<string, string[]>([
      ['/a.ts', ['/b.ts']],
      ['/b.ts', ['/c.ts']],
      ['/c.ts', ['/a.ts']], // closes the loop
    ]);
    const cycle = findCycle(graph);
    expect(cycle).not.toBeNull();
    expect(cycle).toEqual(expect.arrayContaining(['/a.ts', '/b.ts', '/c.ts']));
  });

  it('twin — an acyclic graph reports no cycle', () => {
    const graph = new Map<string, string[]>([
      ['/a.ts', ['/b.ts']],
      ['/b.ts', ['/c.ts']],
      ['/c.ts', []],
    ]);
    expect(findCycle(graph)).toBeNull();
  });
});
