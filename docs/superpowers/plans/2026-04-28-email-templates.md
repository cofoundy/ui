# React Email Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build professional React Email templates in @cofoundy/ui with Storybook preview, replacing the current Jinja2 templates.

**Architecture:** React Email components in `src/components/email/` — shared primitives (layout, info-box, button) composed into 6 template components. Each template exports a typed React component that renders to email-client-safe HTML via `@react-email/render`. Stories in `src/stories/email/` for visual preview.

**Tech Stack:** React Email (`@react-email/components`, `@react-email/render`), TypeScript, Storybook 8.6, Vitest

---

## File Structure

```
src/components/email/
├── constants.ts              # Color tokens, font stacks, spacing, logo URL
├── components/
│   ├── EmailLayout.tsx       # Base layout: <Html><Head><Body> + header/footer/signature
│   ├── InfoBox.tsx           # Branded info card (teal left border)
│   ├── EmailButton.tsx       # CTA button
│   ├── EmailHeading.tsx      # Styled h1/h2
│   ├── EmailText.tsx         # Body text paragraph
│   ├── EmailDivider.tsx      # Horizontal rule
│   └── TestBanner.tsx        # Yellow test-mode banner
├── templates/
│   ├── CotizacionFollowup.tsx
│   ├── Factura.tsx
│   ├── BienvenidaCliente.tsx
│   ├── CierreProyecto.tsx
│   ├── DevEntrega.tsx
│   └── ReminderPago.tsx
├── render.ts                 # renderEmail() helper
└── index.ts                  # Barrel exports

src/stories/email/
├── EmailPrimitives.stories.tsx   # InfoBox, EmailButton, TestBanner showcases
├── CotizacionFollowup.stories.tsx
├── Factura.stories.tsx
├── BienvenidaCliente.stories.tsx
├── CierreProyecto.stories.tsx
├── DevEntrega.stories.tsx
└── ReminderPago.stories.tsx

src/__tests__/components/email/
└── render.test.tsx           # Smoke tests: each template renders valid HTML
```

---

### Task 1: Install React Email dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install packages**

```bash
cd /Users/styreep/cofoundy/packages/ui && npm install @react-email/components @react-email/render
```

- [ ] **Step 2: Verify install**

```bash
cd /Users/styreep/cofoundy/packages/ui && node -e "require('@react-email/components'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Verify TypeScript resolves the types**

```bash
cd /Users/styreep/cofoundy/packages/ui && npx tsc --noEmit 2>&1 | head -5
```

Expected: No new errors (existing errors are OK if they existed before).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json && git commit -m "feat(email): add @react-email/components and @react-email/render dependencies"
```

---

### Task 2: Create constants and email primitives

**Files:**
- Create: `src/components/email/constants.ts`
- Create: `src/components/email/components/EmailLayout.tsx`
- Create: `src/components/email/components/InfoBox.tsx`
- Create: `src/components/email/components/EmailButton.tsx`
- Create: `src/components/email/components/EmailHeading.tsx`
- Create: `src/components/email/components/EmailText.tsx`
- Create: `src/components/email/components/EmailDivider.tsx`
- Create: `src/components/email/components/TestBanner.tsx`

- [ ] **Step 1: Create constants.ts**

```typescript
// src/components/email/constants.ts

export const colors = {
  primary: '#46A0D0',
  navy: '#23435F',
  navyLight: '#1B577E',
  textBody: '#4B4E54',
  textMuted: '#848386',
  bgLight: '#F4F8FB',
  bgWhite: '#FFFFFF',
  border: '#DBE5EB',
  warning: '#FEF3C7',
  warningText: '#92400E',
  overdue: '#B45309',
} as const;

export const fontFamily =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif";

export const logoUrl = 'https://i.imgur.com/evyPiYS.png';
// TODO: migrate to https://cofoundy.dev/assets/logo-email.png or Cloudflare R2

export const cofoundyInfo = {
  name: 'Cofoundy S.A.C.',
  ruc: '20614413566',
  email: 'info@cofoundy.dev',
  web: 'https://cofoundy.dev',
  tagline: 'Productos de software en semanas, no meses.',
} as const;
```

- [ ] **Step 2: Create EmailLayout.tsx**

This is the base wrapper — replaces `_base.html`. Uses React Email's `<Html>`, `<Head>`, `<Body>`, `<Container>`, `<Section>`, `<Img>`, `<Link>`, `<Text>`, `<Font>`, `<Preview>`.

