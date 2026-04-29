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
  backgroundColor: colors.navyMid,
  background: `linear-gradient(145deg, ${colors.navyMid}, ${colors.navyLight})`,
  borderRadius: '10px',
  padding: '24px 24px 22px 24px',
  margin: '14px 0',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'rgba(255,255,255,0.5)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  fontWeight: 500,
  fontFamily,
  margin: '0 0 8px',
  lineHeight: '1.4',
};

const valueStyle: React.CSSProperties = {
  fontSize: '26px',
  color: '#FFFFFF',
  fontWeight: 700,
  fontFamily,
  margin: 0,
  lineHeight: '1.3',
  letterSpacing: '-0.02em',
};

const valueLinkStyle: React.CSSProperties = {
  fontSize: '26px',
  color: '#FFFFFF',
  fontWeight: 700,
  textDecoration: 'none',
  fontFamily,
  letterSpacing: '-0.02em',
};
