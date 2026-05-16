import type { StoryObj, Meta } from "@storybook/react";
import { BuildProgress } from "../../components/docs/BuildProgress";

const meta: Meta<typeof BuildProgress> = {
  title: "Docs/BuildProgress",
  component: BuildProgress,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BuildProgress>;

export const Default: Story = {
  args: {
    steps: [
      { label: "Investigación y discovery", status: "done" },
      { label: "Diseño de arquitectura", status: "done" },
      { label: "Implementación del MVP", status: "current", body: "En progreso — sprint 3 de 4" },
      { label: "QA y pruebas de carga", status: "pending" },
      { label: "Deploy a producción", status: "pending" },
    ],
  },
};

export const AllDone: Story = {
  name: "Todos completados",
  args: {
    steps: [
      { label: "Paso 1", status: "done" },
      { label: "Paso 2", status: "done" },
      { label: "Paso 3", status: "done" },
    ],
  },
};

export const AllPending: Story = {
  name: "Todos pendientes",
  args: {
    steps: [
      { label: "Configurar entorno" },
      { label: "Conectar base de datos" },
      { label: "Desplegar servicio" },
    ],
  },
};

// NEW — exercises Atelier patched props: phase L0-L9, owner, started_at,
// completed_at, vikunja_project_id. XGodel canonical cronograma snapshot.
export const XGodelCronograma: Story = {
  name: "XGodel — phased delivery (Atelier patch)",
  args: {
    steps: [
      {
        label: "L1 — Discovery + Brief",
        status: "done",
        phase: "L1",
        owner: "Andre",
        started_at: "2026-04-12",
        completed_at: "2026-04-18",
      },
      {
        label: "L2 — Personas + Sitemap",
        status: "done",
        phase: "L2",
        owner: "Percy",
        started_at: "2026-04-19",
        completed_at: "2026-04-30",
      },
      {
        label: "L4 — UX Research (3 user interviews)",
        status: "current",
        phase: "L4",
        owner: "Percy",
        started_at: "2026-05-02",
        vikunja_project_id: 22,
        body: "Interview 2 de 3 — programada 2026-05-18",
      },
      {
        label: "L7 — Build + QA",
        status: "pending",
        phase: "L7",
        owner: "Juan",
      },
      {
        label: "L9 — Deploy + Handoff",
        status: "pending",
        phase: "L9",
        owner: "Andre",
      },
    ],
  },
};
