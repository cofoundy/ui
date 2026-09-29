import * as React from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import { CheckIcon, ShieldCheckIcon } from "lucide-react";

import { cn } from "../../utils/cn";
import { springTransition } from "../../lib/spring";
import { Button, type ButtonStatus, type ButtonStatusLabels } from "./button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "./sheet";
import { Skeleton } from "./skeleton";

/**
 * PluginCard + PluginSheet — a catalog of add-ons (plugins, integrations, capabilities).
 *
 * The card answers "what is it, does it work, what do I do about it" in one glance: icon, name,
 * a 2-line summary, a status (dot + words) and at most ONE action. The whole card opens the
 * sheet (stretched-link pattern: the title is the <button>, its ::after covers the card), and
 * the action sits above that layer.
 *
 * The sheet is composed on top of `Sheet` (radix: focus trap, Esc, overlay) — its enter/exit
 * motion belongs to `Sheet`. It has a fixed footer with ONE primary action, which is the
 * package `Button` with `status`: the SAME element morphs Instalar → Instalando → ✓ Instalado.
 *
 * Generic on purpose: no product data. The caller translates its own state into
 * `{ tone, label }` and words; the components never print raw backend reasons.
 */

// ── Tone ─────────────────────────────────────────────────────────────────────

export type PluginTone =
  | "ok"
  | "warn"
  | "danger"
  | "info"
  | "muted"
  | "neutral";

export interface PluginStatusValue {
  tone: PluginTone;
  /** Words the owner reads ("Activo", "Falta configurar", "Pausado hasta mañana 9:00"). */
  label: string;
}

// Proposed tokens (local until promoted to styles/index.css):
//   --cf-plugin-ok/-warn/-danger/-info → the status-* semantic colors.
const TONE_COLOR: Record<PluginTone, string> = {
  ok: "var(--status-success, #059669)",
  warn: "var(--status-warning, #D97706)",
  danger: "var(--status-error, #BE123C)",
  info: "var(--status-info, var(--primary))",
  muted: "var(--muted-foreground)",
  neutral: "var(--muted-foreground)",
};

/** Label ink: the tone pulled toward the foreground, so amber/green text clears AA on both themes. */
function toneInk(tone: PluginTone) {
  if (tone === "muted" || tone === "neutral") return "var(--muted-foreground)";
  return `color-mix(in oklab, ${TONE_COLOR[tone]} 72%, var(--foreground))`;
}

function toneDot(tone: PluginTone) {
  if (tone === "neutral")
    return "color-mix(in oklab, var(--muted-foreground) 55%, transparent)";
  return TONE_COLOR[tone];
}

const SMOOTH = springTransition("smooth");
const SNAPPY = springTransition("snappy");
const FADE_REDUCED: Transition = { duration: 0.12 };
/** Content out ≈ 80 ms (opacity only — small text flickers under blur), then in. */
const EXIT: Transition = { duration: 0.08 };
const COLOR_TRANSITION =
  "color var(--cf-spring-smooth-duration) var(--cf-spring-smooth), background-color var(--cf-spring-smooth-duration) var(--cf-spring-smooth), border-color var(--cf-spring-smooth-duration) var(--cf-spring-smooth)";

// ── Status (dot + words) ─────────────────────────────────────────────────────

/**
 * Dot + label. A tone change recolors in place (CSS spring on color); a label change swaps by
 * opacity (out 80 ms, then in) — never two labels on top of each other.
 * TODO(architect): swap for `StatusPill` (slot 09) once it lands; same `{ tone, label }` shape.
 */
function PluginStatus({
  status,
  live,
  className,
}: {
  status: PluginStatusValue;
  live?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <span
      data-slot="plugin-status"
      data-tone={status.tone}
      aria-live={live ? "polite" : undefined}
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 text-[12.5px] font-medium leading-none",
        className,
      )}
      style={{ color: toneInk(status.tone), transition: COLOR_TRANSITION }}
    >
      <span
        aria-hidden
        className="size-[7px] shrink-0 rounded-full"
        style={{
          background: toneDot(status.tone),
          transition: COLOR_TRANSITION,
        }}
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={status.label}
          className="truncate"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: reduce ? FADE_REDUCED : { duration: 0.16 },
          }}
          exit={{ opacity: 0, transition: reduce ? { duration: 0 } : EXIT }}
        >
          {status.label}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Square icon tile. Radius follows size (10 at 40 px, 12 at 48 px). */
