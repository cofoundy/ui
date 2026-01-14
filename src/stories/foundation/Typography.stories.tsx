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
        Zodiak for headlines (premium), Inter for body (technical), JetBrains Mono for code
      </p>

      <div className="space-y-8">
        {/* Zodiak - Display Font */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--chat-foreground)]">
            Zodiak - Display Font
          </h3>
          <p className="text-[var(--chat-muted)] text-sm mb-4">
            Used for headlines and brand moments. Premium, warm feel.
          </p>
          <div className="p-6 bg-[var(--chat-input-bg)] rounded-lg border border-[var(--chat-border)]">
            <p
              className="text-5xl font-bold mb-3 text-[var(--chat-foreground)]"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em", lineHeight: 1.1 }}
            >
              Cofoundy
            </p>
            <p
              className="text-2xl text-[var(--chat-foreground)]"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}
            >
              Productos de software en semanas, no meses.
            </p>
          </div>
          <p className="text-xs text-[var(--chat-muted)] mt-3 font-mono">
            var(--font-display) · Fontshare · Free
          </p>
        </div>

        {/* Inter - Body Font */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--chat-foreground)]">
            Inter - Body Font
          </h3>
          <p className="text-[var(--chat-muted)] text-sm mb-4">
            Used for body text, UI elements, and all readable content. Clean, technical.
          </p>
          <div className="p-6 bg-[var(--chat-input-bg)] rounded-lg border border-[var(--chat-border)]">
            <p
              className="text-base text-[var(--chat-foreground)] leading-relaxed"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Somos tu cofundador tecnico. Construimos productos de software — landing pages,
              apps, agentes de IA — en semanas, no meses. Usamos AI para ser 10x mas rapidos
              que una agencia tradicional, a una fraccion del costo.
            </p>
          </div>
          <p className="text-xs text-[var(--chat-muted)] mt-3 font-mono">
            var(--font-sans) · Google Fonts · Free
          </p>
        </div>

        {/* JetBrains Mono - Code Font */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--chat-foreground)]">
            JetBrains Mono - Code Font
          </h3>
          <p className="text-[var(--chat-muted)] text-sm mb-4">
            Used for code snippets, technical content, monospace text.
          </p>
          <div className="p-4 bg-[#0f172a] rounded-lg">
            <pre
              className="text-sm text-[#22c55e]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
{`const cofoundy = {
  speed: "10x",
  stack: "modern",
  ai: true,
  fonts: ["Zodiak", "Inter", "JetBrains Mono"]
};`}
            </pre>
          </div>
          <p className="text-xs text-[var(--chat-muted)] mt-3 font-mono">
            var(--font-mono) · Google Fonts · Free
          </p>
        </div>
      </div>
    </div>
  ),
};

export const HeadlineStyles: Story = {
  name: "Headline Styles",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Headline Styles</h2>
      <p className="text-[var(--chat-muted)] mb-8">
        Use Zodiak for headlines with tight letter-spacing
      </p>

      <div className="space-y-8">
        <div>
          <span className="text-xs text-[var(--chat-muted)] font-mono mb-2 block">.cf-headline-xl (4rem)</span>
          <p className="cf-headline-xl text-[var(--chat-foreground)]">
            Build faster
          </p>
        </div>
        <div>
          <span className="text-xs text-[var(--chat-muted)] font-mono mb-2 block">.cf-headline-lg (3rem)</span>
          <p className="cf-headline-lg text-[var(--chat-foreground)]">
            Ship in weeks
          </p>
        </div>
        <div>
          <span className="text-xs text-[var(--chat-muted)] font-mono mb-2 block">.cf-headline (inherits size)</span>
          <p className="cf-headline text-4xl text-[var(--chat-foreground)]">
            Not months
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-[var(--chat-input-bg)] rounded-lg border border-[var(--chat-border)]">
        <h4 className="font-semibold mb-2 text-[var(--chat-foreground)]">Usage</h4>
        <pre className="text-xs font-mono text-[var(--chat-muted)]">
{`<h1 className="cf-headline-xl">Hero Title</h1>
<h2 className="cf-headline-lg">Section Title</h2>
<h3 className="cf-headline text-2xl">Subsection</h3>`}
        </pre>
      </div>
    </div>
  ),
};

export const FontPairing: Story = {
  name: "Font Pairing",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Font Pairing</h2>
      <p className="text-[var(--chat-muted)] mb-8">
        How Zodiak and Inter work together
      </p>

      {/* Example Card */}
      <div className="bg-[var(--chat-background)] rounded-2xl border border-[var(--chat-border)] p-8 mb-6">
        <p
          className="text-4xl font-bold mb-4 text-[var(--chat-foreground)]"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em", lineHeight: 1.1 }}
        >
          Tu socio tecnico para crecer rapido
        </p>
        <p
          className="text-lg text-[var(--chat-muted)] mb-6"
          style={{ fontFamily: "var(--font-sans)", lineHeight: 1.6 }}
        >
          Construimos landing pages, MVPs y agentes de IA en semanas.
          Usamos tecnologia de punta para entregar 10x mas rapido que una agencia tradicional.
        </p>
        <button
          className="bg-[var(--chat-primary)] text-white px-6 py-3 rounded-lg font-semibold"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Agenda una llamada
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-4 bg-[var(--chat-input-bg)] rounded-lg border border-[var(--chat-border)]">
          <p className="font-semibold text-[var(--chat-foreground)] mb-1">Zodiak</p>
          <p className="text-[var(--chat-muted)]">Headlines, titles, brand moments</p>
        </div>
        <div className="p-4 bg-[var(--chat-input-bg)] rounded-lg border border-[var(--chat-border)]">
          <p className="font-semibold text-[var(--chat-foreground)] mb-1">Inter</p>
          <p className="text-[var(--chat-muted)]">Body, buttons, UI, captions</p>
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
        Available font weights
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
