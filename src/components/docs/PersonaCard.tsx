export interface PersonaCardProps {
  name: string;
  role: string;
  avatar?: string;
  demographics?: string[];
  painPoints?: string[];
  goals?: string[];
  quote?: string;
}

function Section({ title, items, accent }: { title: string; items?: string[]; accent: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--font-brand)',
          fontSize: '0.74em',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: accent,
          marginBottom: '0.4em',
        }}
      >
        {title}
      </div>
      <ul style={{ margin: 0, padding: '0 0 0 1.1em', fontSize: '0.9em', lineHeight: 1.55, color: 'var(--cf-fg)' }}>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

export function PersonaCard({ name, role, avatar, demographics, painPoints, goals, quote }: PersonaCardProps) {
  return (
    <article
      data-slot="persona-card"
      style={{
        margin: '1.5em 0',
        padding: '1.5em 1.75em',
        background: 'var(--cf-card)',
        border: '1px solid var(--cf-border)',
        borderRadius: '14px',
        display: 'grid',
        gridTemplateColumns: avatar ? '120px 1fr' : '1fr',
        gap: '1.5em',
      }}
    >
      {avatar && (
        <div>
          <img
            src={avatar}
            alt={name}
            style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--cf-primary)' }}
          />
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
        <header>
          <h3
            style={{
              margin: 0,
              fontFamily: 'var(--font-brand)',
              fontSize: '1.3em',
              fontWeight: 700,
              color: 'var(--cf-fg)',
            }}
          >
            {name}
          </h3>
          <div style={{ fontSize: '0.92em', color: 'var(--cf-primary)', fontWeight: 500 }}>{role}</div>
        </header>
        {quote && (
          <blockquote
            style={{
              margin: 0,
              padding: '0.4em 0 0.4em 0.9em',
              borderLeft: '3px solid var(--cf-primary)',
              fontStyle: 'italic',
              fontSize: '0.95em',
              color: 'var(--cf-fg)',
              opacity: 0.9,
              background: 'transparent',
            }}
          >
            “{quote}”
          </blockquote>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1em' }}>
          <Section title="Demographics" items={demographics} accent="var(--cf-muted)" />
          <Section title="Pain Points" items={painPoints} accent="var(--cf-error)" />
          <Section title="Goals" items={goals} accent="var(--cf-success)" />
        </div>
      </div>
    </article>
  );
}
