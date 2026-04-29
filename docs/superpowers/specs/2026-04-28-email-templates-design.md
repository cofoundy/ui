# React Email Templates for @cofoundy/ui

**Date:** 2026-04-28
**Status:** Approved
**Approach:** React Email components in @cofoundy/ui, previewable in Storybook

## Problem

Current Jinja2 email templates are functional but visually basic, use `<div>` layouts that break in Outlook/Yahoo, host the logo on Imgur, and can't be previewed without sending. They don't reflect Cofoundy's positioning as a modern AI Factory.

## Solution

Replace Jinja2 templates with React Email components inside `@cofoundy/ui`. React Email (by the Resend team) generates email-client-safe HTML (table-based, inline styles) from JSX. Components get Storybook stories for visual preview and iteration.

## Architecture

### Directory Structure

```
src/components/email/
├── components/
│   ├── EmailLayout.tsx       # Base layout: header + content + signature + footer
│   ├── InfoBox.tsx           # Branded info card (left teal border)
│   ├── EmailButton.tsx       # CTA button
│   ├── EmailDivider.tsx      # Styled divider
│   └── TestBanner.tsx        # Yellow test-mode banner
├── templates/
│   ├── CotizacionFollowup.tsx
│   ├── Factura.tsx
│   ├── BienvenidaCliente.tsx
│   ├── CierreProyecto.tsx
│   ├── DevEntrega.tsx
│   └── ReminderPago.tsx
├── constants.ts              # Colors, fonts, spacing tokens
├── render.ts                 # render() helper for server-side use
└── index.ts
```

### Dependencies

- `@react-email/components` — Html, Head, Body, Container, Section, Row, Column, Text, Heading, Button, Img, Hr, Preview, Font, Link
- `@react-email/render` — converts React component tree to HTML string

### Color Tokens (from Brand Book)

```typescript
export const colors = {
  primary: '#46A0D0',       // Teal — CTAs, accents, accent bar
  navy: '#23435F',          // Header bg, headings, strong text
  navyLight: '#1B577E',     // Links, secondary headings
  textBody: '#4B4E54',      // Body paragraphs
  textMuted: '#848386',     // Footer, labels, meta
  bgLight: '#F4F8FB',       // Outer wrapper, info-box bg, footer bg
  bgWhite: '#FFFFFF',       // Content container
  border: '#DBE5EB',        // Dividers, signature border
  warning: '#FEF3C7',       // Test banner bg
  warningText: '#92400E',   // Test banner text
  overdue: '#B45309',       // Overdue payment accent
};
```

### Typography

```typescript
export const fonts = {
  family: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  h1: { fontSize: '24px', fontWeight: '700', lineHeight: '1.3', letterSpacing: '-0.02em' },
  h2: { fontSize: '16px', fontWeight: '600', lineHeight: '1.4', letterSpacing: '-0.005em' },
  body: { fontSize: '15px', fontWeight: '400', lineHeight: '1.7' },
  small: { fontSize: '13px', fontWeight: '400', lineHeight: '1.5' },
  label: { fontSize: '11px', fontWeight: '600', lineHeight: '1.4', letterSpacing: '0.06em', textTransform: 'uppercase' },
};
```

### Spacing

```typescript
export const spacing = {
  containerMax: '600px',
  headerPad: '28px 40px',
  contentPad: '36px 40px 12px',
  footerPad: '24px 40px 32px',
  signaturePad: '0 40px 28px',
  mobilePad: '24px',
  sectionGap: '24px',
};
```

## Components

### EmailLayout

The base wrapper replacing `_base.html`. All templates compose inside it.

```typescript
interface EmailLayoutProps {
  title?: string;
  previewText?: string;
  signatureHtml?: string;
  testMode?: boolean;
  children: React.ReactNode;
}
```

Structure:
1. `<Html>` + `<Head>` with Inter font + responsive meta
2. Optional `<TestBanner>` (yellow bar)
3. Navy header with Cofoundy logo (white SVG hosted on cofoundy.dev or Cloudflare R2)
4. 3px teal accent bar
5. Content area (`{children}`)
6. Signature section (renders raw HTML via dangerouslySetInnerHTML — same as current)
7. Footer: "Cofoundy S.A.C. - RUC 20614413566" + email + web link + tagline + copyright

### InfoBox

The branded info card used for amounts, dates, contacts.

```typescript
interface InfoBoxProps {
  label: string;
  value: string;
  href?: string;   // Makes value a link
}
```

