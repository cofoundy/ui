import type { Meta, StoryObj } from "@storybook/react";
import { useState, useCallback } from "react";
import { MessageComposer } from "../../components/messaging/inputs/MessageComposer";
import { MessageSquareText, Smile, StickyNote, Reply, Sparkles, MessageSquare, Send, Pencil } from "lucide-react";
import { VIEWPORT_MOBILE } from "../_shared/viewports";

const meta: Meta<typeof MessageComposer> = {
  title: "Messaging/MessageComposer",
  component: MessageComposer,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[500px] max-w-full bg-[var(--chat-background)] p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MessageComposer>;

export const Default: Story = {
  args: {
    onSend: (message) => console.log("Send:", message),
    placeholder: "Type a message...",
  },
};

export const WithAttachment: Story = {
  args: {
    onSend: (message) => console.log("Send:", message),
    onAttach: (files) => console.log("Attach:", files),
    showAttachment: true,
  },
};

export const WithToolbarItems: Story = {
  args: {
    onSend: (message) => console.log("Send:", message),
    onAttach: (files) => console.log("Attach:", files),
    showAttachment: true,
    toolbarItems: [
      {
        id: "emoji",
        icon: <Smile className="w-[18px] h-[18px]" />,
        label: "Emojis",
        onClick: () => console.log("Emoji clicked"),
      },
      {
        id: "template",
        icon: <MessageSquareText className="w-[18px] h-[18px]" />,
        label: "WhatsApp Template",
        onClick: () => console.log("Template clicked"),
        hideInModes: ["note"],
      },
    ],
  },
};

/** Intercom/Front pattern: tabs to switch between Reply and Internal Note */
export const WithModeTabs = () => {
  const [mode, setMode] = useState("reply");

  return (
    <MessageComposer
      onSend={(msg) => console.log(`[${mode}] Send:`, msg)}
      onAttach={(files) => console.log("Attach:", files)}
      showAttachment={true}
      modes={[
        {
          id: "reply",
          label: "Responder",
          icon: <Reply className="w-3.5 h-3.5" />,
          placeholder: "Escribe un mensaje...",
          sendLabel: "Enviar",
        },
        {
          id: "note",
          label: "Nota interna",
          icon: <StickyNote className="w-3.5 h-3.5" />,
          placeholder: "Escribe una nota interna...",
          sendLabel: "Añadir",
          activeClass: "text-amber-400 border-amber-400",
        },
      ]}
      activeMode={mode}
      onModeChange={setMode}
      toolbarItems={[
        {
          id: "emoji",
          icon: <Smile className="w-[18px] h-[18px]" />,
          label: "Emojis",
          onClick: () => console.log("Emoji"),
        },
        {
          id: "template",
          icon: <MessageSquareText className="w-[18px] h-[18px]" />,
          label: "Plantilla WhatsApp",
          onClick: () => console.log("Template"),
          hideInModes: ["note"],
        },
      ]}
    />
  );
};

export const Disabled: Story = {
  args: {
    onSend: (message) => console.log("Send:", message),
    disabled: true,
    placeholder: "Conversation closed",
  },
};

/**
 * Instruir AI flow — Option D: Editable preview + pencil on instruction.
 *
 * Flow: Responder tab (normal composer) ↔ Instruir AI tab (instruction → generate → editable preview → send)
 * "Editar" button is gone — the preview IS a textarea. Pencil icon lets you re-instruct.
 */
export const InstructAIFlow = () => {
  const [isInstructMode, setIsInstructMode] = useState(false);
  const [instructionText, setInstructionText] = useState("");
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    const instruction = instructionText.trim();
    if (!instruction) return;
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise((r) => setTimeout(r, 1500));
    setGeneratedText(
      `Hola! Si, tenemos disponibilidad el martes a las 3pm. Te agendo? 😊\n\nQuedo atento a tu confirmacion.`
    );
    setIsGenerating(false);
  }, [instructionText]);

  const handleSendGenerated = useCallback(() => {
    if (!generatedText) return;
    console.log("[Instruir AI] Sent:", generatedText);
    setGeneratedText(null);
    setInstructionText("");
    setIsInstructMode(false);
  }, [generatedText]);

  const handleBackToInstruction = useCallback(() => {
    setGeneratedText(null);
    // instructionText stays — user lands back on textarea with their original query
  }, []);

  return (
    <div className="w-[500px] bg-[var(--chat-background)]">
      {/* Simulated message area */}
      <div className="p-4 space-y-2">
        <div className="ml-auto max-w-[80%] bg-blue-600/30 rounded-xl px-3 py-2 text-sm text-white/80">
          Hola! Solo pasaba para recordarte del formulario del portfolio 😁
        </div>
        <div className="max-w-[80%] bg-white/10 rounded-xl px-3 py-2 text-sm text-white/80">
          Ah si! Lo tengo pendiente, lo lleno hoy
        </div>
        <div className="max-w-[80%] bg-white/10 rounded-xl px-3 py-2 text-sm text-white/80">
          Tienen disponibilidad esta semana para una llamada?
        </div>
      </div>

      {/* Composer area */}
      <div className="border-t border-white/10">
        {/* Mode tabs */}
        <div className="flex items-center gap-1 px-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setIsInstructMode(false);
              setGeneratedText(null);
              setInstructionText("");
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
              !isInstructMode
                ? "text-[var(--chat-primary)] border-[var(--chat-primary)]"
                : "text-white/40 border-transparent hover:text-white/60"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Responder
          </button>
          <button
            type="button"
            onClick={() => setIsInstructMode(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
              isInstructMode
                ? "text-purple-400 border-purple-400"
                : "text-white/40 border-transparent hover:text-white/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Instruir AI
          </button>
        </div>

        {/* Respond mode: normal composer */}
        {!isInstructMode && (
          <MessageComposer
            onSend={(msg) => console.log("[Reply] Send:", msg)}
            placeholder="Escribe un mensaje..."
            showAttachment
          />
        )}

        {/* Instruct AI: instruction input */}
        {isInstructMode && !generatedText && (
          <div className="mx-3 mb-3 mt-2 rounded-xl border border-purple-500/30 bg-purple-500/5">
            <textarea
              value={instructionText}
              onChange={(e) => setInstructionText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder="Ej: dile que si tenemos el martes a las 3..."
              disabled={isGenerating}
              rows={2}
              className="w-full resize-none bg-transparent px-3.5 pt-3 pb-1.5 text-white text-sm placeholder:text-white/30 focus:outline-none disabled:opacity-50"
            />
            <div className="flex items-center justify-end px-2 pb-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !instructionText.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Generar
              </button>
            </div>
          </div>
        )}

        {/* Instruct AI: editable preview (Option D) */}
        {isInstructMode && generatedText && (
          <div className="mx-3 mb-3 mt-2 space-y-2">
            {/* Editable textarea with the generated draft */}
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/5">
              <textarea
                value={generatedText}
                onChange={(e) => setGeneratedText(e.target.value)}
                rows={3}
                className="w-full resize-none bg-transparent px-3.5 pt-3 pb-1.5 text-white text-sm focus:outline-none"
              />
            </div>

            {/* Instruction line with pencil to go back */}
            <button
              type="button"
              onClick={handleBackToInstruction}
              className="group flex items-center gap-1.5 px-1 text-xs text-white/30 hover:text-purple-400 transition-colors cursor-pointer"
            >
              <Pencil className="w-3 h-3" />
              <span className="truncate max-w-[400px]">{instructionText}</span>
            </button>

            {/* Send button */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleSendGenerated}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Enviar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Estado ocupado — la IA está despachando y el operador quiere entrar
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * `busy` — Sofía está respondiendo, y enviar no está disponible.
 *
 * La regla de producto es que no haya mensajes cruzados: si el operador entra,
 * entra. Por eso la acción primaria no se deshabilita, se CAMBIA — el mismo
 * hueco, la misma caja, ahora Parar. Parar no es cancelar ni un error: es tomar
 * el hilo, así que va en el contraste máximo del tema, no en rojo.
 *
 * La fila de estado va arriba del textarea a propósito. Ahí cabe la frase
 * entera en cualquier ancho, y deja la barra de abajo quieta: que el botón no
 * se mueva es lo que hace leer Enviar→Parar como un control cambiando de
 * estado y no como que apareció otro.
 */
export const Busy: Story = {
  args: {
    onSend: (message) => console.log("Send:", message),
    onStop: () => console.log("Stop"),
    onAttach: (files) => console.log("Attach:", files),
    showAttachment: true,
    busy: true,
    busyLabel: "Sofía está respondiendo…",
    stopLabel: "Parar",
    sendLabel: "Enviar",
    placeholder: "Escribe un mensaje...",
  },
};

/**
 * `busy` con borrador escrito — lo que se bloquea es el ENVÍO, no la escritura.
 *
 * El operador puede ir redactando mientras la IA termina, y su texto sobrevive
 * a parar. Por eso el textarea nunca se deshabilita con `busy` (`disabled` sí
 * lo hace, y gana: ese sigue significando "el compositor entero está inerte").
 */
export const BusyWithDraft = () => {
  const [busy, setBusy] = useState(true);

  return (
    <div className="w-[500px] bg-[var(--chat-background)]">
      <MessageComposer
        key={busy ? "busy" : "idle"}
        onSend={(msg) => console.log("Send:", msg)}
        onStop={() => setBusy(false)}
        onAttach={(files) => console.log("Attach:", files)}
        showAttachment
        busy={busy}
        busyLabel="Sofía está respondiendo…"
        stopLabel="Parar"
        sendLabel="Enviar"
        placeholder="Escribe un mensaje..."
      />
      <div className="px-4 pb-3 text-xs text-[var(--chat-muted)]">
        Escribe algo y pulsa Parar: el borrador sigue ahí, y el control vuelve a
        ser Enviar.{" "}
        {!busy && (
          <button
            type="button"
            onClick={() => setBusy(true)}
            className="underline underline-offset-2 hover:text-[var(--chat-foreground)]"
          >
            Volver a ocupado
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * El turno completo, como se ve en el inbox: la IA arranca, despacha burbujas,
 * y el operador la interrumpe para entrar él.
 */
export const BusyLiveTurn = () => {
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const startAI = useCallback(() => {
    setBusy(true);
    setLog((prev) => [...prev, "IA: empieza a redactar"]);
  }, []);

  const handleStop = useCallback(() => {
    setBusy(false);
    setLog((prev) => [...prev, "operador: toma el hilo (onStop)"]);
  }, []);

  return (
    <div className="w-[500px] bg-[var(--chat-background)]">
      <div className="px-3 pt-3">
        <button
          type="button"
          onClick={startAI}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--chat-border)] px-3 py-1.5 text-xs font-medium text-[var(--chat-muted)] transition-colors hover:text-[var(--chat-foreground)] disabled:opacity-30"
        >
          <Sparkles className="w-3 h-3" />
          Simular respuesta de la IA
        </button>
      </div>

      <MessageComposer
        onSend={(msg) => setLog((prev) => [...prev, `operador: envía "${msg}"`])}
        onStop={handleStop}
        onAttach={(files) => console.log("Attach:", files)}
        showAttachment
        busy={busy}
        busyLabel="Sofía está respondiendo…"
        stopLabel="Parar"
        sendLabel="Enviar"
        placeholder="Escribe un mensaje..."
      />

      {log.length > 0 && (
        <div className="px-4 pb-3 font-mono text-xs text-[var(--chat-muted)]">
          {log.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Móvil (375 px). La etiqueta del botón se esconde igual que en Enviar, así que
 * Parar queda como icono — pero conserva su nombre accesible. La fila de estado
 * sí sobrevive entera: por eso no vive en la barra de herramientas, donde
 * habría tenido que competir con los iconos y truncarse.
 */
export const BusyMobileBaseline: Story = {
  parameters: { viewport: VIEWPORT_MOBILE },
  decorators: [
    (Story) => (
      <div className="w-full bg-[var(--chat-background)] py-2">
        <Story />
      </div>
    ),
  ],
  args: {
    onSend: (message) => console.log("Send:", message),
    onStop: () => console.log("Stop"),
    onAttach: (files) => console.log("Attach:", files),
    showAttachment: true,
    busy: true,
    busyLabel: "Sofía está respondiendo…",
    stopLabel: "Parar",
    sendLabel: "Enviar",
    placeholder: "Escribe un mensaje...",
  },
};

/**
 * `disabled` gana sobre `busy` — el compositor entero está inerte y se comporta
 * como siempre lo hizo: Enviar deshabilitado, sin fila de estado, sin Parar.
 */
export const BusyButDisabled: Story = {
  args: {
    onSend: (message) => console.log("Send:", message),
    onStop: () => console.log("Stop"),
    disabled: true,
    busy: true,
    busyLabel: "Sofía está respondiendo…",
    stopLabel: "Parar",
    sendLabel: "Enviar",
    placeholder: "Conversación cerrada",
  },
};
