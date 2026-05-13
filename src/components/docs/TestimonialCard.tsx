export interface TestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  source?: string;
  sourceUrl?: string;
}

export function TestimonialCard({ quote, author, role, avatar, source, sourceUrl }: TestimonialCardProps) {
  return (
    <figure
      data-slot="testimonial-card"
      style={{
        margin: '1.5em 0',
        padding: '1.5em 1.75em',
        background: 'var(--cf-card)',
        border: '1px solid var(--cf-border)',
        borderRadius: '12px',
        position: 'relative',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 12,
          left: 18,
          fontFamily: 'var(--font-brand)',
          fontSize: '3em',
          lineHeight: 1,
          color: 'var(--cf-primary)',
          opacity: 0.25,
        }}
      >
        “
      </span>
      <blockquote
        style={{
          margin: 0,
          padding: '0 0 0 1.5em',
          fontSize: '1.05em',
          lineHeight: 1.6,
          color: 'var(--cf-fg)',
          fontStyle: 'italic',
          border: 'none',
        }}
      >
        {quote}
      </blockquote>
      <figcaption
        style={{
          marginTop: '1em',
          paddingLeft: '1.5em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85em',
        }}
      >
        {avatar && (
          <img
            src={avatar}
            alt={author}
            style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--cf-border)' }}
          />
        )}
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.95em', color: 'var(--cf-fg)' }}>{author}</div>
          {(role || source) && (
            <div style={{ fontSize: '0.82em', color: 'var(--cf-muted)' }}>
              {role}
              {role && source ? ' · ' : ''}
              {source && (sourceUrl ? <a href={sourceUrl}>{source}</a> : source)}
            </div>
          )}
        </div>
      </figcaption>
    </figure>
  );
}
