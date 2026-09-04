// T-007 acceptance #3: "Checklist derivada del `MobileComposer.tsx` real (13 KB, inbox-ai): por
// cada razón que ese fork declara para existir, una fila con veredicto cubierto/no-cubierto."
//
// This test does NOT read `products/cofoundy-platform/inbox-ai/...` at runtime: `packages/ui` and
// `inbox-ai` are separate repos in the Cofoundy workspace (see workspace CLAUDE.md's repo map),
// so a CI job that checks out only `packages/ui` would never have that path — a runtime read
// would make this test fail for an environment reason, not a real regression. Instead, the exact
// fragments below are literal quotes captured from that file on 2026-09-04 (same date
// MOBILE-CHECKLIST.md's header cites) — this test checks that MOBILE-CHECKLIST.md's table still
// grounds each row in one of them, catching drift in the CHECKLIST doc, not in a file this
// package doesn't own and can't see in every CI context.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const CHECKLIST_PATH = join(__dirname, '..', 'MOBILE-CHECKLIST.md');

// One literal fragment per declared reason, captured verbatim from MobileComposer.tsx
// (products/cofoundy-platform/inbox-ai/frontend/src/components/conversation/MobileComposer.tsx,
// 2026-09-04). Order matches the checklist table's row order.
const DECLARED_REASON_FINGERPRINTS: readonly string[] = [
  'ajuste de CSS sobre el', // R1 — layout propio, no un parche sobre MessageComposer
  'Tres botones y no cuatro', // R2 — presupuesto de iconos a ~390px
  'el micrófono NO entró en la píldora', // R3 — mic reemplaza el rol de enviar
  'Parar no es rojo ni de peligro', // R4 — estado busy/stop, tokens de tema
  'Mismo nombre y misma semántica', // R5 — allowEmptySend, paridad de vocabulario (#591)
  'recuperado puede ser de varias líneas', // R6 — borrador + auto-grow al montar
  'Sin "Enter envía"', // R7 — enviar solo por botón
];

const VALID_VERDICTS = ['**Cubierto**', '**No cubierto**', '**No cubierto / N/A**'];

describe('T-007 acceptance #3 — mobile composer checklist is real, not prose', () => {
  const doc = readFileSync(CHECKLIST_PATH, 'utf8');

  it('exists and cites the source file it was derived from', () => {
    expect(doc).toContain('MobileComposer.tsx');
    expect(doc).toContain('inbox-ai');
  });

  it('has exactly one table row per declared reason, in order', () => {
    const rows = doc
      .split('\n')
      .filter((line) => /^\|\s*\d+\s*\|/.test(line)); // "| 1 | ... |" — numbered data rows only
    expect(rows).toHaveLength(DECLARED_REASON_FINGERPRINTS.length);
  });

  it.each(DECLARED_REASON_FINGERPRINTS.map((fp, i) => [i + 1, fp] as const))(
    'row %i is grounded in the real file (fingerprint: %s)',
    (rowNumber, fingerprint) => {
      const rows = doc.split('\n').filter((line) => /^\|\s*\d+\s*\|/.test(line));
      const row = rows[rowNumber - 1];
      expect(row).toBeDefined();
      expect(row).toContain(fingerprint);
    },
  );

  it('every row carries one of the three valid verdicts — no row left as prose', () => {
    const rows = doc.split('\n').filter((line) => /^\|\s*\d+\s*\|/.test(line));
    for (const row of rows) {
      const hasValidVerdict = VALID_VERDICTS.some((v) => row.includes(v));
      expect(hasValidVerdict, `row has no valid verdict: ${row}`).toBe(true);
    }
  });

  it('the "N de 7" summary matches the actual count of Cubierto rows', () => {
    const rows = doc.split('\n').filter((line) => /^\|\s*\d+\s*\|/.test(line));
    const coveredCount = rows.filter((r) => r.includes('**Cubierto**')).length;
    expect(doc).toContain(`${coveredCount} de ${rows.length} cubiertas`);
  });

  it('twin — a doc that silently drops a reason fails the row-count check', () => {
    const dropped = doc
      .split('\n')
      .filter((line) => !line.includes(DECLARED_REASON_FINGERPRINTS[2])) // remove row 3 entirely
      .join('\n');
    const rows = dropped.split('\n').filter((line) => /^\|\s*\d+\s*\|/.test(line));
    expect(rows.length).not.toBe(DECLARED_REASON_FINGERPRINTS.length);
  });
});
