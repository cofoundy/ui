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
    <span className="text-xs text-gray-500 font-mono mb-1 block">{label}</span>
    <p className={className}>{sample}</p>
  </div>
);

export const FontFamilies: Story = {
  name: "Font Families",
  render: () => (
    <div className="p-6 bg-white rounded-xl">
      <h2 className="text-2xl font-bold mb-2">Font Families</h2>
      <p className="text-gray-600 mb-8">
        From Brand Book: Inter for UI, JetBrains Mono for code
      </p>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Inter - Primary Font
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Used for titles, body text, and all UI elements
          </p>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-4xl font-bold mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
              Cofoundy
            </p>
            <p className="text-xl" style={{ fontFamily: "Inter, sans-serif" }}>
              Productos de software en semanas, no meses.
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            JetBrains Mono - Code Font
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Used for code snippets, technical content, monospace text
          </p>
          <div className="p-4 bg-gray-900 rounded-lg">
            <pre
              className="text-sm text-green-400"
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
    <div className="p-6 bg-white rounded-xl">
      <h2 className="text-2xl font-bold mb-2">Type Scale</h2>
      <p className="text-gray-600 mb-8">
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
    <div className="p-6 bg-white rounded-xl">
      <h2 className="text-2xl font-bold mb-2">Font Weights</h2>
      <p className="text-gray-600 mb-8">
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
    <div className="p-6 bg-[#020b1b] rounded-xl" data-theme="dark">
      <h2 className="text-2xl font-bold mb-2 text-white">Text Colors (Dark Theme)</h2>
      <p className="text-gray-400 mb-8">
        Text color hierarchy for dark theme
      </p>

      <div className="space-y-4">
        <div>
          <span className="text-xs text-gray-500 font-mono">--chat-foreground</span>
          <p className="text-xl text-white">
            Primary text - High contrast, main content
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-500 font-mono">--chat-foreground/90</span>
          <p className="text-xl text-white/90">
            Secondary text - Slightly muted
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-500 font-mono">--chat-muted</span>
          <p className="text-xl text-[#94a3b8]">
            Muted text - Captions, timestamps, hints
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-500 font-mono">--chat-primary</span>
          <p className="text-xl text-[#46A0D0]">
            Primary accent - Links, highlights, actions
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-500 font-mono">--chat-success</span>
          <p className="text-xl text-[#22c55e]">
            Success - Confirmations, positive feedback
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-500 font-mono">--chat-error</span>
          <p className="text-xl text-[#ef4444]">
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
    <div className="p-6 bg-white rounded-xl">
      <h2 className="text-2xl font-bold mb-2">Brand Voice</h2>
      <p className="text-gray-600 mb-8">
        From Brand Book: Directa, Tecnica pero accesible, Confiada, Honesta
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <span className="text-xs font-semibold text-green-700 mb-2 block">
            BIEN
          </span>
          <p className="text-gray-800">
            "Tu landing esta tardando 6 segundos en cargar. Google penaliza
            arriba de 3. Te lo arreglamos en una semana."
          </p>
        </div>

        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <span className="text-xs font-semibold text-red-700 mb-2 block">
            MAL
          </span>
          <p className="text-gray-800">
            "Hemos detectado que su sitio web presenta oportunidades de mejora
            en terminos de rendimiento y velocidad de carga..."
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Tone Guidelines</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Discovery call:</strong> Curioso, consultivo</li>
          <li>• <strong>Propuesta:</strong> Profesional, claro</li>
          <li>• <strong>WhatsApp:</strong> Cercano, directo</li>
          <li>• <strong>Problema tecnico:</strong> Transparente, solucionador</li>
          <li>• <strong>Redes sociales:</strong> Informal, tecnico-accesible</li>
        </ul>
      </div>
    </div>
  ),
};
