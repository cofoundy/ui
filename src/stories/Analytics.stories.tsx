import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { StatCard } from "../components/analytics/StatCard";
import { BarChart } from "../components/analytics/BarChart";
import { StackedBar } from "../components/analytics/StackedBar";
import { DataTable } from "../components/analytics/DataTable";
import { HorizontalBar } from "../components/analytics/HorizontalBar";
import { EmptyState } from "../components/analytics/EmptyState";
import { TimeRangeSelector } from "../components/analytics/TimeRangeSelector";
import { AnalyticsSectionHeader } from "../components/analytics/AnalyticsSectionHeader";

// ─── Sample Data ──────────────────────────────────────────

const weekData = [
  { label: "Lun", value: 42 },
  { label: "Mar", value: 58 },
  { label: "Mie", value: 35 },
  { label: "Jue", value: 67 },
  { label: "Vie", value: 51 },
  { label: "Sab", value: 23 },
  { label: "Dom", value: 14 },
];

const monthData = Array.from({ length: 30 }, (_, i) => ({
  label: `${i + 1}`,
  value: Math.floor(Math.random() * 80 + 10),
}));

const agentColumns = [
  { key: "name", label: "Agente", align: "left" as const, format: "text" as const },
  { key: "response_time", label: "Resp. promedio", align: "right" as const, format: "duration" as const },
  { key: "resolved", label: "Resueltas", align: "right" as const, format: "number" as const },
  { key: "ai_rate", label: "AI manejo", align: "right" as const, format: "percentage" as const },
];

const agentData = [
  { name: "Ana Garcia", response_time: 102, resolved: 47, ai_rate: 82 },
  { name: "Carlos Ruiz", response_time: 190, resolved: 31, ai_rate: 71 },
  { name: "Maria Lopez", response_time: 85, resolved: 52, ai_rate: 88 },
];

const channelData = [
  { label: "WhatsApp", value: 312, color: "var(--channel-whatsapp)" },
  { label: "Telegram", value: 84, color: "var(--channel-telegram)" },
  { label: "Instagram", value: 156, color: "var(--channel-instagram)" },
  { label: "Email", value: 43, color: "var(--channel-email)" },
];

const timeRangeOptions = [
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
];

// ─── StatCard ─────────────────────────────────────────────

const statCardMeta: Meta<typeof StatCard> = {
  title: "Analytics/StatCard",
  component: StatCard,
  tags: ["autodocs"],
};

export default statCardMeta;
type StatCardStory = StoryObj<typeof StatCard>;

export const Default: StatCardStory = {
  args: {
    label: "Conversaciones",
    value: 147,
    format: "number",
  },
};

export const WithTrend: StatCardStory = {
  args: {
    label: "Conversaciones",
    value: 147,
    format: "number",
    trend: { delta: 12, direction: "up" },
  },
};

export const DurationFormat: StatCardStory = {
  args: {
    label: "Resp. promedio",
    value: 132,
    format: "duration",
    trend: { delta: 15, direction: "down" },
    trendPositive: "bad",
  },
};

export const PercentageFormat: StatCardStory = {
  args: {
    label: "Resuelto por AI",
    value: 73,
    format: "percentage",
    trend: { delta: 5, direction: "up" },
  },
};

export const MutedState: StatCardStory = {
  args: {
    label: "Satisfaccion",
    value: 0,
    format: "percentage",
    muted: true,
    mutedText: "< 10 datos",
  },
};

export const AllSizes: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4">
      <StatCard label="Pequeno" value={42} format="number" size="sm" />
      <StatCard label="Default" value={147} format="number" />
      <StatCard label="Grande" value={1247} format="number" size="lg" trend={{ delta: 8, direction: "up" }} />
    </div>
  ),
};

export const KPIRow: StoryObj = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Conversaciones" value={147} format="number" trend={{ delta: 12, direction: "up" }} />
      <StatCard label="Resp. agente" value={132} format="duration" trend={{ delta: 15, direction: "down" }} trendPositive="bad" />
      <StatCard label="Resuelto por AI" value={73} format="percentage" trend={{ delta: 5, direction: "up" }} />
      <StatCard label="Abiertas" value={12} format="number" />
    </div>
  ),
};

// ─── BarChart ─────────────────────────────────────────────

export const BarChartDefault: StoryObj = {
  name: "BarChart / Default (7 dias)",
  render: () => <BarChart data={weekData} height={200} animate />,
};

export const BarChartEmpty: StoryObj = {
  name: "BarChart / Estado vacio",
  render: () => <BarChart data={[]} height={200} />,
};

export const BarChartWithValues: StoryObj = {
  name: "BarChart / Con valores",
  render: () => <BarChart data={weekData} height={200} showValues animate />,
};

export const BarChartSingle: StoryObj = {
  name: "BarChart / Una barra",
  render: () => <BarChart data={[{ label: "Hoy", value: 42 }]} height={200} showValues />,
};

