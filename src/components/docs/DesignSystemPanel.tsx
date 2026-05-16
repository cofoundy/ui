import * as React from 'react';
export interface ColorToken {
  name: string;
  value: string;
  /** Short usage hint per token (e.g. "primary CTA", "muted body"). */
  usage_note?: string;
}

export interface TypeToken {
  name: string;
  family: string;
  sample?: string;
  weight?: string;
}

export interface DesignSystemPanelProps {
  colors?: ColorToken[];
  typography?: TypeToken[];
  spacing?: { name: string; value: string }[];
  radius?: { name: string; value: string }[];
  /** Brand direction label (e.g. "emerald-academic"). Renders as a chip in the header. */
  direction?: string;
}

export function DesignSystemPanel({ colors, typography, spacing, radius, direction }: DesignSystemPanelProps) {
  return (
    <section
      data-slot="design-system-panel"
      style={{
        margin: '1.75em 0',
        padding: '1.5em',
        background: 'var(--cf-card)',
        border: '1px solid var(--cf-border)',
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5em',
      }}
    >
      {direction && (
        <header
          data-slot="design-system-panel-direction"
          style={{
            display: 'inline-flex',
            alignSelf: 'flex-start',
            padding: '0.3em 0.85em',
            borderRadius: 999,
            background: 'rgba(70,160,208,0.12)',
            color: 'var(--cf-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78em',
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}
        >
          {direction}
        </header>
      )}
      {colors && colors.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 0.85em', fontFamily: 'var(--font-brand)', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--cf-muted)' }}>Colors</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75em' }}>
            {colors.map((c) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '0.7em' }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 8,
                    background: c.value,
                    border: '1px solid var(--cf-border)',
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85em', color: 'var(--cf-fg)' }}>{c.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78em', color: 'var(--cf-muted)' }}>{c.value}</div>
                  {c.usage_note && (
                    <div
                      data-slot="design-system-panel-usage"
                      style={{ fontSize: '0.72em', color: 'var(--cf-muted)', marginTop: '0.2em', fontStyle: 'italic' }}
                    >
                      {c.usage_note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {typography && typography.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 0.85em', fontFamily: 'var(--font-brand)', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--cf-muted)' }}>Typography</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85em' }}>
            {typography.map((t) => (
              <div key={t.name} style={{ padding: '0.75em 0', borderBottom: '1px solid var(--cf-border)' }}>
                <div style={{ fontSize: '0.78em', color: 'var(--cf-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {t.name} · {t.family} {t.weight && `· ${t.weight}`}
                </div>
                <div style={{ fontFamily: t.family, fontSize: '1.5em', fontWeight: Number(t.weight) || 500, color: 'var(--cf-fg)', marginTop: '0.2em' }}>
                  {t.sample ?? 'The quick brown fox jumps'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {spacing && spacing.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 0.85em', fontFamily: 'var(--font-brand)', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--cf-muted)' }}>Spacing</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
            {spacing.map((s) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '0.85em' }}>
                <div style={{ width: 80, fontSize: '0.85em', color: 'var(--cf-muted)', fontFamily: 'var(--font-mono)' }}>{s.name}</div>
                <div style={{ height: 10, width: s.value, background: 'var(--cf-primary)', borderRadius: 2 }} />
                <div style={{ fontSize: '0.78em', color: 'var(--cf-muted)', fontFamily: 'var(--font-mono)' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {radius && radius.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 0.85em', fontFamily: 'var(--font-brand)', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--cf-muted)' }}>Radius</h4>
          <div style={{ display: 'flex', gap: '1em', flexWrap: 'wrap' }}>
            {radius.map((r) => (
              <div key={r.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3em' }}>
                <div style={{ width: 52, height: 52, background: 'var(--cf-primary)', borderRadius: r.value }} />
                <div style={{ fontSize: '0.75em', color: 'var(--cf-muted)', fontFamily: 'var(--font-mono)' }}>{r.name} · {r.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
