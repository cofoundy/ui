# @cofoundy/ui — Agent Quick Reference

**All components:** `node_modules/@cofoundy/ui/COMPONENTS.md` (intent map + section tables — count is always current there)
**Live stories (API docs):** https://ui.cofoundy.dev — machine-readable index at /index.json

## Update to latest main
```bash
npm install github:cofoundy/ui
```

## Required setup (Next.js)
```typescript
// layout.tsx — MUST be the first import
import '@cofoundy/ui/styles'
```
```typescript
// next.config.ts
transpilePackages: ['@cofoundy/ui']
// dev script: "next dev --webpack"  (turbopack has symlink issues)
```

## Key imports
```typescript
import { Button, Badge, Input, Avatar } from '@cofoundy/ui'                          // primitives
import { ChatWidget, ChatWidgetFloating } from '@cofoundy/ui'                        // chat
import { StatCard, BarChart, DonutChart, Leaderboard } from '@cofoundy/ui'           // analytics
import { MessageBubble, InboxMessage, MessageComposer } from '@cofoundy/ui'          // messaging
```

## Hard rules
- **Never hardcode colors** — use CSS vars (`var(--chat-*)`, `var(--channel-*)`)
- **Never guess props** — read the story for the component or COMPONENTS.md
- **Stories ARE the docs** — 95+ `.stories.tsx` files are the source of truth for every API
