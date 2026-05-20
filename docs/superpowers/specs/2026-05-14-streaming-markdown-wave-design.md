# Streaming Markdown Wave — Design

**Status:** Approved (2026-05-14) · **Owner:** @cofoundy/ui · **Author:** Andre / Claude (brainstorm)

## Context

The `@cofoundy/ui` chat-widget (used by TimelyAI, ChatWidgetFloating on the landing, future products) currently appends LLM streaming deltas directly to message state. High-inference LLMs produce chunky deltas (~40 chars / 500ms), which renders visibly "brusco" — chunks pop in.

A playground at `src/stories/chat-widget/StreamingAnimation.stories.tsx` prototyped six strategies. The team picked **Strategy 5 — Adaptive Wave**: rAF-driven drip rate proportional to backlog, with per-char blur fade-in. The aesthetic is the differentiating premium element.

The prototype splits content at `\n\n` boundaries: closed paragraphs render through `MessageContent` (markdown), the in-flight paragraph renders as per-char wave spans (plain text). When `\n\n` arrives, the in-flight paragraph "promotes" to markdown — this transition is the visible **flicker** we need to eliminate.

## Goals

1. **Zero promotion flicker.** Markdown styling appears progressively as syntax closes; no DOM remount of committed characters.
2. **Per-char wave preserved throughout the stream**, not just on completed blocks.
3. **Adaptive drip rate** based on incoming cadence (already prototyped — generalize and extract).
4. **Reusable** as a primitive: `useStreamingDrip` hook + `<StreamingMarkdown>` component.
5. **Bundle-safe.** No new heavy dependencies (~25kb framer-motion is too expensive for a leaf dep used in landing pages).
6. **Accessible.** Respect `prefers-reduced-motion`.

## Non-goals

- Real-time markdown validation. We assume the backend produces valid markdown eventually.
- Stream resilience (network reconnect, retries) — handled by the transport layer.
- Math, diagrams, custom rehype plugins. Out of scope for chat.

## Architecture

### Four layers

1. **Drip layer** (`useStreamingDrip` hook). Tracks cumulative `content` and rAF-controlled `displayedLen`. Returns `{ displayed, isCatchingUp }`. Replaces the inline rAF loops in the playground strategies.
2. **Markdown render layer** (`<StreamingMarkdown>` component). Renders `displayed` via `react-markdown` (already a dependency: `^10.1.0`) with custom component overrides for every block and inline element.
3. **Per-char span layer.** Inside each component override, walk children and emit `<StreamSpan>` per character. Stable React key = source AST offset.
4. **Style transition layer** (CSS). When a span's wrapper changes (`<span>` becomes `<strong><span></strong>` when `**` closes), `font-weight` / `font-style` / `background` transitions over 180ms — the styling change animates, not snaps.

### Stable key strategy (the core mechanism)

ReactMarkdown v9+ passes a `node` prop to each custom component, containing `position.start.offset` (source character offset). For each text leaf:

```tsx
function emitChars(text: string, baseOffset: number) {
  return Array.from(text).map((ch, i) => (
    <StreamSpan key={baseOffset + i} char={ch} />
  ));
}
```

Across re-renders, the character at source offset N keeps the same key. React preserves the mounted span. Its CSS animation runs **once on mount** and then stays static — no restart when surrounding content grows.

