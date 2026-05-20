import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useRef, useState } from 'react';
import { MessageContent } from '../../components/messaging/primitives/MessageContent';
import { StreamingMarkdown } from '../../components/messaging/primitives/StreamingMarkdown';
import { useStreamingDrip } from '../../hooks/useStreamingDrip';
import { cn } from '../../utils/cn';

// ---------------------------------------------------------------------------
// Sample content — markdown, mixed length (~600 chars)
// ---------------------------------------------------------------------------
const SAMPLE = `## Opciones de Landing Page

Para tu negocio, te recomendaría una landing con estas secciones:

- **Hero** con propuesta de valor clara
- *Testimonios* de clientes reales
- Pricing con \`tres tiers\` (básico, pro, enterprise)
- CTA flotante para agendar demo

Trabajamos con **Next.js + Tailwind** y entregamos en 5-7 días hábiles. ¿Quieres que te mande un ejemplo del último que hicimos para una startup similar?`;

// ---------------------------------------------------------------------------
// Cadence simulators — emit chunks into a growing string
// ---------------------------------------------------------------------------
type Cadence = 'smooth' | 'chunky' | 'slow' | 'realistic';

interface Chunk {
  delay: number; // ms after previous chunk
  size: number; // chars to emit
}

function buildSchedule(text: string, cadence: Cadence): Chunk[] {
  const chunks: Chunk[] = [];
  let i = 0;
  switch (cadence) {
    case 'smooth':
      // 1 char every 20ms (50 cps)
      while (i < text.length) {
        chunks.push({ delay: 20, size: 1 });
        i++;
      }
      break;
    case 'chunky':
      // ~40 chars every 500ms — the "brusco" worst case
      while (i < text.length) {
        const size = Math.min(40, text.length - i);
        chunks.push({ delay: 500, size });
        i += size;
      }
      break;
    case 'slow':
      // 2 chars every 200ms (10 cps)
      while (i < text.length) {
        const size = Math.min(2, text.length - i);
        chunks.push({ delay: 200, size });
        i += size;
      }
      break;
    case 'realistic': {
      // First big burst (high inference start), then mixed
      const first = Math.min(60, text.length);
      chunks.push({ delay: 100, size: first });
      i += first;
      while (i < text.length) {
        const size = Math.min(2 + Math.floor(Math.random() * 8), text.length - i);
        const delay = 80 + Math.floor(Math.random() * 220);
        chunks.push({ delay, size });
        i += size;
      }
      break;
    }
  }
  return chunks;
}

function useStreamSimulator(text: string, cadence: Cadence, playKey: number) {
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    setContent('');
    setIsStreaming(true);
    const schedule = buildSchedule(text, cadence);
    let cancelled = false;
    let i = 0;
    let pos = 0;

    const tick = () => {
      if (cancelled || i >= schedule.length) {
        if (!cancelled) setIsStreaming(false);
        return;
      }
      const chunk = schedule[i++];
      window.setTimeout(() => {
        if (cancelled) return;
        pos += chunk.size;
        setContent(text.slice(0, pos));
        tick();
      }, chunk.delay);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [text, cadence, playKey]);

  return { content, isStreaming };
}

// ---------------------------------------------------------------------------
// Strategies
// ---------------------------------------------------------------------------

// S0: None (control) — pass-through
function StrategyNone({ content }: { content: string }) {
  return <MessageContent content={content} format="markdown" />;
}

