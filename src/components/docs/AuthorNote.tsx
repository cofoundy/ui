import type { ReactNode } from 'react';

export interface AuthorNoteProps {
  author: string;
  role?: string;
  avatar?: string;
  signature?: string;
  children?: ReactNode;
}

export function AuthorNote({ author, role, avatar, signature, children }: AuthorNoteProps) {
  return (
    <aside
      data-slot="author-note"
      style={{
        margin: '2em 0',
        padding: '1.5em 1.75em',
        background: 'var(--cf-card)',
        border: '1px solid var(--cf-border)',
        borderLeft: '4px solid var(--cf-primary)',
        borderRadius: '12px',
        position: 'relative',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: '0.85em', marginBottom: '0.85em' }}>
        {avatar && (
          <img
            src={avatar}
            alt={author}
            style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--cf-border)' }}
          />
        )}
        <div>
          <div style={{ fontFamily: 'var(--font-brand)', fontWeight: 600, fontSize: '0.98em', color: 'var(--cf-fg)' }}>{author}</div>
          {role && <div style={{ fontSize: '0.82em', color: 'var(--cf-muted)' }}>{role}</div>}
        </div>
      </header>
      <div style={{ fontSize: '0.98em', lineHeight: 1.65, color: 'var(--cf-fg)' }}>{children}</div>
      {signature && (
        <div
          style={{
            marginTop: '1em',
            fontFamily: 'var(--font-brand)',
            fontStyle: 'italic',
            color: 'var(--cf-muted)',
            fontSize: '0.92em',
          }}
        >
          — {signature}
        </div>
      )}
    </aside>
  );
}
