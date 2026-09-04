#!/usr/bin/env node
// scripts/capture-chat.mjs — CLI entry point (api-contract.md § "Árbol": `scripts/capture-chat.mjs
// [capture]`). Deliberately thin: this repo has no native way to run a .ts file directly from
// plain `node`, and capture's scope.write excludes package.json, so it can't add a runtime loader
// dependency. `tsx` is already a devDependency (see `gen:agents`/`verify:agents` in package.json
// for the identical existing pattern) — this just locates it and hands off. All the real logic
// (arg parsing, compile(), captureFrame()) lives in capture/cli.ts, typed and unit-testable.
//
// Usage:
//   node scripts/capture-chat.mjs --script path/to/script.json --seed 7 --channel whatsapp \
//     --locale es-PE --tz America/Lima --t0 1767261600000 --width 380 --dpr 2 --out shot.png
// `--t <tick>` captures an exact instant instead of the script's final state (the default).

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');
const tsxBin = join(repoRoot, 'node_modules', '.bin', 'tsx');
const cliEntry = join(repoRoot, 'src/components/chat-sim/capture/cli.ts');

if (!existsSync(tsxBin)) {
  console.error(
    `capture-chat: tsx not found at ${tsxBin} — run \`npm install\` (tsx is an existing devDependency, not something this script installs).`,
  );
  process.exit(1);
}

try {
  execFileSync(tsxBin, [cliEntry, ...process.argv.slice(2)], { stdio: 'inherit' });
} catch (err) {
  process.exit(typeof err.status === 'number' ? err.status : 1);
}