```tsx
// src/components/email/components/EmailLayout.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Link,
  Text,
  Font,
  Preview,
} from '@react-email/components';
import { colors, fontFamily, logoUrl, cofoundyInfo } from '../constants';
import { TestBanner } from './TestBanner';

export interface EmailLayoutProps {
  title?: string;
  previewText?: string;
  signatureHtml?: string;
  testMode?: boolean;
  children: React.ReactNode;
}

export function EmailLayout({
  title = 'Cofoundy',
  previewText,
  signatureHtml,
  testMode = false,
  children,
}: EmailLayoutProps) {
  const year = new Date().getFullYear();

  return (
    <Html lang="es">
      <Head>
        <title>{title}</title>
        <Font
          fontFamily="Inter"
          fallbackFontFamily={['Helvetica', 'Arial', 'sans-serif']}
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      {previewText && <Preview>{previewText}</Preview>}
      <Body style={bodyStyle}>
        <Container style={wrapperStyle}>
          {testMode && <TestBanner />}
          <Container style={containerStyle}>
            {/* Header */}
            <Section style={headerStyle}>
              <Img
                src={logoUrl}
                alt="Cofoundy"
                height={36}
                style={{ height: '36px', width: 'auto', display: 'block' }}
              />
            </Section>
            {/* Teal accent bar */}
            <Section style={accentBarStyle} />
            {/* Content */}
            <Section style={contentStyle}>
              {children}
            </Section>
            {/* Signature */}
            {signatureHtml && (
              <Section style={signatureWrapStyle}>
                <div style={signatureInnerStyle}>
                  <div dangerouslySetInnerHTML={{ __html: signatureHtml }} />
                </div>
              </Section>
            )}
            {/* Footer */}
            <Section style={footerStyle}>
              <Text style={footerLegalStyle}>
                {cofoundyInfo.name} &middot; RUC {cofoundyInfo.ruc}
              </Text>
              <Text style={footerLinksStyle}>
                <Link href={`mailto:${cofoundyInfo.email}`} style={footerLinkStyle}>
                  {cofoundyInfo.email}
                </Link>
                {' · '}
                <Link href={cofoundyInfo.web} style={footerLinkStyle}>
                  cofoundy.dev
                </Link>
              </Text>
              <Text style={footerTaglineStyle}>{cofoundyInfo.tagline}</Text>
              <Text style={footerMetaStyle}>
                Mensaje transaccional. Si no esperabas este correo, escríbenos a{' '}
                <Link href={`mailto:${cofoundyInfo.email}`} style={footerLinkStyle}>
                  {cofoundyInfo.email}
                </Link>
                .
              </Text>
              <Text style={footerMetaStyle}>
                © {year} {cofoundyInfo.name} · Lima, Perú
              </Text>
            </Section>
          </Container>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle: React.CSSProperties = {
  margin: 0,
  padding: 0,
  fontFamily,
  color: colors.navy,
  backgroundColor: colors.bgLight,
  WebkitTextSizeAdjust: '100%',
};

const wrapperStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: colors.bgLight,
  padding: '32px 0',
};

const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: colors.bgWhite,
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(35, 67, 95, 0.06)',
};

const headerStyle: React.CSSProperties = {
  backgroundColor: colors.navy,
  padding: '28px 40px',
  textAlign: 'left' as const,
};

const accentBarStyle: React.CSSProperties = {
  height: '3px',
  backgroundColor: colors.primary,
  lineHeight: '3px',
  fontSize: 0,
};

const contentStyle: React.CSSProperties = {
  padding: '36px 40px 12px',
};

const signatureWrapStyle: React.CSSProperties = {
  padding: '0 40px 28px',
};

const signatureInnerStyle: React.CSSProperties = {
  paddingTop: '16px',
  borderTop: `1px solid ${colors.border}`,
};

const footerStyle: React.CSSProperties = {
  padding: '24px 40px 32px',
  backgroundColor: colors.bgLight,
  borderTop: `1px solid ${colors.border}`,
};

const footerLegalStyle: React.CSSProperties = {
  margin: '0 0 6px',
  color: colors.navy,
  fontSize: '13px',
  fontWeight: 600,
  lineHeight: '1.5',
  fontFamily,
};

const footerLinksStyle: React.CSSProperties = {
  margin: '0 0 6px',
  color: colors.textMuted,
  fontSize: '12px',
  lineHeight: '1.5',
  fontFamily,
};

const footerLinkStyle: React.CSSProperties = {
  color: colors.navyLight,
  textDecoration: 'none',
  fontWeight: 500,
};

const footerTaglineStyle: React.CSSProperties = {
  margin: '0 0 4px',
  color: colors.primary,
  fontSize: '11px',
  fontStyle: 'italic',
  letterSpacing: '0.01em',
  lineHeight: '1.5',
  fontFamily,
};

const footerMetaStyle: React.CSSProperties = {
  margin: '10px 0 0',
  color: colors.textMuted,
  fontSize: '11px',
  lineHeight: '1.5',
  fontFamily,
};
```

- [ ] **Step 3: Create TestBanner.tsx**

```tsx
// src/components/email/components/TestBanner.tsx
import { Section, Text } from '@react-email/components';
import { colors, fontFamily } from '../constants';

export interface TestBannerProps {
  message?: string;
}

export function TestBanner({
  message = 'MODO TEST — Este email no fue enviado al cliente',
}: TestBannerProps) {
  return (
    <Section style={bannerStyle}>
      <Text style={bannerTextStyle}>{message}</Text>
    </Section>
  );
}

const bannerStyle: React.CSSProperties = {
  backgroundColor: colors.warning,
  padding: '10px 16px',
  textAlign: 'center' as const,
  borderRadius: '10px 10px 0 0',
  maxWidth: '600px',
  margin: '0 auto',
};

const bannerTextStyle: React.CSSProperties = {
  margin: 0,
  color: colors.warningText,
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.02em',
  fontFamily,
};
```

- [ ] **Step 4: Create InfoBox.tsx**

```tsx
// src/components/email/components/InfoBox.tsx
import { Section, Text, Link } from '@react-email/components';
import { colors, fontFamily } from '../constants';

export interface InfoBoxProps {
  label: string;
  value: string;
  href?: string;
}

export function InfoBox({ label, value, href }: InfoBoxProps) {
  return (
    <Section style={boxStyle}>
      <Text style={labelStyle}>{label}</Text>
      {href ? (
        <Link href={href} style={valueLinkStyle}>{value}</Link>
      ) : (
        <Text style={valueStyle}>{value}</Text>
      )}
    </Section>
  );
}

const boxStyle: React.CSSProperties = {
  backgroundColor: colors.bgLight,
  borderLeft: `3px solid ${colors.primary}`,
  borderRadius: '6px',
  padding: '14px 18px',
  margin: '14px 0',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: colors.textMuted,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  marginBottom: '4px',
  fontWeight: 600,
  fontFamily,
  margin: '0 0 4px',
  lineHeight: '1.4',
};

const valueStyle: React.CSSProperties = {
  fontSize: '16px',
  color: colors.navy,
  fontWeight: 600,
  fontFamily,
  margin: 0,
  lineHeight: '1.4',
};

const valueLinkStyle: React.CSSProperties = {
  fontSize: '16px',
  color: colors.navyLight,
  fontWeight: 600,
  textDecoration: 'none',
  fontFamily,
};
```

- [ ] **Step 5: Create EmailButton.tsx**

```tsx
// src/components/email/components/EmailButton.tsx
import { Button } from '@react-email/components';
import { colors, fontFamily } from '../constants';

export interface EmailButtonProps {
  href: string;
  children: string;
}

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Button href={href} style={buttonStyle}>
      {children}
    </Button>
  );
}

const buttonStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '14px 28px',
  backgroundColor: colors.primary,
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '14px',
  letterSpacing: '0.01em',
  margin: '8px 0',
  fontFamily,
  textAlign: 'center' as const,
};
```

- [ ] **Step 6: Create EmailHeading.tsx**

```tsx
// src/components/email/components/EmailHeading.tsx
import { Heading } from '@react-email/components';
import { colors, fontFamily } from '../constants';

export interface EmailHeadingProps {
  as?: 'h1' | 'h2';
  children: React.ReactNode;
}

export function EmailHeading({ as = 'h1', children }: EmailHeadingProps) {
  const style = as === 'h1' ? h1Style : h2Style;
  return (
    <Heading as={as} style={style}>
      {children}
    </Heading>
  );
}

const h1Style: React.CSSProperties = {
  margin: '0 0 16px',
  color: colors.navy,
  fontSize: '24px',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  lineHeight: '1.3',
  fontFamily,
};

const h2Style: React.CSSProperties = {
  margin: '24px 0 12px',
  color: colors.navyLight,
  fontSize: '16px',
  fontWeight: 600,
  letterSpacing: '-0.005em',
  lineHeight: '1.4',
  fontFamily,
};
```

