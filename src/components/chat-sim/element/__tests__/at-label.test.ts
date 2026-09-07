// `at` — la etiqueta de hora del guion, opcional, que gana sobre la derivada del tick.
//
// Por qué existe (cofoundy/ui#30): la hora impresa salía de `postedAt` — el tick de ANIMACIÓN —
// así que a la cadencia de un hero (~1s por paso) los catorce pasos de una conversación imprimían
// el mismo minuto catorce veces. `ChatDemo.astro`, el hero de producción que esto reemplaza,
// muestra 20:14 → 20:15 → 20:17 → 20:19. Ese lapso es la evidencia de que pasó tiempo, que es
// sobre lo que se apoya el "respondió en 4 s": es contenido, no decoración.
//
// El gemelo vive DENTRO de la suite, no como ritual manual — disciplina adoptada por el ciclo.

import { describe, expect, it } from 'vitest';
import '../chat-sim-element';

function mount(steps: unknown[]): HTMLElement {
  const el = document.createElement('cf-chat-sim');
  el.setAttribute('channel', 'whatsapp');
  el.setAttribute('seed', '7');
  el.setAttribute('t0', String(Date.UTC(2026, 0, 2, 1, 14, 0)));
  el.setAttribute('locale', 'es-PE');
  el.setAttribute('tz', 'America/Lima');
  el.setAttribute('script', JSON.stringify(steps));
  document.body.appendChild(el);
  el.setAttribute('data-step', String(steps.length));
  return el;
}

const labels = (el: HTMLElement) =>
  [...el.querySelectorAll('.cf-msg')].map((m) => m.querySelector('.cf-time')?.textContent ?? '');

const THREE = [
  { k: 'post', by: 'in', text: 'a', delayMs: 0, at: '20:14' },
  { k: 'post', by: 'out:ai', text: 'b', delayMs: 400, at: '20:15' },
  { k: 'post', by: 'in', text: 'c', delayMs: 800, at: '20:19' },
];

describe('at — la hora la manda el guion, no el tick de animación', () => {
  it('imprime las horas del guion, avanzando, con los pasos a menos de un segundo', () => {
    const el = mount(THREE);
    expect(labels(el)).toEqual(['20:14', '20:15', '20:19']);
    // El punto entero: los tres pasos ocurren en 800 ms de reproducción y aun así el reloj
    // recorre cinco minutos. Antes esto era imposible de expresar.
    el.remove();
  });

  it('sin `at`, la etiqueta sigue derivando del tick — comportamiento intacto', () => {
    const el = mount(THREE.map(({ at: _at, ...rest }) => rest));
    const got = labels(el);
    expect(got).toHaveLength(3);
    expect(got.every((l) => /^\d{2}:\d{2}$/.test(l))).toBe(true);
    // A esta cadencia los tres caen en el mismo minuto: es exactamente el problema que `at`
    // resuelve, y dejarlo afirmado impide que alguien "arregle" el default sin querer.
    expect(new Set(got).size).toBe(1);
    el.remove();
  });

  it('GEMELO — dos guiones idénticos salvo el `at` dan etiquetas distintas', () => {
    // Si el override dejara de aplicarse, ambos caerían en la misma etiqueta derivada y este
    // `it()` se pondría rojo: prueba que la sonda de arriba mide el `at` y no otra cosa.
    const a = mount(THREE);
    const b = mount(THREE.map((s) => ({ ...s, at: '09:00' })));
    expect(labels(a)).not.toEqual(labels(b));
    expect(labels(b)).toEqual(['09:00', '09:00', '09:00']);
    a.remove();
    b.remove();
  });

  it('determinismo: el mismo guion montado dos veces da las MISMAS etiquetas', () => {
    // `at` es un string del guion, nunca una lectura de reloj. Si alguien lo derivara de
    // `Date.now()`, dos montajes separados divergirían y los PNG dejarían de ser byte-idénticos
    // —la garantía central del engine— sin que ningún otro test lo note.
    const a = mount(THREE);
    const first = labels(a);
    a.remove();
    const b = mount(THREE);
    expect(labels(b)).toEqual(first);
    b.remove();
  });
});
