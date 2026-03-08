import type { Meta, StoryObj } from "@storybook/react";
import { useState, useCallback } from "react";
import { MessageComposer } from "../../components/messaging/inputs/MessageComposer";
import { MessageSquareText, Smile, StickyNote, Reply, Sparkles, MessageSquare, Send, Pencil } from "lucide-react";

const meta: Meta<typeof MessageComposer> = {
  title: "Messaging/MessageComposer",
  component: MessageComposer,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[500px] bg-[var(--chat-background)] p-4">
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
