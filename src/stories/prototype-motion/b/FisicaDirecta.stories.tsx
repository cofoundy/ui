import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { cn } from '../../../utils/cn';
import { DragSwitch } from './DragSwitch';
import { PressButton, fakeRequest, type PressPhase } from './PressButton';
import { SwipeTabs } from './SwipeTabs';
import { ThumbToaster, thumbToast } from './ThumbToast';
import { after } from './physics';

/**
 * Variant B — "Física directa, pulgar primero".
 * Every moving value is a JS spring (src/lib/spring.ts) on rAF, retargetable and
 * velocity-carrying, and every one can be grabbed: the switch knob, the tabs (swipe the
 * content), the toast (swipe away). Prototype-local copies — nothing in src/components
 * changes. PROTOTIPO · datos de ejemplo.
 */
const meta: Meta = {
  title: 'Prototype/Motion/B — Física directa',
  parameters: { layout: 'fullscreen' },
};
export default meta;

// --- datos de ejemplo --------------------------------------------------------------
interface Reply { id: string; shortcut: string; text: string; uses: number }
const OPEN: Reply[] = [
  { id: 'o1', shortcut: '/envio', text: 'Hola, gracias por escribirnos. Tu pedido sale mañana entre 9 y 11 a. m.; te enviamos el código de seguimiento por aquí.', uses: 48 },
  { id: 'o2', shortcut: '/horario', text: 'Atendemos de lunes a sábado de 9 a. m. a 7 p. m. Los domingos respondemos el lunes a primera hora.', uses: 31 },
  { id: 'o3', shortcut: '/pago', text: 'Puedes pagar con Yape, Plin o transferencia al BCP. Cuando pagues, envíanos la captura y confirmamos en minutos.', uses: 27 },
  { id: 'o4', shortcut: '/tallas', text: 'Las tallas van de la S a la XL. Si nos dices tu altura y peso te recomendamos la mejor.', uses: 19 },
  { id: 'o5', shortcut: '/cambios-y-devoluciones-temporada-verano', text: 'Tienes 15 días para cambios con la etiqueta puesta. En liquidación de verano no hay devoluciones, solo cambios de talla.', uses: 12 },
  { id: 'o6', shortcut: '/delivery-lima', text: 'El delivery en Lima Metropolitana cuesta S/ 10 y llega en 24 a 48 horas.', uses: 9 },
  { id: 'o7', shortcut: '/provincia', text: 'A provincia enviamos por Shalom u Olva; el costo depende del destino y lo pagas al recoger.', uses: 7 },
  { id: 'o8', shortcut: '/stock', text: 'Déjame revisar el stock en tienda y te confirmo en unos minutos.', uses: 5 },
  { id: 'o9', shortcut: '/gracias', text: 'Gracias a ti. Cualquier cosa, aquí estamos.', uses: 3 },
];
const PENDING: Reply[] = [
  { id: 'p1', shortcut: '/seguimiento', text: 'Seguimos esperando tu comprobante de pago para despachar el pedido. ¿Pudiste hacer la transferencia?', uses: 22 },
  { id: 'p2', shortcut: '/reserva', text: 'Te guardamos la prenda hasta mañana a las 6 p. m. Después vuelve a estar disponible.', uses: 8 },
];

const Tag = () => (
  <span className="rounded-full border border-dashed border-[var(--border)] px-2 py-0.5 font-mono text-[10px] tracking-wide text-[var(--muted-foreground)]">
    PROTOTIPO · datos de ejemplo
  </span>
);

function ReplyList({ items, empty }: { items: Reply[]; empty: React.ReactNode }) {
  if (!items.length) return <div className="flex h-full items-center justify-center px-6 pb-8">{empty}</div>;
  return (
    <ul className="divide-y divide-[var(--border)]">
      {items.map((r) => (
        <li key={r.id} className="flex gap-3 py-3 pr-1">
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-[13px] font-medium text-[var(--primary)]">{r.shortcut}</p>
            <p className="mt-1 line-clamp-2 text-[15px] leading-[21px] text-[var(--foreground)]">{r.text}</p>
          </div>
          <span className="shrink-0 pt-0.5 font-mono text-[12px] tabular-nums text-[var(--muted-foreground)]">{r.uses}×</span>
        </li>
      ))}
    </ul>
  );
}

const EmptyClosed = () => (
  <div className="max-w-[260px] text-center">
    <p className="text-[15px] font-semibold">Sin respuestas para conversaciones cerradas</p>
    <p className="mt-1 text-[13px] leading-[18px] text-[var(--muted-foreground)]">
      Guarda una despedida o una encuesta corta y aparecerá aquí.
    </p>
  </div>
);

// --- Operador: the composed Fovente-like mobile screen ------------------------------
interface OperadorArgs { resultado: 'guarda' | 'falla'; latenciaMs: number; operador: boolean }

