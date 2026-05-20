import type { PreviewData } from '../../components/docs/link-preview';

export const FIXTURES: Record<string, PreviewData> = {
  '/xgodel/propuesta': {
    title: 'Propuesta XGodel — Portal cliente + landing',
    kind: 'proposal',
    excerpt:
      'Cofoundy entrega un portal cliente con Approvals semanales, una landing animada con shader-gradient, y el sistema de design tokens reutilizable. La propuesta cubre 6 semanas de build, dos rondas de concept review, y deploy automatizado en Cloudflare.',
    meta: [
      { label: 'Cliente', value: 'XGodel SAC' },
      { label: 'Fecha', value: '2026-05-18' },
      { label: 'Estado', value: 'firmado' },
    ],
  },
  '/cofoundy/brand-book': {
    title: 'Brand Book MVP — Cofoundy',
    kind: 'doc',
    excerpt:
      'La identidad de marca de Cofoundy se construye sobre tres arquetipos: Sage (claridad), Caregiver (ownership), y Hero (entrega). Este documento define la paleta, tipografías Space Grotesk + Inter + JetBrains Mono, sistema de espaciado, y los anti-self que reconocemos como derivas.',
    meta: [
      { label: 'Versión', value: 'v1.2' },
      { label: 'Actualizado', value: '2026-05-13' },
    ],
  },
  '/xgodel/deliverables/concept-c': {
    title: 'Concept C — Quiet authority + Sage typography',
    kind: 'deliverable',
    excerpt:
      'El concepto C es el que finalmente fue seleccionado por el cliente. Combina una paleta deep blue con acentos amber muy puntuales, tipografía Space Grotesk en headings y un sistema de gradient-anchored hero que respeta prefers-reduced-motion. El microcopy tiene una sola voz: la de un partner técnico, no la de una agencia.',
    meta: [
      { label: 'Estado', value: 'aprobado' },
      { label: 'Vence', value: '2026-06-01' },
    ],
  },
  '/handbook/voice': {
    title: 'Voice & Persona — Cofoundy',
    kind: 'doc',
    excerpt:
      'Sage explica el WHY antes del HOW. Caregiver carga el constraint en vez de externalizarlo. Hero cierra sin floro. Las tres tensiones internas (explicar vs actuar, suavizar vs ser directo, matizar vs ser claro) se resuelven con reglas explícitas que el LLM puede generalizar.',
    meta: [{ label: 'Owner', value: 'Andre' }],
  },
};

export function makeGetPreview(map = FIXTURES) {
  return (href: string) => map[href] ?? null;
}

export function makeFetchPreview(map = FIXTURES, delayMs = 600) {
  return async (href: string) => {
    await new Promise((r) => setTimeout(r, delayMs));
    const data = map[href];
    if (!data) throw new Error('not-found');
    return data;
  };
}
