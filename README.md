# @cofoundy/ui

A collection of accessible, production-ready AI-powered components.

## Vision

This package is the foundation for Cofoundy's **white-label AI component library** - our competitive moat.

### Strategic Direction

1. **Phase 1 (Current)**: Internal UI components for Cofoundy products
   - ChatWidget with real-time AI conversations
   - Appointment scheduling via natural language
   - Multi-language support (ES, EN, PT)

2. **Phase 2**: White-label product
   - Embeddable AI chat widgets for any website
   - Customizable branding (colors, logos, tone)
   - Backend-agnostic (connect to any AI/scheduling API)

3. **Phase 3**: AI Component Marketplace
   - Pre-built AI-powered components (chat, forms, scheduling, support)
   - Subscription model for businesses
   - Similar to Intercom/Drift but component-based

### Why This Matters

- **For clients**: Drop-in AI capabilities without building from scratch
- **For Cofoundy**: Recurring revenue + product differentiation
- **Moat**: Proprietary AI UX patterns refined across multiple deployments

## Installation

```bash
# From GitHub
npm install github:cofoundy/ui

# Or link locally for development
npm link @cofoundy/ui
```

## Usage

```tsx
// Import components
import { ChatWidget } from '@cofoundy/ui/chat-widget';

// Import hooks
import { useWebSocket } from '@cofoundy/ui/hooks';

// Import styles (in your global CSS or layout)
import '@cofoundy/ui/styles';
```

## Components

### ChatWidget

A real-time chat widget that connects to TimelyAI backend via WebSocket.

```tsx
import { ChatWidget } from '@cofoundy/ui/chat-widget';

function App() {
  return (
    <ChatWidget
      websocketUrl="wss://api.timelyai.com"
      greeting={{
        id: "greeting",
        role: "assistant",
        content: "Hi! How can I help you?",
        timestamp: new Date(),
      }}
      quickActions={[
        { id: "1", label: "Book a call", message: "I want to book a call" },
      ]}
      theme={{
        brandName: "Cofoundy",
      }}
    />
  );
}
```

## Hooks

- `useWebSocket` - WebSocket connection with auto-reconnect and streaming support
- `useSession` - Session management with localStorage/sessionStorage

## Development

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Lint
npm run lint
```

## License

MIT
