"use client";

import {
  useState,
  useRef,
  useEffect,
  useId,
  useCallback,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type ChangeEvent,
  type ClipboardEvent,
  type ReactNode,
} from "react";
import { Send, Paperclip, Smile, Square } from "lucide-react";
import { cn } from "../../../utils/cn";

/* ─── Types ─── */

export interface ComposerMode {
  id: string;
  label: string;
  icon?: ReactNode;
  /** CSS color class for active tab accent, e.g. "text-amber-400 border-amber-400" */
  activeClass?: string;
  /** Placeholder override when this mode is active */
  placeholder?: string;
  /** Send button label override, e.g. "Añadir nota" */
  sendLabel?: string;
}

export interface ComposerToolbarItem {
  id: string;
  icon: ReactNode;
  /** Tooltip / aria-label */
  label: string;
  onClick: () => void;
  /** Hide this item in certain modes */
  hideInModes?: string[];
}

/** @deprecated Use ComposerMode + ComposerToolbarItem instead */
export interface QuickAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

export interface MessageComposerProps {
  /** Called when user sends a message */
  onSend: (message: string) => void;
  /** Called when user selects files to attach */
  onAttach?: (files: FileList) => void;
  /** Called when user pastes files (e.g. images from clipboard) */
  onPaste?: (files: File[]) => void;

  /* ─── Mode tabs (Reply vs Note) ─── */
  /** Define modes to show tabs. If omitted, no tabs are shown. */
  modes?: ComposerMode[];
  /** Currently active mode id */
  activeMode?: string;
  /** Called when user switches mode */
  onModeChange?: (modeId: string) => void;

  /* ─── Toolbar ─── */
  /** Extra toolbar items (emoji picker, template picker, etc.) rendered before attach */
  toolbarItems?: ComposerToolbarItem[];

  /* ─── Basics ─── */
  placeholder?: string;
  disabled?: boolean;
  /** Maximum height for textarea in pixels */
  maxHeight?: number;
  /** Show the built-in attachment button */
  showAttachment?: boolean;
  /** Show the built-in emoji button (icon only, no picker) */
  showEmoji?: boolean;
  /** Custom send button label */
  sendLabel?: string;

  /* ─── Estado ocupado (una respuesta automática en vuelo) ─── */
  /** La conversación tiene una respuesta automática en vuelo. Mientras es true,
   *  la acción primaria es Parar en vez de Enviar, y Enter no envía. */
  busy?: boolean;
  /** Se invoca al pulsar Parar. Solo alcanzable mientras `busy`. */
  onStop?: () => void;
  /** Etiqueta del botón Parar. La i18n vive en la app anfitriona, no acá. */
  stopLabel?: string;
  /** Texto de estado mientras `busy` (ej. "Sofía está respondiendo…"). */
  busyLabel?: ReactNode;

  /** Custom ReactNode injected at the start of the toolbar (e.g. an emoji picker with its own popover) */
  toolbarLeading?: ReactNode;

  /** @deprecated Use modes + toolbarItems instead */
  quickActions?: QuickAction[];

  className?: string;
}

/**
 * Agent inbox message composer following Intercom/Front patterns:
 * - Optional mode tabs (Reply | Note) at top
 * - Auto-resizing textarea
 * - Bottom toolbar inside the input border (leading icons + send button)
 * - Single unified visual block
 *
 * Con `busy` la acción primaria pasa de Enviar a Parar. La regla de producto es
 * que no haya mensajes cruzados: mientras la IA despacha, el operador NO puede
 * mandar encima — pero sí puede seguir redactando. Lo que se bloquea es el
 * envío, nunca la escritura, así que el textarea no se toca y su borrador
 * sobrevive al momento de parar.
 */