- [ ] **Step 7: Create EmailText.tsx**

```tsx
// src/components/email/components/EmailText.tsx
import { Text } from '@react-email/components';
import { colors, fontFamily } from '../constants';

export interface EmailTextProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function EmailText({ children, style }: EmailTextProps) {
  return <Text style={{ ...textStyle, ...style }}>{children}</Text>;
}

const textStyle: React.CSSProperties = {
  margin: '0 0 16px',
  color: colors.textBody,
  fontSize: '15px',
  lineHeight: '1.7',
  fontFamily,
};
```

- [ ] **Step 8: Create EmailDivider.tsx**

```tsx
// src/components/email/components/EmailDivider.tsx
import { Hr } from '@react-email/components';
import { colors } from '../constants';

export function EmailDivider() {
  return <Hr style={hrStyle} />;
}

const hrStyle: React.CSSProperties = {
  borderColor: colors.border,
  borderTop: `1px solid ${colors.border}`,
  margin: '24px 0',
};
```

- [ ] **Step 9: Verify primitives compile**

```bash
cd /Users/styreep/cofoundy/packages/ui && npx tsc --noEmit 2>&1 | grep -i "email" || echo "No email type errors"
```

Expected: `No email type errors`

- [ ] **Step 10: Commit**

```bash
git add src/components/email/constants.ts src/components/email/components/ && git commit -m "feat(email): add email constants and primitive components (layout, info-box, button, heading, text, divider, test-banner)"
```

---

### Task 3: Create the 6 email templates

**Files:**
- Create: `src/components/email/templates/CotizacionFollowup.tsx`
- Create: `src/components/email/templates/Factura.tsx`
- Create: `src/components/email/templates/BienvenidaCliente.tsx`
- Create: `src/components/email/templates/CierreProyecto.tsx`
- Create: `src/components/email/templates/DevEntrega.tsx`
- Create: `src/components/email/templates/ReminderPago.tsx`

- [ ] **Step 1: Create CotizacionFollowup.tsx**

```tsx
// src/components/email/templates/CotizacionFollowup.tsx
import { Link } from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailDivider } from '../components/EmailDivider';
import { InfoBox } from '../components/InfoBox';
import { colors, fontFamily } from '../constants';

export interface CotizacionFollowupProps {
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

export function CotizacionFollowup({
  clientName,
  projectName,
  scopeBullets,
  amount,
  timeline,
  nextStep,
  calLink,
  signatureHtml,
  testMode = false,
}: CotizacionFollowupProps) {
  return (
    <EmailLayout
      title={`Propuesta Cofoundy — ${projectName || clientName || ''}`}
      previewText={`Tu propuesta para ${projectName || 'tu proyecto'} está lista`}
      signatureHtml={signatureHtml}
      testMode={testMode}
    >
      <EmailHeading>Tu propuesta está lista</EmailHeading>
      <EmailText>Hola{clientName ? ` ${clientName}` : ''},</EmailText>
      <EmailText>
        Gracias por la conversación. Quedamos bien alineados en los objetivos
        y te comparto la propuesta formal que resume lo que acordamos.
      </EmailText>

      {scopeBullets && scopeBullets.length > 0 && (
        <>
          <EmailHeading as="h2">Lo que incluye</EmailHeading>
          <ul style={listStyle}>
            {scopeBullets.map((bullet, i) => (
              <li key={i} style={listItemStyle}>{bullet}</li>
            ))}
          </ul>
        </>
      )}

      {amount && <InfoBox label="Inversión total" value={amount} />}
      {timeline && <InfoBox label="Tiempo estimado" value={timeline} />}

      <EmailText>
        En el adjunto encontrarás el documento completo con el detalle de fases,
        entregables y condiciones de pago.
      </EmailText>

      <EmailDivider />

      {nextStep && (
        <EmailText>
          <strong style={{ color: colors.navy }}>Próximo paso:</strong> {nextStep}
        </EmailText>
      )}

      {calLink && (
        <>
          <EmailText>
            ¿Tienes preguntas o quieres coordinar una llamada de revisión?
            Agenda directamente aquí:
          </EmailText>
          <EmailButton href={calLink}>Agendar llamada</EmailButton>
        </>
      )}

      <EmailText style={{ marginTop: '16px' }}>
        También puedes responder a este correo y te contesto a la brevedad.
      </EmailText>
    </EmailLayout>
  );
}

const listStyle: React.CSSProperties = {
  margin: '0 0 16px',
  paddingLeft: '22px',
  color: colors.textBody,
  fontSize: '15px',
  lineHeight: '1.7',
  fontFamily,
};

const listItemStyle: React.CSSProperties = {
  marginBottom: '6px',
};
```

- [ ] **Step 2: Create Factura.tsx**

```tsx
// src/components/email/templates/Factura.tsx
import { Link } from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailDivider } from '../components/EmailDivider';
import { InfoBox } from '../components/InfoBox';
import { colors, fontFamily } from '../constants';

export interface FacturaProps {
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

export function Factura({
  clientName,
  invoiceNumber,
  amount,
  dueDate,
  detractionAmount,
  bdnAccount,
  hasXml = false,
  hasCdr = false,
  signatureHtml,
  testMode = false,
}: FacturaProps) {
  return (
    <EmailLayout
      title={`Factura ${invoiceNumber} — Cofoundy`}
      previewText={`Factura ${invoiceNumber} por ${amount}`}
      signatureHtml={signatureHtml}
      testMode={testMode}
    >
      <EmailHeading>Factura {invoiceNumber}</EmailHeading>
      <EmailText>Hola{clientName ? ` ${clientName}` : ''},</EmailText>
      <EmailText>
        Adjuntamos la factura electrónica <strong style={{ color: colors.navy }}>{invoiceNumber}</strong> por
        los servicios prestados por Cofoundy S.A.C. Aquí el resumen:
      </EmailText>

      <InfoBox label="Monto total" value={amount} />
      {dueDate && <InfoBox label="Fecha de vencimiento" value={dueDate} />}

      {detractionAmount && (
        <>
          <EmailHeading as="h2">Detracción SPOT [022]</EmailHeading>
          <EmailText>
            Esta operación está sujeta al Sistema de Pago de Obligaciones Tributarias (SPOT).
            Deposita <strong style={{ color: colors.navy }}>{detractionAmount}</strong> (12%) a nuestra
            cuenta del Banco de la Nación:
          </EmailText>
          <InfoBox label="Cuenta BdN · Cofoundy S.A.C." value={bdnAccount || '00-028-152698'} />
          <EmailText>
            Una vez realizado el depósito, envíanos la constancia a{' '}
            <Link href="mailto:info@cofoundy.dev" style={linkStyle}>info@cofoundy.dev</Link> para
            completar el registro.
          </EmailText>
        </>
      )}

      <EmailDivider />

      <EmailHeading as="h2">Adjuntos en este correo</EmailHeading>
      <ul style={listStyle}>
        <li style={listItemStyle}><strong style={{ color: colors.navy }}>PDF de la factura</strong> — representación impresa</li>
        {hasXml && <li style={listItemStyle}><strong style={{ color: colors.navy }}>XML firmado</strong> — documento oficial SUNAT</li>}
        {hasCdr && <li style={listItemStyle}><strong style={{ color: colors.navy }}>CDR</strong> — constancia de recepción SUNAT</li>}
      </ul>

      <EmailText>
        Cualquier consulta sobre este comprobante, responde a este correo o escríbenos a{' '}
        <Link href="mailto:info@cofoundy.dev" style={linkStyle}>info@cofoundy.dev</Link>.
      </EmailText>
      <EmailText>Gracias por confiar en Cofoundy.</EmailText>
    </EmailLayout>
  );
}

const linkStyle: React.CSSProperties = { color: colors.navyLight, textDecoration: 'underline' };
const listStyle: React.CSSProperties = { margin: '0 0 16px', paddingLeft: '22px', color: colors.textBody, fontSize: '15px', lineHeight: '1.7', fontFamily };
const listItemStyle: React.CSSProperties = { marginBottom: '6px' };
```

