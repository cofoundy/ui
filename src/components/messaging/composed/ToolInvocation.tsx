"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CheckCircle2,
  CircleDashed,
  Layers,
  Loader2,
  Wrench,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { cn } from "../../../utils/cn";
import {
  Collapsible,
  CollapsibleChevron,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible";

/**
 * ToolInvocation — a collapsible card that shows what a tool call did inside an AI turn:
 * its readable name, a one-line summary, a status pill, and (folded by default) the input the
 * model passed and the output the tool returned.
 *
 * Market reference: Vercel AI Elements «Tool» (https://elements.ai-sdk.dev/components/tool) —
 * same four lifecycle states (`input-streaming | input-available | output-available |
 * output-error`), adapted to @cofoundy/ui: tokens only (light/dark), one prop-driven component
 * instead of five sub-components, labels overridable (defaults in English), folded by default.
 *
 * A11y: the header is a real `<button>` (Radix Collapsible trigger) with `aria-expanded` /
 * `aria-controls`; Enter/Space toggle it; the status is announced as text, not only colour.
 */

export type ToolInvocationState =
  | "input-streaming"
  | "input-available"
  | "output-available"
  | "output-error";

export interface ToolInvocationLabels {
  /** Status pill for `input-streaming`. */
  pending: string;
  /** Status pill for `input-available`. */
  running: string;
  /** Status pill for `output-available`. */
  completed: string;
  /** Status pill for `output-error`. */
  error: string;
  /** Heading of the input section. */
  input: string;
  /** Heading of the output section. */
  output: string;
  /** Heading of the error section. */
  errorHeading: string;
  /** Shown in the output section while the tool has not answered yet. */
  waiting: string;
}

export const defaultToolInvocationLabels: ToolInvocationLabels = {
  pending: "Pending",
  running: "Running",
  completed: "Completed",
  error: "Error",
  input: "Input",
  output: "Output",
  errorHeading: "Error",
  waiting: "Waiting for result…",
};

const toolInvocationVariants = cva(
  [
    "group/tool @container w-full min-w-0 overflow-hidden rounded-[12px] border",
    "border-[var(--chat-border)] bg-[var(--chat-card)] text-[var(--chat-foreground)]",
    "transition-colors duration-[var(--cf-duration-fast,150ms)]",
  ],
  {
    variants: {
      density: {
        default: "",
        compact: "rounded-[10px]",
      },
    },
    defaultVariants: { density: "default" },
  },
);

const statusPillVariants = cva(
  "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-4",
  {
    variants: {
      state: {
        "input-streaming":
          "bg-[var(--chat-muted)]/15 text-[var(--chat-muted)]",
        "input-available":
          "bg-[var(--status-info)]/15 text-[var(--status-info)]",
        "output-available":
          "bg-[var(--status-success)]/15 text-[var(--status-success)]",
        "output-error":
          "bg-[var(--status-error)]/15 text-[var(--status-error)]",
      },
    },
    defaultVariants: { state: "output-available" },
  },
);

const STATE_ICON: Record<ToolInvocationState, LucideIcon> = {
  "input-streaming": CircleDashed,
  "input-available": Loader2,
  "output-available": CheckCircle2,
  "output-error": XCircle,
};

const STATE_LABEL_KEY: Record<ToolInvocationState, keyof ToolInvocationLabels> = {
  "input-streaming": "pending",
  "input-available": "running",
  "output-available": "completed",
  "output-error": "error",
};

/* ------------------------------------------------------------------ */
/* Value formatting                                                    */
/* ------------------------------------------------------------------ */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function isPrimitive(value: unknown): value is string | number | boolean | null {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

/** A string that is JSON (e.g. a backend `result_preview`) → parsed value; otherwise `undefined`. */
function tryParseJson(text: string): unknown {
  const trimmed = text.trim();
  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return undefined;
  try {
    return JSON.parse(trimmed);
  } catch {
    return undefined;
  }
}

function stringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}

export type ToolValueFormat = "auto" | "json" | "list";

function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      data-slot="tool-invocation-code"
      className={cn(
        "max-h-64 overflow-auto rounded-[8px] px-3 py-2",
        "bg-[var(--cf-code-bg)] font-mono text-xs leading-5 text-[var(--chat-foreground)]",
        "whitespace-pre-wrap break-words",
      )}
    >
      {children}
    </pre>
  );
}