function PluginIconTile({
  children,
  size = 40,
}: {
  children: React.ReactNode;
  size?: 40 | 48;
}) {
  return (
    <span
      aria-hidden
      data-slot="plugin-icon"
      className={cn(
        "flex shrink-0 items-center justify-center border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]",
        size === 48
          ? "size-12 rounded-[12px] [&_svg]:size-[22px]"
          : "size-10 rounded-[10px] [&_svg]:size-[18px]",
      )}
    >
      {children}
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 rounded-[5px] bg-[var(--muted)] px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-[var(--muted-foreground)]">
      {children}
    </span>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────

export interface PluginCardAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

export interface PluginCardProps extends Omit<
  React.ComponentProps<"article">,
  | "children"
  | "onClick"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "ref"
> {
  icon: React.ReactNode;
  name: string;
  /** Short uppercase tag beside the name ("Incluido", "Beta"). */
  tag?: string;
  /** One or two lines; clamped at 2. */
  summary: React.ReactNode;
  status: PluginStatusValue;
  /** Why it is in this state, in the owner's words. One sentence. */
  reason?: React.ReactNode;
  /** At most ONE action (Instalar, Completar, Reanudar…). Omit when opening the sheet is the action. */
  action?: PluginCardAction;
  /** Opens the detail (usually a PluginSheet). The whole card is the target. */
  onOpen: () => void;
  /** Highlights the border. Defaults to `status.tone === "warn" | "danger"`. */
  attention?: boolean;
}

function PluginCard({
  icon,
  name,
  tag,
  summary,
  status,
  reason,
  action,
  onOpen,
  attention,
  className,
  style,
  ...props
}: PluginCardProps) {
  const reduce = useReducedMotion();
  const flagged =
    attention ?? (status.tone === "warn" || status.tone === "danger");
  const actionRef = React.useRef<HTMLDivElement>(null);

  // Pressing the action must not also press the card: framer listens natively on the card,
  // so the child stops the pointerdown natively (a React handler would run too late).
  React.useEffect(() => {
    const el = actionRef.current;
    if (!el) return;
    const stop = (e: PointerEvent) => e.stopPropagation();
    el.addEventListener("pointerdown", stop);
    return () => el.removeEventListener("pointerdown", stop);
  }, [action]);

  return (
    <motion.article
      data-slot="plugin-card"
      data-attention={flagged ? "" : undefined}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={SNAPPY}
      className={cn(
        "group relative flex min-h-[156px] flex-col rounded-[14px] border bg-[var(--card)] p-4 text-[var(--foreground)]",
        "hover:border-[color:color-mix(in_oklab,var(--foreground)_28%,transparent)] focus-within:border-[color:color-mix(in_oklab,var(--foreground)_28%,transparent)]",
        className,
      )}
      style={{
        borderColor: flagged
          ? `color-mix(in oklab, ${TONE_COLOR[status.tone === "danger" ? "danger" : "warn"]} 42%, var(--border))`
          : "var(--border)",
        transition: COLOR_TRANSITION,
        ...style,
      }}
      {...props}
    >
      <div className="flex items-start gap-3">
        <PluginIconTile>{icon}</PluginIconTile>
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="flex min-w-0 items-center gap-2 text-[15.5px] font-semibold leading-tight">
            <button
              type="button"
              onClick={onOpen}
              className={cn(
                "min-w-0 truncate text-left outline-none",
                "after:absolute after:inset-0 after:rounded-[14px] after:content-['']",
                "focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--ring)]",
              )}
            >
              {name}
            </button>
            {tag ? <Tag>{tag}</Tag> : null}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-[1.45] text-[var(--muted-foreground)]">
            {summary}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <div className="flex min-h-9 items-center justify-between gap-3">
          <PluginStatus status={status} />
          {action ? (
            <div ref={actionRef} className="relative z-10 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-11 rounded-[10px] px-3 text-[13.5px] md:h-9"
                onClick={action.onClick}
              >
                {action.icon}
                {action.label}
              </Button>
            </div>
          ) : null}
        </div>
        <AnimatePresence initial={false} mode="wait">
          {reason ? (
            <motion.p
              key={typeof reason === "string" ? reason : "reason"}
              className="mt-1.5 text-[12.5px] leading-[1.4] text-[color:color-mix(in_oklab,var(--foreground)_72%,transparent)]"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: reduce ? FADE_REDUCED : { duration: 0.16 },
              }}
              exit={{ opacity: 0, transition: reduce ? { duration: 0 } : EXIT }}
            >
              {reason}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

/** Loading placeholder with the card's exact box (no layout jump when data arrives). */
function PluginCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-slot="plugin-card-skeleton"
      aria-hidden
      className={cn(
        "flex min-h-[156px] flex-col rounded-[14px] border border-[var(--border)] bg-[var(--card)] p-4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Skeleton className="size-10 rounded-[10px]" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-4 w-2/5 rounded-[5px]" />
          <Skeleton className="h-3 w-full rounded-[5px]" />
          <Skeleton className="h-3 w-4/5 rounded-[5px]" />
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between pt-4">
        <Skeleton className="h-3 w-24 rounded-[5px]" />
        <Skeleton className="h-9 w-24 rounded-[10px]" />
      </div>
    </div>
  );
}

// ── Sheet ────────────────────────────────────────────────────────────────────

export interface PluginNotice {
  /** Changing the id swaps the notice (out, then in) and scrolls the sheet back to it. */
  id?: string;
  tone: Exclude<PluginTone, "neutral">;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** ONE action that fixes it. */
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export interface PluginPrimaryAction {
  label: string;
  onClick: () => void;
  /** Caller-owned request state; the button owns the choreography (see `Button` `status`). */
  status?: ButtonStatus;
  /** Defaults: Instalando · Instalado · No se pudo · Reintentar. */
  statusLabels?: ButtonStatusLabels;
  /** Only for "nothing to save" — never while loading. */
  disabled?: boolean;
  /** One line above the button ("Se activa cuando Horario esté listo."). */
  note?: React.ReactNode;
}

export interface PluginSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: React.ReactNode;
  name: string;
  tag?: string;
  status: PluginStatusValue;
  /** State banner at the top of the body: why it is (not) working + the one fix. */
  notice?: PluginNotice | null;
  /** What it does, in a sentence or two. */
  summary?: React.ReactNode;
  /** Bulleted list of what it enables (✓). */
  capabilities?: React.ReactNode[];
  capabilitiesTitle?: React.ReactNode;
  /** The trust line (ShieldCheck): what it will NEVER do on its own. */
  guarantee?: React.ReactNode;
  /** Extra line under the capabilities (dependencies, links). */
  meta?: React.ReactNode;
  /** Configuration (a form, a read-only summary…). */
  children?: React.ReactNode;
  /** Destructive zone at the end of the body (uninstall). */
  danger?: React.ReactNode;
  primaryAction?: PluginPrimaryAction;
  /** Beside the primary (e.g. a «Pausar ▾» menu). */
  secondaryAction?: React.ReactNode;
  /** Right side of the footer: the resolved outcome ("✓ Guardado · ya lo usa"). */
  footerStatus?: React.ReactNode;
  /** Replaces the action footer for viewers who cannot change anything. */
  readOnlyNote?: React.ReactNode;
  className?: string;
}

const NOTICE_BG: Record<PluginNotice["tone"], string> = {
  ok: "color-mix(in oklab, var(--status-success, #059669) 12%, var(--background))",
  warn: "color-mix(in oklab, var(--status-warning, #D97706) 12%, var(--background))",
  danger:
    "color-mix(in oklab, var(--status-error, #BE123C) 12%, var(--background))",
  info: "color-mix(in oklab, var(--status-info, #46a0d0) 12%, var(--background))",
  muted: "var(--muted)",
};

/** Height follows the notice (measured, spring smooth); the notice itself swaps out → in. */
function NoticeSlot({ notice }: { notice?: PluginNotice | null }) {
  const reduce = useReducedMotion();
  const inner = React.useRef<HTMLDivElement>(null);
  const [h, setH] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const read = () => setH(el.offsetHeight);
    read();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const key = notice ? (notice.id ?? String(notice.title)) : "none";
  return (
    <motion.div
      data-slot="plugin-notice-slot"
      className="overflow-hidden"
      initial={false}
      animate={{ height: h ?? "auto" }}
      transition={reduce ? { duration: 0 } : SMOOTH}
    >
      <div ref={inner}>
        <AnimatePresence mode="wait" initial={false}>
          {notice ? (
            <motion.div
              key={key}
              className="pb-6"
              initial={{ opacity: 0, y: reduce ? 0 : 4 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: reduce ? FADE_REDUCED : SMOOTH,
              }}
              exit={{ opacity: 0, transition: reduce ? { duration: 0 } : EXIT }}
            >
              <div
                role={
                  notice.tone === "warn" || notice.tone === "danger"
                    ? "alert"
                    : "status"
                }
                className="rounded-[12px] border px-4 py-3"
                style={{
                  background: NOTICE_BG[notice.tone],
                  borderColor:
                    notice.tone === "muted"
                      ? "var(--border)"
                      : `color-mix(in oklab, ${TONE_COLOR[notice.tone]} 35%, transparent)`,
                }}
              >
                <p className="flex items-center gap-2 text-[14px] font-semibold text-[var(--foreground)]">
                  {notice.icon ? (
                    <span
                      className="shrink-0 [&_svg]:size-4"
                      style={{ color: TONE_COLOR[notice.tone] }}
                    >
                      {notice.icon}
                    </span>
                  ) : null}
                  {notice.title}
                </p>
                {notice.description ? (
                  <div className="mt-1 text-[13.5px] leading-[1.45] text-[color:color-mix(in_oklab,var(--foreground)_78%,transparent)]">
                    {notice.description}
                  </div>
                ) : null}
                {notice.action ? (
                  <div className="mt-3">{notice.action}</div>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const DEFAULT_INSTALL_LABELS: ButtonStatusLabels = {
  loading: "Instalando",
  success: "Instalado",
  error: "No se pudo · Reintentar",
};

function PluginSheet({
  open,
  onOpenChange,
  icon,
  name,
  tag,
  status,
  notice,
  summary,
  capabilities,
  capabilitiesTitle = "Qué puede hacer",
  guarantee,
  meta,
  children,
  danger,
  primaryAction,
  secondaryAction,
  footerStatus,
  readOnlyNote,
  className,
}: PluginSheetProps) {
  const reduce = useReducedMotion();
  const body = React.useRef<HTMLDivElement>(null);
  const noticeKey = notice ? (notice.id ?? String(notice.title)) : null;

  // A new outcome lives at the TOP of the body: bring the view to it.
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (noticeKey)
      body.current?.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [noticeKey, reduce]);

  // Body sections cascade in once the sheet is mostly open (--cf-delay-enter ≈ 180 ms).
  const section = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 6 },
    shown: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: reduce ? FADE_REDUCED : { ...SMOOTH, delay: 0.18 + i * 0.04 },
    }),
  };

  const showFooter =
    !readOnlyNote && (primaryAction || secondaryAction || footerStatus);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        data-slot="plugin-sheet"
        {...(summary ? {} : { "aria-describedby": undefined })}
        className={cn(
          "flex w-full flex-col gap-0 p-0 sm:max-w-[540px]",
          "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]",
          className,
        )}
      >
        <header className="flex items-start gap-3 border-b border-[var(--border)] px-5 pb-4 pr-12 pt-5 md:px-6 md:pr-14 md:pt-6">
          <PluginIconTile size={48}>{icon}</PluginIconTile>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex min-w-0 items-center gap-2">
              <SheetTitle className="truncate font-[family-name:var(--font-brand)] text-[23px] font-semibold leading-[1.1] tracking-[-0.01em]">
                {name}
              </SheetTitle>
              {tag ? <Tag>{tag}</Tag> : null}
            </div>
            <div className="mt-2">
              <PluginStatus status={status} live />
            </div>
          </div>
        </header>

        <div
          ref={body}
          data-slot="plugin-sheet-body"
          className="flex-1 overflow-y-auto px-5 py-5 md:px-6"
        >
          <NoticeSlot notice={notice} />
          <div className="flex flex-col gap-6">
            {summary || capabilities?.length || guarantee || meta ? (
              <motion.section
                custom={0}
                variants={section}
                initial="hidden"
                animate="shown"
              >
                {summary ? (
                  <SheetDescription asChild>
                    <div className="text-[15px] leading-[1.55] text-[color:color-mix(in_oklab,var(--foreground)_80%,transparent)]">
                      {summary}
                    </div>
                  </SheetDescription>
                ) : null}
                {capabilities?.length ? (
                  <>
                    <h3 className="mb-2 mt-5 text-[13px] font-semibold first:mt-0">
                      {capabilitiesTitle}
                    </h3>
                    <ul className="flex flex-col gap-1.5">
                      {capabilities.map((c, i) => (
                        <motion.li
                          key={i}
                          custom={i + 1}
                          variants={section}
                          initial="hidden"
                          animate="shown"
                          className="flex gap-2.5 text-[14px] leading-[1.45] text-[color:color-mix(in_oklab,var(--foreground)_80%,transparent)]"
                        >
                          <CheckIcon
                            aria-hidden
                            className="mt-[3px] size-4 shrink-0 text-[var(--muted-foreground)]"
                          />
                          <span>{c}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {guarantee ? (
                  <p className="mt-3 flex gap-2.5 text-[14px] leading-[1.45] text-[var(--foreground)]">
                    <ShieldCheckIcon
                      aria-hidden
                      className="mt-[2px] size-4 shrink-0"
                      style={{ color: TONE_COLOR.ok }}
                    />
                    <span>{guarantee}</span>
                  </p>
                ) : null}
                {meta ? (
                  <div className="mt-4 text-[13px] text-[var(--muted-foreground)]">
                    {meta}
                  </div>
                ) : null}
              </motion.section>
            ) : null}

            {children ? (
              <motion.section
                custom={(capabilities?.length ?? 0) + 1}
                variants={section}
                initial="hidden"
                animate="shown"
                className="border-t border-[var(--border)] pt-5"
              >
                {children}
              </motion.section>
            ) : null}

            {danger ? (
              <section className="border-t border-[var(--border)] pt-4">
                {danger}
              </section>
            ) : null}
          </div>
        </div>

        {readOnlyNote ? (
          <footer className="border-t border-[var(--border)] px-5 py-3.5 text-[13px] text-[var(--muted-foreground)] md:px-6">
            {readOnlyNote}
          </footer>
        ) : null}

        {showFooter ? (
          <footer
            data-slot="plugin-sheet-footer"
            className="border-t border-[var(--border)] bg-[var(--background)] px-5 pt-3.5 md:px-6"
            style={{ paddingBottom: "max(14px, env(safe-area-inset-bottom))" }}
          >
            {primaryAction?.note ? (
              <p className="mb-2.5 text-[12.5px] text-[var(--muted-foreground)]">
                {primaryAction.note}
              </p>
            ) : null}
            <div className="flex items-center gap-2">
              {primaryAction ? (
                <Button
                  size="lg"
                  className="h-11 flex-1 rounded-[10px] px-4 text-[14px] font-semibold md:h-10 md:min-w-[180px] md:flex-none"
                  status={primaryAction.status ?? "idle"}
                  statusLabels={{
                    ...DEFAULT_INSTALL_LABELS,
                    ...primaryAction.statusLabels,
                  }}
                  disabled={
                    primaryAction.disabled &&
                    (primaryAction.status ?? "idle") === "idle"
                  }
                  onClick={primaryAction.onClick}
                >
                  {primaryAction.label}
                </Button>
              ) : null}
              {secondaryAction}
              <AnimatePresence initial={false}>
                {footerStatus ? (
                  <motion.span
                    key="footer-status"
                    className="ml-auto flex min-w-0 items-center gap-1.5 text-right text-[12.5px] text-[var(--muted-foreground)]"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: reduce ? FADE_REDUCED : { duration: 0.16 },
                    }}
                    exit={{
                      opacity: 0,
                      transition: reduce ? { duration: 0 } : EXIT,
                    }}
                  >
                    {footerStatus}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </div>
          </footer>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export {
  PluginCard,
  PluginCardSkeleton,
  PluginSheet,
  PluginStatus,
  PluginIconTile,
};
