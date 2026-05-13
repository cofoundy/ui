export interface MoodBoardItem {
  src: string;
  alt: string;
  caption?: string;
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
          {item.caption && (
            <figcaption
              style={{
                padding: '0.6em 0.8em',
                fontSize: '0.85em',
                color: 'var(--cf-muted)',
                borderTop: '1px solid var(--cf-border)',
              }}
            >
              {item.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
