import type { StoryObj, Meta } from "@storybook/react";
import { useState } from "react";
import { TimeRangeSelector } from "../../components/analytics/TimeRangeSelector";

const options = [
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
];

const meta: Meta<typeof TimeRangeSelector> = {
  title: "Analytics/TimeRangeSelector",
  component: TimeRangeSelector,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TimeRangeSelector>;

export const Default: Story = {
  render: () => {
    const Wrapper = () => {
      const [value, setValue] = useState("7d");
      return <TimeRangeSelector options={options} value={value} onChange={setValue} />;
    };
    return <Wrapper />;
  },
};

export const WithDisabled: Story = {
  name: "Con opciones deshabilitadas",
  render: () => {
    const Wrapper = () => {
      const [value, setValue] = useState("7d");
      return <TimeRangeSelector options={options} value={value} onChange={setValue} disabledOptions={["90d"]} />;
    };
    return <Wrapper />;
  },
};

export const Controlled: Story = {
  name: "Controlado",
  render: () => {
    const Wrapper = () => {
      const [value, setValue] = useState("30d");
      return (
        <div className="flex flex-col gap-2">
          <TimeRangeSelector options={options} value={value} onChange={setValue} />
          <span className="text-xs font-mono text-[var(--chat-muted)]">Seleccionado: {value}</span>
        </div>
      );
    };
    return <Wrapper />;
  },
};

export const ManyOptions: Story = {
  name: "Muchas opciones",
  render: () => {
    const Wrapper = () => {
      const [value, setValue] = useState("7d");
      return (
        <TimeRangeSelector
          options={[
            { value: "1d", label: "Hoy" },
            { value: "7d", label: "7d" },
            { value: "14d", label: "14d" },
            { value: "30d", label: "30d" },
            { value: "90d", label: "90d" },
          ]}
          value={value}
          onChange={setValue}
          disabledOptions={["90d"]}
        />
      );
    };
    return <Wrapper />;
  },
};
