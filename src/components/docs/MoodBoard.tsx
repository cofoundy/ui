import * as React from 'react';
export interface MoodBoardItem {
  src: string;
  alt: string;
  caption?: string;
  /** Provenance URL — where the asset came from (Atelier §6.2). */
  source_url?: string;
  /** Optional concept grouping label (e.g. "A", "B", "Final"). */
  concept_tag?: string;
}

export interface MoodBoardProps {
  items: MoodBoardItem[];
  columns?: number;
}

export function MoodBoard({ items, columns = 3 }: MoodBoardProps) {
  return (
    <div
      data-slot="mood-board"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: '0.85em',
        margin: '1.5em 0',
      }}
    >
      {items.map((item, i) => (
        <figure
          key={i}
          style={{
            margin: 0,
            background: 'var(--cf-card)',
            border: '1px solid var(--cf-border)',
            borderRadius: '10px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <img
            src={item.src}
            alt={item.alt}
            loading="lazy"
            style={{ width: '100%', height: 'auto', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }}
          />
          {(item.caption || item.concept_tag || item.source_url) && (
            <figcaption
              style={{
                padding: '0.6em 0.8em',
                fontSize: '0.85em',
                color: 'var(--cf-muted)',
                borderTop: '1px solid var(--cf-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3em',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5em' }}>
                {item.caption && <span>{item.caption}</span>}
                {item.concept_tag && (
                  <span
                    data-slot="mood-board-concept-tag"
                    style={{
                      padding: '0.15em 0.55em',
                      borderRadius: 999,
                      background: 'rgba(70,160,208,0.12)',
                      color: 'var(--cf-primary)',
                      fontSize: '0.72em',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {item.concept_tag}
                  </span>
                )}
              </div>
              {item.source_url && (
                <a
                  data-slot="mood-board-source"
                  href={item.source_url}
                  rel="noreferrer noopener"
                  target="_blank"
                  style={{ fontSize: '0.75em', fontFamily: 'var(--font-mono)', color: 'var(--cf-muted)' }}
                >
                  source
                </a>
              )}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
