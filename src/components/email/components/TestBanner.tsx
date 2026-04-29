import { Section, Text } from '@react-email/components';
import { colors, fontFamily } from '../constants';

export interface TestBannerProps {
  message?: string;
}

export function TestBanner({
  message = 'MODO TEST — Este email no fue enviado al cliente',
}: TestBannerProps) {
  return (
    <Section style={bannerStyle}>
      <Text style={bannerTextStyle}>{message}</Text>
    </Section>
  );
}

const bannerStyle: React.CSSProperties = {
  backgroundColor: colors.warning,
  padding: '10px 16px',
  textAlign: 'center' as const,
  borderRadius: '10px 10px 0 0',
  maxWidth: '600px',
  margin: '0 auto',
};

const bannerTextStyle: React.CSSProperties = {
  margin: 0,
  color: colors.warningText,
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.02em',
  fontFamily,
};