function OperadorScreen({ resultado, latenciaMs, operador }: OperadorArgs) {
  const [on, setOn] = React.useState(operador);
  const tabRef = React.useRef(0); // read at save time, not at click time
  const [draft, setDraft] = React.useState('Tu pedido ya está en camino. Te escribimos apenas el motorizado esté cerca.');
  const [lists, setLists] = React.useState<Reply[][]>([OPEN, PENDING, []]);
  React.useEffect(() => () => thumbToast.clear(), []);

  const save = () => fakeRequest(latenciaMs, resultado === 'falla');
  const onSaved = () => {
    const r: Reply = { id: `n${Date.now()}`, shortcut: '/en-camino', text: draft.trim(), uses: 0 };
    const at = tabRef.current;
    setLists((l) => l.map((x, i) => (i === at ? [r, ...x] : x)));
    thumbToast.success('Respuesta guardada', {
      description: `Escribe /en-camino en ${['Abiertas', 'Pendientes', 'Cerradas'][at]} para usarla.`,
      action: { label: 'Deshacer', onClick: () => setLists((l) => l.map((x, i) => (i === at ? x.filter((y) => y.id !== r.id) : x))) },
    });
  };
  const onFailed = () =>
    thumbToast.error('No se guardó la respuesta', { description: 'Revisa tu conexión. El texto sigue aquí.' });

  return (
    <div className="flex min-h-[100dvh] w-full justify-center sm:items-center sm:py-8">
      <div
        data-slot="operador-screen"
        className="relative flex h-[100dvh] w-full max-w-[375px] flex-col overflow-hidden bg-[var(--background)] font-sans text-[var(--foreground)] sm:h-[min(812px,calc(100dvh-4rem))] sm:rounded-[32px] sm:ring-1 sm:ring-[var(--border)]"
      >
        <header className="shrink-0 px-4 pb-3 pt-3">
          <Tag />
          <h1 className="mt-2 font-display text-[20px] font-semibold leading-7">Ajustes de conversación</h1>
          <p className="truncate text-[13px] text-[var(--muted-foreground)]">Tienda Luna · WhatsApp e Instagram</p>
        </header>

        {/* Modo operador — the whole row is the hit area; the knob is draggable. */}
        <div className="mx-3 flex shrink-0 items-center gap-3 rounded-2xl bg-[var(--card)] py-2.5 pl-4 pr-1.5 ring-1 ring-inset ring-[var(--border)]">
          <div className="min-w-0 flex-1" onClick={() => setOn((v) => !v)}>
            <p id="op-label" className="text-[16px] font-semibold leading-6">Modo operador</p>
            <p id="op-desc" className="text-[13px] leading-[18px] text-[var(--muted-foreground)]">
              {on ? 'Tú respondes. La IA no contesta hasta que lo apagues.' : 'La IA responde y te avisa si necesita ayuda.'}
            </p>
          </div>
          <DragSwitch checked={on} onCheckedChange={setOn} aria-labelledby="op-label" aria-describedby="op-desc" />
        </div>

        <h2 className="shrink-0 px-4 pb-2 pt-5 text-[13px] font-semibold text-[var(--muted-foreground)]">Respuestas rápidas</h2>
        <SwipeTabs
          aria-label="Respuestas rápidas por estado"
          className="min-h-0 flex-1 px-3"
          onChange={(i) => { tabRef.current = i; }}
          tabs={[
            { id: 'a', label: 'Abiertas', count: lists[0].length, content: <ReplyList items={lists[0]} empty={null} /> },
            { id: 'p', label: 'Pendientes', count: lists[1].length, content: <ReplyList items={lists[1]} empty={null} /> },
            { id: 'c', label: 'Cerradas', count: lists[2].length, content: <ReplyList items={lists[2]} empty={<EmptyClosed />} /> },
          ]}
        />

        <ThumbToaster className="bottom-[186px]" />

        {/* Thumb dock: the one primary action sits where the thumb already is. */}
        <div className="relative z-20 shrink-0 border-t border-[var(--border)] bg-[var(--background)] px-3 pb-5 pt-3">
          <label htmlFor="qr" className="sr-only">Nueva respuesta rápida</label>
          <textarea
            id="qr"
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Escribe la respuesta que quieres reutilizar"
            className="mb-2.5 block w-full resize-none rounded-xl bg-[var(--muted)] px-3.5 py-2.5 text-[16px] leading-[22px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          />
          <PressButton
            className="w-full"
            label="Guardar respuesta rápida"
            disabled={!draft.trim()}
            onAction={save}
            onSuccess={onSaved}
            onError={onFailed}
          />
        </div>
      </div>
    </div>
  );
}

type OpStory = StoryObj<OperadorArgs>;

export const Operador: OpStory = {
  name: 'Operador',
  args: { resultado: 'guarda', latenciaMs: 900, operador: false },
  argTypes: {
    resultado: { control: 'inline-radio', options: ['guarda', 'falla'] },
    latenciaMs: { control: { type: 'range', min: 100, max: 4000, step: 100 } },
  },
  render: (a) => <OperadorScreen {...a} />,
};

