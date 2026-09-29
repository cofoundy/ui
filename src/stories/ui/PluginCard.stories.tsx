import type { Meta, StoryObj } from "@storybook/react";
import { useRef, useState } from "react";
import { Bell, CalendarDays, CheckCircle2, RefreshCw, Star } from "lucide-react";

import {
  PluginCard,
  PluginCardSkeleton,
  PluginSheet,
  type PluginNotice,
  type PluginStatusValue,
} from "../../components/ui/plugin-card";
import type { ButtonStatus } from "../../components/ui/button";

const meta: Meta<typeof PluginCard> = {
  title: "UI/PluginCard",
  component: PluginCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Catalog card (stretched link, ONE action) + detail sheet with ONE primary whose `Button status` morphs Instalar → Instalando → ✓ Instalado. The caller translates its state into `{ tone, label }`; never print raw backend reasons.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PluginCard>;

const grid = "grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3 max-w-[960px]";

export const States: Story = {
  render: () => (
    <div className={grid}>
      <PluginCard
        icon={<CalendarDays />}
        name="Reservas"
        summary="Tu agente toma reservas de mesa por WhatsApp y te avisa cada una."
        status={{ tone: "neutral", label: "Disponible" }}
        action={{ label: "Instalar", onClick: () => {} }}
        onOpen={() => {}}
      />
      <PluginCard
        icon={<Bell />}
        name="Recordatorios"
        summary="Le recuerda al cliente su reserva unas horas antes para que no falte."
        status={{ tone: "warn", label: "Falta configurar" }}
        reason="Falta: la plantilla del recordatorio."
        action={{ label: "Completar", onClick: () => {} }}
        onOpen={() => {}}
      />
      <PluginCard
        icon={<Star />}
        name="Encuesta de satisfacción"
        summary="Pregunta cómo le fue al cliente después de su visita."
        status={{ tone: "ok", label: "Activo" }}
        onOpen={() => {}}
      />
      <PluginCard
        icon={<RefreshCw />}
        name="Seguimientos"
        tag="Incluido"
        summary="Retoma las conversaciones que se quedaron sin respuesta hace días."
        status={{ tone: "muted", label: "Pausado hasta mañana 9:00" }}
        reason="El agente no lo usa mientras esté pausado."
        action={{ label: "Reanudar", onClick: () => {} }}
        onOpen={() => {}}
      />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className={grid}>
      <PluginCardSkeleton />
      <PluginCardSkeleton />
      <PluginCardSkeleton />
    </div>
  ),
};

function InstallDemo({ fail = false }: { fail?: boolean }) {
  const [open, setOpen] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [btn, setBtn] = useState<ButtonStatus>("idle");
  const [notice, setNotice] = useState<PluginNotice | null>(null);
  const t = useRef<number | undefined>(undefined);
  const status: PluginStatusValue = installed
    ? { tone: "ok", label: "Activo" }
    : { tone: "neutral", label: "Disponible" };

  const install = () => {
    setBtn("loading");
    t.current = window.setTimeout(() => {
      if (fail) return setBtn("error");
      setInstalled(true);
      setBtn("success");
      setNotice({ id: "ok", tone: "ok", icon: <CheckCircle2 />, title: "Listo. Tu agente ya puede usar Reservas." });
    }, 900);
  };

  return (
    <div className="max-w-[340px]">
      <PluginCard
        icon={<CalendarDays />}
        name="Reservas"
        summary="Tu agente toma reservas de mesa por WhatsApp y te avisa cada una."
        status={status}
        action={installed ? undefined : { label: "Instalar", onClick: () => setOpen(true) }}
        onOpen={() => setOpen(true)}
      />
      <PluginSheet
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) window.clearTimeout(t.current);
        }}
        icon={<CalendarDays />}
        name="Reservas"
        status={status}
        notice={notice}
        summary="Tu agente toma reservas de mesa por WhatsApp y te avisa cada una."
        capabilitiesTitle="Con esto, tu agente puede"
        capabilities={["Ofrecer los horarios libres del día", "Anotar nombre, personas y hora"]}
        guarantee="Nunca confirma una mesa que no esté libre en tu horario."
        primaryAction={{
          label: installed ? "Guardar cambios" : "Instalar y activar",
          status: btn,
          disabled: installed && btn === "idle",
          onClick: install,
        }}
      />
    </div>
  );
}

export const InstallFlow: Story = { render: () => <InstallDemo /> };
export const InstallFails: Story = { render: () => <InstallDemo fail /> };

export const ReadOnly: Story = {
  render: () => (
    <PluginSheet
      open
      onOpenChange={() => {}}
      icon={<Bell />}
      name="Recordatorios"
      status={{ tone: "warn", label: "Falta configurar" }}
      notice={{ tone: "warn", title: "Sin terminar de configurar", description: "Falta la plantilla del recordatorio." }}
      summary="Le recuerda al cliente su reserva unas horas antes para que no falte."
      readOnlyNote="Solo un administrador puede cambiar esta configuración."
    />
  ),
};
