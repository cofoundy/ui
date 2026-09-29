import * as React from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotionConfig,
} from "framer-motion";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "../../utils/cn";
import { springTransition } from "../../lib/spring";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

/**
 * WorkspaceSwitcher — selector de negocio / workspace.
 *
 * Variantes:
 * - `rail`: la marca del negocio (40–44 px) arriba de un riel, con un badge SÓLIDO de chevrons
 *   que gira al abrir. No hay caja contenedora: el hover es un anillo concéntrico en la marca
 *   misma (radio = radio de la marca + separación), así nunca hay dos bordes con radios distintos.
 *   El menú es el `DropdownMenu` del paquete: nace desde la marca y su highlight viaja entre filas.
 * - `sheet`: fila de cabecera (p. ej. dentro de una hoja «Más») con marca + nombre + rol y un
 *   «Cambiar» ↔ «Cerrar» que despliega la lista inline con alto animado.
 *
 * Lista: marca + nombre + rol; el ✓ viaja a la fila elegida y RECIÉN después se llama `onSelect`
 * (la elección se ve confirmada antes del cambio).
 *
 * Motion: springs de `lib/spring` — smooth (contenido), edge (✓ que viaja),
 * snappy (presión, giro del chevron, filas). El nombre del negocio NUNCA se desenfoca (en texto
 * chico el blur flickea): cambia con opacidad, sale primero y entra después.
 */

// ============================================
// Types
// ============================================

export interface Workspace {
  id: string;
  name: string;
  /** Rol de la persona en ESE workspace («Administrador», «Atención»). */
  role?: string;
  /** URL de imagen o un nodo (SVG, ícono). Sin logo se pintan las iniciales. */
  logo?: string | React.ReactNode;
  /** Iniciales a mostrar sin logo (default: derivadas del nombre). */
  initials?: string;
}

export interface WorkspaceSwitcherLabels {
  /** Kicker de la lista. Default: `Tus negocios · N`. */
  heading?: (count: number) => string;
  /** aria-label del trigger. Default: `Negocio: X. Cambiar de negocio`. */
  trigger?: (active: Workspace) => string;
  /** Acción de la variante sheet. Default «Cambiar» / «Cerrar». */
  change?: string;
  close?: string;
  /** Sufijo de la variante sheet. Default: `N negocios`. */
  count?: (count: number) => string;
}

export interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  activeId: string;
  /** Se llama DESPUÉS de que el ✓ llegó a la fila elegida (≈ `confirmDelay` ms). */
  onSelect: (id: string) => void;
  variant?: "rail" | "sheet";
  /** rail: muestra el nombre del negocio debajo de la marca (riel ancho). */
  showName?: boolean;
  /** rail: lado del menú. Default `right`. */
  side?: "right" | "bottom";
  /** rail: tamaño de la marca en px. Default 44 con `showName`, 40 sin él. */
  markSize?: number;
  /** ms entre la elección y `onSelect` (el viaje del ✓). Default 260; 0 con reduced motion. */
  confirmDelay?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Reemplaza la marca por defecto (logo/iniciales). */
  renderMark?: (workspace: Workspace, size: number) => React.ReactNode;
  labels?: WorkspaceSwitcherLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<WorkspaceSwitcherLabels> = {
  heading: (n) => `Tus negocios · ${n}`,
  trigger: (w) => `Negocio: ${w.name}. Cambiar de negocio`,
  change: "Cambiar",
  close: "Cerrar",
  count: (n) => `${n} negocios`,
};

// ============================================
// Motion
// ============================================

const SMOOTH = springTransition("smooth");
const SNAPPY = springTransition("snappy");
const EDGE = springTransition("edge");
const INSTANT = { duration: 0 };
/** Salida de contenido: ≈80 ms, sólo opacidad (lineal: es un fade, no una curva propia). */
const EXIT_FAST = { duration: 0.08, ease: "linear" as const };
const TAP = { scale: 0.96 };

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.025 } },
};
const rowVariants = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0, transition: SNAPPY },
};
const rowVariantsReduced = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.1, ease: "linear" as const } },
};

// ============================================
// Mark
// ============================================

