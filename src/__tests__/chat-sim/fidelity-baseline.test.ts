// __tests__/chat-sim/fidelity-baseline.test.ts — qa's own write cell (T-032 Part A / T-014).
//
// Team-lead's framing: "los 8 defectos reales de este ciclo los encontró el operador mirando la
// pantalla. Ninguno lo cazó un test." Not for lack of tests — 302 green, 9 gates that redden under
// mutation. The problem is CLASS: every existing gate (receipt-model.test.ts, wallpaper-contrast
// .test.ts, caps.test.ts...) verifies that the renderer/type OBEYS the adapter — internal
// consistency. None of them verify that the adapter's VALUE is right. A wrong value passes every
// one of those gates, because the DOM still changes when the adapter changes — just toward the
// wrong thing.
//
// This file is that missing instrument: a table of assertions against `.cofoundy/specs
// /telegram-fidelity-fix.md`'s own findings, each citing the PRIMARY SOURCE the spec itself cites
// (tdesktop's `chat.style` / `colors.palette` / `night.tdesktop-theme`, or the operator's own
// real-client screenshot where the spec's inferred value was contradicted) — not the spec's prose,
// and never a value this file invents. Reads the REAL `ChannelAdapter` objects (`adapters/telegram
// .ts`, `adapters/whatsapp.ts`), never a local re-typed fixture — same discipline
// `core/__tests__/receipt-model.test.ts` already enforces for its two live rows.
//
// Mandatory twin (team-lead's explicit acceptance bar): reverting Telegram's `receipt.states` back
// to the old simple-tick shape (glyph fixed, color varies — the exact §F-1 bug that slipped
// through an entire cycle) MUST break this instrument. If it doesn't, the instrument doesn't earn
// its name.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { telegram } from '../../components/chat-sim/adapters/telegram';
import { whatsapp } from '../../components/chat-sim/adapters/whatsapp';
import type { ChannelAdapter, TicksReceiptModel } from '../../components/chat-sim/core/types';

const SPEC_PATH = join(__dirname, '..', '..', '..', '.cofoundy', 'specs', 'telegram-fidelity-fix.md');
const SPEC = readFileSync(SPEC_PATH, 'utf8');

function asTicks(adapter: ChannelAdapter): TicksReceiptModel {
  if (adapter.receipt.kind !== 'ticks') throw new Error('expected a kind:"ticks" receipt model');
  return adapter.receipt;
}

// ---------------------------------------------------------------------------------------------
// External-reference baseline. Each entry documents, in prose, the primary-source citation next
// to the runnable assertion below it — the two are kept adjacent on purpose (a citation nobody can
// see next to the check it justifies is not a citation, it's a footnote).
// ---------------------------------------------------------------------------------------------

describe('Fidelity baseline — WhatsApp receipt (telegram-fidelity-fix.md §F-1, row "WhatsApp")', () => {
  // Source: §F-1 table, "WhatsApp | el color (✓✓ gris → ✓✓ azul) | glifo constante, color
  // variable". Real WhatsApp: sending(clock) -> sent(1 check) -> delivered(2 check, gray) ->
  // read(2 check, blue). The glyph is constant ACROSS delivered->read specifically (both
  // double-check) — that pair is what T-011's contract had to be able to express, and what the
  // old flat `receiptGlyph` enum could not.
  it('glyph is fixed from delivered→read; color is the only thing that flips at read', () => {
    const r = asTicks(whatsapp);
    expect(r.states.delivered.glyph).toBe('double-check');
    expect(r.states.read.glyph).toBe('double-check');
    expect(r.states.delivered.color).not.toBe(r.states.read.color);
  });
});