- [ ] **Step 3: Create BienvenidaCliente.tsx**

```tsx
// src/components/email/templates/BienvenidaCliente.tsx
import { Link } from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailDivider } from '../components/EmailDivider';
import { InfoBox } from '../components/InfoBox';
import { fontFamily, colors } from '../constants';

export interface BienvenidaClienteProps {
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

export function BienvenidaCliente({
  clientName,
  projectName,
  kickoffDate,
  pmName,
  senderEmail,
  nextStepsBullets,
  vikunjaUrl,
  kickoffDetails,
  calLink,
  signatureHtml,
  testMode = false,
}: BienvenidaClienteProps) {
  const defaultSteps = [
    'Te iremos actualizando por WhatsApp con los avances de cada fase.',
    'Para consultas formales, responde a este correo.',
  ];

  const steps = nextStepsBullets && nextStepsBullets.length > 0
    ? nextStepsBullets
    : defaultSteps;

  return (
    <EmailLayout
      title={`Bienvenido a Cofoundy — ${projectName || clientName}`}
      previewText={`¡Bienvenido, ${clientName}! Tu proyecto ${projectName} está activo`}
      signatureHtml={signatureHtml}
      testMode={testMode}
    >
      <EmailHeading>¡Bienvenido, {clientName}!</EmailHeading>
      <EmailText>
        Nos alegra arrancar contigo en <strong style={{ color: colors.navy }}>{projectName}</strong>.
        Tu proyecto ya está activo en nuestro sistema y el equipo está listo para empezar.
      </EmailText>

      {kickoffDate && <InfoBox label="Fecha de inicio" value={kickoffDate} />}
      {pmName && (
        <InfoBox
          label="Tu punto de contacto en Cofoundy"
          value={senderEmail ? `${pmName} · ${senderEmail}` : pmName}
          href={senderEmail ? `mailto:${senderEmail}` : undefined}
        />
      )}

      <EmailHeading as="h2">¿Qué sigue?</EmailHeading>
      <ul style={listStyle}>
        {steps.map((item, i) => (
          <li key={i} style={listItemStyle}>{item}</li>
        ))}
        {vikunjaUrl && (
          <li style={listItemStyle}>
            Panel de seguimiento del proyecto:{' '}
            <Link href={vikunjaUrl} style={linkStyle}>ver aquí</Link>
          </li>
        )}
        {kickoffDetails && <li style={listItemStyle}>{kickoffDetails}</li>}
      </ul>

      <EmailDivider />

      {calLink && (
        <>
          <EmailText>Si necesitas coordinar una llamada rápida en cualquier momento:</EmailText>
          <EmailButton href={calLink}>Agendar llamada</EmailButton>
        </>
      )}

      <EmailText style={{ marginTop: '16px' }}>
        Gracias por confiar en Cofoundy. Vamos a construir algo excelente juntos.
      </EmailText>
    </EmailLayout>
  );
}

const linkStyle: React.CSSProperties = { color: colors.navyLight, textDecoration: 'none', fontWeight: 600 };
const listStyle: React.CSSProperties = { margin: '0 0 16px', paddingLeft: '22px', color: colors.textBody, fontSize: '15px', lineHeight: '1.7', fontFamily };
const listItemStyle: React.CSSProperties = { marginBottom: '6px' };
```

- [ ] **Step 4: Create CierreProyecto.tsx**

```tsx
// src/components/email/templates/CierreProyecto.tsx
import { Link } from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailDivider } from '../components/EmailDivider';
import { InfoBox } from '../components/InfoBox';
import { colors, fontFamily } from '../constants';

export interface CierreProyectoProps {
  clientName?: string;
  projectName: string;
  deliverables?: string[];
  liveUrl?: string;
  caseStudyUrl?: string;
  calLink?: string;
  signatureHtml?: string;
  testMode?: boolean;
}

export function CierreProyecto({
  clientName,
  projectName,
  deliverables,
  liveUrl,
  caseStudyUrl,
  calLink,
  signatureHtml,
  testMode = false,
}: CierreProyectoProps) {
  return (
    <EmailLayout
      title={`Proyecto ${projectName} completado — Cofoundy`}
      previewText={`El proyecto ${projectName} está completado y entregado`}
      signatureHtml={signatureHtml}
      testMode={testMode}
    >
      <EmailHeading>Proyecto entregado con éxito</EmailHeading>
      <EmailText>Hola{clientName ? ` ${clientName}` : ''},</EmailText>
      <EmailText>
        El proyecto <strong style={{ color: colors.navy }}>{projectName}</strong> está completado y entregado.
        Fue un placer construirlo contigo.
      </EmailText>

      {deliverables && deliverables.length > 0 && (
        <>
          <EmailHeading as="h2">Entregables finales</EmailHeading>
          <ul style={listStyle}>
            {deliverables.map((item, i) => (
              <li key={i} style={listItemStyle}>{item}</li>
            ))}
          </ul>
        </>
      )}

      {liveUrl && <InfoBox label="Tu proyecto en línea" value={liveUrl} href={liveUrl} />}

      <EmailDivider />

      <EmailHeading as="h2">¿Qué sigue?</EmailHeading>
      <EmailText>
        En los próximos 30 días te haremos seguimiento para asegurarnos de que todo
        funciona correctamente y explorar cómo podemos seguir apoyándote.
      </EmailText>

      {caseStudyUrl && (
        <EmailText>
          Si estás de acuerdo, nos gustaría compartir tu caso con nuestra comunidad.{' '}
          <Link href={caseStudyUrl} style={linkStyle}>Ver borrador del caso de éxito</Link>
        </EmailText>
      )}

      {calLink && (
        <>
          <EmailText>¿Tienes un nuevo proyecto en mente o quieres coordinar el seguimiento?</EmailText>
          <EmailButton href={calLink}>Agendar llamada de cierre</EmailButton>
        </>
      )}

      <EmailText style={{ marginTop: '16px' }}>
        Gracias por confiar en Cofoundy. Nos vemos en el próximo.
      </EmailText>
    </EmailLayout>
  );
}

const linkStyle: React.CSSProperties = { color: colors.navyLight, textDecoration: 'underline' };
const listStyle: React.CSSProperties = { margin: '0 0 16px', paddingLeft: '22px', color: colors.textBody, fontSize: '15px', lineHeight: '1.7', fontFamily };
const listItemStyle: React.CSSProperties = { marginBottom: '6px' };
```

