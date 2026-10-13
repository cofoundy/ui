import type { Meta, StoryObj } from "@storybook/react";
import { Calculator, FileSearch, Mail } from "lucide-react";
import {
  ToolInvocation,
  ToolInvocationGroup,
} from "../../components/messaging/composed/ToolInvocation";
import { VIEWPORT_MOBILE } from "../_shared/viewports";

/**
 * Data below is fictitious. Its SHAPE mirrors Fovente's `metadata.ai_trace.tool_calls[]`
 * entry: `{ tool, args, result_preview }` — `result_preview` is the tool's JSON result,
 * truncated to 200 chars with «…» (a truncated preview is shown as text, a complete one
 * is pretty-printed).
 */
const meta: Meta<typeof ToolInvocation> = {
  title: "Messaging/ToolInvocation",
  component: ToolInvocation,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Collapsible card for one tool call of an AI turn: readable name, one-line summary, status pill, and folded input/output. Reference: Vercel AI Elements «Tool» (https://elements.ai-sdk.dev/components/tool). Group several with `ToolInvocationGroup`.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    state: {
      control: "select",
      options: ["input-streaming", "input-available", "output-available", "output-error"],
    },
    density: { control: "inline-radio", options: ["default", "compact"] },
  },
};

export default meta;
type Story = StoryObj<typeof ToolInvocation>;

export const Default: Story = {
  args: {
    name: "Consultar tarifario",
    summary: "Consultó tarifario MSL · Ningbo",
    state: "output-available",
    input: { carrier: "MSL", origin: "Ningbo", destination: "Callao", mode: "LCL" },
    output: '{"success": true, "rate_usd_per_wm": 95, "min_wm": 1, "valid_until": "2026-10-31"}',
  },
};

export const Open: Story = {
  args: { ...Default.args, defaultOpen: true },
};

export const Running: Story = {
  args: {
    name: "Calcular flete",
    summary: "Calculando W/M…",
    state: "input-available",
    input: { volume_m3: 4.2, weight_kg: 1800 },
    defaultOpen: true,
  },
};

export const Streaming: Story = {
  args: {
    name: "Calcular flete",
    state: "input-streaming",
    defaultOpen: true,
  },
};

export const ErrorState: Story = {
  name: "Error",
  args: {
    name: "Consultar tarifario",
    summary: "Ningbo → Paita",
    state: "output-error",
    input: { carrier: "MSL", origin: "Ningbo", destination: "Paita" },
    errorText: "No hay tarifa vigente para esa ruta.",
    defaultOpen: true,
  },
};

export const TruncatedPreview: Story = {
  name: "Truncated result_preview (production shape)",
  args: {
    name: "load_script",
    summary: "Cargó el guion «cotizaciones»",
    input: { name: "cotizaciones" },
    output:
      '{"success": true, "name": "cotizaciones", "content": "## Cómo cotizar\\n1. Pide volumen (m³) y peso (kg).\\n2. Calcula W/M = max(m³, t).\\n3. Multiplica por la tarifa vigente de la ruta y suma los recargos de origen…',
    defaultOpen: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <ToolInvocation name="Consultar tarifario" summary="MSL · Ningbo" state="input-streaming" />
      <ToolInvocation name="Calcular flete" summary="W/M 4,2" state="input-available" />
      <ToolInvocation
        name="Calcular flete"
        summary="Calculó W/M 4,2 → USD 399"
        state="output-available"
      />
      <ToolInvocation
        name="Enviar cotización"
        summary="Correo a compras@ejemplo.pe"
        state="output-error"
        errorText="Falta el correo del destinatario."
      />
    </div>
  ),
};

export const Localized: Story = {
  name: "Labels overridden (Spanish)",
  args: {
    ...Default.args,
    defaultOpen: true,
    labels: {
      pending: "Preparando",
      running: "Ejecutando",
      completed: "Listo",
      error: "Falló",
      input: "Entrada",
      output: "Resultado",
      errorHeading: "Error",
      waiting: "Esperando resultado…",
    },
  },
};

export const Compact: Story = {
  args: { ...Default.args, density: "compact" },
};

export const Group: StoryObj<typeof ToolInvocationGroup> = {
  name: "Group — one AI turn",
  render: () => (
    <ToolInvocationGroup
      defaultOpen
      summary="Tarifario · Calculadora · Borrador de correo"
      labels={{ title: (n) => `La IA hizo ${n} acciones` }}
    >
      <ToolInvocation
        icon={<FileSearch className="size-3.5" />}
        name="Consultar tarifario"
        summary="Consultó tarifario MSL · Ningbo"
        input={{ carrier: "MSL", origin: "Ningbo", destination: "Callao" }}
        output='{"success": true, "rate_usd_per_wm": 95}'
      />
      <ToolInvocation
        icon={<Calculator className="size-3.5" />}
        name="Calcular flete"
        summary="Calculó W/M 4,2 → USD 399"
        input={{ volume_m3: 4.2, weight_kg: 1800, rate_usd_per_wm: 95 }}
        output={{ wm: 4.2, total_usd: 399 }}
      />
      <ToolInvocation
        icon={<Mail className="size-3.5" />}
        name="Preparar borrador"
        summary="Borrador para compras@ejemplo.pe"
        state="output-error"
        errorText="El tenant no tiene firma configurada."
      />
    </ToolInvocationGroup>
  ),
};

export const MobileBaseline: Story = {
  parameters: { viewport: VIEWPORT_MOBILE },
  render: () => (
    <ToolInvocationGroup defaultOpen>
      <ToolInvocation
        name="Consultar tarifario con un nombre bastante largo para probar el truncado"
        summary="Consultó tarifario MSL · Ningbo → Callao · LCL · vigencia octubre"
        input={{ carrier: "MSL", origin: "Ningbo" }}
        output='{"success": true, "rate_usd_per_wm": 95}'
        defaultOpen
      />
      <ToolInvocation name="Calcular flete" summary="Calculó W/M 4,2 → USD 399" />
    </ToolInvocationGroup>
  ),
};
