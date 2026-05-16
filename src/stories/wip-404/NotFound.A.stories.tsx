// Concept A — "Threshold pause"
// Axis profile: bg=light · layout=centered-vertical · focal=typography-art
//              tone=quiet-confident · narrative=no-metaphor · density=minimal
// Strategic role: Tests maximally restrained Sage. Whitespace does the caregiver work.
//                 If this wins, the brief is right that voice > visual.
// Risk this concept must avoid: brushing against ruler-corporate.
//   Mitigation: copy register opens with "Pasa que" (conversational first-person),
//   CTA is a link with a slow underline — NOT a button rectangle (refusing
//   the corporate notice posture). One thin hairline marks the threshold;
//   the page is the breath.

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from '../../components/ui/button';

interface NotFoundProps {
  productContext?: 'inbox' | 'timely' | 'pulse' | 'landing';
  primaryAction: { label: string; href: string };
  secondaryMessage?: string;
  theme?: 'light' | 'dark';
}

const productLabel: Record<NonNullable<NotFoundProps['productContext']>, string> = {
  inbox: 'Inbox AI',
  timely: 'Timely AI',
  pulse: 'Pulse AI',
  landing: 'Cofoundy',
};

const productScope: Record<NonNullable<NotFoundProps['productContext']>, string> = {
  inbox: 'tu inbox',
  timely: 'tu agenda',
  pulse: 'tu tablero',
  landing: 'el sitio',
};

function NotFound({ productContext = 'inbox', primaryAction, secondaryMessage, theme = 'light' }: NotFoundProps) {
  const scope = productScope[productContext];
  const product = productLabel[productContext];

  const colors = theme === 'dark' 
    ? {
        bg: '#0a0f1a',
        text: '#f1f5f9',
        muted: '#64748b',
        subtext: '#cbd5e1',
        hairline: 'rgba(241, 245, 249, 0.12)',
        button: '#2984AD',
        buttonText: '#ffffff',
        footer: '#94a3b8',
      }
    : {
        bg: '#ffffff',
        text: '#0f172a',
        muted: '#94a3b8',
        subtext: '#64748b',
        hairline: 'rgba(15, 23, 42, 0.12)',
        button: '#2984AD',
        buttonText: '#ffffff',
        footer: '#cbd5e1',
      };

  return (
    <div
      data-slot="not-found"
      data-theme={theme}
      style={{
        minHeight: '100vh',
        width: '100%',
        background: colors.bg,
        color: colors.text,
        fontFamily: 'var(--font-sans)',
        display: 'grid',
        // Asymmetric vertical rhythm — content sits slightly above optical center,
        // creating a "held breath" rather than a static centered block.
        gridTemplateRows: '38vh 1fr 22vh',
        padding: '0 7vw',
      }}
    >
      {/* Top eyebrow — tiny locator. Establishes that we know where we are.
          Anti-self compliance: no "404" badge (brief forbids "Error 404" register). */}
      <header
        style={{
          alignSelf: 'end',
          paddingBottom: '4vh',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'baseline',
          color: colors.muted,
          fontSize: '12px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}
      >
        <span>{product}</span>
      </header>

      {/* The threshold — the only graphic element. A hairline that the eye crosses
          before reading the sentence. The page does not fill space; it pauses. */}
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
        }}
      >
        <div
          aria-hidden
          style={{
            height: '1px',
            width: '100%',
            background: colors.hairline,
            // Subtle slow draw-in — the breath beginning.
            animation: 'thresholdDraw var(--cf-duration-slow) var(--cf-ease-default) both',
            transformOrigin: 'left center',
          }}
        />

        {/* Headline — Display medium, 48px peak. The plain-spoken Sage line. */}
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 3.6vw, 46px)',
            lineHeight: 1.2,
            letterSpacing: '-0.015em',
            fontWeight: 500,
            color: colors.text,
            maxWidth: '56ch',
            margin: '8vh 0 0 0',
            // The sentence fades in after the threshold.
            animation: 'sentenceRise var(--cf-duration-slow) var(--cf-ease-default) 120ms both',
          }}
        >
          Pasa que esta URL ya no existe en {scope}.
        </p>

        {/* Subline — optional why-clause. Inter 18px, muted slate, ~60-65% of headline weight.
            Two sizes + two weights = typography-art axis fulfilled. */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            marginTop: '18px',
            fontSize: '18px',
            lineHeight: 1.55,
            letterSpacing: '-0.005em',
            color: colors.subtext,
            maxWidth: '50ch',
            fontWeight: 400,
            margin: '18px 0 0 0',
            animation: 'sentenceRise var(--cf-duration-slow) var(--cf-ease-default) 200ms both',
          }}
        >
          {secondaryMessage ?? 'Se movió, expiró, o el enlace tenía un typo.'}
        </p>

        <div
          style={{
            marginTop: '7vh',
            animation: 'sentenceRise var(--cf-duration-slow) var(--cf-ease-default) 320ms both',
          }}
        >
          {/* Hero stance: filled primary button, brand color, committed shape.
              No competing secondary — single CTA per brief. */}
          <Button
            asChild
            variant="default"
            size="lg"
            style={{
              backgroundColor: colors.button,
              color: colors.buttonText,
              padding: '14px 22px',
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              fontWeight: 500,
              letterSpacing: '0.01em',
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
            }}
          >
            <a href={primaryAction.href}>{primaryAction.label}</a>
          </Button>
        </div>
      </main>

      {/* Footer — almost empty. The page exhales here. */}
      <footer
        style={{
          alignSelf: 'end',
          paddingBottom: '4vh',
          fontSize: '12px',
          letterSpacing: '0.08em',
          color: colors.footer,
          fontWeight: 400,
        }}
      >
        cofoundy.dev
      </footer>

      <style>{`
        @keyframes thresholdDraw {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
        @keyframes sentenceRise {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const meta: Meta<typeof NotFound> = {
  title: 'WIP / 404 / A Threshold pause',
  component: NotFound,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light', values: [{ name: 'light', value: '#ffffff' }] },
  },
};

export default meta;
type Story = StoryObj<typeof NotFound>;

export const Default: Story = {
  args: {
    productContext: 'inbox',
    primaryAction: { label: 'Volver al inbox', href: '/' },
    theme: 'light',
  },
};

export const Dark: Story = {
  args: {
    productContext: 'inbox',
    primaryAction: { label: 'Volver al inbox', href: '/' },
    theme: 'dark',
  },
  parameters: {
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0a0f1a' }] },
  },
};
