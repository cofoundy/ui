import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import {
  NavDropdown,
  type NavDropdownItem,
} from "../../components/navigation/NavDropdown";

const meta: Meta<typeof NavDropdown> = {
  title: "Navigation/NavDropdown",
  component: NavDropdown,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
A navigation dropdown component designed for navbar menus.

## Features
- **Hover-to-open** on desktop, **click-to-open** on touch devices
- **150ms close delay** to prevent accidental closure
- **Keyboard navigation**: Arrow keys, Enter, Escape, Tab, Home, End
- **ARIA-compliant**: Proper roles, states, and keyboard support
- **Glassmorphism design**: Backdrop blur, subtle borders
- **Premium animations**: Smooth easing with scale and fade
- **Active state indicator**: Visual highlight for current page
- **Touch-friendly**: 44px minimum touch targets

## Usage
\`\`\`tsx
import { NavDropdown } from '@cofoundy/ui'

<NavDropdown
  label="Services"
  variant="dark"
  items={[
    { key: 'landing', href: '/landing-pages', label: 'Landing Pages', description: 'Your landing ready in 7 days' },
    { key: 'chatbot', href: '/chatbot', label: 'AI Chatbot', isActive: true },
  ]}
  onItemClick={(key, href) => router.push(href)}
/>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["dark", "light"],
      description: "Theme variant",
    },
    label: {
      control: "text",
      description: "Trigger button label",
    },
    items: {
      description: "Menu items array",
    },
    onItemClick: {
      action: "clicked",
      description: "Callback when an item is clicked",
    },
  },
  decorators: [
    (Story, context) => {
      const isDark = context.args.variant === "dark";
      return (
        <div
          className="p-8 rounded-xl min-h-[400px]"
          style={{
            backgroundColor: isDark ? "#020916" : "#f8fafc",
          }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof NavDropdown>;

// Sample items for stories
const serviceItems: NavDropdownItem[] = [
  {
    key: "landing",
    href: "/servicios/landing-pages",
    label: "Landing Pages",
    description: "Tu landing lista en 7 días",
  },
  {
    key: "pollada",
    href: "/servicios/pollada",
    label: "Pollada Virtual",
    description: "Portafolio desde S/.50",
  },
  {
    key: "chatbot",
    href: "/servicios/chatbot",
    label: "AI Chatbot",
    description: "Automatiza tu atención 24/7",
  },
  {
    key: "fullstack",
    href: "/servicios/fullstack",
    label: "Desarrollo Fullstack",
    description: "Apps a medida para tu negocio",
  },
];

const productItems: NavDropdownItem[] = [
  {
    key: "timely",
    href: "/productos/timely-ai",
    label: "TimelyAI",
    description: "Scheduling inteligente",
    isActive: true,
  },
  {
    key: "inbox",
    href: "/productos/inbox-ai",
    label: "InboxAI",
    description: "Omnichannel inbox unificado",
  },
  {
    key: "pulse",
    href: "/productos/pulse-ai",
    label: "PulseAI",
    description: "Voice agent para llamadas",
  },
];

// ============================================
// Stories
// ============================================

export const Default: Story = {
  args: {
    label: "Servicios",
    variant: "dark",
    items: serviceItems,
  },
};

export const WithActiveItem: Story = {
  args: {
    label: "Productos",
    variant: "dark",
    items: productItems,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Items can have an `isActive` prop to indicate the current page. Shows a primary-colored left border and subtle background.",
      },
    },
  },
};

export const LightVariant: Story = {
  args: {
    label: "Servicios",
    variant: "light",
    items: serviceItems,
  },
  parameters: {
    docs: {
      description: {
        story: "Light variant for use on light backgrounds.",
      },
    },
  },
};

export const LightWithActive: Story = {
  args: {
    label: "Productos",
    variant: "light",
    items: productItems,
  },
};

export const MinimalItems: Story = {
  args: {
    label: "Resources",
    variant: "dark",
    items: [
      { key: "docs", href: "/docs", label: "Documentation" },
      { key: "blog", href: "/blog", label: "Blog" },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: "Items without descriptions for a more compact menu.",
      },
    },
  },
};

export const CustomWidth: Story = {
  args: {
    label: "Solutions",
    variant: "dark",
    items: serviceItems,
    menuClassName: "min-w-[360px]",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use `menuClassName` to customize the dropdown width and other styles.",
      },
    },
  },
};

// Interactive demo with navbar context
export const InNavbar: Story = {
  render: function Render() {
    const [activeKey, setActiveKey] = React.useState("timely");

    const items = productItems.map((item) => ({
      ...item,
      isActive: item.key === activeKey,
    }));

    return (
      <div className="bg-[#020916] rounded-xl">
        {/* Simulated navbar */}
        <nav className="flex items-center gap-6 px-6 py-4 border-b border-white/10">
          <div className="text-white font-semibold">Cofoundy</div>
          <NavDropdown
            label="Servicios"
            variant="dark"
            items={serviceItems}
            onItemClick={(key) => console.log("Navigate to service:", key)}
          />
          <NavDropdown
            label="Productos"
            variant="dark"
            items={items}
            onItemClick={(key) => {
              setActiveKey(key);
              console.log("Navigate to product:", key);
            }}
          />
          <a href="#" className="text-white/90 hover:text-white text-sm">
            Pricing
          </a>
          <a href="#" className="text-white/90 hover:text-white text-sm">
            Contact
          </a>
        </nav>
        <div className="p-6 text-white/60 text-sm min-h-[200px]">
          Page content area. Click on Products dropdown to change active item.
          <br />
          Active product: <span className="text-[#46a0d0]">{activeKey}</span>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Example of NavDropdown components used within a navbar context. The Products dropdown demonstrates interactive active state management.",
      },
    },
  },
};

// Keyboard navigation demo
export const KeyboardNavigation: Story = {
  args: {
    label: "Keyboard Demo",
    variant: "dark",
    items: serviceItems,
  },
  parameters: {
    docs: {
      description: {
        story: `
**Try these keyboard interactions:**
- **Tab** to focus the dropdown trigger
- **Enter/Space** to open the menu
- **Arrow Down/Up** to navigate items
- **Home/End** to jump to first/last item
- **Enter** to select an item
- **Escape** to close the menu
- **Tab** while open to close and move focus
        `,
      },
    },
  },
};

// Touch device simulation
export const TouchBehavior: Story = {
  args: {
    label: "Tap to Open",
    variant: "dark",
    items: serviceItems,
  },
  parameters: {
    docs: {
      description: {
        story:
          "On touch devices, the dropdown opens and closes on tap instead of hover. Test this on a mobile device or using browser dev tools touch simulation.",
      },
    },
  },
};