When a marker (`**`, `` ` ``, `*`, `[`, `]`, `(`, `)`) gets consumed by the parser (e.g., `**Hello**` resolves to `<strong>Hello</strong>`), the marker chars no longer appear in the AST output. They unmount.

### Marker exit animation (no framer-motion)

To avoid a "pop" when marker chars unmount, we maintain a phantom map:

```ts
type Phantom = { offset: number; char: string; bornAt: number };
const phantoms = useRef<Map<number, Phantom>>(new Map());
```

On each AST diff (effectively each render), identify chars that were rendered in the previous tree but aren't in the new one (marker offsets). Push them to `phantoms` with `bornAt = performance.now()`. Render phantoms with class `cf-stream-char-exit` (opacity 1→0 animation, 100ms). Schedule unmount via `setTimeout(exitMs)`.

Phantom rendering position: inline at their original offset (siblings of the surrounding committed chars). They occupy zero space after fade since they're being removed — acceptable visual jitter? **Resolved:** render phantoms with `display: inline-block; width: 0; overflow: visible;` so their disappearance doesn't reflow. The marker glyph is visually overlaid during its 100ms exit.

### Component hierarchy

```
<StreamingMarkdown content={displayed} isStreaming fadeMs blurPx>
  └── <ReactMarkdown components={STREAM_COMPONENTS}>
        ├── StreamP({ node, children }) → <p>{walk(children)}</p>
        ├── StreamStrong({ node, children }) → <strong>{walk(children)}</strong>
        ├── StreamEm({ node, children }) → <em>{walk(children)}</em>
        ├── StreamCode({ node, children }) → <code>{walk(children)}</code>
        ├── StreamH2 / H3 / H4 / ...
        ├── StreamUl / StreamOl / StreamLi
        ├── StreamA({ node, children, href }) → <a href>{walk(children)}</a>
        ├── StreamBlockquote
        └── StreamPre (atomic — no per-char animation; reveal as a block)
```

Phantoms (marker chars in exit animation) render **inline** at their original source offset, as siblings of the committed spans — not as an absolute overlay. `display: inline-block; width: 0; overflow: visible;` lets the marker glyph fade visually without occupying width, so its disappearance doesn't reflow neighboring text.

`walk(children)` recurses through React children. Cases:
- **string leaf:** split into chars; emit `<StreamSpan key={offsetCursor + i}>` per char; advance `offsetCursor`.
- **React element** (already wrapped by a component override like `<strong>`): return as-is. The element's own override handles its inner walk.
- **`React.Fragment` or array:** flatten and recurse.
- **null / boolean / number:** skip.

The `offsetCursor` for each component override is seeded from `node.position.start.offset` (passed by react-markdown). Inline child elements (`<strong>`) carry their own `node.position`, so each subtree computes offsets independently — no offset propagation needed across siblings.

### `<StreamSpan>` component

```tsx
const StreamSpan = memo(({ char }: { char: string }) => (
  <span className="cf-stream-char">{char}</span>
));
```

`key` is set by the parent walker. Animation runs on mount via CSS:

```css
@keyframes cf-stream-char-wave {
  from { opacity: 0; filter: blur(var(--cf-blur, 4px)); transform: translateY(2px); }
  to   { opacity: 1; filter: blur(0); transform: translateY(0); }
}
.cf-stream-char {
  animation: cf-stream-char-wave var(--cf-fade, 220ms) ease-out both;
  display: inline-block;
  white-space: pre;
}
.cf-stream-char-exit {
  animation: cf-stream-char-exit 100ms ease-in forwards;
  display: inline-block;
  width: 0;
  overflow: visible;
}
@keyframes cf-stream-char-exit { to { opacity: 0; } }

/* Style change transitions inherited from wrappers */
.cf-stream-char {
  transition: color 180ms, background-color 180ms;
}
strong > .cf-stream-char,
em > .cf-stream-char,
code > .cf-stream-char {
  /* inherited weight/style is naturally animated by browser when wrapper appears */
}
```

Font-weight transition note: browsers transition `font-weight` continuously only for variable fonts. Inter (Cofoundy's display font) supports variable axes — confirm at implementation time. If not animatable, fall back to opacity cross-fade on the wrapper itself: when `<strong>` first appears, fade-in over 180ms (overlapping any per-char wave still in flight).

### Hook API

```ts
type DripMode = 'adaptive' | 'typewriter' | 'off';

interface UseStreamingDripOptions {
  isStreaming: boolean;
  mode?: DripMode;            // default 'adaptive'
  cps?: number;                // typewriter-mode fixed rate, default 60
  minCps?: number;             // adaptive floor, default 30
  maxCps?: number;             // adaptive ceiling, default 160
  targetLagMs?: number;        // adaptive target, default 150
}

function useStreamingDrip(
  content: string,
  opts: UseStreamingDripOptions
): { displayed: string; isCatchingUp: boolean };
```

When `mode: 'off'` or `!isStreaming`, returns `{ displayed: content, isCatchingUp: false }` (passthrough).

### Component API

```tsx
<StreamingMarkdown
  content={displayed}
  isStreaming={isCatchingUp}
  fadeMs={220}
  blurPx={4}
  charExitMs={100}
  reduceMotion="auto"   // 'auto' | 'always' | 'never'
/>
```

When `isStreaming` is false (idle), bypass the wave logic and render via plain `<MessageContent>` for performance.

### Reduced motion

If `reduceMotion === 'always'` OR (`reduceMotion === 'auto'` AND `window.matchMedia('(prefers-reduced-motion: reduce)').matches`):
- Skip drip entirely (`displayed = content`).
- Render via plain `<MessageContent>`.
- No wave, no phantoms.

## Components to ship

| File | Type | Status |
|------|------|--------|
| `src/hooks/useStreamingDrip.ts` | hook | new |
| `src/components/messaging/primitives/StreamingMarkdown.tsx` | component | new |
| `src/components/messaging/primitives/StreamSpan.tsx` | internal component | new |
| `src/components/messaging/primitives/stream-components.tsx` | overrides for p/h2/strong/em/code/a/ul/ol/li/blockquote/pre | new |
| `src/styles/index.css` | keyframes `cf-stream-char-wave`, `cf-stream-char-exit` + reduced-motion media query | append |
| `src/components/chat-widget/Message.tsx` | switch to `<StreamingMarkdown>` when `isStreaming && id === streamingMessageId` | modify |
| `src/stories/chat-widget/StreamingAnimation.stories.tsx` | add Strategy 6 "Adaptive Wave + MD" using `<StreamingMarkdown>` | modify |
| `src/__tests__/hooks/useStreamingDrip.test.ts` | vitest | new |
| `src/__tests__/components/StreamingMarkdown.test.tsx` | vitest | new |
| `src/index.ts` | export new component + hook | modify |

## Data flow

```
LLM stream → transport.onToken(delta) → appendToStreamingMessage(delta)
                                          ↓
                            chatStore.messages[].content (cumulative)
                                          ↓
Message.tsx { message, isStreaming, streamingMessageId }
                                          ↓
if isStreaming && message.id === streamingMessageId:
   useStreamingDrip(message.content, opts) → { displayed, isCatchingUp }
   <StreamingMarkdown content={displayed} isStreaming={isCatchingUp} />
else:
   <MessageContent content={message.content} format="markdown" />
                                          ↓
                           ReactMarkdown → STREAM_COMPONENTS
                                          ↓
                           per-char <StreamSpan key={srcOffset}>
                                          ↓
                            CSS wave animation on mount
```

## Error handling

- **Invalid markdown chunks during stream.** ReactMarkdown handles gracefully (unclosed markers render as literal text). No special handling needed; the natural progression of the stream resolves them.
- **Empty content.** Component renders nothing.
- **Stream reset / replay.** Consumer changes a React `key` prop on `<StreamingMarkdown>` to force a full remount. Phantoms are flushed.
- **Content shrinks** (shouldn't happen in append-only stream, but defensive): drip layer detects and resets `displayedLen` to 0; phantoms flushed.
- **Content > 5000 chars.** Skip per-char rendering; fall back to `<MessageContent>` (with a single block fade-in on first mount). Hard cutoff prevents DOM bloat.

## Testing

### Vitest (`src/__tests__/`)

1. `useStreamingDrip`:
   - mode=`off` is passthrough
   - mode=`typewriter` drips at constant cps
   - mode=`adaptive` clamps within `[minCps, maxCps]`
   - adaptive accelerates when backlog grows
   - `prefers-reduced-motion` collapses to passthrough
2. `<StreamingMarkdown>`:
   - rendered DOM has one `<span class="cf-stream-char">` per char
   - keys remain stable when content grows
   - marker chars produce phantom spans on consumption (assert `.cf-stream-char-exit` count increments)
   - content > 5000 chars falls back to `<MessageContent>` path

### Storybook (`src/stories/chat-widget/StreamingAnimation.stories.tsx`)

Add **Strategy 6 — Adaptive Wave + MD** using the new component. Keep Strategy 5 for visual regression comparison. Verify across all four cadences (smooth / chunky / slow / realistic).

### Chromatic visual regression

Snapshot at fixed drip positions (25 %, 50 %, 75 %, 100 %) of a representative message. Triggers on PR.

### Manual QA

- TimelyAI dev environment: send a markdown-heavy reply, verify no flicker.
- ChatWidgetFloating on landing: same.
- Throttle CPU to 4× slowdown; verify drip stays smooth.

## Migration path

1. Build `useStreamingDrip` and `<StreamingMarkdown>` alongside existing `MessageContent`. No breaking changes.
2. Update `Message.tsx` to use the new component **only when streaming**; idle messages keep the cheap `MessageContent` path.
3. Add Storybook Strategy 6 for visual A/B against Strategy 5.
4. Ship to TimelyAI + ChatWidgetFloating in the next ui release.
5. Adopt in InboxAI's `InboxMessage` when streaming arrives there.

## Open questions

| Q | Resolution |
|---|------------|
| framer-motion vs custom exit animation? | Custom (bundle weight: ~25 kb saved). |
| Direct `remark-parse` vs `react-markdown` component overrides? | `react-markdown` overrides — less code, leverages existing dep, supports remark-gfm. |
| Variable-font `font-weight` transition support? | Confirm at impl time. Inter has variable axes; fallback to opacity cross-fade on wrapper if needed. |
| Per-char animation for code blocks (`<pre>`)? | No — treated as atomic block reveal. Reading code char-by-char is annoying. |

## References & Research Sources

External (fetched 2026-05-12, web search):

- [Smooth Text Streaming in AI SDK v5 — Upstash](https://upstash.com/blog/smooth-streaming) — validates the decoupled drip pattern; recommends ~200 cps cap for readability.
- [Flowtoken (GitHub)](https://github.com/Ephibbs/flowtoken) — existing React lib; doesn't match our wave+markdown aesthetic, but confirms the buffer+drip pattern is industry standard.
- [Typewriter — Motion.dev](https://motion.dev/docs/react-typewriter) — minimalist alternative; pure typewriter, no wave or markdown smoothing.
- [Streaming Text Like an LLM with TypeIt — Alex MacArthur](https://macarthur.me/posts/streaming-text-with-typeit/) — single-strategy primer.

Internal:

- `src/stories/chat-widget/StreamingAnimation.stories.tsx` — the playground; Strategy 5 chosen as base aesthetic.
- `src/components/messaging/primitives/MessageContent.tsx` — current markdown render path; the component overrides here are the starting point for `stream-components.tsx`.
- `src/stores/chatStore.ts` — `appendToStreamingMessage` is where deltas land in state; `streamingMessageId` flags the live message.
- `src/components/chat-widget/Message.tsx` — consumer that must branch on `isStreaming`.
- `packages/ui/CLAUDE.md` — component patterns + theming requirements (CSS variables, `data-slot`, CVA where applicable).
