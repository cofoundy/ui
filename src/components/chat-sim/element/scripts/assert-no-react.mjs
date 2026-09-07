#!/usr/bin/env node
// T-002 acceptance #7 (B-6) — "El bundle construido de element/ contiene cero React: afirmarlo
// sobre el grafo de imports del build (react/react-dom ausentes de las dependencias del
// bundle). Gemelo positivo: la misma sonda contra el bundle de react/ DEBE dar positivo — un
// chequeo que nunca encuentra React no prueba nada."
//
// react/ (T-007, [app]) doesn't exist until wave 4, so the positive twin can't point at it yet
// (the acceptance note says so explicitly). Instead it bundles a throwaway `import 'react'`
// via esbuild's stdin option — nothing touches disk outside this script's own process — and
// asserts THAT build's module graph DOES contain react. Same assertNoReact() function runs
// both builds; only the expectation flips. That's what makes this a twin, not two unrelated
// checks.
//
// Run: node src/components/chat-sim/element/scripts/assert-no-react.mjs

import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../../../..');
const entry = resolve(here, '../index.ts');

function hasReact(metafile) {
  return Object.keys(metafile.inputs).some((f) => /(^|\/)node_modules\/react(-dom)?\//.test(f));
}

async function realElementBundle() {
  const { metafile } = await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    format: 'iife',
    target: 'es2020',
    metafile: true,
    absWorkingDir: repoRoot,
  });
  return metafile;
}

async function reactTwinBundle() {
  const { metafile } = await build({
    stdin: {
      contents: "import React from 'react';\nexport default React;\n",
      loader: 'ts',
      resolveDir: repoRoot,
    },
    bundle: true,
    write: false,
    format: 'iife',
    target: 'es2020',
    metafile: true,
    absWorkingDir: repoRoot,
  });
  return metafile;
}

const [realMeta, twinMeta] = await Promise.all([realElementBundle(), reactTwinBundle()]);

const realHasReact = hasReact(realMeta);
const twinHasReact = hasReact(twinMeta);

let failed = false;

if (realHasReact) {
  console.error('FAIL: element/ bundle contains react/react-dom (acceptance #7 violated).');
  console.error(Object.keys(realMeta.inputs).filter((f) => /react/.test(f)));
  failed = true;
} else {
  console.log('PASS: element/ bundle is React-free (' + Object.keys(realMeta.inputs).length + ' modules).');
}

if (!twinHasReact) {
  console.error('FAIL: positive twin did NOT detect react — the probe cannot go red, it proves nothing.');
  failed = true;
} else {
  console.log('PASS: positive twin correctly detects react when it IS imported (gemelo positivo).');
}

process.exit(failed ? 1 : 0);
