import type { StoryObj, Meta } from "@storybook/react";
import { useState } from "react";
import { AnalyticsSectionHeader } from "../../components/analytics/AnalyticsSectionHeader";
import { TimeRangeSelector } from "../../components/analytics/TimeRangeSelector";

const meta: Meta<typeof AnalyticsSectionHeader> = {
  title: "Analytics/AnalyticsSectionHeader",
  component: AnalyticsSectionHeader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AnalyticsSectionHeader>;

export const Default: Story = {
  args: {
    title: "Rendimiento del equipo",
  },
};

export const WithSubtitle: Story = {
  name: "Con subtitulo",
  args: {
    title: "Rendimiento del equipo",
    subtitle: "Ultimos 7 dias",
  },
};

export const WithAction: Story = {
  name: "Con accion",
  render: () => {
    const Wrapper = () => {
      const [range, setRange] = useState("7d");
      return (
        <AnalyticsSectionHeader
          title="Rendimiento"
          subtitle="Ultimos 7 dias"
          action={
            <TimeRangeSelector
              options={[
                { value: "7d", label: "7d" },
                { value: "30d", label: "30d" },
                { value: "90d", label: "90d" },
              ]}
              value={range}
              onChange={setRange}
            />
          }
        />
      );
    };
    return <Wrapper />;
  },
};
