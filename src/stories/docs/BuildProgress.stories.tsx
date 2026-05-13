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
