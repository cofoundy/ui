import type { StoryObj, Meta } from "@storybook/react";
import { useState } from "react";
import { StatCard } from "../../components/analytics/StatCard";
import { SparkLine } from "../../components/analytics/SparkLine";
import { BarChart } from "../../components/analytics/BarChart";
import { StackedBar } from "../../components/analytics/StackedBar";
import { DataTable } from "../../components/analytics/DataTable";
import { HorizontalBar } from "../../components/analytics/HorizontalBar";
import { DonutChart } from "../../components/analytics/DonutChart";
import { ProgressBar } from "../../components/analytics/ProgressBar";
import { Heatmap } from "../../components/analytics/Heatmap";
import { Leaderboard } from "../../components/analytics/Leaderboard";
import { FunnelChart } from "../../components/analytics/FunnelChart";
import { ActivityFeed } from "../../components/analytics/ActivityFeed";
import { EmptyState } from "../../components/analytics/EmptyState";
import { TimeRangeSelector } from "../../components/analytics/TimeRangeSelector";
import { AnalyticsSectionHeader } from "../../components/analytics/AnalyticsSectionHeader";

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

const sparkTrend = [20, 35, 28, 42, 38, 58, 47];
const sparkUp = [10, 15, 18, 22, 30, 35, 50];

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