// S1: Typewriter — fixed cps drip via rAF
function StrategyTypewriter({ content, cps }: { content: string; cps: number }) {
  const [displayed, setDisplayed] = useState('');
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const accumRef = useRef<number>(0);
  const contentRef = useRef(content);
  contentRef.current = content;

  useEffect(() => {
    const loop = (t: number) => {
      const last = lastTimeRef.current || t;
      const dt = t - last;
      lastTimeRef.current = t;
      accumRef.current += (dt / 1000) * cps;
      const chars = Math.floor(accumRef.current);
      if (chars > 0) {
        accumRef.current -= chars;
        setDisplayed((prev) => {
          const target = contentRef.current;
          if (prev.length >= target.length) return prev;
          return target.slice(0, Math.min(target.length, prev.length + chars));
        });
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [cps]);

  return <MessageContent content={displayed} format="markdown" />;
}

// S2: Fade — render chunks with fade-in animation on mount
function StrategyFade({ content, fadeMs }: { content: string; fadeMs: number }) {
  const [chunks, setChunks] = useState<string[]>([]);
  const prevLenRef = useRef(0);

  useEffect(() => {
    if (content.length > prevLenRef.current) {
      const newPart = content.slice(prevLenRef.current);
      setChunks((prev) => [...prev, newPart]);
      prevLenRef.current = content.length;
    } else if (content.length === 0) {
      setChunks([]);
      prevLenRef.current = 0;
    }
  }, [content]);

  // Render as plain text with span chunks (markdown re-render per chunk would
  // remount everything and lose the per-chunk animation). Trade-off documented.
  return (
    <div className="prose prose-sm max-w-none text-inherit whitespace-pre-wrap">
      {chunks.map((c, i) => (
        <span
          key={i}
          className="cf-stream-chunk"
          style={{ animationDuration: `${fadeMs}ms` }}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

// S3: Adaptive — rAF loop, drip rate scales with backlog, target lag
function StrategyAdaptive({
  content,
  targetLagMs,
  minCps,
  maxCps,
}: {
  content: string;
  targetLagMs: number;
  minCps: number;
  maxCps: number;
}) {
  const [displayed, setDisplayed] = useState('');
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const accumRef = useRef<number>(0);
  const contentRef = useRef(content);
  contentRef.current = content;

  useEffect(() => {
    const loop = (t: number) => {
      const last = lastTimeRef.current || t;
      const dt = t - last;
      lastTimeRef.current = t;
      setDisplayed((prev) => {
        const target = contentRef.current;
        const gap = target.length - prev.length;
        if (gap <= 0) return prev;
        // Effective cps: enough to clear backlog in targetLagMs, clamped
        const desiredCps = Math.max(minCps, Math.min(maxCps, (gap / targetLagMs) * 1000));
        accumRef.current += (dt / 1000) * desiredCps;
        const chars = Math.floor(accumRef.current);
        if (chars <= 0) return prev;
        accumRef.current -= chars;
        return target.slice(0, Math.min(target.length, prev.length + chars));
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetLagMs, minCps, maxCps]);

  return <MessageContent content={displayed} format="markdown" />;
}

// S5: Adaptive + Wave — same drip as Adaptive but each char fades in with blur
// Trade-off: plain text only (per-char spans break markdown rendering).
function StrategyAdaptiveWave({
  content,
  targetLagMs,
  minCps,
  maxCps,
  fadeMs,
  blurPx,
}: {
  content: string;
  targetLagMs: number;
  minCps: number;
  maxCps: number;
  fadeMs: number;
  blurPx: number;
}) {
  const [displayedLen, setDisplayedLen] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const accumRef = useRef<number>(0);
  const contentRef = useRef(content);
  contentRef.current = content;

  useEffect(() => {
    const loop = (t: number) => {
      const last = lastTimeRef.current || t;
      const dt = t - last;
      lastTimeRef.current = t;
      setDisplayedLen((prev) => {
        const target = contentRef.current.length;
        const gap = target - prev;
        if (gap <= 0) return prev;
        const desiredCps = Math.max(minCps, Math.min(maxCps, (gap / targetLagMs) * 1000));
        accumRef.current += (dt / 1000) * desiredCps;
        const chars = Math.floor(accumRef.current);
        if (chars <= 0) return prev;
        accumRef.current -= chars;
        return Math.min(target, prev + chars);
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetLagMs, minCps, maxCps]);

  const visible = content.slice(0, displayedLen);
  const isComplete = displayedLen === content.length && content.length > 0;

  // Paragraph-boundary split: closed paragraphs (terminated by \n\n) go through
  // markdown renderer; the in-flight paragraph renders as per-char wave spans.
  // On completion, everything promotes to markdown.
  let splitAt: number;
  if (isComplete) {
    splitAt = visible.length;
  } else {
    const lastBreak = visible.lastIndexOf('\n\n');
    splitAt = lastBreak === -1 ? 0 : lastBreak + 2;
  }
  const committed = visible.slice(0, splitAt);
  const tail = visible.slice(splitAt);

  return (
    <div style={{ ['--cf-blur' as string]: `${blurPx}px` }}>
      {committed && <MessageContent content={committed} format="markdown" />}
      {tail && (
        <div className="prose prose-sm max-w-none text-inherit whitespace-pre-wrap">
          {tail.split('').map((c, i) => (
            <span
              key={splitAt + i}
              className="cf-stream-char"
              style={{ animationDuration: `${fadeMs}ms` }}
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// S4: Per-word — emit on word boundaries, each word fades in
function StrategyPerWord({ content, fadeMs }: { content: string; fadeMs: number }) {
  const [committed, setCommitted] = useState<string[]>([]);
  // Hold partial word until a whitespace boundary arrives
  useEffect(() => {
    if (content.length === 0) {
      setCommitted([]);
      return;
    }
    // Split content into tokens including whitespace runs
    const tokens = content.match(/\S+\s+|\S+$|\s+/g) ?? [];
    // Commit all complete tokens (end with whitespace) and hold the last one if no trailing ws
    const trailingWs = /\s$/.test(content);
    const commitCount = trailingWs ? tokens.length : tokens.length - 1;
    const safe = tokens.slice(0, Math.max(0, commitCount));
    setCommitted((prev) => {
      if (safe.length === prev.length) return prev;
      return safe;
    });
  }, [content]);

  return (
    <div className="prose prose-sm max-w-none text-inherit whitespace-pre-wrap">
      {committed.map((w, i) => (
        <span
          key={i}
          className="cf-stream-chunk"
          style={{ animationDuration: `${fadeMs}ms` }}
        >
          {w}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------

const STRATEGIES = [
  { key: 'none', label: '0 · None (control)' },
  { key: 'typewriter', label: '1 · Typewriter (B)' },
  { key: 'fade', label: '2 · Fade (A)' },
  { key: 'adaptive', label: '3 · Adaptive (C)' },
  { key: 'perword', label: '4 · Per-word (D)' },
  { key: 'wave', label: '5 · Adaptive Wave ★' },
  { key: 'wavemd', label: '6 · Wave + MD ★★' },
] as const;

// Strategy 6: real production path — useStreamingDrip + <StreamingMarkdown>
function StrategyWaveMD({
  content,
  isStreaming,
  targetLagMs,
  minCps,
  maxCps,
  fadeMs,
  blurPx,
}: {
  content: string;
  isStreaming: boolean;
  targetLagMs: number;
  minCps: number;
  maxCps: number;
  fadeMs: number;
  blurPx: number;
}) {
  const { displayed, isCatchingUp } = useStreamingDrip(content, {
    isStreaming,
    mode: 'adaptive',
    minCps,
    maxCps,
    targetLagMs,
  });
  return (
    <StreamingMarkdown
      content={displayed}
      isStreaming={isCatchingUp}
      fadeMs={fadeMs}
      blurPx={blurPx}
    />
  );
}

interface PlaygroundArgs {
  cadence: Cadence;
  cps: number;
  fadeMs: number;
  targetLagMs: number;
  minCps: number;
  maxCps: number;
  blurPx: number;
  content: string;
}

function Bubble({
  title,
  children,
  isStreaming,
}: {
  title: string;
  children: React.ReactNode;
  isStreaming: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between text-[11px] text-[var(--chat-muted)] uppercase tracking-wide">
        <span>{title}</span>
        {isStreaming && (
          <span className="text-[var(--chat-primary)]">● streaming</span>
        )}
      </div>
      <div className="bg-[var(--chat-card-hover)] text-[var(--chat-foreground)] rounded-2xl rounded-tl-sm px-4 py-3 min-h-[280px] text-sm">
        {children}
      </div>
    </div>
  );
}

function Playground(args: PlaygroundArgs) {
  const [playKey, setPlayKey] = useState(0);
  const { content, isStreaming } = useStreamSimulator(args.content, args.cadence, playKey);

  return (
    <div className="w-full">
      {/* Local styles for chunk + per-char fade-in */}
      <style>{`
        @keyframes cf-stream-fade {
          from { opacity: 0; filter: blur(2px); }
          to { opacity: 1; filter: blur(0); }
        }
        @keyframes cf-stream-char-wave {
          from {
            opacity: 0;
            filter: blur(var(--cf-blur, 4px));
            transform: translateY(2px);
          }
          to {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0);
          }
        }
        .cf-stream-chunk {
          animation-name: cf-stream-fade;
          animation-timing-function: ease-out;
          animation-fill-mode: both;
          display: inline;
        }
        .cf-stream-char {
          animation-name: cf-stream-char-wave;
          animation-timing-function: ease-out;
          animation-fill-mode: both;
          display: inline-block;
          white-space: pre;
        }
      `}</style>

      {/* Header: simulator status + replay */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-[var(--chat-card)] rounded-lg border border-[var(--chat-border)]">
        <button
          onClick={() => setPlayKey((k) => k + 1)}
          className="px-3 py-1.5 bg-[var(--chat-primary)] text-[var(--chat-on-primary,white)] rounded-md text-sm font-medium hover:opacity-90"
        >
          ▶ Replay
        </button>
        <div className="text-xs text-[var(--chat-muted)] flex gap-4">
          <span>
            cadence: <strong className="text-[var(--chat-foreground)]">{args.cadence}</strong>
          </span>
          <span>
            chars: <strong className="text-[var(--chat-foreground)]">
              {content.length}/{args.content.length}
            </strong>
          </span>
          <span>
            status:{' '}
            <strong className={cn(isStreaming ? 'text-[var(--chat-primary)]' : 'text-[var(--chat-muted)]')}>
              {isStreaming ? 'streaming' : 'done'}
            </strong>
          </span>
        </div>
      </div>

      {/* Grid of strategies */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {STRATEGIES.map(({ key, label }) => (
          <Bubble key={key} title={label} isStreaming={isStreaming}>
            {key === 'none' && <StrategyNone content={content} />}
            {key === 'typewriter' && (
              <StrategyTypewriter key={playKey} content={content} cps={args.cps} />
            )}
            {key === 'fade' && (
              <StrategyFade key={playKey} content={content} fadeMs={args.fadeMs} />
            )}
            {key === 'adaptive' && (
              <StrategyAdaptive
                key={playKey}
                content={content}
                targetLagMs={args.targetLagMs}
                minCps={args.minCps}
                maxCps={args.maxCps}
              />
            )}
            {key === 'perword' && (
              <StrategyPerWord key={playKey} content={content} fadeMs={args.fadeMs} />
            )}
            {key === 'wave' && (
              <StrategyAdaptiveWave
                key={playKey}
                content={content}
                targetLagMs={args.targetLagMs}
                minCps={args.minCps}
                maxCps={args.maxCps}
                fadeMs={args.fadeMs}
                blurPx={args.blurPx}
              />
            )}
            {key === 'wavemd' && (
              <StrategyWaveMD
                key={playKey}
                content={content}
                isStreaming={isStreaming}
                targetLagMs={args.targetLagMs}
                minCps={args.minCps}
                maxCps={args.maxCps}
                fadeMs={args.fadeMs}
                blurPx={args.blurPx}
              />
            )}
          </Bubble>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 text-xs text-[var(--chat-muted)] space-y-1">
        <p>
          <strong>0 None</strong>: append directo, baseline brusco. Replica el comportamiento
          actual de <code>appendToStreamingMessage</code>.
        </p>
        <p>
          <strong>1 Typewriter</strong>: drip a cps fijo. Suave pero acumula lag con streams
          rápidos.
        </p>
        <p>
          <strong>2 Fade</strong>: chunks aparecen instant con opacity+blur ramp. Sin lag, suaviza
          el "pop".
        </p>
        <p>
          <strong>3 Adaptive</strong>: drip rate proporcional al backlog. Target {args.targetLagMs}
          ms de lag, clamp [{args.minCps}, {args.maxCps}] cps.
        </p>
        <p>
          <strong>4 Per-word</strong>: commit en word boundaries con fade. Mantiene parciales
          ocultos hasta cerrar palabra.
        </p>
        <p>
          <strong>5 Adaptive Wave ★</strong>: prototype con split por `\n\n`. Wave per char
          en el tail (plain), markdown solo en bloques cerrados. Flicker visible al promote.
        </p>
        <p>
          <strong>6 Wave + MD ★★</strong>: producto final — <code>useStreamingDrip</code> +{' '}
          <code>StreamingMarkdown</code>. Walker sobre hast tree con keys = source offsets,
          markdown progresivo (bold/italic/code aparecen via className change), spans
          mantienen mount state. Cero promotion flicker.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Storybook meta
// ---------------------------------------------------------------------------
const meta: Meta<typeof Playground> = {
  title: 'Chat/Streaming Animation Playground',
  component: Playground,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="w-full p-6 bg-[var(--chat-background)] min-h-screen">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    cadence: {
      control: 'inline-radio',
      options: ['smooth', 'chunky', 'slow', 'realistic'] satisfies Cadence[],
    },
    cps: { control: { type: 'range', min: 10, max: 200, step: 5 } },
    fadeMs: { control: { type: 'range', min: 50, max: 600, step: 25 } },
    targetLagMs: { control: { type: 'range', min: 50, max: 500, step: 25 } },
    minCps: { control: { type: 'range', min: 5, max: 80, step: 5 } },
    maxCps: { control: { type: 'range', min: 60, max: 400, step: 10 } },
    blurPx: { control: { type: 'range', min: 0, max: 12, step: 1 } },
    content: { control: 'text' },
  },
  args: {
    cadence: 'chunky',
    cps: 60,
    fadeMs: 220,
    targetLagMs: 150,
    minCps: 30,
    maxCps: 160,
    blurPx: 4,
    content: SAMPLE,
  },
};

export default meta;
type Story = StoryObj<typeof Playground>;

export const AllStrategies: Story = {};

export const ChunkyBurst: Story = {
  args: { cadence: 'chunky' },
  parameters: {
    docs: {
      description: {
        story:
          'El caso brusco: 40 chars cada 500ms. Compara None vs las 4 estrategias para ver cómo cada una suaviza el "pop".',
      },
    },
  },
};

export const SmoothStream: Story = {
  args: { cadence: 'smooth' },
};

export const RealisticStream: Story = {
  args: { cadence: 'realistic' },
};

export const SlowStream: Story = {
  args: { cadence: 'slow' },
};
