import { Heading } from '@react-email/components';
import { colors, fontFamily } from '../constants';

export interface EmailHeadingProps {
  as?: 'h1' | 'h2';
  children: React.ReactNode;
}

export function EmailHeading({ as = 'h1', children }: EmailHeadingProps) {
  const style = as === 'h1' ? h1Style : h2Style;
  return (
    <Heading as={as} style={style}>
      {children}
    </Heading>
  );
}

/** h1 kept for edge cases; primary heading now lives in EmailLayout header */
const h1Style: React.CSSProperties = {
  margin: '0 0 16px',
  color: colors.textDark,
  fontSize: '24px',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  lineHeight: '1.3',
  fontFamily,
};

/** Section label: teal uppercase */
const h2Style: React.CSSProperties = {
  margin: '24px 0 14px',
  color: colors.primary,
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  lineHeight: '1.4',
  fontFamily,
};