Visual: Light blue bg (#F4F8FB), 3px left teal border, rounded corners. Label in uppercase muted text, value in navy bold.

### EmailButton

CTA button matching brand.

```typescript
interface EmailButtonProps {
  href: string;
  children: string;
}
```

Visual: Teal bg (#46A0D0), white text, 14px 600-weight, 14px 28px padding, 6px border-radius. Full-width on mobile.

### TestBanner

Yellow warning bar for non-production sends.

```typescript
interface TestBannerProps {
  message?: string;  // Default: "MODO TEST — Este email no fue enviado al cliente"
}
```

## Templates

### 1. CotizacionFollowup

```typescript
interface CotizacionFollowupProps {
  clientName?: string;
  projectName?: string;
  scopeBullets?: string[];
  amount?: string;
  timeline?: string;
  nextStep?: string;
  calLink?: string;
  signatureHtml?: string;
  testMode?: boolean;
}
```

### 2. Factura

```typescript
interface FacturaProps {
  clientName?: string;
  invoiceNumber: string;
  amount: string;
  dueDate?: string;
  detractionAmount?: string;
  bdnAccount?: string;
  hasXml?: boolean;
  hasCdr?: boolean;
  signatureHtml?: string;
  testMode?: boolean;
}
```

### 3. BienvenidaCliente

```typescript
interface BienvenidaClienteProps {
  clientName: string;
  projectName: string;
  kickoffDate?: string;
  pmName?: string;
  senderEmail?: string;
  nextStepsBullets?: string[];
  vikunjaUrl?: string;
  kickoffDetails?: string;
  calLink?: string;
  signatureHtml?: string;
  testMode?: boolean;
}
```

### 4. CierreProyecto

```typescript
interface CierreProyectoProps {
  clientName?: string;
  projectName: string;
  deliverables?: string[];
  liveUrl?: string;
  caseStudyUrl?: string;
  calLink?: string;
  signatureHtml?: string;
  testMode?: boolean;
}
```

### 5. DevEntrega

```typescript
interface DevEntregaProps {
  clientName?: string;
  projectName?: string;
  featureName?: string;
  testUrl?: string;
  notes?: string;
  reviewItems?: string[];
  nextStepsBullets?: string[];
  calLink?: string;
  signatureHtml?: string;
  testMode?: boolean;
}
```

### 6. ReminderPago

```typescript
interface ReminderPagoProps {
  clientName?: string;
  invoiceNumber?: string;
  amount: string;
  dueDate?: string;
  daysOverdue?: number;
  bdnAccount?: string;
  calLink?: string;
  signatureHtml?: string;
  testMode?: boolean;
}
```

## Storybook Stories

Each template gets a story file in `src/stories/email/` with:
- **Default** — all props filled with realistic sample data
- **Minimal** — only required props
- **Test Mode** — with yellow banner enabled
- Decorator that wraps in an iframe-like container (max 600px centered, light gray bg) to simulate email client viewport

## Render Bridge

```typescript
// src/components/email/render.ts
import { render } from '@react-email/render';

export async function renderEmail(
  Template: React.ComponentType<any>,
  props: Record<string, any>
): Promise<string> {
  return render(Template(props));
}
```

For the Python mail skill, a standalone Node script:

```typescript
// scripts/render-email.mjs
import { render } from '@react-email/render';
import * as templates from '../src/components/email/templates/index.js';

const [,, templateName, jsonData] = process.argv;
const data = JSON.parse(jsonData);
const Template = templates[templateName];
const html = await render(Template(data));
process.stdout.write(html);
```

Python side calls: `subprocess.run(['node', 'render-email.mjs', 'CotizacionFollowup', json.dumps(data)], capture_output=True)`

## Visual Design Direction

Target: between Stripe's cleanliness and Vercel's sophistication. Specific upgrades over current templates:

1. **Inter font via Google Fonts** — loaded in `<Head>`, consistent rendering
2. **Refined header** — navy bg with better logo spacing, the teal accent bar stays (brand recognizable)
3. **Better typographic hierarchy** — h1 at 24px bold with negative letter-spacing, body at 15px with 1.7 line-height
4. **Elevated info-boxes** — subtle background + left border, slightly larger padding, better label/value contrast
5. **Prominent CTAs** — larger button, more padding, centered on mobile
6. **Cleaner footer** — lighter treatment, tagline in teal italic, better legal formatting
7. **Generous whitespace** — 36px content padding, 24px section gaps
8. **Table-based rendering** — React Email handles this automatically, fixing Outlook/Yahoo

## Logo Hosting

Migrate from Imgur to Cloudflare R2 or cofoundy.dev static asset. The logo URL becomes a constant in `constants.ts` — easy to update once hosted.

## Scope Boundary

- IN: Base layout, 6 templates, Storybook stories, render helper, constants
- OUT: Modifying the Python mail skill (separate task), setting up new logo hosting (separate), React Email dev server (Storybook is sufficient)
