#!/usr/bin/env tsx
/**
 * gen-atelier-agents-md.ts
 *
 * Deterministic generator of `packages/ui/AGENTS.md` from the registry
 * SSOT (`src/lib/atelier-registry.ts`). Single-source-of-truth → markdown
 * allowlist consumed by LLMs authoring MDX in docs-ai.
 *
 * Output is byte-deterministic for unchanged registry input (only the ISO
 * timestamp in the top comment varies). CI gate `verify-agents-md.yml`
 * runs `pnpm gen:agents && git diff --exit-code AGENTS.md` to enforce drift.
 *
 * Usage:
 *   pnpm gen:agents          # writes packages/ui/AGENTS.md
 *   tsx scripts/gen-atelier-agents-md.ts --check   # exits 1 if drift
 *
 * Contract: api-contract.md §3.
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

import { ATELIER_COMPONENTS, type AtelierEntry } from '../src/lib/atelier-registry';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '..', 'AGENTS.md');

type JsonSchema = {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema | JsonSchema[];
  enum?: unknown[];
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  description?: string;
  default?: unknown;
  $ref?: string;
  // JSONSchema7 has many more fields — we only consume a subset.
  [k: string]: unknown;
};

function describeType(schema: JsonSchema | undefined): string {
  if (!schema) return 'unknown';
  if (schema.enum && Array.isArray(schema.enum)) {
    return schema.enum.map((v) => JSON.stringify(v)).join(' | ');
  }
  if (schema.anyOf || schema.oneOf) {
    const variants = (schema.anyOf || schema.oneOf || []).map(describeType);
    return variants.join(' | ');
  }
  if (schema.type === 'array') {
    const items = Array.isArray(schema.items) ? schema.items[0] : schema.items;
    return `${describeType(items)}[]`;
  }
  if (schema.type === 'object') return 'object';
  if (Array.isArray(schema.type)) return schema.type.join(' | ');
  if (typeof schema.type === 'string') return schema.type;
  return 'unknown';
}

function escapeCell(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function renderPropsTable(schema: JsonSchema): string {
  const props = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  const rows: string[] = [];

  const keys = Object.keys(props).sort();
  for (const key of keys) {
    const propSchema = props[key];
    const type = describeType(propSchema);
    const req = required.has(key) ? 'yes' : 'no';
    const def =
      propSchema && 'default' in propSchema && propSchema.default !== undefined
        ? '`' + JSON.stringify(propSchema.default) + '`'
        : '—';
    const desc = (propSchema?.description as string | undefined) ?? '';
    rows.push(`| \`${key}\` | \`${escapeCell(type)}\` | ${req} | ${def} | ${escapeCell(desc)} |`);
  }

  if (rows.length === 0) {
    return '_(no documented props)_';
  }

  return [
    '| Name | Type | Required | Default | Description |',
    '|------|------|----------|---------|-------------|',
    ...rows,
  ].join('\n');
}

function renderMdxExample(name: string, example: Record<string, unknown>): string {
  // Inline-prop MDX form; complex values become JSON expressions.
  const props = Object.entries(example).map(([key, value]) => {
    if (typeof value === 'string') {
      return `  ${key}="${value.replace(/"/g, '&quot;')}"`;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return `  ${key}={${JSON.stringify(value)}}`;
    }
    // Object / array — pretty-print, indent for legibility.
    const json = JSON.stringify(value, null, 2)
      .split('\n')
      .map((line, i) => (i === 0 ? line : '  ' + line))
      .join('\n');
    return `  ${key}={${json}}`;
  });
  return ['```mdx', `<${name}`, ...props, '/>', '```'].join('\n');
}

function renderComponentSection(name: string, entry: AtelierEntry): string {
  // Use Zod v4's built-in JSON-schema export. (The legacy `zod-to-json-schema`
  // npm package targets Zod v3 internals and returns `{}` against v4 schemas —
  // verified empirically 2026-05-16.)
  const schema = z.toJSONSchema(entry.schema as z.ZodType) as JsonSchema;

  return [
    `## ${name}`,
    '',
    `**Description:** ${entry.description}`,
    '',
    '**Props (from Zod):**',
    '',
    renderPropsTable(schema),
    '',
    '**Example MDX:**',
    '',
    renderMdxExample(name, entry.example),
    '',
    '---',
    '',
  ].join('\n');
}

export function renderAgentsMarkdown(): string {
  const names = Object.keys(ATELIER_COMPONENTS).sort() as Array<keyof typeof ATELIER_COMPONENTS>;

  // NOTE: header is byte-deterministic by design — no timestamp, no git sha,
  // nothing time-varying. The drift gate (`verify-agents-md.yml`) relies on
  // `git diff --exit-code AGENTS.md` returning empty when the registry is in
  // sync; any varying byte would guarantee a false-positive drift.
  // (Previous v1 had `<!-- Last generated: <ISO> -->` here — removed
  // 2026-05-16 per ceo-agent fix request. `git log` is the provenance source.)
  const header = [
    '# Atelier Components — Agent Allowlist',
    '<!-- AUTO-GENERATED by scripts/gen-atelier-agents-md.ts — DO NOT EDIT -->',
    '<!-- Source: src/lib/atelier-registry.ts -->',
    '',
    'These are the **only** components agents may emit when authoring MDX',
    'in `docs-ai/content/`. Adding a new component requires a registry edit',
    'plus regeneration of this file (`pnpm gen:agents`). The CI gate',
    '`verify-agents-md.yml` fails on drift.',
    '',
    '## Available components',
    '',
    ...names.map((n) => `- \`${n}\` — ${ATELIER_COMPONENTS[n].description}`),
    '',
    '---',
    '',
  ].join('\n');

  const sections = names
    .map((n) => renderComponentSection(n, ATELIER_COMPONENTS[n]))
    .join('');

  return header + sections;
}

/**
 * CLI entry — returns an exit code (0 ok, 1 drift / missing).
 * Decoupled from `process.exit` for testability.
 */
export function runCli(args: string[] = process.argv.slice(2), outputPath = OUTPUT_PATH): number {
  const checkMode = args.includes('--check');
  const content = renderAgentsMarkdown();

  if (checkMode) {
    if (!existsSync(outputPath)) {
      console.error('[gen:agents] AGENTS.md does not exist. Run `npm run gen:agents` and commit.');
      return 1;
    }
    const existing = readFileSync(outputPath, 'utf-8');
    if (existing !== content) {
      console.error('[gen:agents] DRIFT: AGENTS.md is out of date.');
      console.error('Run `npm run gen:agents` and commit updated AGENTS.md.');
      return 1;
    }
    console.log('[gen:agents] AGENTS.md is up to date.');
    return 0;
  }

  writeFileSync(outputPath, content, 'utf-8');
  console.log(
    `[gen:agents] wrote ${outputPath} (${content.length} bytes, ${Object.keys(ATELIER_COMPONENTS).length} components)`,
  );
  return 0;
}

// Only run when executed directly (not when imported by tests).
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  try {
    process.exit(runCli());
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
