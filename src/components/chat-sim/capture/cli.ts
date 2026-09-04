// capture/cli.ts — the real logic behind `scripts/capture-chat.mjs`. That file is a thin,
// dependency-free bootstrap (plain .mjs, no build step, per file-ownership-matrix.md's literal
// `scripts/capture-chat.mjs` cell); this is where argument parsing and orchestration actually
// live, run via `tsx` (already a devDependency — see repo's own `gen:agents`/`verify:agents`
// scripts for the identical pattern) so it can import typed core/** and capture/** modules
// directly, no separate compile step.

import { readFileSync } from 'node:fs';
import { compile, type ChannelId, type SimScript, type Tick } from '../index';
import { captureFrame } from './captureFrame';

interface Args {
  script: string;
  seed: number;
  channel: ChannelId;
  locale: string;
  tz: string;
  t0: Tick;
  t?: Tick;
  width: number;
  dpr: number;
  out: string;
  contactName?: string;
  contactStatus?: string;
}

function parseArgs(argv: readonly string[]): Args {
  const flags = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    if (!key?.startsWith('--')) throw new Error(`capture-chat: unexpected argument "${key}"`);
    const value = argv[i + 1];
    if (value === undefined) throw new Error(`capture-chat: --${key.slice(2)} needs a value`);
    flags.set(key.slice(2), value);
  }

  const script = flags.get('script');
  const out = flags.get('out');
  if (!script) throw new Error('capture-chat: --script <path-to-json> is required');
  if (!out) throw new Error('capture-chat: --out <path.png> is required');

  return {
    script,
    seed: Number(flags.get('seed') ?? '1'),
    channel: (flags.get('channel') as ChannelId) ?? 'whatsapp',
    locale: flags.get('locale') ?? 'es-PE',
    tz: flags.get('tz') ?? 'America/Lima',
    t0: Number(flags.get('t0') ?? Date.UTC(2026, 0, 1, 9, 0, 0)),
    t: flags.has('t') ? Number(flags.get('t')) : undefined,
    width: Number(flags.get('width') ?? '380'),
    dpr: Number(flags.get('dpr') ?? '2'),
    out,
    contactName: flags.get('contact-name'),
    contactStatus: flags.get('contact-status'),
  };
}

async function main(argv: readonly string[]): Promise<void> {
  const args = parseArgs(argv);
  const scriptData = JSON.parse(readFileSync(args.script, 'utf8')) as SimScript;

  const tl = compile(scriptData, {
    seed: args.seed,
    channel: args.channel,
    locale: args.locale,
    tz: args.tz,
    t0: args.t0,
  });

  const t = args.t ?? tl.duration;

  const outPath = await captureFrame(tl, t, {
    script: scriptData,
    seed: args.seed,
    channel: args.channel,
    locale: args.locale,
    tz: args.tz,
    t0: args.t0,
    contactName: args.contactName,
    contactStatus: args.contactStatus,
    width: args.width,
    dpr: args.dpr,
    out: args.out,
  });

  process.stdout.write(`${outPath}\n`);
}

main(process.argv.slice(2)).catch((err: unknown) => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exitCode = 1;
});