function KeyValueList({ value }: { value: Record<string, unknown> }) {
  return (
    <dl
      data-slot="tool-invocation-list"
      className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs leading-5"
    >
      {Object.entries(value).map(([key, v]) => (
        <React.Fragment key={key}>
          <dt className="truncate font-mono text-[var(--chat-muted)]">{key}</dt>
          <dd className="min-w-0 break-words font-mono text-[var(--chat-foreground)]">
            {isPrimitive(v) ? String(v) : stringify(v)}
          </dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

/**
 * Renders any tool value: a React node as-is, a flat object as a key/value list (when
 * `format` is `auto` or `list`), anything else as formatted JSON, and plain text as text.
 * A string that holds JSON is parsed first; a truncated one (e.g. `…`) stays text.
 */
export function ToolValue({
  value,
  format = "auto",
}: {
  value: unknown;
  format?: ToolValueFormat;
}) {
  if (value === undefined) return null;
  if (React.isValidElement(value)) return <>{value}</>;

  let resolved = value;
  if (typeof value === "string") {
    const parsed = tryParseJson(value);
    if (parsed === undefined) return <CodeBlock>{value}</CodeBlock>;
    resolved = parsed;
  }

  if (isPlainObject(resolved) && format !== "json") {
    const entries = Object.values(resolved);
    const flat = entries.length > 0 && entries.every(isPrimitive);
    if (format === "list" || (flat && entries.length <= 8)) {
      return <KeyValueList value={resolved} />;
    }
  }

  return <CodeBlock>{isPrimitive(resolved) ? String(resolved) : stringify(resolved)}</CodeBlock>;
}

/* ------------------------------------------------------------------ */
/* ToolInvocation                                                      */
/* ------------------------------------------------------------------ */

export interface ToolInvocationProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "children">,
    VariantProps<typeof toolInvocationVariants> {
  /** Readable tool name, e.g. «Consultar tarifario». */
  name: React.ReactNode;
  /** Lifecycle state. Default `output-available`. */
  state?: ToolInvocationState;
  /** One-line summary shown under the name in the header (truncated). */
  summary?: React.ReactNode;
  /** Arguments the model passed. Object → key/value list or JSON; string → parsed if JSON. */
  input?: unknown;
  /** What the tool returned: text, object (formatted) or any ReactNode. */
  output?: unknown;
  /** Error message; shown when `state="output-error"` (or whenever provided). */
  errorText?: React.ReactNode;
  /** Open on first render. Default `false` (folded). */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Leading icon. Default a wrench. */
  icon?: React.ReactNode;
  /** How to render `input`. Default `auto`. */
  inputFormat?: ToolValueFormat;
  /** How to render `output`. Default `auto`. */
  outputFormat?: ToolValueFormat;
  /** Override any UI string (defaults in English). */
  labels?: Partial<ToolInvocationLabels>;
  /** Extra content at the end of the body (e.g. a link to the trace). */
  children?: React.ReactNode;
}

function Section({
  heading,
  tone = "default",
  children,
}: {
  heading: string;
  tone?: "default" | "error";
  children: React.ReactNode;
}) {
  return (
    <section data-slot="tool-invocation-section" className="space-y-1.5">
      <h4
        className={cn(
          "text-[11px] font-medium uppercase tracking-wide",
          tone === "error" ? "text-[var(--status-error)]" : "text-[var(--chat-muted)]",
        )}
      >
        {heading}
      </h4>
      {children}
    </section>
  );
}

export function ToolInvocationStatus({
  state,
  labels,
  collapseLabel = false,
  className,
}: {
  state: ToolInvocationState;
  labels?: Partial<ToolInvocationLabels>;
  /** Hide the text (keep it for screen readers) when the nearest `@container` is narrower than 20rem. */
  collapseLabel?: boolean;
  className?: string;
}) {
  const l = { ...defaultToolInvocationLabels, ...labels };
  const Icon = STATE_ICON[state];
  return (
    <span
      data-slot="tool-invocation-status"
      data-state={state}
      className={cn(statusPillVariants({ state }), className)}
    >
      <Icon
        aria-hidden
        className={cn(
          "size-3",
          state === "input-available" && "motion-safe:animate-spin",
          state === "input-streaming" && "motion-safe:animate-pulse",
        )}
      />
      {/* Narrow card (<20rem): icon-only pill, label kept for screen readers. */}
      <span className={cn(collapseLabel && "sr-only @xs:not-sr-only")}>
        {l[STATE_LABEL_KEY[state]]}
      </span>
    </span>
  );
}

export const ToolInvocation = React.forwardRef<HTMLDivElement, ToolInvocationProps>(
  function ToolInvocation(
    {
      name,
      state = "output-available",
      summary,
      input,
      output,
      errorText,
      defaultOpen = false,
      open,
      onOpenChange,
      icon,
      inputFormat = "auto",
      outputFormat = "auto",
      labels,
      density,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const l = { ...defaultToolInvocationLabels, ...labels };
    const compact = density === "compact";
    const hasInput = input !== undefined;
    const isError = state === "output-error" || errorText != null;
    const showOutput = !isError && (output !== undefined || state !== "output-available");

    return (
      <Collapsible defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
        <div
          ref={ref}
          data-slot="tool-invocation"
          data-state={state}
          className={cn(toolInvocationVariants({ density }), className)}
          {...props}
        >
          <CollapsibleTrigger
            data-slot="tool-invocation-header"
            className={cn(
              "flex w-full min-w-0 items-center gap-2.5 text-left",
              compact ? "min-h-10 px-2.5 py-1.5" : "min-h-11 px-3 py-2",
              "hover:bg-[var(--chat-card-hover)] transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--chat-primary)]",
              "cursor-pointer",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "flex shrink-0 items-center justify-center rounded-[6px]",
                compact ? "size-6" : "size-7",
                isError
                  ? "bg-[var(--status-error)]/12 text-[var(--status-error)]"
                  : "bg-[var(--chat-primary)]/12 text-[var(--chat-primary)]",
              )}
            >
              {icon ?? <Wrench className="size-3.5" />}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span
                data-slot="tool-invocation-name"
                className="truncate text-sm font-medium leading-5"
              >
                {name}
              </span>
              {summary != null && (
                <span
                  data-slot="tool-invocation-summary"
                  className="truncate text-xs leading-4 text-[var(--chat-muted)]"
                >
                  {summary}
                </span>
              )}
            </span>
            <ToolInvocationStatus state={state} labels={labels} collapseLabel />
            <CollapsibleChevron className="text-[var(--chat-muted)]" />
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div
              data-slot="tool-invocation-content"
              className={cn(
                "space-y-3 border-t border-[var(--chat-border)]",
                compact ? "px-2.5 py-2" : "px-3 py-3",
              )}
            >
              {hasInput && (
                <Section heading={l.input}>
                  <ToolValue value={input} format={inputFormat} />
                </Section>
              )}
              {isError && (
                <Section heading={l.errorHeading} tone="error">
                  <div
                    role="alert"
                    className="rounded-[8px] bg-[var(--status-error)]/10 px-3 py-2 text-xs leading-5 text-[var(--status-error)] break-words"
                  >
                    {errorText ?? l.error}
                  </div>
                </Section>
              )}
              {showOutput && (
                <Section heading={l.output}>
                  {output !== undefined ? (
                    <ToolValue value={output} format={outputFormat} />
                  ) : (
                    <p className="text-xs italic text-[var(--chat-muted)]">{l.waiting}</p>
                  )}
                </Section>
              )}
              {children}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  },
);

/* ------------------------------------------------------------------ */
/* ToolInvocationGroup                                                 */
/* ------------------------------------------------------------------ */

export interface ToolInvocationGroupLabels {
  /** Header text. Receives the number of tool invocations. */
  title: (count: number) => string;
  /** Pill text when some invocations failed. Receives the error count. */
  errors: (count: number) => string;
}

export const defaultToolInvocationGroupLabels: ToolInvocationGroupLabels = {
  title: (n) => `AI ran ${n} ${n === 1 ? "action" : "actions"}`,
  errors: (n) => `${n} ${n === 1 ? "error" : "errors"}`,
};

export interface ToolInvocationGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** `<ToolInvocation>` elements of one AI turn. */
  children: React.ReactNode;
  /** Header text; overrides `labels.title`. */
  title?: React.ReactNode;
  /** One-line summary under the title (e.g. the tool names). */
  summary?: React.ReactNode;
  /** Open on first render. Default `false`. */
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  labels?: Partial<ToolInvocationGroupLabels>;
}

export const ToolInvocationGroup = React.forwardRef<HTMLDivElement, ToolInvocationGroupProps>(
  function ToolInvocationGroup(
    { children, title, summary, defaultOpen = false, open, onOpenChange, labels, className, ...props },
    ref,
  ) {
    const l = { ...defaultToolInvocationGroupLabels, ...labels };
    const items = React.Children.toArray(children).filter(React.isValidElement);
    const count = items.length;
    const errorCount = items.filter(
      (el) => (el.props as { state?: ToolInvocationState }).state === "output-error",
    ).length;
    const running = items.some((el) => {
      const s = (el.props as { state?: ToolInvocationState }).state;
      return s === "input-streaming" || s === "input-available";
    });

    return (
      <Collapsible defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
        <div
          ref={ref}
          data-slot="tool-invocation-group"
          data-count={count}
          className={cn("w-full min-w-0", className)}
          {...props}
        >
          <CollapsibleTrigger
            data-slot="tool-invocation-group-header"
            className={cn(
              "flex min-h-11 w-full min-w-0 items-center gap-2 rounded-[8px] px-2 py-1.5 text-left",
              "text-[var(--chat-muted)] hover:bg-[var(--chat-card-hover)] hover:text-[var(--chat-foreground)] transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chat-primary)]",
              "cursor-pointer",
            )}
          >
            {running ? (
              <Loader2 aria-hidden className="size-4 shrink-0 text-[var(--status-info)] motion-safe:animate-spin" />
            ) : (
              <Layers aria-hidden className="size-4 shrink-0" />
            )}
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium leading-5">
                {title ?? l.title(count)}
              </span>
              {summary != null && (
                <span className="truncate text-xs leading-4 opacity-80">{summary}</span>
              )}
            </span>
            {errorCount > 0 && (
              <span className={statusPillVariants({ state: "output-error" })}>
                <XCircle aria-hidden className="size-3" />
                {l.errors(errorCount)}
              </span>
            )}
            <CollapsibleChevron />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div
              data-slot="tool-invocation-group-content"
              className="flex flex-col gap-2 pt-1.5 pl-2 ml-2 sm:pl-3 border-l border-[var(--chat-border)]"
            >
              {children}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  },
);

export { toolInvocationVariants, statusPillVariants as toolInvocationStatusVariants };