function initialsOf(w: Workspace) {
  if (w.initials) return w.initials;
  return w.name
    .split(/\s+/)
    .filter((p) => p.length > 2 || /^[A-ZÁÉÍÓÚÑ]/.test(p))
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

/** Radio de la marca: sigue al tamaño (≈ 27 %), nunca el `rounded-md` por defecto. */
export function markRadius(size: number) {
  return Math.round(size * 0.27);
}

export interface WorkspaceMarkProps {
  workspace: Workspace;
  size?: number;
  className?: string;
}

/** Logo cuadrado del workspace: imagen, nodo o iniciales sobre el primario del tema. */
export function WorkspaceMark({ workspace, size = 32, className }: WorkspaceMarkProps) {
  const { logo } = workspace;
  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: markRadius(size),
  };
  const initialsStyle: React.CSSProperties = {
    fontSize: Math.round(size * 0.38),
    background: "var(--primary)",
    color: "var(--primary-foreground)",
  };
  if (typeof logo === "string") {
    // Avatar del paquete: si la imagen falla (404, CORS, URL vieja) quedan las iniciales.
    return (
      <Avatar aria-hidden className={cn("size-auto", className)} style={style}>
        <AvatarImage src={logo} alt="" className="object-cover" />
        <AvatarFallback
          className="select-none rounded-[inherit] font-brand font-semibold leading-none"
          style={initialsStyle}
        >
          {initialsOf(workspace)}
        </AvatarFallback>
      </Avatar>
    );
  }
  if (logo) {
    return (
      <span
        className={cn("flex shrink-0 items-center justify-center overflow-hidden", className)}
        style={style}
      >
        {logo}
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 select-none items-center justify-center font-brand font-semibold leading-none",
        className,
      )}
      style={{ ...style, ...initialsStyle }}
    >
      {initialsOf(workspace)}
    </span>
  );
}

