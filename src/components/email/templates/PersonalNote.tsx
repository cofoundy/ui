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
} from '@react-email/components';
import { colors, fontFamily, cofoundyInfo } from '../constants';
import { TestBanner } from '../components/TestBanner';

export interface PersonalNoteProps {
  senderName?: string;
  senderRole?: string;
  senderEmail?: string;
  body?: React.ReactNode;
  greeting?: string;
  signOff?: string;
  calLink?: string;
  calLabel?: string;
  previewText?: string;
  testMode?: boolean;
  children?: React.ReactNode;
}

export function PersonalNote({
  senderName = 'Andre Pacheco Taboada',
  senderRole = 'CEO',
  senderEmail = cofoundyInfo.email,
  body,
  greeting,
  signOff = 'Un abrazo,',
  calLink,
  calLabel = 'Agendar llamada',
  previewText,
  testMode = false,
  children,
}: PersonalNoteProps) {
  const content = body ?? children;

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
      <Body style={bodyStyle}>
        <Container style={wrapperStyle}>
          {testMode && <TestBanner />}
          <Container style={containerStyle}>
            {/* Accent bar */}
            <Section style={accentBarStyle} />

            {/* Body content */}
            <Section style={contentStyle}>
              {greeting && <Text style={greetingStyle}>{greeting}</Text>}
              {content}
            </Section>

            {/* Optional CTA */}
            {calLink && (
              <Section style={calBoxStyle}>
                <Link href={calLink} style={calLinkStyle}>
                  {calLabel} &rarr;
                </Link>
              </Section>
            )}

            {/* Sign-off */}
            <Section style={signOffSectionStyle}>
              <Text style={signOffStyle}>{signOff}</Text>
            </Section>

            {/* Integrated signature */}
            <Section style={sigSectionStyle}>
              <table cellPadding={0} cellSpacing={0} style={{ borderCollapse: 'collapse' as const }}>
                <tbody>
                  <tr>
                    <td style={sigLogoTdStyle}>
                      <Img
                        src="https://i.imgur.com/s8ah1HT.png"
                        alt="Cofoundy"
                        width={40}
                        height={40}
                        style={{ display: 'block' }}
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

const greetingStyle: React.CSSProperties = {
  margin: '0 0 20px',
  color: colors.textDark,
  fontSize: '15px',
  fontWeight: 500,
  lineHeight: '1.7',
  fontFamily,
};

const calBoxStyle: React.CSSProperties = {
  padding: '4px 44px 0',
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

const signOffSectionStyle: React.CSSProperties = {
  padding: '20px 44px 0',
};

const signOffStyle: React.CSSProperties = {
  margin: 0,
  color: colors.textBody,
  fontSize: '15px',
  lineHeight: '1.7',
  fontFamily,
};

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
