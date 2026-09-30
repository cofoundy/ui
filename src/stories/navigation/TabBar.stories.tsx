import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { CalendarDays, Home, Menu, MessageCircle, UtensilsCrossed } from "lucide-react";

import { TabBar, TabBarItem } from "../../components/navigation/TabBar";
import { VIEWPORT_MOBILE } from "../_shared/viewports";

const meta: Meta<typeof TabBar> = {
  title: "Navigation/TabBar",
  component: TabBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Bottom navigation for phones — at most 5 destinations (put the rest behind a «Más» item).

- **One pill travels** behind the active icon with two edges: leading on \`--cf-spring-edge\`, trailing on \`--cf-spring-smooth\` compressed to 400 ms (same machinery as \`Tabs\`/\`Switch\`). No slide-in on mount.
- **Numeric badge** pops (snappy) when it changes; \`badgeMax\` caps it (\`99+\`). \`dot\` for "something new inside".
- **Press**: \`whileTap\` scale .96. **Safe-area** padding below the 56 px row.
- \`value\`/\`onValueChange\` on the bar, or \`active\` on an item (e.g. «Más» while its sheet is open). \`asChild\` renders your router link.
- Reduced motion (OS or \`<MotionConfig reducedMotion="always">\`): instant.
`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof TabBar>;

function Demo({ initial = "mensajes", unread = 3 }: { initial?: string | null; unread?: number }) {
  const [value, setValue] = React.useState<string | undefined>(initial ?? undefined);
  const [more, setMore] = React.useState(false);
  const [count, setCount] = React.useState(unread);
  return (
    <div className="flex h-[640px] flex-col" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <main className="flex-1 space-y-3 p-4 text-sm">
        <p>Pantalla: {more ? "Más" : value ?? "(una pantalla de «Más»)"}</p>
        <div className="flex gap-2">
          <button className="rounded-full border px-3 py-1" onClick={() => setCount((n) => n + 1)}>+1 mensaje</button>
          <button className="rounded-full border px-3 py-1" onClick={() => setCount(0)}>Leer todo</button>
          <button className="rounded-full border px-3 py-1" onClick={() => { setMore(false); setValue(undefined); }}>Sin activo</button>
        </div>
      </main>
      <TabBar position="static" value={more ? undefined : value} onValueChange={(v) => { if (v !== "mas") { setMore(false); setValue(v); } }}>
        <TabBarItem value="inicio" label="Inicio" icon={<Home />} />
        <TabBarItem value="mensajes" label="Mensajes" icon={<MessageCircle />} badge={count} badgeLabel={`${count} sin leer`} />
        <TabBarItem value="reservas" label="Reservas" icon={<CalendarDays />} />
        <TabBarItem value="carta" label="Carta" icon={<UtensilsCrossed />} />
        <TabBarItem value="mas" label="Más" icon={<Menu />} active={more} dot onClick={() => setMore((m) => !m)} />
      </TabBar>
    </div>
  );
}

export const Default: Story = { render: () => <Demo /> };
export const MobileBaseline: Story = { render: () => <Demo />, parameters: { viewport: VIEWPORT_MOBILE } };
export const BadgeOverflow: Story = { render: () => <Demo unread={140} /> };
export const NothingActive: Story = { render: () => <Demo initial={null} /> };
