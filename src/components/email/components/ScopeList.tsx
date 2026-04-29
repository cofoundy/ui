import { Section, Row, Column, Text } from '@react-email/components';
import { colors, fontFamily } from '../constants';

export interface ScopeListProps {
  items: string[];
}

export function ScopeList({ items }: ScopeListProps) {
  if (items.length === 0) return null;

  return (
    <Section style={cardStyle}>
      {items.map((item, i) => (
        <Row key={i} style={i < items.length - 1 ? rowStyleWithBorder : rowStyle}>
          <Column width={28} style={checkColStyle}>
            <div style={checkCircleStyle}>&#10003;</div>
          </Column>
          <Column style={textColStyle}>
            <Text style={itemTextStyle}>{item}</Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: colors.bgCard,
  borderRadius: '10px',
  border: `1px solid ${colors.border}`,
  margin: '0 0 32px',
};

const rowStyle: React.CSSProperties = {
  padding: '15px 20px',
};

const rowStyleWithBorder: React.CSSProperties = {
  ...rowStyle,
  borderBottom: `1px solid ${colors.border}`,
};

const checkColStyle: React.CSSProperties = {
  verticalAlign: 'top',
  paddingTop: '1px',
  width: '28px',
};

const checkCircleStyle: React.CSSProperties = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: colors.primary,
  textAlign: 'center' as const,
  lineHeight: '20px',
  fontSize: '11px',
  color: '#ffffff',
};

const textColStyle: React.CSSProperties = {
  paddingLeft: '12px',
};

const itemTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '14px',
  color: colors.textBody,
  lineHeight: '1.5',
  fontFamily,
};
