// react/ChatSim.tsx — `<ChatSim script channel seed mode="demo"|"live" />` (api-contract.md
// §"Firmas públicas"). See types.ts for what `mode` means — decided here, not spec'd upstream.

import { useEffect, useMemo, useRef, useState } from 'react';
import { compile } from '../core/compile';
import { createPlayhead } from '../core/playhead';
import { getAdapter } from '../adapters/registry';
import type { Timeline } from '../core/types';
import type { RenderMessage } from '../element/render';
import {
  dateSeparators,
  draftIntervals,
  formatTime,
  fullSequence,
  postedAtByMsgId,
  stateAtStep,
} from './engine';
import { MessageThread } from './MessageThread';
import { DemoComposer } from './DemoComposer';
import { LiveComposer } from './LiveComposer';
import type { ChatSimProps } from './types';

const DEFAULT_LOCALE = 'es-PE';
const DEFAULT_TZ = 'America/Lima';
const DEFAULT_T0 = Date.UTC(2026, 0, 1, 9, 0, 0); // same literal element/chat-sim-element.ts falls back to

// `100dvh` (architecture-v1.md §8): only forced in `live` mode, where a real on-screen keyboard
// can actually appear. `demo` keeps whatever sizing the consumer's container already gives
// `<cf-chat-sim>` — forcing full-viewport height on an autoplaying preview embed would be a
// regression nobody asked for.
const LIVE_ROOT_STYLE = { minHeight: '100dvh', display: 'flex', flexDirection: 'column' } as const;

export function ChatSim(props: ChatSimProps) {
  const {
    script,
    channel,
    seed,
    mode,
    locale = DEFAULT_LOCALE,
    tz = DEFAULT_TZ,
    t0 = DEFAULT_T0,
    contactName = 'Chat',
    contactStatus = '',
    editedLabel = 'Editado',
    liveActorId = 'in',
    composerPlaceholder = 'Mensaje',
    onLiveSend,
    className,
  } = props;

  const adapter = useMemo(() => getAdapter(channel), [channel]);
  const timeline = useMemo(
    () => compile(script, { seed, channel, locale, tz, t0 }),
    [script, seed, channel, locale, tz, t0],
  );

  const postedAt = useMemo(() => postedAtByMsgId(timeline.frames), [timeline]);
  const finalState = useMemo(() => stateAtStep(timeline, timeline.frames.length), [timeline]);
  const finalOrder = finalState.order;
  const visibleFinalIds = useMemo(
    () => new Set(finalOrder.filter((id) => finalState.msgs.get(id)?.deleted === null)),
    [finalOrder, finalState],
  );
  const seps = useMemo(
    () => dateSeparators(finalOrder, postedAt, t0, locale, tz),
    [finalOrder, postedAt, t0, locale, tz],
  );
  const typing = useMemo(() => draftIntervals(timeline), [timeline]);
  const seq = useMemo(() => fullSequence(finalOrder, seps, typing), [finalOrder, seps, typing]);

  // `demo`: the script plays itself (core Playhead, same rAF-driven contract as
  // element/chat-sim-element.ts's play()). `live`: frozen at the final step — the script is this
  // widget's seeded history, not something to replay for a visitor who's about to type into it.
  const [step, setStep] = useState(mode === 'demo' ? 0 : timeline.frames.length);

  useEffect(() => {
    if (mode !== 'demo') return;
    const ph = createPlayhead(timeline);
    const unsubscribe = ph.onFrame((_state, t) => {
      let s = 0;
      while (s < timeline.frames.length && timeline.frames[s].t <= t) s++;
      setStep(s);
    });
    ph.play();
    return () => {
      unsubscribe();
      ph.pause();
    };
  }, [mode, timeline]);

  const visibleStepIds = useMemo(() => visibleAt(timeline, step), [timeline, step]);
  const visibleIds = mode === 'demo' ? visibleStepIds : visibleFinalIds;

  const [liveMessages, setLiveMessages] = useState<RenderMessage[]>([]);
  const liveMsgCounter = useRef(0);
  const logRef = useRef<HTMLOListElement>(null);

  const handleLiveSend = (text: string): void => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const rm: RenderMessage = {
      id: `live${liveMsgCounter.current++}`,
      by: liveActorId,
      text: trimmed,
      atLabel: formatTime(t0, Date.now() - t0, locale, tz),
      receipt: 'sent',
      views: 0,
      reactions: [],
    };
    setLiveMessages((prev) => [...prev, rm]);
    onLiveSend?.(trimmed);
  };

  const rootClass = ['cf-chat-sim', className].filter(Boolean).join(' ');

  return (
    <div
      className={rootClass}
      data-wallpaper={adapter.wallpaper}
      role="log"
      data-mode={mode}
      style={mode === 'live' ? LIVE_ROOT_STYLE : undefined}
    >
      <MessageThread
        finalOrder={finalOrder}
        seq={seq}
        visibleIds={visibleIds}
        step={step}
        msgs={finalState.msgs}
        postedAt={postedAt}
        adapter={adapter}
        locale={locale}
        tz={tz}
        t0={t0}
        editedLabel={editedLabel}
        contactName={contactName}
        contactStatus={contactStatus}
        extraMessages={mode === 'live' ? liveMessages : EMPTY_EXTRA}
        logRef={mode === 'live' ? logRef : undefined}
      />
      {mode === 'demo' ? (
        <DemoComposer />
      ) : (
        <LiveComposer placeholder={composerPlaceholder} onSend={handleLiveSend} logRef={logRef} />
      )}
    </div>
  );
}

const EMPTY_EXTRA: readonly RenderMessage[] = [];

function visibleAt(timeline: Timeline, step: number): Set<string> {
  const state = stateAtStep(timeline, step);
  return new Set(state.order.filter((id) => state.msgs.get(id)?.deleted === null));
}