- [ ] **Step 5: Create DevEntrega.tsx**

```tsx
// src/components/email/templates/DevEntrega.tsx
import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailDivider } from '../components/EmailDivider';
import { InfoBox } from '../components/InfoBox';
import { colors, fontFamily } from '../constants';

export interface DevEntregaProps {
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

export function DevEntrega({
  clientName,
  projectName,
  featureName,
  testUrl,
  notes,
  reviewItems,
  nextStepsBullets,
  calLink,
  signatureHtml,
  testMode = false,
}: DevEntregaProps) {
  return (
    <EmailLayout
      title={`Entrega: ${featureName || 'Avance del proyecto'} — ${projectName || ''}`}
      previewText={`${featureName || 'Avance'} listo para revisión`}
      signatureHtml={signatureHtml}
      testMode={testMode}
    >
      <EmailHeading>Entrega lista para revisión</EmailHeading>
      <EmailText>Hola{clientName ? ` ${clientName}` : ''},</EmailText>
      <EmailText>
        Terminamos de implementar{' '}
        <strong style={{ color: colors.navy }}>{featureName || 'el avance solicitado'}</strong>
        {projectName && <> en <strong style={{ color: colors.navy }}>{projectName}</strong></>}
        {' '}y está lista para tu revisión.
      </EmailText>

      {testUrl && <InfoBox label="Ambiente de revisión" value={testUrl} href={testUrl} />}
      {notes && (
        <>
          <EmailHeading as="h2">Notas de la entrega</EmailHeading>
          <EmailText>{notes}</EmailText>
        </>
      )}

      {reviewItems && reviewItems.length > 0 && (
        <>
          <EmailHeading as="h2">Puntos a revisar</EmailHeading>
          <ul style={listStyle}>
            {reviewItems.map((item, i) => (
              <li key={i} style={listItemStyle}>{item}</li>
            ))}
          </ul>
        </>
      )}

      {nextStepsBullets && nextStepsBullets.length > 0 && (
        <>
          <EmailHeading as="h2">Próximos pasos</EmailHeading>
          <ul style={listStyle}>
            {nextStepsBullets.map((item, i) => (
              <li key={i} style={listItemStyle}>{item}</li>
            ))}
          </ul>
        </>
      )}

      <EmailDivider />

      <EmailText>
        Por favor revisa y danos tu feedback para proceder con los ajustes finales
        o confirmar la aprobación.
      </EmailText>

      {calLink && (
        <>
          <EmailText>Si prefieres revisar juntos en una llamada rápida:</EmailText>
          <EmailButton href={calLink}>Agendar revisión</EmailButton>
        </>
      )}
    </EmailLayout>
  );
}

const listStyle: React.CSSProperties = { margin: '0 0 16px', paddingLeft: '22px', color: colors.textBody, fontSize: '15px', lineHeight: '1.7', fontFamily };
const listItemStyle: React.CSSProperties = { marginBottom: '6px' };
```

- [ ] **Step 6: Create ReminderPago.tsx**

```tsx
// src/components/email/templates/ReminderPago.tsx
import { Link } from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';
import { EmailHeading } from '../components/EmailHeading';
import { EmailText } from '../components/EmailText';
import { EmailButton } from '../components/EmailButton';
import { EmailDivider } from '../components/EmailDivider';
import { InfoBox } from '../components/InfoBox';
import { colors, fontFamily } from '../constants';

export interface ReminderPagoProps {
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

export function ReminderPago({
  clientName,
  invoiceNumber,
  amount,
  dueDate,
  daysOverdue,
  bdnAccount,
  calLink,
  signatureHtml,
  testMode = false,
}: ReminderPagoProps) {
  const dueDateDisplay = dueDate && daysOverdue && daysOverdue > 0
    ? `${dueDate} (${daysOverdue} días vencida)`
    : dueDate;

  return (
    <EmailLayout
      title={`Recordatorio de pago — ${invoiceNumber || 'Factura pendiente'}`}
      previewText={`Recordatorio: pago pendiente de ${amount}`}
      signatureHtml={signatureHtml}
      testMode={testMode}
    >
      <EmailHeading>Recordatorio de pago pendiente</EmailHeading>
      <EmailText>Hola{clientName ? ` ${clientName}` : ''},</EmailText>
      <EmailText>
        Te escribimos para recordarte un pago pendiente correspondiente a los
        servicios de Cofoundy S.A.C.
      </EmailText>

      {invoiceNumber && <InfoBox label="Comprobante" value={invoiceNumber} />}
      <InfoBox label="Monto pendiente" value={amount} />
      {dueDateDisplay && <InfoBox label="Fecha de vencimiento" value={dueDateDisplay} />}

      {bdnAccount && (
        <>
          <EmailHeading as="h2">Datos para el pago</EmailHeading>
          <EmailText>
            Si aún no has procesado la detracción SPOT, realiza el depósito a nuestra
            cuenta del Banco de la Nación:
          </EmailText>
          <InfoBox label="Cuenta BdN · Cofoundy S.A.C." value={bdnAccount} />
        </>
      )}

      <EmailDivider />

      <EmailText>
        Si ya realizaste el pago, por favor ignora este mensaje y envíanos la
        constancia para actualizar nuestros registros.
      </EmailText>
      <EmailText>
        Si tienes algún inconveniente o quieres coordinar una alternativa, no dudes
        en responder a este correo o contactarnos directamente.
      </EmailText>

      {calLink && <EmailButton href={calLink}>Coordinar llamada</EmailButton>}
    </EmailLayout>
  );
}
```

- [ ] **Step 7: Verify all templates compile**

