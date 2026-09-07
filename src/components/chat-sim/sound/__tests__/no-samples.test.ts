// T-006 acceptance #2: "Cero samples de terceros: todo sintetizado." WhatsApp/Telegram's real
// notification audio is copyrighted (architecture-v1.md §7) — unlike the prior art's MIT code.
// Static-scan, same pattern as core/__tests__/purity.test.ts and
// element/__tests__/no-tailwind.test.ts: walk sound/**, fail on any audio-asset import, `fetch`,
// or binary-audio file extension. Positive twin included.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SOUND_DIR = join(__dirname, '..');
const SELF = 'no-samples.test.ts';
const AUDIO_EXT_RE = /\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i;
const BANNED_RE = /\bfetch\s*\(|\brequire\(['"][^'"]+\.(mp3|wav|ogg|m4a|aac|flac)['"]\)|from\s+['"][^'"]+\.(mp3|wav|ogg|m4a|aac|flac)['"]/i;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

describe('sound/** ships zero third-party samples (T-006 #2)', () => {
  it('contains no audio asset files', () => {
    const audioFiles = walk(SOUND_DIR).filter((f) => AUDIO_EXT_RE.test(f));
    expect(audioFiles).toEqual([]);
  });

  it('contains no fetch()/audio-file import in source', () => {
    const violations: string[] = [];
    for (const f of walk(SOUND_DIR)) {
      if (!/\.tsx?$/.test(f) || f.endsWith(SELF)) continue;
      const src = readFileSync(f, 'utf8');
      if (BANNED_RE.test(src)) violations.push(f);
    }
    expect(violations).toEqual([]);
  });

  it('the instrument can go red (positive twin)', () => {
    const fixture = "const clip = require('./notification.mp3');";
    expect(BANNED_RE.test(fixture)).toBe(true);
  });
});
