import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { StatusPill, type StatusPillTone } from "../../components/ui/status-pill";

/**
 * StatusPill — dot + short label for the state of a thing. Changing `tone` or the label
 * morphs the SAME pill: colour cross-tints and the width springs (smooth); the label swaps
 * by opacity (old leaves first, then the new one enters). Reduced motion: instant width.
 */
const meta: Meta<typeof StatusPill> = {
  title: "UI/StatusPill",
  component: StatusPill,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    tone: { control: "radio", options: ["ok", "warn", "danger", "info", "muted"] },
    size: { control: "radio", options: ["sm", "default"] },
  },
  args: { tone: "ok", children: "Conectado", size: "default", dot: true },
};
export default meta;
type Story = StoryObj<typeof StatusPill>;

export const Default: Story = {};

export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <StatusPill tone="muted">Sin conectar</StatusPill>
      <StatusPill tone="info">Verificando</StatusPill>
      <StatusPill tone="ok">Conectado</StatusPill>
      <StatusPill tone="warn">Sin mensajes hace 6 h</StatusPill>
      <StatusPill tone="danger">Error</StatusPill>
      <StatusPill tone="ok" dot={false}>Sin punto</StatusPill>
      <StatusPill tone="info" size="sm">En cocina</StatusPill>
    </div>
  ),
};

const CYCLE: { tone: StatusPillTone; label: string }[] = [
  { tone: "muted", label: "Sin conectar" },
  { tone: "info", label: "Verificando" },
  { tone: "ok", label: "Conectado" },
  { tone: "warn", label: "Sin mensajes hace 6 h" },
  { tone: "danger", label: "Error" },
];

function MorphDemo() {
  const [i, setI] = useState(0);
  const cur = CYCLE[i];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <StatusPill tone={cur.tone} live>{cur.label}</StatusPill>
      <button type="button" onClick={() => setI((i + 1) % CYCLE.length)}>Cambiar estado</button>
    </div>
  );
}

export const Morph: Story = { render: () => <MorphDemo /> };

export const Light: Story = {
  render: () => (
    <div data-theme="light" style={{ padding: 24, background: "#fff", display: "flex", gap: 8 }}>
      <StatusPill tone="ok">Conectado</StatusPill>
      <StatusPill tone="warn">Demorado</StatusPill>
      <StatusPill tone="danger">Rechazado</StatusPill>
    </div>
  ),
};