/** Marca que se reemplaza al cambiar de negocio: la vieja sale (80 ms) y después entra la nueva. */
function SwappingMark({
  workspace,
  size,
  renderMark,
  reduced,
}: {
  workspace: Workspace;
  size: number;
  renderMark?: WorkspaceSwitcherProps["renderMark"];
  reduced: boolean;
}) {
  return (
    <span className="relative block" style={{ width: size, height: size }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={workspace.id}
          className="block"
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduced ? { opacity: 0, transition: EXIT_FAST } : { opacity: 0, scale: 0.9, transition: EXIT_FAST }}
          transition={reduced ? { duration: 0.1, ease: "linear" } : SMOOTH}
        >
          {renderMark ? renderMark(workspace, size) : <WorkspaceMark workspace={workspace} size={size} />}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Texto que cambia SIN blur (flickea en texto chico): sale con opacidad y después entra. */
function SwappingText({
  swapKey,
  children,
  className,
  reduced,
}: {
  swapKey: string;
  children: React.ReactNode;
  className?: string;
  reduced: boolean;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={swapKey}
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: EXIT_FAST }}
        transition={reduced ? { duration: 0.1, ease: "linear" } : SMOOTH}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

/** Badge sólido de chevrons: fondo opaco, borde, tinta primaria; gira 180° al abrir. */
function ChevronBadge({ open, reduced }: { open: boolean; reduced: boolean }) {
  return (
    <span
      aria-hidden
      className="absolute -bottom-1.5 -right-1.5 z-10 flex size-[18px] items-center justify-center rounded-full border"
      style={{
        borderColor: "var(--border)",
        background: "var(--popover)",
        color: "var(--popover-foreground)",
        boxShadow: "0 1px 2px color-mix(in srgb, black 14%, transparent)",
      }}
    >
      <motion.span
        className="flex"
        animate={{ rotate: open ? 180 : 0 }}
        transition={reduced ? INSTANT : SNAPPY}
      >
        <ChevronsUpDown className="size-3" strokeWidth={2.25} />
      </motion.span>
    </span>
  );
}

// ============================================
// List
// ============================================

interface ListProps {
  workspaces: Workspace[];
  activeId: string;
  /** Workspace con el ✓ (viaja al elegido antes de confirmar). */
  checkedId: string;
  onChoose: (id: string) => void;
  mode: "menu" | "inline";
  heading: string;
  renderMark?: WorkspaceSwitcherProps["renderMark"];
  reduced: boolean;
}

function WorkspaceRows({
  workspaces,
  activeId,
  checkedId,
  onChoose,
  mode,
  heading,
  renderMark,
  reduced,
}: ListProps) {
  const group = React.useId();
  const variants = reduced ? rowVariantsReduced : rowVariants;

  // El contenido de la fila entra en cascada; en modo menú el highlight que viaja lo pone
  // `DropdownMenuItem` (hermano de este span), en modo inline es un hover CSS.
  const rowInner = (w: Workspace) => (
    <motion.span
      variants={variants}
      whileTap={reduced ? undefined : TAP}
      className="flex min-w-0 flex-1 items-center gap-3"
    >
      <span className="relative">
        {renderMark ? renderMark(w, 28) : <WorkspaceMark workspace={w} size={28} />}
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="block truncate text-[14px] font-medium leading-5 text-[var(--popover-foreground)]">
          {w.name}
        </span>
        {w.role && (
          <span className="block truncate text-[12px] leading-4 text-[var(--muted-foreground)]">
            {w.role}
          </span>
        )}
      </span>
      <span className="relative flex size-4 shrink-0 items-center justify-center">
        {checkedId === w.id && (
          <motion.span
            layoutId="ws-check"
            className="flex"
            transition={reduced ? INSTANT : EDGE}
          >
            <Check className="size-4" strokeWidth={2.25} style={{ color: "var(--primary)" }} />
          </motion.span>
        )}
      </span>
    </motion.span>
  );

  /** Radio 10 = radio de la superficie (16) − padding (6): una sola forma concéntrica. */
  const rowClass =
    "relative flex min-h-[48px] w-full cursor-pointer items-center gap-3 rounded-[10px] px-2.5 py-1.5 text-left outline-none focus-visible:outline-none";
  const headingClass =
    "px-2.5 pb-1 pt-1.5 font-mono text-[10px] font-normal uppercase tracking-[0.14em] text-[var(--muted-foreground)]";

  return (
    <LayoutGroup id={group}>
      <motion.div variants={listVariants} initial="hidden" animate="show">
        {mode === "menu" ? (
          <DropdownMenuLabel className={headingClass}>{heading}</DropdownMenuLabel>
        ) : (
          <p className={headingClass}>{heading}</p>
        )}
        {workspaces.map((w) =>
          mode === "menu" ? (
            <DropdownMenuItem
              key={w.id}
              onSelect={(e) => {
                // El menú se cierra cuando el ✓ llegó, no al hacer clic.
                e.preventDefault();
                onChoose(w.id);
              }}
              data-workspace={w.id}
              aria-current={w.id === activeId ? "true" : undefined}
              className={rowClass}
            >
              {rowInner(w)}
            </DropdownMenuItem>
          ) : (
            <button
              key={w.id}
              type="button"
              data-workspace={w.id}
              aria-current={w.id === activeId ? "true" : undefined}
              onClick={() => onChoose(w.id)}
              className={cn(
                rowClass,
                "transition-colors hover:bg-[var(--cf-nav-hover-bg,var(--accent))]",
                "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]",
              )}
            >
              {rowInner(w)}
            </button>
          ),
        )}
      </motion.div>
    </LayoutGroup>
  );
}

/** El ✓ viaja y recién después se confirma. Devuelve el id con ✓ y la función para elegir. */
function useChoose(
  activeId: string,
  onSelect: (id: string) => void,
  close: () => void,
  delay: number,
) {
  const [checkedId, setCheckedId] = React.useState(activeId);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = React.useRef(false);

  React.useEffect(() => {
    setCheckedId(activeId);
  }, [activeId]);
  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const choose = React.useCallback(
    (id: string) => {
      if (pending.current) return;
      if (id === activeId) {
        close();
        return;
      }
      pending.current = true;
      setCheckedId(id);
      timer.current = setTimeout(() => {
        pending.current = false;
        close();
        onSelect(id);
      }, delay);
    },
    [activeId, close, delay, onSelect],
  );
  const reset = React.useCallback(() => setCheckedId(activeId), [activeId]);
  return { checkedId, choose, reset };
}

// ============================================
// WorkspaceSwitcher
// ============================================

export function WorkspaceSwitcher(props: WorkspaceSwitcherProps) {
  return props.variant === "sheet" ? <SheetSwitcher {...props} /> : <RailSwitcher {...props} />;
}

function useOpenState(open: boolean | undefined, onOpenChange?: (o: boolean) => void) {
  const [inner, setInner] = React.useState(false);
  const isOpen = open ?? inner;
  const setOpen = React.useCallback(
    (o: boolean) => {
      if (open === undefined) setInner(o);
      onOpenChange?.(o);
    },
    [open, onOpenChange],
  );
  return [isOpen, setOpen] as const;
}

function RailSwitcher({
  workspaces,
  activeId,
  onSelect,
  showName = false,
  side = "right",
  markSize,
  confirmDelay = 260,
  open,
  onOpenChange,
  renderMark,
  labels,
  className,
}: WorkspaceSwitcherProps) {
  const reduced = useReducedMotionConfig() === true;
  const l = { ...DEFAULT_LABELS, ...labels };
  const active = workspaces.find((w) => w.id === activeId) ?? workspaces[0];
  const [isOpen, setOpen] = useOpenState(open, onOpenChange);
  const close = React.useCallback(() => setOpen(false), [setOpen]);
  const { checkedId, choose, reset } = useChoose(activeId, onSelect, close, reduced ? 0 : confirmDelay);
  const size = markSize ?? (showName ? 44 : 40);
  const radius = markRadius(size);
  const multi = workspaces.length > 1;
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  if (!active) return null;

  const mark = (
    <span className="relative block" style={{ width: size, height: size }}>
      {multi && (
        // Anillo concéntrico: separación 2 px + trazo 2 px → radio = radio de la marca + 4.
        // Es el ÚNICO borde del control: no hay caja alrededor con otro radio.
        <span
          aria-hidden
          data-ring
          className="pointer-events-none absolute -inset-1 border-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-data-[state=open]:opacity-100"
          style={{
            borderRadius: radius + 4,
            borderColor: "color-mix(in srgb, var(--primary) 55%, transparent)",
            transitionDuration: reduced ? "0ms" : "var(--cf-spring-snappy-duration)",
            transitionTimingFunction: "var(--cf-spring-snappy)",
          }}
        />
      )}
      <SwappingMark workspace={active} size={size} renderMark={renderMark} reduced={reduced} />
      {multi && <ChevronBadge open={isOpen} reduced={reduced} />}
    </span>
  );

  const name = showName ? (
    <span className="relative block w-full">
      <SwappingText
        swapKey={active.id}
        reduced={reduced}
        className="line-clamp-2 block w-full text-center text-[10.5px] font-semibold leading-[1.15] text-[var(--foreground)] [overflow-wrap:anywhere]"
      >
        {active.name}
      </SwappingText>
    </span>
  ) : null;

  const bodyClass = cn(
    "flex flex-col items-center gap-2 outline-none",
    showName ? "w-full px-0.5 pb-1 pt-1.5" : "p-1",
    className,
  );

  if (!multi) {
    return (
      <div className={bodyClass} data-workspace-switcher="single" aria-label={active.name}>
        {mark}
        {name}
      </div>
    );
  }

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(o) => {
        if (o) reset();
        setOpen(o);
      }}
      modal={false}
    >
      <DropdownMenuTrigger asChild>
        <motion.button
          ref={triggerRef}
          type="button"
          whileTap={reduced ? undefined : TAP}
          transition={SNAPPY}
          aria-label={l.trigger(active)}
          data-workspace-switcher="rail"
          className={cn("group cursor-pointer", bodyClass)}
        >
          {mark}
          {name}
        </motion.button>
      </DropdownMenuTrigger>
      {/* Entrada desde el trigger, salida y highlight que viaja: los pone DropdownMenuContent. */}
      <DropdownMenuContent
        data-workspace-menu
        side={side}
        align="start"
        sideOffset={10}
        collisionPadding={8}
        loop
        onCloseAutoFocus={(e) => {
          // El foco vuelve al trigger, pero sin anillo de foco si se eligió con el puntero
          // (el anillo es también el hover: quedaría «pegado» tras un clic).
          e.preventDefault();
          triggerRef.current?.focus({ focusVisible: false } as FocusOptions);
        }}
        className="w-[288px] rounded-[16px] p-1.5 shadow-none"
        style={{
          boxShadow:
            "var(--cf-shadow-float, 0 12px 32px color-mix(in srgb, black 18%, transparent))",
        }}
      >
        <WorkspaceRows
          mode="menu"
          workspaces={workspaces}
          activeId={activeId}
          checkedId={checkedId}
          onChoose={choose}
          heading={l.heading(workspaces.length)}
          renderMark={renderMark}
          reduced={reduced}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SheetSwitcher({
  workspaces,
  activeId,
  onSelect,
  confirmDelay = 260,
  open,
  onOpenChange,
  renderMark,
  labels,
  className,
}: WorkspaceSwitcherProps) {
  const reduced = useReducedMotionConfig() === true;
  const l = { ...DEFAULT_LABELS, ...labels };
  const active = workspaces.find((w) => w.id === activeId) ?? workspaces[0];
  const [isOpen, setOpen] = useOpenState(open, onOpenChange);
  const close = React.useCallback(() => setOpen(false), [setOpen]);
  const { checkedId, choose, reset } = useChoose(activeId, onSelect, close, reduced ? 0 : confirmDelay);
  const multi = workspaces.length > 1;
  const listId = React.useId();

  if (!active) return null;

  const subtitle = [active.role, multi ? l.count(workspaces.length) : null].filter(Boolean).join(" · ");

  return (
    <div className={cn("w-full", className)} data-workspace-switcher="sheet">
      <motion.button
        type="button"
        disabled={!multi}
        whileTap={multi && !reduced ? { scale: 0.98 } : undefined}
        transition={SNAPPY}
        aria-expanded={multi ? isOpen : undefined}
        aria-controls={multi ? listId : undefined}
        onClick={() => {
          if (!isOpen) reset();
          setOpen(!isOpen);
        }}
        className={cn(
          "flex min-h-[60px] w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left outline-none",
          "bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] disabled:cursor-default",
          multi &&
            "cursor-pointer transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        )}
      >
        <SwappingMark workspace={active} size={36} renderMark={renderMark} reduced={reduced} />
        <span className="min-w-0 flex-1">
          <SwappingText
            swapKey={active.id}
            reduced={reduced}
            className="block truncate text-[15px] font-semibold leading-5 text-[var(--foreground)]"
          >
            {active.name}
          </SwappingText>
          {subtitle && (
            <SwappingText
              swapKey={`${active.id}-sub`}
              reduced={reduced}
              className="block truncate text-[12.5px] leading-4 text-[var(--muted-foreground)]"
            >
              {subtitle}
            </SwappingText>
          )}
        </span>
        {multi && (
          <span
            className="relative flex h-5 min-w-[52px] items-center justify-end text-[13px] font-medium"
            style={{ color: "var(--primary)" }}
          >
            <SwappingText swapKey={isOpen ? "close" : "change"} reduced={reduced}>
              {isOpen ? l.close : l.change}
            </SwappingText>
          </span>
        )}
      </motion.button>
      <AnimatePresence initial={false}>
        {multi && isOpen && (
          <motion.div
            key="list"
            id={listId}
            className="overflow-hidden"
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0, transition: EXIT_FAST } : { height: 0, opacity: 0 }}
            transition={reduced ? { duration: 0.1, ease: "linear" } : SMOOTH}
          >
            <div className="pt-1">
              <WorkspaceRows
                mode="inline"
                workspaces={workspaces}
                activeId={activeId}
                checkedId={checkedId}
                onChoose={choose}
                heading={l.heading(workspaces.length)}
                renderMark={renderMark}
                reduced={reduced}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