```bash
cd /Users/styreep/cofoundy/packages/ui && npx tsc --noEmit 2>&1 | grep -c "error" || echo "0 errors"
```

- [ ] **Step 8: Commit**

```bash
git add src/components/email/templates/ && git commit -m "feat(email): add 6 email templates (cotizacion, factura, bienvenida, cierre, dev-entrega, reminder-pago)"
```

---

### Task 4: Create barrel exports and render helper

**Files:**
- Create: `src/components/email/render.ts`
- Create: `src/components/email/index.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Create render.ts**

```typescript
// src/components/email/render.ts
import { render } from '@react-email/render';
import type { ReactElement } from 'react';

export async function renderEmail(element: ReactElement): Promise<string> {
  return render(element);
}

export async function renderEmailPlainText(element: ReactElement): Promise<string> {
  return render(element, { plainText: true });
}
```

- [ ] **Step 2: Create email/index.ts**

```typescript
// src/components/email/index.ts

// Primitives
export { EmailLayout } from './components/EmailLayout';
export type { EmailLayoutProps } from './components/EmailLayout';
export { InfoBox } from './components/InfoBox';
export type { InfoBoxProps } from './components/InfoBox';
export { EmailButton } from './components/EmailButton';
export type { EmailButtonProps } from './components/EmailButton';
export { EmailHeading } from './components/EmailHeading';
export type { EmailHeadingProps } from './components/EmailHeading';
export { EmailText } from './components/EmailText';
export type { EmailTextProps } from './components/EmailText';
export { EmailDivider } from './components/EmailDivider';
export { TestBanner } from './components/TestBanner';
export type { TestBannerProps } from './components/TestBanner';

// Templates
export { CotizacionFollowup } from './templates/CotizacionFollowup';
export type { CotizacionFollowupProps } from './templates/CotizacionFollowup';
export { Factura } from './templates/Factura';
export type { FacturaProps } from './templates/Factura';
export { BienvenidaCliente } from './templates/BienvenidaCliente';
export type { BienvenidaClienteProps } from './templates/BienvenidaCliente';
export { CierreProyecto } from './templates/CierreProyecto';
export type { CierreProyectoProps } from './templates/CierreProyecto';
export { DevEntrega } from './templates/DevEntrega';
export type { DevEntregaProps } from './templates/DevEntrega';
export { ReminderPago } from './templates/ReminderPago';
export type { ReminderPagoProps } from './templates/ReminderPago';

// Render utilities
export { renderEmail, renderEmailPlainText } from './render';

// Constants
export { colors as emailColors, cofoundyInfo } from './constants';
```

- [ ] **Step 3: Add email exports to root index.ts**

Append to the end of `src/index.ts`:

```typescript
// Email Templates
export {
  // Primitives
  EmailLayout,
  InfoBox as EmailInfoBox,
  EmailButton,
  EmailHeading,
  EmailText,
  EmailDivider,
  TestBanner as EmailTestBanner,
  // Templates
  CotizacionFollowup,
  Factura,
  BienvenidaCliente,
  CierreProyecto,
  DevEntrega,
  ReminderPago,
  // Render
  renderEmail,
  renderEmailPlainText,
  // Constants
  emailColors,
  cofoundyInfo,
} from "./components/email";
export type {
  EmailLayoutProps,
  EmailButtonProps,
  EmailHeadingProps,
  EmailTextProps,
  TestBannerProps as EmailTestBannerProps,
  CotizacionFollowupProps,
  FacturaProps,
  BienvenidaClienteProps,
  CierreProyectoProps,
  DevEntregaProps,
  ReminderPagoProps,
} from "./components/email";
```

- [ ] **Step 4: Verify full build compiles**

```bash
cd /Users/styreep/cofoundy/packages/ui && npx tsc --noEmit 2>&1 | tail -5
```

Expected: No new errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/email/render.ts src/components/email/index.ts src/index.ts && git commit -m "feat(email): add barrel exports and render helper"
```

---

### Task 5: Create Storybook stories

**Files:**
- Create: `src/stories/email/EmailPrimitives.stories.tsx`
- Create: `src/stories/email/CotizacionFollowup.stories.tsx`
- Create: `src/stories/email/Factura.stories.tsx`
- Create: `src/stories/email/BienvenidaCliente.stories.tsx`
- Create: `src/stories/email/CierreProyecto.stories.tsx`
- Create: `src/stories/email/DevEntrega.stories.tsx`
- Create: `src/stories/email/ReminderPago.stories.tsx`

Email templates use their own inline styles and are self-contained HTML documents. Storybook stories should:
1. Override the default decorator — emails don't need the dark theme wrapper
2. Use `parameters: { layout: 'fullscreen' }` so the email fills the viewport
3. Use a light gray background to simulate an email client

- [ ] **Step 1: Create EmailPrimitives.stories.tsx**

```tsx
// src/stories/email/EmailPrimitives.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { InfoBox } from '../../components/email/components/InfoBox';
import { EmailButton } from '../../components/email/components/EmailButton';
import { EmailHeading } from '../../components/email/components/EmailHeading';
import { EmailText } from '../../components/email/components/EmailText';
import { EmailDivider } from '../../components/email/components/EmailDivider';
import { TestBanner } from '../../components/email/components/TestBanner';

const meta: Meta = {
  title: 'Email/Primitives',
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '520px', padding: '24px', fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const InfoBoxDefault: StoryObj = {
  name: 'InfoBox — Default',
  render: () => <InfoBox label="Inversión total" value="S/2,600.00" />,
};

export const InfoBoxWithLink: StoryObj = {
  name: 'InfoBox — With Link',
  render: () => <InfoBox label="Tu proyecto en línea" value="https://app.neoser.pe" href="https://app.neoser.pe" />,
};

export const InfoBoxStack: StoryObj = {
  name: 'InfoBox — Stacked',
  render: () => (
    <>
      <InfoBox label="Monto total" value="S/2,600.00" />
      <InfoBox label="Fecha de vencimiento" value="15 de mayo, 2026" />
      <InfoBox label="Comprobante" value="F001-00042" />
    </>
  ),
};

export const ButtonDefault: StoryObj = {
  name: 'EmailButton',
  render: () => <EmailButton href="https://cal.cofoundy.dev/andre/meet">Agendar llamada</EmailButton>,
};

export const Headings: StoryObj = {
  name: 'Headings',
  render: () => (
    <>
      <EmailHeading as="h1">Tu propuesta está lista</EmailHeading>
      <EmailHeading as="h2">Lo que incluye</EmailHeading>
    </>
  ),
};

export const TextParagraph: StoryObj = {
  name: 'EmailText',
  render: () => (
    <EmailText>
      Gracias por la conversación. Quedamos bien alineados en los objetivos
      y te comparto la propuesta formal que resume lo que acordamos.
    </EmailText>
  ),
};

export const DividerDefault: StoryObj = {
  name: 'EmailDivider',
  render: () => (
    <>
      <EmailText>Content above the divider.</EmailText>
      <EmailDivider />
      <EmailText>Content below the divider.</EmailText>
    </>
  ),
};

export const TestBannerDefault: StoryObj = {
  name: 'TestBanner',
  render: () => <TestBanner />,
};
```

