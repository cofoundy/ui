# @cofoundy/ui

A collection of accessible, production-ready components for Cofoundy products.

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
