"use client";

import { memo, useMemo, useRef } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../../../utils/cn";
import { MessageContent } from "./MessageContent";

const HARD_LIMIT = 5000;

export interface StreamingMarkdownProps {
  content: string;
  /** Whether the stream is still in flight (drip catching up). */
  isStreaming?: boolean;
  fadeMs?: number;
  blurPx?: number;
  className?: string;
  isUser?: boolean;
  /** 'auto' respects prefers-reduced-motion. Default 'auto'. */
  reduceMotion?: "auto" | "always" | "never";
}

/**
 * Streaming-aware markdown renderer.
 *
 * Walks the hast tree (via react-markdown component overrides) and emits per-char
 * <span> elements with stable keys (absolute source offsets). When markdown
 * structure changes mid-stream (e.g., `**` closes and wraps text in <strong>),
 * the span keys stay constant — React keeps them mounted, only their className
 * changes, and CSS transitions smooth the styling shift.
 *
 * Falls back to plain MessageContent when:
 *  - isStreaming is false
 *  - prefers-reduced-motion
 *  - content exceeds HARD_LIMIT chars
 */
export const StreamingMarkdown = memo(function StreamingMarkdown({
  content,
  isStreaming = true,
  fadeMs = 220,
  blurPx = 4,
  className,
  isUser = false,
  reduceMotion = "auto",
}: StreamingMarkdownProps) {
  const prefersReducedMotion =
    reduceMotion === "always" ||
    (reduceMotion === "auto" &&
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

  // Hard escape hatches: reduced motion (accessibility) and oversized content
  // (perf). For these, render via plain MessageContent — we still want the
  // markdown to display, just without the per-char wave overhead.
  const useFallback =
    prefersReducedMotion || content.length > HARD_LIMIT;

  if (useFallback) {
    return (
      <MessageContent
        content={content}
        format="markdown"
        className={className}
        isUser={isUser}
      />
    );
  }

  // Always use the streaming render path — toggle the `isStreaming` class on
  // the wrapper so completed spans freeze in place. This keeps the DOM stable
  // when the stream ends so no flicker or restyle happens at completion.
  return (
    <StreamingMarkdownInner
      content={content}
      isStreaming={isStreaming}
      fadeMs={fadeMs}
      blurPx={blurPx}
      className={className}
      isUser={isUser}
    />
  );
});

interface InnerProps {
  content: string;
  isStreaming: boolean;
  fadeMs: number;
  blurPx: number;
  className?: string;
  isUser: boolean;
}

function StreamingMarkdownInner({
  content,
  isStreaming,
  fadeMs,
  blurPx,
  className,
  isUser,
}: InnerProps) {
  // Walker context: cursor resets at the start of every render and is mutated
  // synchronously as react-markdown calls our component overrides (which is
  // safe because react-markdown renders synchronously during React's render).
  const ctxRef = useRef<WalkerCtx>({ cursor: { value: 0 }, source: "" });
  ctxRef.current.cursor.value = 0;
  ctxRef.current.source = content;

  const components = useMemo<Components>(
    () => buildStreamComponents(isUser, ctxRef.current),
    [isUser],
  );

  return (
    <div
      className={cn(
        "max-w-none text-inherit cf-stream-root",
        isStreaming && "cf-stream-active",
        className,
      )}
      style={
        {
          ["--cf-stream-fade"]: `${fadeMs}ms`,
          ["--cf-stream-blur"]: `${blurPx}px`,
        } as React.CSSProperties
      }
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Walker — emits per-char spans from the hast tree.
// ---------------------------------------------------------------------------

interface HastTextNode {
  type: "text";
  value: string;
  position?: { start: { offset: number } };
}

interface HastElementNode {
  type: "element";
  tagName: string;
  properties?: Record<string, unknown>;
  children: HastNode[];
  position?: { start: { offset: number } };
}

type HastNode = HastTextNode | HastElementNode | { type: string };

interface WalkerCtx {
  /** Mutable cursor: cumulative char index in the source markdown.
   *  Reset to 0 at the start of every render of StreamingMarkdownInner. */
  cursor: { value: number };
  /** Full source content — used for index-of fallback when AST position is missing. */
  source: string;
}

/**
 * Walk the hast tree and emit a **flat** array of per-char spans. Inline
 * markdown (strong/em/code/strike) is applied as className modifiers on the
 * spans, NOT as wrapper elements. This keeps each char's React parent stable
 * across renders when markers close (the char never changes from a direct
 * child of <p> to a child of <strong>), so React preserves the mount and
 * the wave animation does not replay.
 *
 * Link is the one exception — it stays a wrapper, since <a> has behavior.
 * Re-mount of link inner chars when the link first appears is acceptable.
 */
function walkInline(
  nodes: HastNode[],
  styleStack: string[],
  out: React.ReactNode[],
  ctx: WalkerCtx,
): void {
  for (const node of nodes) {
    if (node.type === "text") {
      const text = (node as HastTextNode).value;
      const pos = (node as HastTextNode).position?.start?.offset;
      // Prefer hast position; fall back to indexOf search from current cursor.
      let base: number;
      if (typeof pos === "number") {
        base = pos;
      } else {
        const found = ctx.source.indexOf(text, ctx.cursor.value);
        base = found >= 0 ? found : ctx.cursor.value;
      }
      for (let i = 0; i < text.length; i++) {
        out.push(
          <span
            key={`c-${base + i}`}
            className={cn("cf-stream-char", ...styleStack)}
            data-cf-pos={base + i}
          >
            {text[i]}
          </span>,
        );
      }
      ctx.cursor.value = base + text.length;
      continue;
    }
    if (node.type !== "element") continue;
    const el = node as HastElementNode;
    const tag = el.tagName;
    if (tag === "strong") {
      walkInline(el.children, [...styleStack, "cf-stream-bold"], out, ctx);
    } else if (tag === "em") {
      walkInline(el.children, [...styleStack, "cf-stream-italic"], out, ctx);
    } else if (tag === "code") {
      walkInline(el.children, [...styleStack, "cf-stream-code"], out, ctx);
    } else if (tag === "a") {
      const pos = el.position?.start?.offset ?? ctx.cursor.value;
      const inner: React.ReactNode[] = [];
      walkInline(el.children, styleStack, inner, ctx);
      const href = (el.properties?.href as string | undefined) ?? "#";
      out.push(
        <a
          key={`a-${pos}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80 text-[var(--chat-primary)]"
        >
          {inner}
        </a>,
      );
    } else if (tag === "del" || tag === "s") {
      walkInline(el.children, [...styleStack, "cf-stream-strike"], out, ctx);
    } else {
      walkInline(el.children, styleStack, out, ctx);
    }
  }
}

function hasBlockChildren(node: HastElementNode): boolean {
  return node.children.some(
    (c) =>
      c.type === "element" &&
      ["p", "ul", "ol", "blockquote", "pre"].includes(
        (c as HastElementNode).tagName,
      ),
  );
}

type OverrideProps = { node?: HastElementNode; children?: React.ReactNode };

/** Block-level styling via inline style — avoids dependency on @tailwindcss/typography
 *  and on Tailwind's content-scan picking up this file. */
const BLOCK_STYLES = {
  h1: { fontSize: "1.6em", fontWeight: 700, margin: "0.4em 0 0.3em" },
  h2: { fontSize: "1.35em", fontWeight: 700, margin: "0.4em 0 0.3em" },
  h3: { fontSize: "1.15em", fontWeight: 600, margin: "0.4em 0 0.3em" },
  h4: { fontSize: "1.05em", fontWeight: 600, margin: "0.3em 0 0.2em" },
  h5: { fontSize: "1em", fontWeight: 600, margin: "0.3em 0 0.2em" },
  h6: { fontSize: "1em", fontWeight: 600, margin: "0.3em 0 0.2em" },
  p: { margin: "0 0 0.6em" },
  ul: { listStyle: "disc", paddingLeft: "1.25em", margin: "0 0 0.6em" },
  ol: { listStyle: "decimal", paddingLeft: "1.5em", margin: "0 0 0.6em" },
  li: { margin: "0.15em 0" },
  blockquote: {
    borderLeft: "2px solid var(--chat-muted, #848386)",
    paddingLeft: "0.75em",
    margin: "0.5em 0",
    fontStyle: "italic" as const,
    opacity: 0.9,
  },
  pre: {
    background: "rgba(255,255,255,0.06)",
    padding: "0.5em 0.75em",
    borderRadius: "6px",
    overflowX: "auto" as const,
    margin: "0.5em 0",
    fontFamily: "var(--font-mono, ui-monospace, monospace)",
    fontSize: "0.9em",
  },
  th: {
    fontWeight: 600,
    padding: "0.3em 0.6em",
    borderBottom: "1px solid var(--chat-border, rgba(255,255,255,0.2))",
    textAlign: "left" as const,
  },
  td: {
    padding: "0.2em 0.6em",
    borderBottom: "1px solid var(--chat-border, rgba(255,255,255,0.08))",
  },
} satisfies Record<string, React.CSSProperties>;

function buildStreamComponents(_isUser: boolean, ctx: WalkerCtx): Components {
  function walked(node: HastElementNode | undefined): React.ReactNode[] {
    if (!node) return [];
    const out: React.ReactNode[] = [];
    walkInline(node.children, [], out, ctx);
    return out;
  }

  const map = {
    p: ({ node, children }: OverrideProps) => (
      <p style={BLOCK_STYLES.p}>{node ? walked(node) : children}</p>
    ),
    h1: ({ node, children }: OverrideProps) => (
      <h1 style={BLOCK_STYLES.h1}>{node ? walked(node) : children}</h1>
    ),
    h2: ({ node, children }: OverrideProps) => (
      <h2 style={BLOCK_STYLES.h2}>{node ? walked(node) : children}</h2>
    ),
    h3: ({ node, children }: OverrideProps) => (
      <h3 style={BLOCK_STYLES.h3}>{node ? walked(node) : children}</h3>
    ),
    h4: ({ node, children }: OverrideProps) => (
      <h4 style={BLOCK_STYLES.h4}>{node ? walked(node) : children}</h4>
    ),
    h5: ({ node, children }: OverrideProps) => (
      <h5 style={BLOCK_STYLES.h5}>{node ? walked(node) : children}</h5>
    ),
    h6: ({ node, children }: OverrideProps) => (
      <h6 style={BLOCK_STYLES.h6}>{node ? walked(node) : children}</h6>
    ),
    blockquote: ({ node, children }: OverrideProps) => (
      <blockquote style={BLOCK_STYLES.blockquote}>
        {node ? walked(node) : children}
      </blockquote>
    ),
    ul: ({ children }: OverrideProps) => (
      <ul style={BLOCK_STYLES.ul}>{children}</ul>
    ),
    ol: ({ children }: OverrideProps) => (
      <ol style={BLOCK_STYLES.ol}>{children}</ol>
    ),
    li: ({ node, children }: OverrideProps) => {
      const n = node as HastElementNode | undefined;
      if (!n || hasBlockChildren(n)) return <li style={BLOCK_STYLES.li}>{children}</li>;
      const out: React.ReactNode[] = [];
      walkInline(n.children, [], out, ctx);
      return <li style={BLOCK_STYLES.li}>{out}</li>;
    },
    pre: ({ children }: OverrideProps) => (
      <pre style={BLOCK_STYLES.pre}>{children}</pre>
    ),
    hr: () => (
      <hr style={{ border: 0, borderTop: "1px solid var(--chat-border, rgba(255,255,255,0.1))", margin: "0.6em 0" }} />
    ),
    table: ({ children }: OverrideProps) => (
      <div style={{ overflowX: "auto", margin: "0.5em 0" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.9em" }}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: OverrideProps) => <thead>{children}</thead>,
    tbody: ({ children }: OverrideProps) => <tbody>{children}</tbody>,
    tr: ({ children }: OverrideProps) => <tr>{children}</tr>,
    th: ({ node, children }: OverrideProps) => (
      <th style={BLOCK_STYLES.th}>{node ? walked(node) : children}</th>
    ),
    td: ({ node, children }: OverrideProps) => (
      <td style={BLOCK_STYLES.td}>{node ? walked(node) : children}</td>
    ),
  } as unknown as Components;
  return map;
}