const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}`);
const days = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

function generateHeatmapData() {
  const data: { row: number; col: number; value: number }[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const isWeekday = day < 5;
      const isBusinessHours = hour >= 9 && hour <= 18;
      const isPeak = hour >= 10 && hour <= 14;
      let base = 0;
      if (isWeekday && isPeak) base = 15;
      else if (isWeekday && isBusinessHours) base = 8;
      else if (isWeekday) base = 2;
      else if (isBusinessHours) base = 4;
      else base = 1;
      const value = Math.max(0, base + Math.floor(Math.random() * 6 - 2));
      if (value > 0) data.push({ row: day, col: hour, value });
    }
  }
  return data;
}

const activityItems = [
  { actor: "Maria Lopez", description: "resolvio conversacion #1247", timestamp: "Hace 2 min", color: "var(--chat-success)" },
  { actor: "AI", description: "resolvio automaticamente #1246", timestamp: "Hace 5 min", color: "var(--chat-primary)" },
  { actor: "Carlos Ruiz", description: "escalo #1245 a Soporte L2", timestamp: "Hace 12 min", color: "var(--chat-warning)" },
  { actor: "Ana Garcia", description: "se conecto al inbox", timestamp: "Hace 15 min", color: "var(--chat-muted)" },
];

// ─── Meta ─────────────────────────────────────────────────

const meta: Meta = {
  title: "Analytics/Dashboard",
  tags: ["autodocs"],
};

export default meta;

// ─── Full Dashboard ───────────────────────────────────────

export const FullDashboard: StoryObj = {
  name: "Completo",
  render: () => {
    const Wrapper = () => {
      const [range, setRange] = useState("7d");
      return (
        <div className="max-w-5xl mx-auto p-6 space-y-8 bg-[var(--chat-background)] min-h-screen">
          {/* Header */}
          <AnalyticsSectionHeader
            title="Dashboard"
            subtitle="Ultimos 7 dias"
            action={<TimeRangeSelector options={timeRangeOptions} value={range} onChange={setRange} disabledOptions={["90d"]} />}
          />

          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Conversaciones" value={147} format="number" trend={{ delta: 12, direction: "up" }} />
            <StatCard label="Resp. agente" value={132} format="duration" trend={{ delta: 15, direction: "down" }} trendPositive="bad" />
            <StatCard label="Resuelto por AI" value={73} format="percentage" trend={{ delta: 5, direction: "up" }} />
            <StatCard label="Abiertas" value={12} format="number" />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-2">
              <AnalyticsSectionHeader title="Conversaciones por dia" />
              <BarChart data={weekData} height={200} animate />
            </div>
            <div className="space-y-2">
              <AnalyticsSectionHeader title="Resolucion" />
              <div className="flex justify-center py-4">
                <DonutChart
                  segments={[
                    { label: "AI resolvio", value: 107, color: "var(--chat-success)" },
                    { label: "Agente resolvio", value: 40, color: "var(--chat-primary)" },
                  ]}
                  centerValue="73%"
                  centerLabel="AI"
                  showLegend
                  size={140}
                  thickness={18}
                />
              </div>
            </div>
          </div>

          {/* Stacked bar */}
          <StackedBar
            segments={[
              { label: "AI resolvio", value: 107, color: "var(--chat-success)" },
              { label: "Agente resolvio", value: 40, color: "var(--chat-primary)" },
            ]}
            showLegend
            showPercentages
            animate
          />

          {/* Funnel */}
          <AnalyticsSectionHeader title="Embudo de conversaciones" />
          <FunnelChart
            steps={[
              { label: "Iniciadas", value: 500, color: "var(--chat-primary)" },
              { label: "AI respondio", value: 450, color: "var(--chat-primary)" },
              { label: "Resueltas AI", value: 320, color: "var(--chat-success)" },
              { label: "Escaladas", value: 130, color: "var(--chat-warning)" },
              { label: "Resueltas agente", value: 110, color: "var(--chat-success)" },
            ]}
            showPercentages
            showDropoff
            animate
          />

          {/* Goals */}
          <AnalyticsSectionHeader title="Metas del mes" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProgressBar label="Tickets resueltos" value={385} max={500} format="fraction" color="var(--chat-success)" />
            <ProgressBar label="CSAT > 4.5" value={73} max={100} format="percentage" color="var(--chat-primary)" />
            <ProgressBar label="Resp. < 2min" value={62} max={100} format="percentage" color="var(--chat-warning)" />
            <ProgressBar label="Tasa abandono < 5%" value={92} max={100} format="percentage" color="var(--chat-success)" />
          </div>

          {/* Team + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <AnalyticsSectionHeader title="Rendimiento del equipo" />
              <DataTable columns={agentColumns} rows={agentData} highlight="best" />
            </div>
            <div className="space-y-2">
              <AnalyticsSectionHeader title="Leaderboard" />
              <Leaderboard
                items={[
                  { name: "Maria Lopez", score: 52, subtitle: "Soporte L2" },
                  { name: "Ana Garcia", score: 47, subtitle: "Soporte L1" },
                  { name: "Carlos Ruiz", score: 31, subtitle: "Soporte L1" },
                ]}
                metric="Tickets resueltos"
                showBars
                podiumStyle
              />
            </div>
          </div>

          {/* Heatmap */}
          <AnalyticsSectionHeader title="Horas pico" />
          <Heatmap data={generateHeatmapData()} rows={days} cols={hours} showLabels />

          {/* Channels + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <AnalyticsSectionHeader title="Canales" />
              <HorizontalBar items={channelData} showCounts animate />
            </div>
            <div className="space-y-2">
              <AnalyticsSectionHeader title="Actividad reciente" />
              <ActivityFeed items={activityItems} showTimeline />
            </div>
          </div>
        </div>
      );
    };
    return <Wrapper />;
  },
};

// ─── Solo Agent ───────────────────────────────────────────

export const SoloAgent: StoryObj = {
  name: "Agente solo",
  render: () => (
    <div className="max-w-5xl mx-auto p-6 space-y-6 bg-[var(--chat-background)] min-h-screen">
      <AnalyticsSectionHeader title="Mi rendimiento" subtitle="Ultimos 7 dias" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Conversaciones" value={47} format="number" trend={{ delta: 8, direction: "up" }} />
        <StatCard label="Resp. promedio" value={102} format="duration" />
        <StatCard label="AI manejo" value={82} format="percentage" />
      </div>

      <BarChart data={weekData} height={180} animate />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProgressBar label="Meta semanal" value={47} max={60} format="fraction" color="var(--chat-primary)" />
        <ProgressBar label="CSAT" value={88} max={100} format="percentage" color="var(--chat-success)" />
      </div>

      <HorizontalBar
        items={[{ label: "WhatsApp", value: 47, color: "var(--channel-whatsapp)" }]}
        showCounts
      />
    </div>
  ),
};

// ─── New Tenant ───────────────────────────────────────────

export const NewTenant: StoryObj = {
  name: "Tenant nuevo",
  render: () => (
    <div className="max-w-5xl mx-auto p-6 bg-[var(--chat-background)] min-h-screen flex items-center justify-center">
      <EmptyState
        title="Aqui veras el rendimiento de tu equipo"
        description="Las metricas aparecen cuando empiezas a recibir conversaciones."
        action={{ label: "Ir al inbox", href: "/inbox" }}
      />
    </div>
  ),
};

// ─── Dark vs Light ────────────────────────────────────────

export const DarkVsLight: StoryObj = {
  name: "Dark vs Light",
  render: () => {
    const Panel = () => (
      <div className="p-6 space-y-4 bg-[var(--chat-background)]">
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
        <DonutChart
          segments={[
            { label: "AI", value: 73, color: "var(--chat-success)" },
            { label: "Agente", value: 27, color: "var(--chat-primary)" },
          ]}
          size={100}
          thickness={12}
          centerValue="73%"
          showLegend={false}
        />
        <ProgressBar label="Meta mensual" value={73} max={100} format="percentage" color="var(--chat-success)" />
      </div>
    );

    return (
      <div className="grid grid-cols-2 gap-0">
        <div data-theme="dark"><Panel /></div>
        <div data-theme="light"><Panel /></div>
      </div>
    );
  },
};
