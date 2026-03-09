import type { StoryObj, Meta } from "@storybook/react";
import { Heatmap } from "../../components/analytics/Heatmap";

const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
const days = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

// Generate realistic data (more activity during business hours on weekdays)
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

const meta: Meta<typeof Heatmap> = {
  title: "Analytics/Heatmap",
  component: Heatmap,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Heatmap>;

export const Default: Story = {
  name: "Horas pico",
  args: {
    data: generateHeatmapData(),
    rows: days,
    cols: hours,
    showLabels: true,
  },
};

export const SuccessColor: Story = {
  name: "Color exito",
  args: {
    data: generateHeatmapData(),
    rows: days,
    cols: hours,
    color: "var(--chat-success)",
    showLabels: true,
  },
};

export const CompactHours: StoryObj = {
  name: "Solo horario laboral",
  render: () => {
    const businessHours = hours.slice(8, 19);
    const data = generateHeatmapData().filter((d) => d.col >= 8 && d.col <= 18).map((d) => ({ ...d, col: d.col - 8 }));
    return (
      <Heatmap
        data={data}
        rows={days}
        cols={businessHours}
        showLabels
      />
    );
  },
};