- [ ] **Step 2: Create CotizacionFollowup.stories.tsx**

```tsx
// src/stories/email/CotizacionFollowup.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { CotizacionFollowup } from '../../components/email/templates/CotizacionFollowup';

const meta: Meta<typeof CotizacionFollowup> = {
  title: 'Email/Cotización Followup',
  component: CotizacionFollowup,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ background: '#e5e7eb', minHeight: '100vh', padding: '0' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CotizacionFollowup>;

export const Default: Story = {
  args: {
    clientName: 'Diana',
    projectName: 'Portal Web NeoSer',
    scopeBullets: [
      'Diseño y desarrollo del portal web corporativo',
      'Integración con API de servicios existente',
      'Panel administrativo para gestión de contenido',
      'Optimización SEO y performance',
    ],
    amount: 'S/2,600.00',
    timeline: '8 semanas',
    nextStep: 'Revisa la propuesta adjunta y confirmanos tu disponibilidad para arrancar',
    calLink: 'https://cal.cofoundy.dev/andre/meet',
  },
};

export const Minimal: Story = {
  args: {
    clientName: 'Carlos',
  },
};

export const TestMode: Story = {
  args: {
    ...Default.args,
    testMode: true,
  },
};
```

- [ ] **Step 3: Create Factura.stories.tsx**

```tsx
// src/stories/email/Factura.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Factura } from '../../components/email/templates/Factura';

const meta: Meta<typeof Factura> = {
  title: 'Email/Factura',
  component: Factura,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ background: '#e5e7eb', minHeight: '100vh', padding: '0' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Factura>;

export const Default: Story = {
  args: {
    clientName: 'Diana',
    invoiceNumber: 'F001-00042',
    amount: 'S/2,600.00',
    dueDate: '15 de mayo, 2026',
    hasXml: true,
    hasCdr: true,
  },
};

export const WithDetraction: Story = {
  args: {
    ...Default.args,
    detractionAmount: 'S/312.00',
    bdnAccount: '00-028-152698',
  },
};

export const Minimal: Story = {
  args: {
    invoiceNumber: 'F001-00043',
    amount: 'S/800.00',
  },
};

export const TestMode: Story = {
  args: {
    ...Default.args,
    testMode: true,
  },
};
```

- [ ] **Step 4: Create BienvenidaCliente.stories.tsx**

```tsx
// src/stories/email/BienvenidaCliente.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { BienvenidaCliente } from '../../components/email/templates/BienvenidaCliente';

const meta: Meta<typeof BienvenidaCliente> = {
  title: 'Email/Bienvenida Cliente',
  component: BienvenidaCliente,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ background: '#e5e7eb', minHeight: '100vh', padding: '0' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BienvenidaCliente>;

export const Default: Story = {
  args: {
    clientName: 'Diana',
    projectName: 'Portal Web NeoSer',
    kickoffDate: '5 de mayo, 2026',
    pmName: 'André Pacheco',
    senderEmail: 'andre@cofoundy.dev',
    calLink: 'https://cal.cofoundy.dev/andre/meet',
  },
};

export const WithCustomSteps: Story = {
  args: {
    ...Default.args,
    nextStepsBullets: [
      'Reunión de kickoff el lunes 5 de mayo a las 10am',
      'Acceso al repositorio GitHub compartido',
      'Canal de WhatsApp para comunicación rápida',
      'Primer sprint: diseño de wireframes (1 semana)',
    ],
    vikunjaUrl: 'https://vikunja.cofoundy.dev/projects/42',
  },
};

export const Minimal: Story = {
  args: {
    clientName: 'Carlos',
    projectName: 'App Delivery',
  },
};

export const TestMode: Story = {
  args: {
    ...Default.args,
    testMode: true,
  },
};
```

- [ ] **Step 5: Create CierreProyecto.stories.tsx**

```tsx
// src/stories/email/CierreProyecto.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { CierreProyecto } from '../../components/email/templates/CierreProyecto';

const meta: Meta<typeof CierreProyecto> = {
  title: 'Email/Cierre Proyecto',
  component: CierreProyecto,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ background: '#e5e7eb', minHeight: '100vh', padding: '0' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CierreProyecto>;

export const Default: Story = {
  args: {
    clientName: 'Diana',
    projectName: 'Portal Web NeoSer',
    deliverables: [
      'Portal web corporativo (neoser.pe)',
      'Panel admin con CMS',
      'API de servicios integrada',
      'Documentación técnica',
    ],
    liveUrl: 'https://neoser.pe',
    calLink: 'https://cal.cofoundy.dev/andre/meet',
  },
};

export const WithCaseStudy: Story = {
  args: {
    ...Default.args,
    caseStudyUrl: 'https://cofoundy.dev/cases/neoser',
  },
};

export const Minimal: Story = {
  args: {
    projectName: 'App Delivery',
  },
};

export const TestMode: Story = {
  args: {
    ...Default.args,
    testMode: true,
  },
};
```

- [ ] **Step 6: Create DevEntrega.stories.tsx**

```tsx
// src/stories/email/DevEntrega.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { DevEntrega } from '../../components/email/templates/DevEntrega';

const meta: Meta<typeof DevEntrega> = {
  title: 'Email/Dev Entrega',
  component: DevEntrega,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ background: '#e5e7eb', minHeight: '100vh', padding: '0' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DevEntrega>;

export const Default: Story = {
  args: {
    clientName: 'Diana',
    projectName: 'Portal Web NeoSer',
    featureName: 'Módulo de contacto con formulario inteligente',
    testUrl: 'https://staging.neoser.pe',
    notes: 'El formulario detecta automáticamente el tipo de consulta y la redirige al área correspondiente.',
    reviewItems: [
      'Flujo completo del formulario de contacto',
      'Notificaciones por email al equipo interno',
      'Responsive en móvil',
      'Validaciones de campos',
    ],
    calLink: 'https://cal.cofoundy.dev/andre/meet',
  },
};

export const WithNextSteps: Story = {
  args: {
    ...Default.args,
    nextStepsBullets: [
      'Aprobación del módulo de contacto',
      'Inicio de sprint 3: integración de pagos',
      'Demo final programada para el 20 de mayo',
    ],
  },
};

export const Minimal: Story = {
  args: {
    clientName: 'Carlos',
    featureName: 'Dashboard de métricas',
  },
};

export const TestMode: Story = {
  args: {
    ...Default.args,
    testMode: true,
  },
};
```

