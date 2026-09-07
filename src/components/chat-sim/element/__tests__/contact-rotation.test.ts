// Contacto por rubro. `#buildHead` leía `contact-name`/`contact-status` UNA vez en
// `connectedCallback`, así que el header conservaba un solo contacto mientras el guion y la
// etiqueta rotaban debajo: la misma persona vendiendo catering, después con un restaurante,
// después con una inmobiliaria. `ChatDemo.astro` (producción) rota `contact.name`/`contact.meta`
// por rubro, así que sin esto reemplazarlo era una regresión en el hero de una landing viva.
//
// El gemelo NO es un ritual manual: vive acá abajo como su propio `it()`, afirmando lo contrario
// del test positivo sobre la MISMA medición. Es la disciplina que adoptó el ciclo tras descubrir
// que la sonda del alto seguía verde con el default mutado a `auto`.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../chat-sim-element';

function stubRaf() {
  let pending: ((t: number) => void) | null = null;
  vi.stubGlobal('requestAnimationFrame', (cb: (t: number) => void) => {
    pending = cb;
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {
    pending = null;
  });
  return {
    flush(t: number) {
      const cb = pending;
      pending = null;
      cb?.(t);
    },
  };
}
let raf: ReturnType<typeof stubRaf>;

const SCRIPT = JSON.stringify([{ k: 'post', by: 'in', text: 'hola', delayMs: 0 }]);

function scriptTag(attrs: Record<string, string>): HTMLScriptElement {
  const el = document.createElement('script');
  el.type = 'application/json';
  el.textContent = SCRIPT;
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

/** Los tres rubros del hero de Fovente, con el contacto que producción rota en cada uno. */
const RUBROS = [
  { 'data-contact-name': 'Marisol Quispe', 'data-contact-status': '+51 987 654 321' },
  { 'data-contact-name': 'Sazón de Barranco', 'data-contact-status': 'en línea' },
  { 'data-contact-name': 'Terra Inmobiliaria', 'data-contact-status': 'últ. vez hoy' },
];

function mount(hostAttrs: Record<string, string>, slides: Record<string, string>[]): HTMLElement {
  const el = document.createElement('cf-chat-sim');
  el.setAttribute('loop', '');
  el.setAttribute('loop-pause-ms', '100');
  el.setAttribute('channel', 'whatsapp');
  el.setAttribute('seed', '3');
  el.setAttribute('t0', '0');
  Object.entries(hostAttrs).forEach(([k, v]) => el.setAttribute(k, v));
  slides.forEach((a) => el.appendChild(scriptTag(a)));
  document.body.appendChild(el);
  return el;
}

/** Lo que el espectador realmente ve en la cabecera, en el slide activo. */
function head(el: HTMLElement) {
  return {
    name: el.querySelector('.cf-who b')?.textContent ?? '',
    status: el.querySelector('.cf-who em')?.textContent ?? '',
    avatar: el.querySelector('.cf-avatar')?.textContent ?? '',
  };
}

/** Arranca la reproducción. Secuencia idéntica a la del test del loop en `t031.test.ts`. */
function start(el: HTMLElement): void {
  (el as HTMLElement & { play: () => void }).play();
  raf.flush(0);
}

/** Avanza UN rubro por el camino real: terminar el slide, dejar vencer `loop-pause-ms` para que
 * el loop active el siguiente, y darle su primer tick al nuevo playhead. Deliberadamente NO se
 * llama a un helper interno del componente: un atajo por dentro seguiría pasando aunque la
 * rotación real se rompiera, y el test no mediría nada. */
function advance(el: HTMLElement): void {
  raf.flush(10_000); // completa el slide activo
  vi.advanceTimersByTime(200); // vence loop-pause-ms => activa el siguiente
  raf.flush(0); // primer tick del nuevo playhead
}

beforeEach(() => {
  vi.useFakeTimers();
  raf = stubRaf();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('contacto por rubro — el header rota junto con el guion y la etiqueta', () => {
  it('slide 0 toma SU propio contacto al montar, no el del host', () => {
    // El caso que sólo aparecería al segundo loop: sin aplicar en el mount, la primera pasada
    // muestra el contacto del host y las siguientes el del slide 0.
    const el = mount({ 'contact-name': 'FALLBACK DEL HOST' }, RUBROS);
    expect(head(el).name).toBe('Marisol Quispe');
    expect(head(el).avatar).toBe('M');
    el.remove();
  });

  it('los tres rubros muestran nombre, estado E inicial distintos', () => {
    const el = mount({}, RUBROS);
    start(el);
    const seen = [head(el)];
    for (let i = 0; i < 2; i++) {
      advance(el);
      seen.push(head(el));
    }
    expect(seen.map((s) => s.name)).toEqual([
      'Marisol Quispe',
      'Sazón de Barranco',
      'Terra Inmobiliaria',
    ]);
    expect(seen.map((s) => s.status)).toEqual(['+51 987 654 321', 'en línea', 'últ. vez hoy']);
    // La inicial se deriva del nombre rotado. Rotar el nombre y dejar la inicial quieta —
    // una "M" sobre "Sazón de Barranco" — se lee peor que no rotar.
    expect(seen.map((s) => s.avatar)).toEqual(['M', 'S', 'T']);
    el.remove();
  });

  it('un slide con estado después de uno sin estado SÍ lo puede escribir', () => {
    // El `<em>` se crea siempre y se esconde vacío, en vez de crearse sólo si hay estado al
    // montar. Si no, el segundo rubro no tendría dónde escribir y el bug aparecería recién ahí.
    const el = mount({}, [
      { 'data-contact-name': 'Sin estado' },
      { 'data-contact-name': 'Con estado', 'data-contact-status': 'en línea' },
    ]);
    start(el);
    expect(head(el).status).toBe('');
    advance(el);
    expect(head(el).status).toBe('en línea');
    el.remove();
  });

  it('sin datos por slide, el atributo del host sigue mandando (caso guion único)', () => {
    const el = mount({ 'contact-name': 'Solo Host', 'contact-status': 'en línea' }, [{}]);
    expect(head(el).name).toBe('Solo Host');
    expect(head(el).status).toBe('en línea');
    el.remove();
  });

  it('GEMELO — sin datos por slide los tres rubros NO se distinguen', () => {
    // El mismo montaje y la misma medición que el test positivo de arriba, con la única
    // diferencia de quitarle a los slides su contacto. Si el applier dejara de correr, el
    // positivo pasaría a verse así — y este `it()` se pondría rojo, señalando que el
    // instrumento dejó de medir en vez de que el bug volvió sin aviso.
    const el = mount({ 'contact-name': 'Uno Solo' }, [{}, {}, {}]);
    start(el);
    const seen = [head(el)];
    for (let i = 0; i < 2; i++) {
      advance(el);
      seen.push(head(el));
    }
    expect(new Set(seen.map((s) => s.name)).size).toBe(1);
    expect(seen[0].name).toBe('Uno Solo');
    el.remove();
  });
});
