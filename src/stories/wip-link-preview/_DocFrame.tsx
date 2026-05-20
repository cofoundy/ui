import type { ReactNode } from 'react';

/**
 * A faithful-enough mock of `<article class="reader-prose prose">` from
 * docs.cofoundy.dev — wikilink-dense paragraph so we can hover-test the
 * preview without standing up a full docs build.
 */
export function DocFrame({ children }: { children?: ReactNode }) {
  return (
    <div
      style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: '48px 32px',
        fontFamily: 'var(--font-sans, Inter, system-ui)',
        color: 'var(--cf-fg, #E2E8F0)',
        background: 'var(--cf-bg, #020b1b)',
        minHeight: '100vh',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-display, Space Grotesk)',
          fontWeight: 600,
          fontSize: 32,
          letterSpacing: '-0.02em',
          marginBottom: 8,
        }}
      >
        Notas — semana del 13 de mayo
      </h1>
      <p style={{ color: 'var(--cf-muted, #94A3B8)', fontSize: 13, marginBottom: 32 }}>
        Vault interno, denso en wikilinks. Pasa el cursor sobre los enlaces para ver el preview.
      </p>

      <article style={{ fontSize: 16, lineHeight: 1.7 }}>
        <p>
          La{' '}
          <Link href="/xgodel/propuesta">propuesta XGodel</Link> quedó firmada el lunes — el portal cliente,
          la landing animada con shader-gradient, y el sistema de design tokens. El{' '}
          <Link href="/xgodel/deliverables/concept-c">Concept C</Link> fue el que el cliente eligió de
          las tres rondas de exploración. Más allá del entregable visible, lo que se cerró fue el frame
          de trabajo: Cofoundy entrega como partner técnico, no como agencia.
        </p>
        <p>
          El <Link href="/handbook/voice">documento de voz y persona</Link> lo actualizamos esta semana
          con la cláusula sobre <i>performed-warmth</i> — Sage + Caregiver, no Lover. Es la misma regla
          que enforce el draft del <Link href="/xgodel/propuesta">brief de propuesta</Link> y que
          encadena con el <Link href="/cofoundy/brand-book">Brand Book MVP</Link>: warmth se gana con
          atención, no se declara con puntuación.
        </p>
        <p>
          Pendiente: que el <Link href="/cofoundy/brand-book">brand book</Link> incorpore el ejemplo
          de retro de Concept C — la versión donde casi caemos en la deriva Lover, y cómo el critique
          subagent lo cazó. Otra cosa que quedó clara en la review: el preview link debe ser quiet, no
          glow.
        </p>
        <p>
          Próximos pasos: revisar la integración con docs-ai (route handlers + cache map), pasar el
          QA de hover-grace en mobile, y subir el <Link href="/xgodel/deliverables/concept-c">deliverable
          firmado</Link> al portal del cliente.
        </p>
      </article>
    </div>
  );
}

function Link({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      data-link-preview=""
      onClick={(e) => e.preventDefault()}
      style={{
        color: 'var(--cf-primary, #46A0D0)',
        textDecoration: 'none',
        borderBottom: '1px solid color-mix(in oklab, var(--cf-primary, #46A0D0) 35%, transparent)',
        paddingBottom: 1,
        transition: 'border-color 120ms var(--cf-ease-default)',
      }}
    >
      {children}
    </a>
  );
}