- [ ] **Step 7: Create ReminderPago.stories.tsx**

```tsx
// src/stories/email/ReminderPago.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ReminderPago } from '../../components/email/templates/ReminderPago';

const meta: Meta<typeof ReminderPago> = {
  title: 'Email/Reminder Pago',
  component: ReminderPago,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ background: '#e5e7eb', minHeight: '100vh', padding: '0' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ReminderPago>;

export const Default: Story = {
  args: {
    clientName: 'Diana',
    invoiceNumber: 'F001-00042',
    amount: 'S/2,600.00',
    dueDate: '15 de abril, 2026',
    daysOverdue: 13,
    calLink: 'https://cal.cofoundy.dev/andre/meet',
  },
};

export const WithDetraction: Story = {
  args: {
    ...Default.args,
    bdnAccount: '00-028-152698',
  },
};

export const NotOverdue: Story = {
  name: 'Not Yet Overdue',
  args: {
    clientName: 'Carlos',
    amount: 'S/800.00',
    dueDate: '30 de abril, 2026',
  },
};

export const Minimal: Story = {
  args: {
    amount: 'S/1,200.00',
  },
};

export const TestMode: Story = {
  args: {
    ...Default.args,
    testMode: true,
  },
};
```

- [ ] **Step 8: Verify Storybook loads with no errors**

```bash
cd /Users/styreep/cofoundy/packages/ui && npx tsc --noEmit 2>&1 | tail -5
```

Then open `http://localhost:6006` and navigate to Email category to verify all stories render.

- [ ] **Step 9: Commit**

```bash
git add src/stories/email/ && git commit -m "feat(email): add Storybook stories for all email templates and primitives"
```

---

### Task 6: Add smoke tests for email rendering

**Files:**
- Create: `src/__tests__/components/email/render.test.tsx`

- [ ] **Step 1: Write smoke tests**

```tsx
// src/__tests__/components/email/render.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@react-email/render';
import { CotizacionFollowup } from '../../../components/email/templates/CotizacionFollowup';
import { Factura } from '../../../components/email/templates/Factura';
import { BienvenidaCliente } from '../../../components/email/templates/BienvenidaCliente';
import { CierreProyecto } from '../../../components/email/templates/CierreProyecto';
import { DevEntrega } from '../../../components/email/templates/DevEntrega';
import { ReminderPago } from '../../../components/email/templates/ReminderPago';

describe('Email template rendering', () => {
  it('renders CotizacionFollowup to valid HTML', async () => {
    const html = await render(
      CotizacionFollowup({
        clientName: 'Test',
        projectName: 'Test Project',
        amount: 'S/1,000',
        scopeBullets: ['Item 1', 'Item 2'],
        calLink: 'https://example.com',
      })
    );
    expect(html).toContain('<!DOCTYPE html');
    expect(html).toContain('Tu propuesta está lista');
    expect(html).toContain('Test Project');
    expect(html).toContain('S/1,000');
    expect(html).toContain('Item 1');
  });

  it('renders Factura to valid HTML', async () => {
    const html = await render(
      Factura({
        clientName: 'Test',
        invoiceNumber: 'F001-00001',
        amount: 'S/500',
        hasXml: true,
        hasCdr: true,
      })
    );
    expect(html).toContain('<!DOCTYPE html');
    expect(html).toContain('F001-00001');
    expect(html).toContain('XML firmado');
    expect(html).toContain('CDR');
  });

  it('renders BienvenidaCliente to valid HTML', async () => {
    const html = await render(
      BienvenidaCliente({
        clientName: 'Test',
        projectName: 'Test Project',
        kickoffDate: '1 de enero',
      })
    );
    expect(html).toContain('<!DOCTYPE html');
    expect(html).toContain('¡Bienvenido, Test!');
    expect(html).toContain('Test Project');
  });

  it('renders CierreProyecto to valid HTML', async () => {
    const html = await render(
      CierreProyecto({
        projectName: 'Test Project',
        deliverables: ['Entregable 1'],
        liveUrl: 'https://example.com',
      })
    );
    expect(html).toContain('<!DOCTYPE html');
    expect(html).toContain('Proyecto entregado');
    expect(html).toContain('Entregable 1');
  });

  it('renders DevEntrega to valid HTML', async () => {
    const html = await render(
      DevEntrega({
        clientName: 'Test',
        featureName: 'Feature X',
        testUrl: 'https://staging.example.com',
      })
    );
    expect(html).toContain('<!DOCTYPE html');
    expect(html).toContain('Feature X');
    expect(html).toContain('staging.example.com');
  });

  it('renders ReminderPago to valid HTML', async () => {
    const html = await render(
      ReminderPago({
        amount: 'S/1,000',
        dueDate: '1 de enero',
        daysOverdue: 5,
      })
    );
    expect(html).toContain('<!DOCTYPE html');
    expect(html).toContain('Recordatorio de pago');
    expect(html).toContain('5 días vencida');
  });

  it('includes test banner when testMode is true', async () => {
    const html = await render(
      CotizacionFollowup({ testMode: true })
    );
    expect(html).toContain('MODO TEST');
  });

  it('omits test banner when testMode is false', async () => {
    const html = await render(
      CotizacionFollowup({ testMode: false })
    );
    expect(html).not.toContain('MODO TEST');
  });
});
```

- [ ] **Step 2: Run tests**

```bash
cd /Users/styreep/cofoundy/packages/ui && npm test -- --testPathPattern="email" 2>&1
```

Expected: All 8 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/components/email/ && git commit -m "test(email): add smoke tests for all 6 email templates"
```

---

### Task 7: Visual QA in Storybook

**Files:** None (verification only)

- [ ] **Step 1: Open Storybook and verify**

Open `http://localhost:6006` and check:
1. Navigate to "Email" category — all 7 story groups should appear (Primitives + 6 templates)
2. Click through each template's Default story — verify navy header, teal accent, content, footer
3. Click TestMode stories — verify yellow banner appears above the template
4. Click Minimal stories — verify templates render gracefully with missing optional props
5. Check Primitives stories — InfoBox, Button, Heading, Text, Divider, TestBanner each render correctly

- [ ] **Step 2: Fix any visual issues found**

If any component renders incorrectly in Storybook, fix the inline styles and re-verify.

- [ ] **Step 3: Final commit if fixes were needed**

```bash
git add -u && git commit -m "fix(email): visual adjustments from Storybook QA"
```
