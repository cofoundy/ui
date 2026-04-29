import { Section, Text, Link } from '@react-email/components';
import { colors, fontFamily } from '../constants';

export interface InfoBoxProps {
  label: string;
  value: string;
  href?: string;
}

export function InfoBox({ label, value, href }: InfoBoxProps) {
  return (
    <Section style={boxStyle}>
      <Text style={labelStyle}>{label}</Text>
      {href ? (
        <Link href={href} style={valueLinkStyle}>{value}</Link>
      ) : (
        <Text style={valueStyle}>{value}</Text>
      )}
    </Section>
  );
}

const boxStyle: React.CSSProperties = {
  backgroundColor: colors.bgLight,
  borderLeft: `3px solid ${colors.primary}`,
  borderRadius: '6px',
  padding: '14px 18px',
  margin: '14px 0',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: colors.textMuted,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  fontWeight: 600,
  fontFamily,
  margin: '0 0 4px',
  lineHeight: '1.4',
};

const valueStyle: React.CSSProperties = {
  fontSize: '16px',
  color: colors.navy,
  fontWeight: 600,
  fontFamily,
  margin: 0,
  lineHeight: '1.4',
};

const valueLinkStyle: React.CSSProperties = {
  fontSize: '16px',
  color: colors.navyLight,
  fontWeight: 600,
  textDecoration: 'none',
  fontFamily,
};
