// sound/audition-entry.ts — the "story de audición" (T-006 Alcance): a page to actually LISTEN
// to both channels' cue packs, since `pcmDigest` proves "distinct", not "good". Bundled to
// audition.bundle.js the same way T-002's demo is (see audition.html's closing comment) — this is
// NOT a Storybook story: src/stories/chat-sim/** is [qa]'s exclusive write cell
// (file-ownership-matrix.md), so a real .stories.tsx there is T-008's job, not this task's. This
// stays inside sound/**, T-006's own scope.write.

import { AudioSink } from './audio-sink';
import { DEFAULT_CUE_PACK } from './packs';
import { pcmDigest, renderPack } from './synth';
import type { Cue } from './types';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElement> = {}): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  Object.assign(node, props);
  return node;
}

function mount(): void {
  const root = document.getElementById('root');
  if (!root) return;

  const ctx = new AudioContext();
  const sink = new AudioSink(ctx);

  const unmuteBtn = el('button', { textContent: '🔇 muted (click to unmute)' });
  unmuteBtn.addEventListener('click', () => {
    if (sink.muted) {
      sink.unmute();
      unmuteBtn.textContent = '🔊 unmuted';
    } else {
      sink.mute();
      unmuteBtn.textContent = '🔇 muted (click to unmute)';
    }
  });
  root.appendChild(unmuteBtn);

  (['whatsapp', 'telegram'] as const).forEach((channel) => {
    const cues = DEFAULT_CUE_PACK[channel] ?? [];
    const section = el('section');
    section.appendChild(el('h2', { textContent: channel }));

    const digest = pcmDigest(renderPack(cues));
    section.appendChild(el('p', { textContent: `pack digest: ${digest} (${cues.length} cues)` }));

    cues.forEach((cue: Cue) => {
      const btn = el('button', { textContent: `▶ ${cue.id}` });
      btn.addEventListener('click', () => {
        if (ctx.state === 'suspended') ctx.resume();
        sink.schedule(cue);
      });
      section.appendChild(btn);
    });

    const cancelBtn = el('button', { textContent: '⏹ cancelAll() — the seek/scrub hook' });
    cancelBtn.addEventListener('click', () => sink.cancelAll());
    section.appendChild(cancelBtn);

    root.appendChild(section);
  });
}

mount();
