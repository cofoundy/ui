import type { StoryObj, Meta } from "@storybook/react";
import { InfoBox, InfoBoxRow } from "../../components/docs/InfoBox";

const meta: Meta<typeof InfoBox> = {
  title: "Docs/InfoBox",
  component: InfoBox,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InfoBox>;

export const Default: Story = {
  args: {
    label: "Ahorro mensual",
    value: "S/ 2,400",
  },
};

export const Positive: Story = {
  args: {
    label: "Retención de clientes",
    value: "94.2%",
    emphasis: "positive",
  },
};

export const Negative: Story = {
  args: {
    label: "Churn rate",
    value: "5.8%",
    emphasis: "negative",
  },
};

export const WithLink: Story = {
  name: "Con enlace",
  args: {
    label: "Repositorio",
    value: "github.com/cofoundy/docs-ai",
    link: "https://github.com/cofoundy/docs-ai",
  },
};

export const Row: Story = {
  name: "InfoBoxRow (multiple)",
  render: () => (
    <InfoBoxRow>
      <InfoBox label="MRR" value="$12,400" emphasis="positive" />
      <InfoBox label="Churn" value="2.1%" emphasis="negative" />
      <InfoBox label="NPS" value="72" />
    </InfoBoxRow>
  ),
};