export const OperadorSinRed: OpStory = {
  name: 'Operador · sin red (error)',
  args: { resultado: 'falla', latenciaMs: 1400, operador: true },
  render: (a) => <OperadorScreen {...a} />,
};

// --- Primitivos sueltos ----------------------------------------------------------------
const Stage = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('mx-auto flex min-h-[100dvh] w-full max-w-[375px] flex-col justify-center gap-6 bg-[var(--background)] p-6 font-sans text-[var(--foreground)]', className)}>
    {children}
  </div>
);

export const Boton: StoryObj = {
  name: 'Botón · presión + carga → éxito',
  render: () => (
    <Stage>
      <PressButton className="w-full" label="Guardar respuesta rápida" onAction={() => fakeRequest(700)} />
      <div className="flex justify-center">
        <PressButton label="Guardar" successLabel="Listo" onAction={() => fakeRequest(700)} />
      </div>
    </Stage>
  ),
};

export const Interruptor: StoryObj = {
  name: 'Switch · arrastrable',
  render: () => {
    const [on, setOn] = React.useState(false);
    return (
      <Stage>
        <div className="flex items-center gap-3">
          <p id="sw" className="flex-1 text-[16px] font-semibold">Modo operador</p>
          <DragSwitch checked={on} onCheckedChange={setOn} aria-labelledby="sw" />
        </div>
      </Stage>
    );
  },
};

export const Pestanas: StoryObj = {
  name: 'Tabs · deslizar contenido',
  render: () => (
    <Stage className="justify-start pt-10">
      <SwipeTabs
        aria-label="Respuestas rápidas por estado"
        panelClassName="h-[520px]"
        tabs={[
          { id: 'a', label: 'Abiertas', count: OPEN.length, content: <ReplyList items={OPEN} empty={null} /> },
          { id: 'p', label: 'Pendientes', count: PENDING.length, content: <ReplyList items={PENDING} empty={null} /> },
          { id: 'c', label: 'Cerradas', count: 0, content: <ReplyList items={[]} empty={<EmptyClosed />} /> },
        ]}
      />
    </Stage>
  ),
};

export const Toast: StoryObj = {
  name: 'Toast · deslizar para cerrar',
  render: () => {
    React.useEffect(() => () => thumbToast.clear(), []);
    return (
      <Stage className="relative justify-end pb-8">
        <ThumbToaster className="bottom-[96px]" />
        <div className="relative z-20 -mx-6 bg-[var(--background)] px-6 pt-3">
        <PressButton
          className="w-full"
          label="Mostrar toast"
          successLabel="Mostrado"
          successHoldMs={500}
          onAction={() => fakeRequest(120)}
          onSuccess={() => thumbToast.success('Respuesta guardada', { description: 'Escribe /en-camino para usarla.', action: { label: 'Deshacer', onClick: () => {} } })}
        />
        </div>
      </Stage>
    );
  },
};

export const Estados: StoryObj = {
  name: 'Estados',
  render: () => {
    React.useEffect(() => {
      const cancel = after(0, () => {
        thumbToast.error('No se guardó la respuesta', { description: 'Revisa tu conexión. El texto sigue aquí.', duration: Infinity });
        thumbToast.success('Respuesta guardada', { description: 'Escribe /en-camino para usarla.', duration: Infinity, action: { label: 'Deshacer', onClick: () => {} } });
      });
      return () => { cancel(); thumbToast.clear(); };
    }, []);
    const phases: [PressPhase, string][] = [['idle', 'Reposo'], ['loading', 'Guardando'], ['success', 'Éxito'], ['error', 'Error']];
    return (
      <Stage className="relative justify-start gap-5 pt-6">
        <div className="flex items-center justify-between"><h1 className="font-display text-[18px] font-semibold">Estados</h1><Tag /></div>
        <section className="grid gap-2">
          {phases.map(([p, name]) => (
            <div key={p} className="grid grid-cols-[72px_1fr] items-center gap-3">
              <span className="text-[12px] text-[var(--muted-foreground)]">{name}</span>
              <PressButton className="w-full" label="Guardar respuesta rápida" phase={p} />
            </div>
          ))}
          <div className="grid grid-cols-[72px_1fr] items-center gap-3">
            <span className="text-[12px] text-[var(--muted-foreground)]">Vacío</span>
            <PressButton className="w-full" label="Guardar respuesta rápida" disabled />
          </div>
        </section>
        <section className="grid gap-1">
          {[
            ['Apagado', false, false, ''],
            ['Encendido', true, false, ''],
            ['Sin permiso', true, true, 'Solo un administrador puede cambiar esto.'],
          ].map(([name, on, dis, note]) => (
            <div key={name as string} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">Modo operador <span className="font-normal text-[var(--muted-foreground)]">· {name as string}</span></p>
                {note && <p className="text-[13px] text-[var(--muted-foreground)]">{note as string}</p>}
              </div>
              <DragSwitch checked={on as boolean} disabled={dis as boolean} aria-label={`Modo operador ${name}`} />
            </div>
          ))}
        </section>
        <ThumbToaster className="bottom-8" />
      </Stage>
    );
  },
};
