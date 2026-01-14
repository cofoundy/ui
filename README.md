# @cofoundy/ui

Shared UI component library for the Cofoundy product suite.

## Overview

This package provides **shared, reusable UI components** used across multiple Cofoundy products:

- **InboxAI** - Omnichannel inbox
- **TimelyAI** - Scheduling assistant
- **PulseAI** - Voice agent
- **Transcript** - Call intelligence

For the embeddable chat widget, see [@cofoundy/chat-widget](../chat-widget).

## Installation

```bash
npm install @cofoundy/ui
```

## Components

All components are built on [shadcn/ui](https://ui.shadcn.com/) with Radix UI primitives.

### Available Components

| Component | Description |
|-----------|-------------|
| `Avatar` | User/bot avatars with fallback initials |
| `Badge` | Status badges with channel variants (WhatsApp, Telegram, Email, etc.) |
| `Button` | Primary action buttons with variants |
| `Input` | Text input with consistent styling |
| `Switch` | Toggle switch for settings |
| `Tabs` | Tab navigation with mobile scroll support |
| `Spinner` | Loading indicator with size variants |
| `Toast` | Toast notifications (via Sonner) |

### Usage

```tsx
import { Button, Badge, Avatar, Input, Tabs, TabsList, TabsTrigger, TabsContent } from '@cofoundy/ui';
import '@cofoundy/ui/styles';

function Example() {
  return (
    <div>
      <Badge variant="whatsapp">WhatsApp</Badge>
      <Badge variant="telegram">Telegram</Badge>
      <Badge variant="success">Active</Badge>

      <Button variant="primary">Send Message</Button>

      <Avatar src="/avatar.jpg" fallback="JD" />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
        <TabsContent value="all">All conversations</TabsContent>
        <TabsContent value="unread">Unread messages</TabsContent>
      </Tabs>
    </div>
  );
}
```

## Utilities

### `cn()` - Class Name Utility

Merge Tailwind classes with proper precedence:

```tsx
import { cn } from '@cofoundy/ui/utils';

<div className={cn('px-4 py-2', isActive && 'bg-primary', className)} />
```

### Channel Utilities

Helpers for omnichannel inbox:

```tsx
import { getChannelColor, getChannelIcon, formatChannelName } from '@cofoundy/ui/utils';

getChannelColor('whatsapp');  // '#25D366'
getChannelIcon('telegram');   // TelegramIcon component
formatChannelName('webchat'); // 'Web Chat'
```

### String Utilities

```tsx
import { truncate, capitalize } from '@cofoundy/ui/utils';

truncate('Long message...', 50);
capitalize('hello world');  // 'Hello world'
```

## Theming

Components support theming via CSS variables:

```css
:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  --card: #f4f4f5;
  --border: #e4e4e7;
  --muted: #71717a;
}

[data-theme="dark"] {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --primary: #3b82f6;
  --card: #18181b;
  --border: #27272a;
}
```

## Development

### Storybook

```bash
npm run storybook
```

View all components at [http://localhost:6006](http://localhost:6006).

### Type Check

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

## Related Packages

- [@cofoundy/chat-widget](../chat-widget) - Embeddable chat widget for TimelyAI

## License

MIT
