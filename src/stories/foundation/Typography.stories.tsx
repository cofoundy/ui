import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Foundation/Typography",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

const TypeSample = ({
  label,
  className,
  sample = "The quick brown fox jumps over the lazy dog",
}: {
  label: string;
  className: string;
  sample?: string;
}) => (
  <div className="mb-6">
    <span className="text-xs text-[var(--chat-muted)] font-mono mb-1 block">{label}</span>
    <p className={`text-[var(--chat-foreground)] ${className}`}>{sample}</p>
  </div>
);

export const FontFamilies: Story = {
  name: "Font Families",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Font Families</h2>
      <p className="text-[var(--chat-muted)] mb-8">
        From Brand Book: Inter for UI, JetBrains Mono for code
      </p>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--chat-foreground)]">
            Inter - Primary Font
          </h3>
          <p className="text-[var(--chat-muted)] text-sm mb-4">
            Used for titles, body text, and all UI elements
          </p>
          <div className="p-4 bg-[var(--chat-input-bg)] rounded-lg border border-[var(--chat-border)]">
            <p className="text-4xl font-bold mb-2 text-[var(--chat-foreground)]" style={{ fontFamily: "Inter, sans-serif" }}>
              Cofoundy
            </p>
            <p className="text-xl text-[var(--chat-foreground)]" style={{ fontFamily: "Inter, sans-serif" }}>
              Productos de software en semanas, no meses.
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--chat-foreground)]">
            JetBrains Mono - Code Font
          </h3>
          <p className="text-[var(--chat-muted)] text-sm mb-4">
            Used for code snippets, technical content, monospace text
          </p>
          <div className="p-4 bg-[#0f172a] rounded-lg">
            <pre
              className="text-sm text-[#22c55e]"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
{`const startup = {
  speed: "10x",
  stack: "modern",
  ai: true
};`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const TypeScale: Story = {
  name: "Type Scale",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Type Scale</h2>
      <p className="text-[var(--chat-muted)] mb-8">
        Tailwind CSS type scale used across components
      </p>

      <div className="space-y-1">
        <TypeSample label="text-xs (12px)" className="text-xs" />
        <TypeSample label="text-sm (14px)" className="text-sm" />
        <TypeSample label="text-base (16px)" className="text-base" />
        <TypeSample label="text-lg (18px)" className="text-lg" />
        <TypeSample label="text-xl (20px)" className="text-xl" />
        <TypeSample label="text-2xl (24px)" className="text-2xl" />
        <TypeSample label="text-3xl (30px)" className="text-3xl" />
        <TypeSample label="text-4xl (36px)" className="text-4xl" />
      </div>
    </div>
  ),
};

export const FontWeights: Story = {
  name: "Font Weights",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Font Weights</h2>
      <p className="text-[var(--chat-muted)] mb-8">
        Available font weights for Inter
      </p>

      <div className="space-y-4">
        <TypeSample
          label="font-normal (400)"
          className="text-2xl font-normal"
          sample="Regular weight for body text"
        />
        <TypeSample
          label="font-medium (500)"
          className="text-2xl font-medium"
          sample="Medium weight for emphasis"
        />
        <TypeSample
          label="font-semibold (600)"
          className="text-2xl font-semibold"
          sample="Semibold for subheadings"
        />
        <TypeSample
          label="font-bold (700)"
          className="text-2xl font-bold"
          sample="Bold for titles and headings"
        />
      </div>
    </div>
  ),
};

export const TextColors: Story = {
  name: "Text Colors",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Text Colors</h2>
      <p className="text-[var(--chat-muted)] mb-8">
        Text color hierarchy (adapts to current theme)
      </p>

      <div className="space-y-4">
        <div>
          <span className="text-xs text-[var(--chat-muted)] font-mono">--chat-foreground</span>
          <p className="text-xl text-[var(--chat-foreground)]">
            Primary text - High contrast, main content
          </p>
        </div>
        <div>
          <span className="text-xs text-[var(--chat-muted)] font-mono">--chat-foreground/90</span>
          <p className="text-xl text-[var(--chat-foreground)]/90">
            Secondary text - Slightly muted
          </p>
        </div>
        <div>
          <span className="text-xs text-[var(--chat-muted)] font-mono">--chat-muted</span>
          <p className="text-xl text-[var(--chat-muted)]">
            Muted text - Captions, timestamps, hints
          </p>
        </div>
        <div>
          <span className="text-xs text-[var(--chat-muted)] font-mono">--chat-primary</span>
          <p className="text-xl text-[var(--chat-primary)]">
            Primary accent - Links, highlights, actions
          </p>
        </div>
        <div>
          <span className="text-xs text-[var(--chat-muted)] font-mono">--chat-success</span>
          <p className="text-xl text-[var(--chat-success)]">
            Success - Confirmations, positive feedback
          </p>
        </div>
        <div>
          <span className="text-xs text-[var(--chat-muted)] font-mono">--chat-error</span>
          <p className="text-xl text-[var(--chat-error)]">
            Error - Warnings, destructive actions
          </p>
        </div>
      </div>
    </div>
  ),
};

export const BrandVoice: Story = {
  name: "Brand Voice Examples",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Brand Voice</h2>
      <p className="text-[var(--chat-muted)] mb-8">
        From Brand Book: Directa, Tecnica pero accesible, Confiada, Honesta
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 bg-[var(--chat-success)]/10 rounded-lg border border-[var(--chat-success)]/30">
          <span className="text-xs font-semibold text-[var(--chat-success)] mb-2 block">
            BIEN
          </span>
          <p className="text-[var(--chat-foreground)]">
            "Tu landing esta tardando 6 segundos en cargar. Google penaliza
            arriba de 3. Te lo arreglamos en una semana."
          </p>
        </div>

        <div className="p-4 bg-[var(--chat-error)]/10 rounded-lg border border-[var(--chat-error)]/30">
          <span className="text-xs font-semibold text-[var(--chat-error)] mb-2 block">
            MAL
          </span>
          <p className="text-[var(--chat-foreground)]">
            "Hemos detectado que su sitio web presenta oportunidades de mejora
            en terminos de rendimiento y velocidad de carga..."
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-[var(--chat-input-bg)] rounded-lg border border-[var(--chat-border)]">
        <h4 className="font-semibold mb-2 text-[var(--chat-foreground)]">Tone Guidelines</h4>
        <ul className="text-sm text-[var(--chat-muted)] space-y-1">
          <li>• <strong className="text-[var(--chat-foreground)]">Discovery call:</strong> Curioso, consultivo</li>
          <li>• <strong className="text-[var(--chat-foreground)]">Propuesta:</strong> Profesional, claro</li>
          <li>• <strong className="text-[var(--chat-foreground)]">WhatsApp:</strong> Cercano, directo</li>
          <li>• <strong className="text-[var(--chat-foreground)]">Problema tecnico:</strong> Transparente, solucionador</li>
          <li>• <strong className="text-[var(--chat-foreground)]">Redes sociales:</strong> Informal, tecnico-accesible</li>
        </ul>
      </div>
    </div>
  ),
};
