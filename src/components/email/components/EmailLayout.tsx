import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Link,
  Text,
  Font,
  Preview,
  Heading,
} from '@react-email/components';
import { colors, fontFamily, isologoWhiteDataUri, cofoundyInfo } from '../constants';
import { TestBanner } from './TestBanner';

export interface EmailLayoutProps {
  title?: string;
  heading?: string;
  subtitle?: string;
  previewText?: string;
  testMode?: boolean;
  children: React.ReactNode;
}

export function EmailLayout({
  title = 'Cofoundy',
  heading,
  subtitle,
  previewText,
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
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
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
            {/* Header: navy gradient with isologo + heading + subtitle */}
            <Section style={headerStyle}>
              <Img
                src={isologoWhiteDataUri}
                alt="Cofoundy"
                width={40}
                style={{ display: 'block', height: 'auto', opacity: 0.85 }}
              />
              {heading && (
                <Heading
                  as="h1"
                  style={headerHeadingStyle}
                >
                  {heading}
                </Heading>
              )}
              {subtitle && (
                <Text style={headerSubtitleStyle}>{subtitle}</Text>
              )}
            </Section>

            {/* Teal accent bar */}
            <Section style={accentBarStyle} />

            {/* Body content */}
            <Section style={contentStyle}>
              {children}
            </Section>

            {/* Footer: 2-column light bg */}
            <Section style={footerStyle}>
              <Row>
                <Column style={{ verticalAlign: 'top' }}>
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
                </Column>
                <Column style={{ textAlign: 'right' as const, verticalAlign: 'top' }}>
                  <Text style={footerTaglineStyle}>
                    &ldquo;Productos de software<br />en semanas, no meses.&rdquo;
                  </Text>
                </Column>
              </Row>
              <Text style={footerCopyrightStyle}>
                &copy; {year} {cofoundyInfo.name} &middot; Lima, Per&uacute;
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
  color: colors.textBody,
  backgroundColor: colors.bgOuter,
  WebkitTextSizeAdjust: '100%',
};

const wrapperStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: colors.bgOuter,
  padding: '48px 24px',
};

const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: colors.bgWhite,
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)',
};

const headerStyle: React.CSSProperties = {
  backgroundColor: colors.navyMid,
  background: `linear-gradient(145deg, ${colors.navyDark} 0%, ${colors.navyMid} 40%, ${colors.navy} 100%)`,
  padding: '52px 48px 48px 48px',
};

const headerHeadingStyle: React.CSSProperties = {
  margin: '32px 0 10px 0',
  fontSize: '36px',
  fontWeight: 700,
  color: '#FFFFFF',
  lineHeight: '1.15',
  letterSpacing: '-0.03em',
  fontFamily,
};

const headerSubtitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '13px',
  color: 'rgba(255,255,255,0.45)',
  fontWeight: 400,
  letterSpacing: '0.01em',
  fontFamily,
};

const accentBarStyle: React.CSSProperties = {
  height: '3px',
  backgroundColor: colors.primary,
  background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight})`,
  lineHeight: '3px',
  fontSize: 0,
};

const contentStyle: React.CSSProperties = {
  padding: '40px 48px 12px',
};

const footerStyle: React.CSSProperties = {
  padding: '28px 48px',
  backgroundColor: colors.bgCard,
  borderTop: `1px solid ${colors.footerBorder}`,
};

const footerLegalStyle: React.CSSProperties = {
  margin: '0 0 2px',
  color: colors.textMuted,
  fontSize: '12px',
  lineHeight: '1.5',
  fontFamily,
};

const footerLinksStyle: React.CSSProperties = {
  margin: 0,
  color: colors.textMutedLight,
  fontSize: '12px',
  lineHeight: '1.5',
  fontFamily,
};

const footerLinkStyle: React.CSSProperties = {
  color: colors.textMutedLight,
  textDecoration: 'none',
};

const footerTaglineStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '11px',
  color: colors.textMutedLight,
  lineHeight: '1.5',
  fontStyle: 'italic',
  fontFamily,
};

const footerCopyrightStyle: React.CSSProperties = {
  margin: '12px 0 0',
  fontSize: '10px',
  color: colors.copyright,
  fontFamily,
};
