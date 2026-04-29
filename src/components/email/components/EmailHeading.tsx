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

const h1Style: React.CSSProperties = {
  margin: '0 0 16px',
  color: colors.navy,
  fontSize: '24px',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  lineHeight: '1.3',
  fontFamily,
};

const h2Style: React.CSSProperties = {
  margin: '24px 0 12px',
  color: colors.navyLight,
  fontSize: '16px',
  fontWeight: 600,
  letterSpacing: '-0.005em',
  lineHeight: '1.4',
  fontFamily,
};
