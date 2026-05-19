import * as React from 'react';
import type { DocumentItem, DocumentType, PortalDocumentsProps } from '../ClientPortalPanel.schema';
import { SectionHeading } from './SectionHeading';

/* ============================================================
   ClientPortalPanel.Documents — TILE-GRID archetype
   ============================================================
   Unified document vault grouped by type (quote / contract /
   nda / invoice / other). Each group has a small-caps eyebrow
   then a tile grid (auto-fit, min 200px). Each tile shows the
   PDF thumb (or type chip if no thumb), title, status, amount
   when applicable. Tiles are sharp 1px-bordered. Hover →
   border shifts to accent.
   ============================================================ */

const wrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '2em' };

const groupWrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1em' };

const groupHead: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: '0.5em',
  paddingBottom: '0.85em',
  borderBottom: '1px solid var(--cf-border)',
};

const groupLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
  margin: 0,
};

const groupCount: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.12em',
  color: 'var(--cf-muted)',
};

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 280px))',
  gap: 'clamp(16px, 2vw, 24px)',
};

const tile: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75em',
  textDecoration: 'none',
  color: 'inherit',
  minWidth: 0,
};

const thumb: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  aspectRatio: '3 / 4',
  maxHeight: 360,
  background: 'var(--cf-card)',
  border: '1px solid var(--cf-border)',
  overflow: 'hidden',
  transition: 'border-color var(--cf-duration-fast, 150ms) var(--cf-ease-default, ease)',
};

const thumbImg: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const typeBadge: React.CSSProperties = {
  position: 'absolute',
  top: 8,
  left: 8,
  padding: '0.25em 0.55em',
  background: 'var(--cf-bg)',
  border: '1px solid var(--cf-border)',
  fontFamily: 'var(--font-mono)',
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
};

const titleRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: '0.75em',
};

const title: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--cf-fg)',
  lineHeight: 1.3,
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const amount: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
  color: 'var(--cf-fg)',
  letterSpacing: '0.02em',
  whiteSpace: 'nowrap',
};

const metaRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: '0.5em',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
};

const typeLabel: Record<DocumentType, string> = {
  quote: 'Cotizaciones',
  contract: 'Contratos',
  nda: 'NDAs',
  invoice: 'Facturas',
  other: 'Otros',
};

const defaultOrder: DocumentType[] = ['quote', 'contract', 'nda', 'invoice', 'other'];

function Tile({ item }: { item: DocumentItem }) {
  return (
    <a
      data-slot="portal-document-tile"
      data-doc-type={item.type}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      style={tile}
    >
      <div style={thumb} className="cf-portal-doc-thumb">
        <span style={typeBadge}>{item.type}</span>
        {item.thumbnail && <img src={item.thumbnail} alt={item.title} style={thumbImg} loading="lazy" />}
      </div>
      <div style={titleRow}>
        <h4 style={title}>{item.title}</h4>
        {item.amount && <span style={amount}>{item.amount}</span>}
      </div>
      <div style={metaRow}>
        <span>{item.status ?? ''}</span>
        <span>{item.date ?? ''}</span>
      </div>
      <style>{`
        [data-slot="portal-document-tile"]:hover .cf-portal-doc-thumb {
          border-color: var(--portal-accent, var(--cf-primary));
        }
      `}</style>
    </a>
  );
}

export function Documents({ heading = 'Documentos', items, groupOrder }: PortalDocumentsProps) {
  if (!items || items.length === 0) return null;

  const order = groupOrder ?? defaultOrder;
  const grouped: Record<DocumentType, DocumentItem[]> = {
    quote: [],
    contract: [],
    nda: [],
    invoice: [],
    other: [],
  };
  for (const it of items) {
    (grouped[it.type] ?? grouped.other).push(it);
  }

  const groupsWithData = order.filter((t) => grouped[t] && grouped[t].length > 0);

  return (
    <section data-slot="portal-documents" style={wrap}>
      <SectionHeading>{heading}</SectionHeading>
      {groupsWithData.map((t) => (
        <div key={t} style={groupWrap}>
          <div style={groupHead}>
            <h3 style={groupLabel}>{typeLabel[t]}</h3>
            <span style={groupCount}>{grouped[t].length}</span>
          </div>
          <div style={grid}>
            {grouped[t].map((d, i) => (
              <Tile key={`${t}-${i}`} item={d} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