export function MessageComposer({
  onSend,
  onAttach,
  onPaste,
  modes,
  activeMode,
  onModeChange,
  toolbarItems,
  placeholder = "Type a message...",
  disabled = false,
  maxHeight = 120,
  showAttachment = true,
  showEmoji = false,
  toolbarLeading,
  sendLabel,
  busy = false,
  onStop,
  stopLabel,
  busyLabel,
  quickActions,
  className,
}: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const [stopping, setStopping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Guard sincrónico del doble clic. `stopping` es estado y se aplica en el
  // render siguiente, así que dos clics seguidos pasarían los dos; el ref se
  // actualiza en el mismo tick. Nunca `disabled` en el botón de Parar: un
  // control deshabilitado se borra de su propio submit, porque el navegador
  // arma la entry list DESPUÉS de despachar el evento.
  const stoppingRef = useRef(false);
  const busyStatusId = useId();

  // `disabled` gana sobre `busy`: si el compositor entero está inerte, se
  // comporta exactamente como siempre — sin estado ocupado y sin botón Parar.
  const isBusy = busy && !disabled;
  const showBusyStatus = isBusy && Boolean(busyLabel);
  // El botón necesita nombre accesible aunque el host no pase etiqueta visible
  // (en móvil el texto se oculta, igual que en Enviar).
  const stopAccessibleLabel = stopLabel ?? "Parar";

  // Al salir de ocupado se rearma Parar para el próximo turno de la IA.
  useEffect(() => {
    if (!isBusy) {
      stoppingRef.current = false;
      setStopping(false);
    }
  }, [isBusy]);

  // Resolve active mode config
  const currentMode = modes?.find((m) => m.id === activeMode);
  const resolvedPlaceholder = currentMode?.placeholder ?? placeholder;
  const resolvedSendLabel = currentMode?.sendLabel ?? sendLabel;

  // Filter toolbar items by current mode
  const visibleToolbarItems = toolbarItems?.filter(
    (item) => !item.hideInModes || !activeMode || !item.hideInModes.includes(activeMode)
  );

  // Should hide attach in current mode?
  const showAttachInMode = showAttachment && onAttach;

  // Auto-resize textarea
  const handleInput = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.target;
      setMessage(textarea.value);
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    },
    [maxHeight]
  );

  // Handle send
  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      // Nada de mensajes cruzados: mientras la IA despacha, enviar no existe.
      if (isBusy) return;
      if (message.trim() && !disabled) {
        onSend(message.trim());
        setMessage("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    },
    [message, disabled, isBusy, onSend]
  );

  // Enter to send, Shift+Enter for newline
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        // Se traga la tecla también con `busy`: el operador quiso enviar, no
        // meter un salto de línea en su borrador. Shift+Enter sigue igual.
        e.preventDefault();
        if (isBusy) return;
        handleSubmit();
      }
    },
    [handleSubmit, isBusy]
  );

  // File selection
  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0 && onAttach) {
        onAttach(e.target.files);
        e.target.value = "";
      }
    },
    [onAttach]
  );

  // Paste handler
  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLTextAreaElement>) => {
      if (!onPaste) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of Array.from(items)) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        onPaste(files);
      }
    },
    [onPaste]
  );

  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleStop = useCallback(() => {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    setStopping(true);
    onStop?.();
  }, [onStop]);

  // Determine accent styling for note-like modes
  const isAccented = currentMode?.activeClass;

  return (
    <div className={cn("flex flex-col", className)}>
      {/* ─── Mode tabs ─── */}
      {modes && modes.length > 1 && (
        <div className="flex items-center gap-1 px-3 pt-3 pb-0">
          {modes.map((mode) => {
            const isActive = mode.id === activeMode;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onModeChange?.(mode.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-lg border-b-2 transition-colors",
                  isActive
                    ? mode.activeClass ?? "text-[var(--chat-primary)] border-[var(--chat-primary)]"
                    : "text-[var(--chat-muted)] border-transparent hover:text-[var(--chat-foreground)] hover:border-[var(--chat-border)]"
                )}
              >
                {mode.icon}
                {mode.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ─── Unified input container ─── */}
      <div
        className={cn(
          "mx-3 mb-3 mt-2 rounded-xl border transition-colors",
          isAccented
            ? "border-[var(--chat-warning)]/40 bg-[var(--chat-warning)]/5"
            : "border-[var(--chat-border)] bg-[var(--chat-input-bg,var(--chat-card-hover))]"
        )}
      >
        {/* ─── Estado: la IA está redactando ─────────────────────────────
            Va ARRIBA del textarea, no en la barra de herramientas, por dos
            razones: aquí cabe la frase entera en cualquier ancho (sin truncar
            ni esconderla en móvil), y deja la fila de abajo intacta — que el
            botón no se mueva es lo que hace leer Enviar→Parar como un mismo
            control cambiando de estado y no como que apareció otro. */}
        {showBusyStatus && (
          <div
            id={busyStatusId}
            data-slot="composer-busy"
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 px-3.5 pt-2.5 text-xs text-[var(--chat-muted)]"
          >
            <span className="flex items-center gap-0.5 shrink-0" aria-hidden="true">
              {[0, 180, 360].map((delay) => (
                <span
                  key={delay}
                  className="h-1.5 w-1.5 rounded-full bg-[var(--chat-primary)] cf-animate-typing-dot"
                  style={{ "--cf-dot-delay": `${delay}ms` } as CSSProperties}
                />
              ))}
            </span>
            <span className="min-w-0 truncate">{busyLabel}</span>
          </div>
        )}

        {/* Textarea */}
        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={resolvedPlaceholder}
            disabled={disabled}
            aria-describedby={showBusyStatus ? busyStatusId : undefined}
            rows={1}
            className={cn(
              "w-full resize-none bg-transparent",
              // La fila de estado ya aportó aire arriba; sin ella, padding normal.
              showBusyStatus ? "px-3.5 pt-1.5 pb-1.5" : "px-3.5 pt-3 pb-1.5",
              "text-[var(--chat-foreground)] text-sm",
              "placeholder:text-[var(--chat-muted)]",
              "focus:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            style={{ maxHeight: `${maxHeight}px` }}
          />

          {/* ─── Bottom toolbar ─── */}
          <div className="flex items-center gap-0.5 px-2 pb-2">
            {/* Custom leading content (e.g. emoji picker with popover) */}
            {toolbarLeading}

            {/* Leading: attach, emoji, custom toolbar items */}
            {showAttachInMode && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  onClick={handleAttachClick}
                  disabled={disabled}
                  className="p-1.5 rounded-lg text-[var(--chat-muted)] hover:text-[var(--chat-foreground)] hover:bg-[var(--chat-border)]/50 transition-colors disabled:opacity-50"
                  title="Adjuntar archivo"
                >
                  <Paperclip className="w-[18px] h-[18px]" />
                </button>
              </>
            )}

            {showEmoji && (
              <button
                type="button"
                disabled={disabled}
                className="p-1.5 rounded-lg text-[var(--chat-muted)] hover:text-[var(--chat-foreground)] hover:bg-[var(--chat-border)]/50 transition-colors disabled:opacity-50"
                title="Emojis"
              >
                <Smile className="w-[18px] h-[18px]" />
              </button>
            )}

            {visibleToolbarItems?.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                disabled={disabled}
                className="p-1.5 rounded-lg text-[var(--chat-muted)] hover:text-[var(--chat-foreground)] hover:bg-[var(--chat-border)]/50 transition-colors disabled:opacity-50"
                title={item.label}
              >
                {item.icon}
              </button>
            ))}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Botón primario — mismo hueco, misma caja, dos estados.
                Parar no es rojo ni de peligro: es el gesto de tomar el hilo,
                así que va en el contraste máximo del tema (foreground sólido),
                inconfundible frente al primary de Enviar sin leerse como error.
                Nunca `disabled` mientras se está parando. */}
            {isBusy ? (
              <button
                type="button"
                onClick={handleStop}
                aria-disabled={stopping || undefined}
                aria-label={stopAccessibleLabel}
                title={stopAccessibleLabel}
                data-slot="composer-stop"
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  "bg-[var(--chat-foreground)] hover:bg-[var(--chat-foreground)]/90 text-[var(--chat-background)]",
                  stopping && "opacity-80"
                )}
              >
                <Square className="w-3.5 h-3.5" fill="currentColor" />
                {stopLabel && <span className="hidden sm:inline">{stopLabel}</span>}
              </button>
            ) : (
              <button
                type="submit"
                disabled={disabled || !message.trim()}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  "disabled:opacity-30 disabled:cursor-not-allowed",
                  isAccented
                    ? "bg-[var(--chat-warning)] hover:bg-[var(--chat-warning)]/90 text-[var(--chat-on-primary)]"
                    : "bg-[var(--chat-primary)] hover:bg-[var(--chat-primary)]/80 text-[var(--chat-on-primary)]"
                )}
              >
                <Send className="w-3.5 h-3.5" />
                {resolvedSendLabel && (
                  <span className="hidden sm:inline">{resolvedSendLabel}</span>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ─── Legacy quick actions (deprecated) ─── */}
      {quickActions && quickActions.length > 0 && (
        <div className="flex items-center gap-2 px-4 pb-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={disabled}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                "text-xs font-medium",
                "bg-[var(--chat-card-hover)] text-[var(--chat-muted)]",
                "hover:bg-[var(--chat-border)] hover:text-[var(--chat-foreground)]",
                "transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
