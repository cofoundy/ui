import { Section, Row, Column } from '@react-email/components';
import { colors, fontFamily } from '../constants';
import { Text } from '@react-email/components';

export interface InfoBoxRowItem {
  label: string;
  value: string;
}

export interface InfoBoxRowProps {
  items: [InfoBoxRowItem, InfoBoxRowItem];
}

export function InfoBoxRow({ items }: InfoBoxRowProps) {
  return (
    <Section style={wrapperStyle}>
      <Row>
        <Column width="48%" style={cardStyle}>
          <Text style={labelStyle}>{items[0].label}</Text>
          <Text style={valueStyle}>{items[0].value}</Text>
        </Column>
        <Column width="4%" />
        <Column width="48%" style={cardStyle}>
          <Text style={labelStyle}>{items[1].label}</Text>
          <Text style={valueStyle}>{items[1].value}</Text>
        </Column>
      </Row>
    </Section>
  );
}

const wrapperStyle: React.CSSProperties = {
  margin: '0 0 36px',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: colors.navyMid,
  background: `linear-gradient(145deg, ${colors.navyMid}, ${colors.navyLight})`,
  borderRadius: '10px',
  padding: '24px 24px 22px 24px',
};

const labelStyle: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: '11px',
  fontWeight: 500,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: 'rgba(255,255,255,0.5)',
  fontFamily,
};

const valueStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '26px',
  fontWeight: 700,
  color: '#FFFFFF',
  letterSpacing: '-0.02em',
  fontFamily,
};
