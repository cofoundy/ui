# @cofoundy/ui

Shared UI component library for the Cofoundy product suite.

## Quick Reference

```bash
# Storybook
npm run storybook        # http://localhost:6006

# Tests
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Build IIFE (standalone widget)
npm run build:iife
```

## Package Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   └── ...
│   │
│   ├── chat-widget/           # Chat widget system
│   │   ├── ChatWidget.tsx         # Main embedded widget
│   │   ├── ChatWidgetFloating.tsx # Floating bubble widget
│   │   ├── FloatingLauncher.tsx   # Bubble button
│   │   ├── FloatingWindow.tsx     # Popup window
│   │   ├── ChatHeader.tsx
│   │   ├── ChatInput.tsx
│   │   ├── Message.tsx
│   │   └── ...
│   │
│   └── messaging/             # InboxAI messaging primitives
│       ├── MessageBubble.tsx
│       ├── InboxMessage.tsx
│       └── ...
│
├── transports/                # Backend connection adapters
│   ├── types.ts               # Transport interfaces
│   ├── WebSocketTransport.ts  # For TimelyAI
│   └── SocketIOTransport.ts   # For InboxAI (dynamic import)
│
├── hooks/
│   ├── useChatTransport.ts    # Unified transport hook
│   ├── useWebSocket.ts        # Raw WebSocket hook
│   ├── useAutoScroll.ts
│   └── useSession.ts
│
├── stores/
│   └── chatStore.ts           # Zustand chat state
│
├── styles/
│   └── index.css              # CSS variables & theme tokens
│
├── stories/                   # Storybook stories
│   ├── chat-widget/           # Chat component stories
│   ├── messaging/             # Messaging component stories
│   ├── ui/                    # UI primitive stories
│   └── foundation/            # Design token stories
│
├── iife/                      # Standalone widget build
│   └── index.tsx              # IIFE entry point
│
└── __tests__/                 # Vitest tests
    ├── components/
    ├── hooks/
    └── transports/
```

## Key Exports

### Chat Widget (for TimelyAI, Landing Page)
```typescript
import {
  ChatWidget,           // Embedded mode
  ChatWidgetFloating,   // Floating bubble mode
  FloatingLauncher,     // Just the bubble button
  FloatingWindow        // Just the popup container
} from '@cofoundy/ui'
```

### Transport Layer
```typescript
import {
  useChatTransport,           // Unified hook
  createTransportConfigFromUrl
} from '@cofoundy/ui'

// Config types
type TransportConfig =
  | { type: 'websocket', url: string }
  | { type: 'socketio', url: string, tenantId: string }
```

### UI Primitives
```typescript
import {
  Button, Badge, Input, Avatar,
  Tabs, Switch, Spinner, Logo
} from '@cofoundy/ui'
```

### Messaging (for InboxAI)
```typescript
import {
  MessageBubble,
  InboxMessage,
  InboxMessageList,
  MessageComposer
} from '@cofoundy/ui'
```

## Theming

All components use CSS variables for theming:

```css
:root {
  /* Brand colors */
  --chat-primary: #2984AD;
  --chat-background: #020916;
  --chat-foreground: #ffffff;
  --chat-muted: #848386;
  --chat-border: rgba(255, 255, 255, 0.1);
  --chat-card: rgba(255, 255, 255, 0.05);

  /* Shadcn-compatible tokens */
  --primary: var(--chat-primary);
  --background: var(--chat-background);
  --foreground: var(--chat-foreground);
}
```

## Usage in Projects

### In package.json
```json
"@cofoundy/ui": "file:../../packages/ui"
```

### Next.js Configuration

**1. Use Webpack (Turbopack has symlink issues):**
```json
"scripts": {
  "dev": "next dev --webpack"
}
```

**2. Add to next.config.ts:**
```typescript
transpilePackages: ['@cofoundy/ui'],
```

### Import Styles (REQUIRED)

**⚠️ IMPORTANT: Import via JavaScript, NOT CSS @import**

```typescript
// In your app/layout.tsx (or _app.tsx)
import '@cofoundy/ui/styles';  // ← MUST be first
import './globals.css';         // Then your local styles
```

**Why JS import instead of CSS @import?**
- `@import "@cofoundy/ui/styles"` fails with PostCSS + symlinks
- `import '@cofoundy/ui/styles'` works because bundler uses Node resolution

**DO NOT do this:**
```css
/* ❌ This FAILS with symlinked packages */
@import "@cofoundy/ui/styles";
```

## Development Guidelines

### Adding Components
1. Check if shadcn/ui has it: `npx shadcn@latest add [component]`
2. Customize with Cofoundy theme tokens
3. Add Storybook story in `src/stories/`
4. Export from `src/index.ts`
5. Add tests in `src/__tests__/`

### Story Location
- UI primitives: `stories/ui/ComponentName.stories.tsx`
- Chat widget: `stories/chat-widget/ComponentName.stories.tsx`
- Messaging: `stories/messaging/ComponentName.stories.tsx`

### Testing
```bash
npm test                    # Run all tests
npm run test:coverage       # With coverage
```

## Products Using This Package

| Product | Components Used |
|---------|-----------------|
| **TimelyAI** | ChatWidget, ChatWidgetFloating, transports |
| **InboxAI** | Badge, Avatar, Messaging components |
| **Landing Page** | ChatWidgetFloating, FloatingLauncher |
| **PulseAI** | UI primitives |

## AI Assistant Rules

1. **ALWAYS add Storybook stories** for new components
2. **ALWAYS add tests** for hooks and transports
3. **Use CSS variables** - never hardcode colors
4. **Export from index.ts** - all public components must be exported
5. **Check multiple projects** - changes here affect TimelyAI, InboxAI, Landing
6. **Run Storybook** to verify visual changes: `npm run storybook`
