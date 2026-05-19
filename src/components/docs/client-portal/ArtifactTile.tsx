import * as React from 'react';
import type { ArtifactRef } from '../ClientPortalPanel.schema';

/* Reusable artifact tile for PDFs / external documents.
   Sharp 1px border, hover shifts to accent. Mono caption row. */

interface ArtifactTileProps {
  artifact: ArtifactRef;
  /** "landscape" (16:10) or "portrait" (3:4) thumbnail aspect. */
  aspect?: 'landscape' | 'portrait';
}

export function ArtifactTile({ artifact, aspect = 'landscape' }: ArtifactTileProps) {
  return (
    <a
      data-slot="portal-artifact-tile"
      href={artifact.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
    >
      <div
        className="cf-portal-artifact-thumb"
        style={{
          position: 'relative',
          aspectRatio: aspect === 'portrait' ? '3 / 4' : '16 / 10',
          width: '100%',
          border: '1px solid var(--cf-border)',
          background: 'var(--cf-card)',
          overflow: 'hidden',
          transition: 'border-color var(--cf-duration-fast, 150ms) var(--cf-ease-default, ease)',
        }}
      >
        {artifact.thumbnail ? (
          <img
            src={artifact.thumbnail}
            alt={artifact.title}
            loading="lazy"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--cf-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            PDF
          </div>
        )}
      </div>
      <div
        style={{
          marginTop: '0.75em',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1em',
          alignItems: 'baseline',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--cf-fg)',
          }}
        >
          {artifact.title}
        </span>
        {artifact.caption && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--cf-muted)',
            }}
          >
            {artifact.caption}
          </span>
        )}
      </div>
      <style>{`
        [data-slot="portal-artifact-tile"]:hover .cf-portal-artifact-thumb {
          border-color: var(--portal-accent, var(--cf-primary));
        }
      `}</style>
    </a>
  );
}