export const BarChartManyBars: StoryObj = {
  name: "BarChart / 30 dias",
  render: () => <BarChart data={monthData} height={200} animate />,
};

// ─── StackedBar ───────────────────────────────────────────

export const StackedBarTwoSegments: StoryObj = {
  name: "StackedBar / AI vs Agente",
  render: () => (
    <StackedBar
      segments={[
        { label: "AI resolvio", value: 107, color: "var(--chat-success)" },
        { label: "Agente resolvio", value: 40, color: "var(--chat-primary)" },
      ]}
      showLegend
      showPercentages
      animate
    />
  ),
};

export const StackedBarThreeSegments: StoryObj = {
  name: "StackedBar / Tres segmentos",
  render: () => (
    <StackedBar
      segments={[
        { label: "AI resolvio", value: 85, color: "var(--chat-success)" },
        { label: "Agente resolvio", value: 40, color: "var(--chat-primary)" },
        { label: "Sin resolver", value: 12, color: "var(--chat-warning)" },
      ]}
      showLegend
      showPercentages
      animate
    />
  ),
};

export const StackedBarSingle: StoryObj = {
  name: "StackedBar / 100% un segmento",
  render: () => (
    <StackedBar
      segments={[{ label: "AI resolvio todo", value: 147, color: "var(--chat-success)" }]}
      showLegend
      showPercentages
    />
  ),
};

export const StackedBarWithLegend: StoryObj = {
  name: "StackedBar / Con leyenda",
  render: () => (
    <StackedBar
      segments={[
        { label: "AI resolvio", value: 107, color: "var(--chat-success)" },
        { label: "Agente resolvio", value: 40, color: "var(--chat-primary)" },
      ]}
      showLegend
      height={24}
    />
  ),
};

// ─── DataTable ────────────────────────────────────────────

export const DataTableAgentPerformance: StoryObj = {
  name: "DataTable / Rendimiento agentes",
  render: () => (
    <DataTable columns={agentColumns} rows={agentData} highlight="best" />
  ),
};

export const DataTableEmpty: StoryObj = {
  name: "DataTable / Estado vacio",
  render: () => (
    <DataTable columns={agentColumns} rows={[]} emptyText="No hay agentes" />
  ),
};

export const DataTableSingleRow: StoryObj = {
  name: "DataTable / Una fila",
  render: () => (
    <DataTable columns={agentColumns} rows={[agentData[0]]} />
  ),
};

export const DataTableWithHighlights: StoryObj = {
  name: "DataTable / Con mejores valores",
  render: () => (
    <DataTable columns={agentColumns} rows={agentData} highlight="best" />
  ),
};

// ─── HorizontalBar ────────────────────────────────────────

export const HorizontalBarChannels: StoryObj = {
  name: "HorizontalBar / Canales",
  render: () => <HorizontalBar items={channelData} showCounts animate />,
};

export const HorizontalBarSingle: StoryObj = {
  name: "HorizontalBar / Un canal",
  render: () => (
    <HorizontalBar
      items={[{ label: "WhatsApp", value: 312, color: "var(--channel-whatsapp)" }]}
      showCounts
    />
  ),
};

export const HorizontalBarNoCount: StoryObj = {
  name: "HorizontalBar / Sin conteo",
  render: () => <HorizontalBar items={channelData} showCounts={false} animate />,
};

// ─── EmptyState ───────────────────────────────────────────

export const EmptyStateDefault: StoryObj = {
  name: "EmptyState / Default",
  render: () => (
    <EmptyState
      title="Aqui veras el rendimiento de tu equipo"
      description="Las metricas aparecen cuando empiezas a recibir conversaciones."
    />
  ),
};

export const EmptyStateWithAction: StoryObj = {
  name: "EmptyState / Con accion",
  render: () => (
    <EmptyState
      title="Aqui veras el rendimiento de tu equipo"
      description="Las metricas aparecen cuando empiezas a recibir conversaciones."
      action={{ label: "Ir al inbox", href: "/inbox" }}
    />
  ),
};

// ─── TimeRangeSelector ────────────────────────────────────

export const TimeRangeSelectorDefault: StoryObj = {
  name: "TimeRangeSelector / Default",
  render: () => {
    const Wrapper = () => {
      const [value, setValue] = useState("7d");
      return <TimeRangeSelector options={timeRangeOptions} value={value} onChange={setValue} />;
    };
    return <Wrapper />;
  },
};

export const TimeRangeSelectorDisabled: StoryObj = {
  name: "TimeRangeSelector / Con opciones deshabilitadas",
  render: () => {
    const Wrapper = () => {
      const [value, setValue] = useState("7d");
      return (
        <TimeRangeSelector
          options={timeRangeOptions}
          value={value}
          onChange={setValue}
          disabledOptions={["90d"]}
        />
      );
    };
    return <Wrapper />;
  },
};

