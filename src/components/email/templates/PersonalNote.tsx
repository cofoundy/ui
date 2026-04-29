import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Link,
  Text,
  Img,
  Font,
  Preview,
  Button,
} from '@react-email/components';
import { Markdown } from '@react-email/markdown';
import { colors, fontFamily, cofoundyInfo } from '../constants';
import { TestBanner } from '../components/TestBanner';

export interface PersonalNoteCta {
  label: string;
  url: string;
}

export interface PersonalNoteInfoItem {
  label: string;
  value: string;
}

export interface PersonalNoteProps {
  senderName?: string;
  senderRole?: string;
  senderEmail?: string;
  /** Direct JSX body — for Storybook / TS-direct usage */
  body?: React.ReactNode;
  /** Markdown body — rendered via @react-email/markdown with Cofoundy design tokens */
  bodyMarkdown?: string;
  greeting?: string;
  signOff?: string;
  calLink?: string;
  calLabel?: string;
  previewText?: string;
  testMode?: boolean;
  children?: React.ReactNode;
  /** Primary call-to-action button */
  cta?: PersonalNoteCta;
  /** Key-value info pairs rendered as a light table */
  infoItems?: PersonalNoteInfoItem[];
  /** Next-step callout text */
  nextStep?: string;
}

const markdownStyles = {
  h1: {
    color: colors.navy,
    fontSize: '22px',
    fontWeight: 700,
    lineHeight: '1.3',
    fontFamily,
    margin: '24px 0 10px',
    letterSpacing: '-0.02em',
  } as React.CSSProperties,
  h2: {
    color: colors.navy,
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '1.35',
    fontFamily,
    margin: '22px 0 8px',
    letterSpacing: '-0.01em',
  } as React.CSSProperties,
  h3: {
    color: colors.navy,
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '1.4',
    fontFamily,
    margin: '18px 0 6px',
  } as React.CSSProperties,
  p: {
    color: colors.textBody,
    fontSize: '15px',
    lineHeight: '1.7',
    fontFamily,
    margin: '0 0 16px',
  } as React.CSSProperties,
  bold: {
    color: colors.textDark,
    fontWeight: 600,
  } as React.CSSProperties,
  italic: {
    fontStyle: 'italic' as const,
  } as React.CSSProperties,
  link: {
    color: colors.primary,
    textDecoration: 'none',
    fontWeight: 500,
  } as React.CSSProperties,
  li: {
    color: colors.textBody,
    fontSize: '15px',
    lineHeight: '1.7',
    fontFamily,
    marginBottom: '4px',
  } as React.CSSProperties,
  ul: {
    margin: '0 0 16px',
    paddingLeft: '24px',
  } as React.CSSProperties,
  ol: {
    margin: '0 0 16px',
    paddingLeft: '24px',
  } as React.CSSProperties,
  blockQuote: {
    borderLeft: `3px solid ${colors.primary}`,
    padding: '12px 16px',
    backgroundColor: '#F4F8FB',
    borderRadius: '0 6px 6px 0',
    margin: '16px 0',
    color: colors.textBody,
    fontSize: '14px',
    lineHeight: '1.6',
    fontStyle: 'normal' as const,
    fontFamily,
  } as React.CSSProperties,
  hr: {
    borderTop: `1px solid ${colors.divider}`,
    margin: '24px 0',
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    margin: '16px 0',
  } as React.CSSProperties,
  thead: {} as React.CSSProperties,
  tbody: {} as React.CSSProperties,
  tr: {} as React.CSSProperties,
  th: {
    textAlign: 'left' as const,
    padding: '8px 12px',
    borderBottom: `2px solid ${colors.navy}`,
    fontSize: '13px',
    fontWeight: 600,
    color: colors.navy,
    fontFamily,
  } as React.CSSProperties,
  td: {
    textAlign: 'left' as const,
    padding: '8px 12px',
    borderBottom: `1px solid ${colors.divider}`,
    fontSize: '14px',
    color: colors.textBody,
    fontFamily,
  } as React.CSSProperties,
  image: {
    maxWidth: '100%',
    borderRadius: '6px',
  } as React.CSSProperties,
  codeInline: {
    backgroundColor: '#F0F4F8',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    color: colors.navy,
  } as React.CSSProperties,
  strikethrough: {
    textDecoration: 'line-through',
    color: colors.textMuted,
  } as React.CSSProperties,
};

