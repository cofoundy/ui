import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Link,
  Text,
  Font,
  Preview,
} from '@react-email/components';
import { colors, fontFamily, logoUrl, cofoundyInfo } from '../constants';
import { TestBanner } from './TestBanner';

export interface EmailLayoutProps {
  title?: string;
  previewText?: string;
  signatureHtml?: string;
  testMode?: boolean;
  children: React.ReactNode;
}

export function EmailLayout({
  title = 'Cofoundy',
  previewText,
  signatureHtml,
  testMode = false,
  children,
}: EmailLayoutProps) {
  const year = new Date().getFullYear();

  return (
    <Html lang="es">
      <Head>
        <title>{title}</title>
        <Font
          fontFamily="Inter"
          fallbackFontFamily={['Helvetica', 'Arial', 'sans-serif']}
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      {previewText && <Preview>{previewText}</Preview>}
      <Body style={bodyStyle}>
        <Container style={wrapperStyle}>
          {testMode && <TestBanner />}
          <Container style={containerStyle}>
            <Section style={headerStyle}>
              <Img
                src={logoUrl}
                alt="Cofoundy"
                height={36}
                style={{ height: '36px', width: 'auto', display: 'block' }}
              />
            </Section>
            <Section style={accentBarStyle} />
            <Section style={contentStyle}>
              {children}
            </Section>
            {signatureHtml && (
              <Section style={signatureWrapStyle}>
                <div style={signatureInnerStyle}>
                  <div dangerouslySetInnerHTML={{ __html: signatureHtml }} />
                </div>
              </Section>
            )}
            <Section style={footerStyle}>
              <Text style={footerLegalStyle}>
                {cofoundyInfo.name} &middot; RUC {cofoundyInfo.ruc}
              </Text>
              <Text style={footerLinksStyle}>
                <Link href={`mailto:${cofoundyInfo.email}`} style={footerLinkStyle}>
                  {cofoundyInfo.email}
                </Link>
                {' · '}
                <Link href={cofoundyInfo.web} style={footerLinkStyle}>
                  cofoundy.dev
                </Link>
              </Text>
              <Text style={footerTaglineStyle}>{cofoundyInfo.tagline}</Text>
              <Text style={footerMetaStyle}>
                Mensaje transaccional. Si no esperabas este correo, escríbenos a{' '}
                <Link href={`mailto:${cofoundyInfo.email}`} style={footerLinkStyle}>
                  {cofoundyInfo.email}
                </Link>
                .
              </Text>
              <Text style={footerMetaStyle}>
                © {year} {cofoundyInfo.name} · Lima, Perú
              </Text>
            </Section>
          </Container>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle: React.CSSProperties = {
  margin: 0,
  padding: 0,
  fontFamily,
  color: colors.navy,
  backgroundColor: colors.bgLight,
  WebkitTextSizeAdjust: '100%',
};

const wrapperStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: colors.bgLight,
  padding: '32px 0',
};

const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: colors.bgWhite,
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(35, 67, 95, 0.06)',
};

const headerStyle: React.CSSProperties = {
  backgroundColor: colors.navy,
  padding: '28px 40px',
  textAlign: 'left' as const,
};

const accentBarStyle: React.CSSProperties = {
  height: '3px',
  backgroundColor: colors.primary,
  lineHeight: '3px',
  fontSize: 0,
};

const contentStyle: React.CSSProperties = {
  padding: '36px 40px 12px',
};

const signatureWrapStyle: React.CSSProperties = {
  padding: '0 40px 28px',
};

const signatureInnerStyle: React.CSSProperties = {
  paddingTop: '16px',
  borderTop: `1px solid ${colors.border}`,
};

const footerStyle: React.CSSProperties = {
  padding: '24px 40px 32px',
  backgroundColor: colors.bgLight,
  borderTop: `1px solid ${colors.border}`,
};

const footerLegalStyle: React.CSSProperties = {
  margin: '0 0 6px',
  color: colors.navy,
  fontSize: '13px',
  fontWeight: 600,
  lineHeight: '1.5',
  fontFamily,
};

const footerLinksStyle: React.CSSProperties = {
  margin: '0 0 6px',
  color: colors.textMuted,
  fontSize: '12px',
  lineHeight: '1.5',
  fontFamily,
};

const footerLinkStyle: React.CSSProperties = {
  color: colors.navyLight,
  textDecoration: 'none',
  fontWeight: 500,
};

const footerTaglineStyle: React.CSSProperties = {
  margin: '0 0 4px',
  color: colors.primary,
  fontSize: '11px',
  fontStyle: 'italic',
  letterSpacing: '0.01em',
  lineHeight: '1.5',
  fontFamily,
};

const footerMetaStyle: React.CSSProperties = {
  margin: '10px 0 0',
  color: colors.textMuted,
  fontSize: '11px',
  lineHeight: '1.5',
  fontFamily,
};