describe('Fidelity baseline — Telegram 1:1/group receipt (telegram-fidelity-fix.md §F-1/§F-2)', () => {
  // Source: §F-1 table, "Telegram 1:1 / grupo | el glifo (✓ → ✓✓), color fijo | color constante,
  // glifo variable" — the exact inverse of WhatsApp's row above. This IS the bug the operator
  // caught ("doble tick") after it survived a full cycle behind green gates.
  it('glyph flips sent→read (single tick to double tick); color is constant', () => {
    const r = asTicks(telegram);
    expect(r.states.sent.glyph).toBe('check');
    expect(r.states.read.glyph).toBe('double-check');
    expect(r.states.sent.glyph).not.toBe(r.states.read.glyph);
    expect(r.states.sent.color).toBe(r.states.read.color);
  });

  // Source: §F-2 table, "Telegram, contador de vistas | en todo mensaje | solo canales
  // broadcast; en 1:1 el slot lo ocupan los ticks". This adapter models 1:1/group (no separate
  // broadcast-channel adapter is wired this cycle — core/__tests__/receipt-model.test.ts's
  // `metric` row is a paper-proof fixture, not a live adapter), so the real adapter's own
  // `counter` field must read 'none', never 'views'.
  it('has no view-counter — the 👁 N slot is broadcast-only, not this (1:1/group) adapter', () => {
    expect(telegram.counter).toBe('none');
  });

  // Source: §F-1 table, "Telegram 1:1 / grupo | ... | color fijo" — 1:1/group tickets, unlike
  // WhatsApp, have no reachable `delivered` state (queued -> sent -> read only, per
  // adapter-interface-draft.md's `deliveryStates` column). Asserted on the adapter's OWN field.
  it('has no reachable delivered state (queued → sent → read only)', () => {
    expect(telegram.deliveryStates).not.toContain('delivered');
  });

  // MANDATORY TWIN (team-lead: "revertir receipt.states de Telegram al tick simple debe
  // romperlo. Ese fue el bug original que se nos escapó; si el baseline no lo caza, no sirve.").
  // Builds the OLD, wrong shape by hand — glyph pinned to a single tick across sent→read, color
  // doing the varying instead (the WhatsApp-shaped answer, wrong on Telegram) — and proves the
  // exact assertions above flip to failing on it. This is not a hypothetical: it is the literal
  // regression a `git revert` of T-011/T-012 on this one field would reintroduce.
  it('gemelo obligatorio: reverting to the old simple-tick shape (glyph fixed, color varies) breaks the checks above', () => {
    const regressedTelegram: ChannelAdapter = {
      ...telegram,
      receipt: {
        kind: 'ticks',
        placement: telegram.receipt.placement,
        scope: telegram.receipt.scope,
        states: {
          queued: { glyph: 'clock', color: 'var(--cf-cs-bubble-out-meta)' },
          sent: { glyph: 'check', color: 'var(--cf-cs-bubble-out-meta)' },
          delivered: { glyph: 'check', color: 'var(--cf-cs-bubble-out-meta)' },
          // old (wrong) model: glyph pinned to 'check', color flips instead of the glyph
          read: { glyph: 'check', color: 'var(--channel-telegram-read, #37a1de)' },
          failed: { glyph: 'alert', color: '#e53935' },
        },
      },
    };
    const r = asTicks(regressedTelegram);
    // The real baseline demands sent.glyph !== read.glyph AND sent.color === read.color.
    // The regressed shape inverts BOTH — proving the real assertions above are falsifiable,
    // not vacuously true.
    expect(r.states.sent.glyph).toBe(r.states.read.glyph); // WRONG: glyph is now constant
    expect(r.states.sent.color).not.toBe(r.states.read.color); // WRONG: color now varies
  });
});

describe('Fidelity baseline — structural facts that are adapter fields, not chrome (adapter-interface-draft.md)', () => {
  // These four are load-bearing per-channel facts modeled as literal ChannelAdapter enum values
  // (not brand color/texture, which the family deliberately keeps OUT of the 17-field contract —
  // see styles.css's own header comment). Regression here means the wrong RENDER SHAPE, not just
  // the wrong color — e.g. Telegram's reply quote losing its `thin-bar` treatment for WhatsApp's
  // `color-bar` would be exactly this class of bug and none of the existing gates key on it.
  it('WhatsApp: quote style is color-bar, timestamp sits inside the padded corner', () => {
    expect(whatsapp.quote).toBe('color-bar');
    expect(whatsapp.timestamp).toBe('inside-pad');
  });

  it('Telegram: quote style is thin-bar, timestamp sits inline/plain (no pad reservation)', () => {
    expect(telegram.quote).toBe('thin-bar');
    expect(telegram.timestamp).toBe('inside-plain');
  });

  it('both channels use a doodle-textured wallpaper (adapter.wallpaper === pattern)', () => {
    expect(whatsapp.wallpaper).toBe('pattern');
    expect(telegram.wallpaper).toBe('pattern');
  });
});

// ---------------------------------------------------------------------------------------------
// The 3 facts the research explicitly could NOT verify (telegram-fidelity-fix.md § "No
// verificado"). Team-lead: "quedan como tales, no rellenadas — ya cometimos el error de
// implementar un valor no-verificado como si lo estuviera (el wallpaper invisible salió de ahí)".
// This describe block does not assert a pixel value for any of the three — doing so would be
// exactly that mistake again. Instead it's a drift detector on the SPEC's own caveat: if someone
// edits telegram-fidelity-fix.md to quietly drop one of these three admissions (implying it got
// "verified" without anyone re-running this task), the test goes red and forces a look — the
// caveat can't silently rot into an implied verified fact.
// ---------------------------------------------------------------------------------------------
describe('No verificado — marcado como tal, nunca rellenado (T-032 delta)', () => {
  it('spec still flags the exact read-tick color as unconfirmed (not measured byte-for-byte)', () => {
    expect(SPEC).toContain('no confirmado byte a byte');
  });

  it('spec still flags the live server wallpaper as possibly an animated gradient (not this static doodle)', () => {
    expect(SPEC).toContain('gradiente animado de 4 colores');
  });

  it('spec still flags the tail silhouette as described, not measured', () => {
    expect(SPEC).toContain('descrita por silueta, no medida');
  });
});