export function PersonalNote({
  senderName = 'Andre Pacheco Taboada',
  senderRole = 'CEO',
  senderEmail = cofoundyInfo.email,
  body,
  bodyMarkdown,
  greeting,
  signOff = 'Un abrazo,',
  calLink,
  calLabel = 'Agendar llamada',
  previewText,
  testMode = false,
  children,
  cta,
  infoItems,
  nextStep,
}: PersonalNoteProps) {
  const reactContent = body ?? children;
  const useMarkdown = !!bodyMarkdown;

  return (
    <Html lang="es">
      <Head>
        <title>{`Mensaje de ${senderName} — Cofoundy`}</title>
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
      <Body style={mainBodyStyle}>
        <Container style={wrapperStyle}>
          {testMode && <TestBanner />}
          <Container style={containerStyle}>
            <Section style={accentBarStyle} />

            <Section style={contentStyle}>
              {greeting && <Text style={greetingStyle}>{greeting}</Text>}

              {useMarkdown ? (
                <Markdown
                  markdownCustomStyles={markdownStyles}
                  markdownContainerStyles={markdownContainerStyle}
                >
                  {bodyMarkdown!}
                </Markdown>
              ) : (
                reactContent
              )}
            </Section>

            {infoItems && infoItems.length > 0 && (
              <Section style={infoSectionStyle}>
                <table cellPadding={0} cellSpacing={0} style={infoTableStyle}>
                  <tbody>
                    {infoItems.map((item, i) => (
                      <tr key={i}>
                        <td style={infoLabelTdStyle}>{item.label}</td>
                        <td style={infoValueTdStyle}>{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>
            )}

            {nextStep && (
              <Section style={nextStepSectionStyle}>
                <div style={nextStepBorderStyle}>
                  <Text style={nextStepLabelStyle}>Siguiente paso</Text>
                  <Text style={nextStepTextStyle}>{nextStep}</Text>
                </div>
              </Section>
            )}

            {cta && (
              <Section style={ctaSectionStyle}>
                <Button href={cta.url} style={ctaButtonStyle}>
                  {cta.label} &rarr;
                </Button>
              </Section>
            )}

            {calLink && (
              <Section style={calBoxStyle}>
                <Link href={calLink} style={calLinkStyle}>
                  {calLabel} &rarr;
                </Link>
              </Section>
            )}

            <Section style={signOffSectionStyle}>
              <Text style={signOffTextStyle}>{signOff}</Text>
            </Section>

            <Section style={sigSectionStyle}>
              <table cellPadding={0} cellSpacing={0} style={{ borderCollapse: 'collapse' as const }}>
                <tbody>
                  <tr>
                    <td style={sigLogoTdStyle}>
                      <Img
                        src="https://cofoundy.dev/email/logo-sig.png"
                        alt="Cofoundy"
                        width={40}
                        height={40}
                        style={{ display: 'block', borderRadius: '8px' }}
                      />
                    </td>
                    <td style={sigBarTdStyle}>
                      <div style={sigBarStyle} />
                    </td>
                    <td style={sigTextTdStyle}>
                      <Text style={sigNameStyle}>{senderName}</Text>
                      <Text style={sigRoleStyle}>{senderRole} &middot; Cofoundy</Text>
                      <Text style={sigLinksStyle}>
                        <Link href={cofoundyInfo.web} style={sigLinkStyle}>cofoundy.dev</Link>
                        <span style={{ color: colors.textMuted }}> &middot; </span>
                        <Link href={`mailto:${senderEmail}`} style={sigLinkStyle}>{senderEmail}</Link>
                      </Text>
                      <Text style={sigTaglineStyle}>{cofoundyInfo.tagline}</Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>
          </Container>
        </Container>
      </Body>
    </Html>
  );
}

// --- Styles ---

const mainBodyStyle: React.CSSProperties = {
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
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 8px 30px rgba(0,0,0,0.04)',
};

const accentBarStyle: React.CSSProperties = {
  height: '3px',
  backgroundColor: colors.primary,
  background: `linear-gradient(90deg, ${colors.navy}, ${colors.primary})`,
  lineHeight: '3px',
  fontSize: 0,
};

const contentStyle: React.CSSProperties = {
  padding: '36px 44px 0',
};

const markdownContainerStyle: React.CSSProperties = {};

const greetingStyle: React.CSSProperties = {
  margin: '0 0 20px',
  color: colors.textDark,
  fontSize: '15px',
  fontWeight: 500,
  lineHeight: '1.7',
  fontFamily,
};

// --- Info items (light key-value table) ---

const infoSectionStyle: React.CSSProperties = {
  padding: '0 44px',
};

const infoTableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  backgroundColor: '#F8FAFC',
  borderRadius: '8px',
  overflow: 'hidden',
  border: `1px solid ${colors.border}`,
};

const infoLabelTdStyle: React.CSSProperties = {
  padding: '10px 16px',
  fontSize: '13px',
  fontWeight: 500,
  color: colors.textMuted,
  fontFamily,
  borderBottom: `1px solid ${colors.border}`,
  width: '40%',
};

const infoValueTdStyle: React.CSSProperties = {
  padding: '10px 16px',
  fontSize: '14px',
  fontWeight: 600,
  color: colors.navy,
  fontFamily,
  borderBottom: `1px solid ${colors.border}`,
  textAlign: 'right' as const,
};

// --- Next step callout ---

const nextStepSectionStyle: React.CSSProperties = {
  padding: '8px 44px 0',
};

const nextStepBorderStyle: React.CSSProperties = {
  borderLeft: `3px solid ${colors.primary}`,
  paddingLeft: '16px',
};

const nextStepLabelStyle: React.CSSProperties = {
  margin: '0 0 4px',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  color: colors.primary,
  fontFamily,
};

const nextStepTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '15px',
  lineHeight: '1.7',
  color: colors.textBody,
  fontFamily,
};

// --- CTA button ---

const ctaSectionStyle: React.CSSProperties = {
  padding: '16px 44px 0',
};

const ctaButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '14px 32px',
  backgroundColor: colors.primary,
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '14px',
  letterSpacing: '0.01em',
  fontFamily,
  textAlign: 'center' as const,
  boxShadow: '0 1px 3px rgba(70,160,208,0.3), 0 4px 12px rgba(70,160,208,0.15)',
};

// --- Cal link (lighter secondary action) ---

const calBoxStyle: React.CSSProperties = {
  padding: '12px 44px 0',
};

const calLinkStyle: React.CSSProperties = {
  display: 'inline-block',
  background: '#F4F8FB',
  border: '1px solid #e8eff4',
  borderRadius: '6px',
  padding: '10px 16px',
  color: colors.navy,
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 500,
  fontFamily,
};

// --- Sign-off ---

const signOffSectionStyle: React.CSSProperties = {
  padding: '20px 44px 0',
};

const signOffTextStyle: React.CSSProperties = {
  margin: 0,
  color: colors.textBody,
  fontSize: '15px',
  lineHeight: '1.7',
  fontFamily,
};

// --- Signature ---

const sigSectionStyle: React.CSSProperties = {
  padding: '0 44px 32px',
  borderTop: '1px solid #e8e8e8',
  marginTop: '24px',
};

const sigLogoTdStyle: React.CSSProperties = {
  paddingRight: '14px',
  paddingTop: '16px',
  verticalAlign: 'middle',
};

const sigBarTdStyle: React.CSSProperties = {
  paddingTop: '16px',
  verticalAlign: 'middle',
};

const sigBarStyle: React.CSSProperties = {
  width: '3px',
  height: '44px',
  backgroundColor: colors.primary,
  borderRadius: '2px',
};

const sigTextTdStyle: React.CSSProperties = {
  paddingLeft: '14px',
  paddingTop: '16px',
  verticalAlign: 'middle',
};

const sigNameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '14px',
  fontWeight: 600,
  color: colors.navy,
  letterSpacing: '-0.01em',
  lineHeight: '1.3',
  fontFamily,
};

const sigRoleStyle: React.CSSProperties = {
  margin: '1px 0 0',
  fontSize: '12px',
  color: colors.primary,
  fontWeight: 500,
  lineHeight: '1.3',
  fontFamily,
};

const sigLinksStyle: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: '12px',
  lineHeight: '1.3',
  fontFamily,
};

const sigLinkStyle: React.CSSProperties = {
  color: '#1B577E',
  textDecoration: 'none',
  fontWeight: 500,
};

const sigTaglineStyle: React.CSSProperties = {
  margin: '5px 0 0',
  fontSize: '11px',
  color: colors.textMuted,
  fontStyle: 'italic',
  lineHeight: '1.3',
  fontFamily,
};
