import { Section, Row, Column, Text } from '@react-email/components';
import { colors, fontFamily } from '../constants';

export interface NextStepCalloutProps {
  label?: string;
  children: React.ReactNode;
}

export function NextStepCallout({ label = 'Siguiente paso', children }: NextStepCalloutProps) {
  return (
    <Section style={wrapperStyle}>
      <div style={borderStyle}>
        {label && <Text style={labelStyle}>{label}</Text>}
        <Text style={contentStyle}>{children}</Text>
      </div>
    </Section>
  );
}

const wrapperStyle: React.CSSProperties = {
  margin: '0 0 16px',
};

const borderStyle: React.CSSProperties = {
  borderLeft: `3px solid ${colors.primary}`,
  paddingLeft: '20px',
};

const labelStyle: React.CSSProperties = {
  margin: '0 0 4px',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  color: colors.primary,
  fontFamily,
};

const contentStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '15px',
  lineHeight: '1.7',
  color: colors.textBody,
  fontFamily,
};
