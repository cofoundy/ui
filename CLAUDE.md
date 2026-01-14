# @cofoundy/ui

Shared UI component library for the Cofoundy product suite.

## Philosophy

This package provides **shared, reusable UI components** used across multiple Cofoundy products:

- **InboxAI** - Omnichannel inbox (uses Badge, Avatar, channel utils)
- **TimelyAI** - Scheduling assistant (uses @cofoundy/chat-widget)
- **PulseAI** - Voice agent
- **Transcript** - Call intelligence

### Design Principles

1. **Shared only** - Components here must be used by 2+ products
2. **White-label ready** - All components support theming via CSS variables
3. **shadcn/ui based** - We adopt shadcn/ui components for quality and accessibility
4. **Business logic lives elsewhere** - This is pure UI, no API calls or state management

### What belongs here vs. product repos

| Here (@cofoundy/ui) | Product repos |
|---------------------|---------------|
| Badge, Button, Input, Avatar | Product-specific layouts |
| Channel utilities (badge variants) | API integrations |
| Shared types | State management |
| Theme tokens | Business logic |

## Package Structure

```
src/
├── components/ui/     # shadcn/ui components + customizations
│   ├── badge.tsx      # With channel variants (whatsapp, telegram, etc.)
│   ├── button.tsx
│   ├── input.tsx
│   ├── avatar.tsx
│   ├── tabs.tsx
│   ├── switch.tsx
│   └── ...
├── utils/
│   ├── cn.ts          # Tailwind class merger
│   ├── channel.ts     # Channel badge/icon/color utilities
│   └── string.ts      # String utilities (getInitials, truncate)
├── styles/
│   └── index.css      # CSS variables + theme tokens
└── stories/           # Storybook stories
```

## Theming / White-Labeling

Components use CSS variables for theming:

```css
/* Theme variables - customize per product/client */
--primary: #2984AD;
--background: #072235;
--foreground: #FFFFFF;
--muted: #94A3B8;
--border: #1E3A4C;
/* ... */
```

### How to white-label

1. Override CSS variables in your app's global CSS
2. Or use the `data-theme` attribute for light/dark modes
3. Brand colors can be customized per deployment

## Channel Utilities

For omnichannel products (InboxAI), we provide channel-specific utilities:

```typescript
import { getChannelBadgeVariant, getChannelIcon } from "@cofoundy/ui";

// Returns badge variant for channel
getChannelBadgeVariant("whatsapp"); // "whatsapp"
getChannelIcon("telegram");          // "T"
```

Supported channels: telegram, whatsapp, email, webchat, instagram, messenger, sms

## shadcn/ui Adoption

We use [shadcn/ui](https://ui.shadcn.com) as our component foundation because:

1. **Accessibility** - Built on Radix UI primitives
2. **Quality** - Battle-tested, well-maintained
3. **Customizable** - We own the source code
4. **Dark mode** - Built-in support

### Customizations

We extend shadcn components with:
- **Badge**: Channel variants for messaging platforms
- **Tabs**: Mobile scroll support
- All components: Cofoundy theme tokens

## Development Workflow

### Storybook

```bash
npm run storybook
```

All components have stories demonstrating variants and states.

### Visual Testing

We use Chromatic for visual regression testing:

```bash
npm run build-storybook
# Chromatic runs on push to main
```

### Adding Components

1. Check if shadcn/ui has the component: `npx shadcn@latest add [component]`
2. If yes, install and customize with our theme
3. If no, create following shadcn patterns (CVA, cn utility)
4. Add Storybook story
5. Export from index.ts

## Exports

```typescript
// Components
export { Button, buttonVariants } from "./components/ui/button";
export { Badge, badgeVariants } from "./components/ui/badge";
export { Input } from "./components/ui/input";
export { Avatar, AvatarImage, AvatarFallback } from "./components/ui/avatar";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
export { Switch } from "./components/ui/switch";
// ... more components

// Utilities
export { cn } from "./utils/cn";
export { getChannelBadgeVariant, getChannelIcon, getChannelDisplayName } from "./utils/channel";
export { getInitials, truncate, capitalize } from "./utils/string";
```

## Related Packages

- **@cofoundy/chat-widget** - Embeddable chat widget for TimelyAI (separate package)

## Notes for AI Assistants

- Do NOT add product-specific components here
- Do NOT add state management (Zustand, etc.)
- Do NOT add API calls or hooks that make requests
- DO use shadcn/ui patterns for new components
- DO add Storybook stories for all components
- DO export variants (buttonVariants, badgeVariants) for consumer customization