export const TimeRangeSelectorControlled: StoryObj = {
  name: "TimeRangeSelector / Controlado",
  render: () => {
    const Wrapper = () => {
      const [value, setValue] = useState("30d");
      return (
        <div className="flex flex-col gap-2">
          <TimeRangeSelector options={timeRangeOptions} value={value} onChange={setValue} />
          <span className="text-xs font-mono text-[var(--chat-muted)]">Seleccionado: {value}</span>
        </div>
      );
    };
    return <Wrapper />;
  },
};

// ─── Dashboard (Composed) ─────────────────────────────────

export const FullDashboard: StoryObj = {
  name: "Dashboard / Completo",
  render: () => {
    const Wrapper = () => {
      const [range, setRange] = useState("7d");
      return (
        <div className="max-w-5xl mx-auto p-6 space-y-6 bg-[var(--chat-background)] min-h-screen">
          <AnalyticsSectionHeader
            title="Rendimiento"
            subtitle="Ultimos 7 dias"
            action={
              <TimeRangeSelector
                options={timeRangeOptions}
                value={range}
                onChange={setRange}
                disabledOptions={["90d"]}
              />
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Conversaciones" value={147} format="number" trend={{ delta: 12, direction: "up" }} />
            <StatCard label="Resp. agente" value={132} format="duration" trend={{ delta: 15, direction: "down" }} trendPositive="bad" />
            <StatCard label="Resuelto por AI" value={73} format="percentage" trend={{ delta: 5, direction: "up" }} />
            <StatCard label="Abiertas" value={12} format="number" />
          </div>

          <AnalyticsSectionHeader title="Conversaciones por dia" />
          <BarChart data={weekData} height={200} animate />

          <AnalyticsSectionHeader title="Resolucion" />
          <StackedBar
            segments={[
              { label: "AI resolvio", value: 107, color: "var(--chat-success)" },
              { label: "Agente resolvio", value: 40, color: "var(--chat-primary)" },
            ]}
            showLegend
            showPercentages
            animate
          />

          <AnalyticsSectionHeader title="Rendimiento del equipo" />
          <DataTable columns={agentColumns} rows={agentData} highlight="best" />

          <AnalyticsSectionHeader title="Canales" />
          <HorizontalBar items={channelData} showCounts animate />
        </div>
      );
    };
    return <Wrapper />;
  },
};

export const SoloAgentDashboard: StoryObj = {
  name: "Dashboard / Agente solo",
  render: () => (
    <div className="max-w-5xl mx-auto p-6 space-y-6 bg-[var(--chat-background)] min-h-screen">
      <AnalyticsSectionHeader title="Rendimiento" subtitle="Ultimos 7 dias" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Conversaciones" value={47} format="number" trend={{ delta: 8, direction: "up" }} />
        <StatCard label="Resp. promedio" value={102} format="duration" />
        <StatCard label="AI manejo" value={82} format="percentage" />
      </div>

      <BarChart data={weekData} height={180} animate />

      <HorizontalBar
        items={[{ label: "WhatsApp", value: 47, color: "var(--channel-whatsapp)" }]}
        showCounts
      />
    </div>
  ),
};

export const NewTenantDashboard: StoryObj = {
  name: "Dashboard / Tenant nuevo",
  render: () => (
    <div className="max-w-5xl mx-auto p-6 bg-[var(--chat-background)] min-h-screen flex items-center">
      <EmptyState
        title="Aqui veras el rendimiento de tu equipo"
        description="Las metricas aparecen cuando empiezas a recibir conversaciones."
        action={{ label: "Ir al inbox", href: "/inbox" }}
      />
    </div>
  ),
};

export const DarkVsLight: StoryObj = {
  name: "Dashboard / Dark vs Light",
  render: () => {
    const DashboardContent = () => (
      <div className="p-6 space-y-4">
        <AnalyticsSectionHeader title="Rendimiento" subtitle="Ultimos 7 dias" />
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Conversaciones" value={147} format="number" trend={{ delta: 12, direction: "up" }} size="sm" />
          <StatCard label="Resuelto por AI" value={73} format="percentage" size="sm" />
        </div>
        <BarChart data={weekData} height={120} animate />
        <StackedBar
          segments={[
            { label: "AI", value: 107, color: "var(--chat-success)" },
            { label: "Agente", value: 40, color: "var(--chat-primary)" },
          ]}
          showLegend
          height={24}
        />
      </div>
    );

    return (
      <div className="grid grid-cols-2 gap-0">
        <div data-theme="dark" className="bg-[var(--chat-background)]">
          <DashboardContent />
        </div>
        <div data-theme="light" className="bg-[var(--chat-background)]">
          <DashboardContent />
        </div>
      </div>
    );
  },
};
