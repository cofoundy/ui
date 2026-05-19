import * as React from 'react';
import type { ClientPortalPanelRootProps } from '../ClientPortalPanel.schema';

/* ============================================================
   ClientPortalPanel.Root
   ============================================================
   Slot-composable wrapper. Hydrates --portal-accent (per-client
   brand color) and optionally --portal-display-font. Children
   are the section subcomponents (Hero, Phase, LiveSites, …).

   Inherits theme from chrome via [data-theme] on ancestor.
   Single light/dark commitment per page = whatever client-chrome
   resolves. NO theme switching inside the panel.

   data-slot: "client-portal-panel" — anchors styling + tests.
   ============================================================ */

export function Root({ slug, accentColor, displayFont, children }: ClientPortalPanelRootProps) {
  const style: React.CSSProperties = {
    // CSS variables hydrated on the wrapper, scoped to subtree.
    // Fallback to brand primary when no per-client accent supplied.
    ['--portal-accent' as any]: accentColor ?? 'var(--cf-primary)',
    ['--portal-accent-soft' as any]: accentColor
      ? `color-mix(in srgb, ${accentColor} 12%, transparent)`
      : 'color-mix(in srgb, var(--cf-primary) 12%, transparent)',
    ...(displayFont ? { ['--portal-display-font' as any]: displayFont } : {}),

    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(48px, 6vw, 96px)',
    width: '100%',
    maxWidth: 1200,
    margin: '0 auto',
    padding: 'clamp(24px, 4vw, 48px) clamp(16px, 3vw, 48px)',
    background: 'var(--cf-bg)',
    color: 'var(--cf-fg)',
    fontFamily: 'var(--font-sans)',
    boxSizing: 'border-box',
    overflowX: 'hidden',
  };

  return (
    <section data-slot="client-portal-panel" data-client-slug={slug} style={style}>
      {children}
    </section>
  );
}
