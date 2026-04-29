import { Text } from '@react-email/components';
import { colors, fontFamily } from '../constants';

export interface EmailTextProps {
  variant?: 'body' | 'greeting' | 'muted';
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function EmailText({ variant = 'body', children, style }: EmailTextProps) {
  const baseStyle = variant === 'greeting'
    ? greetingStyle
    : variant === 'muted'
      ? mutedStyle
      : bodyStyle;
  return <Text style={{ ...baseStyle, ...style }}>{children}</Text>;
}

const bodyStyle: React.CSSProperties = {
  margin: '0 0 16px',
  color: colors.textBody,
  fontSize: '15px',
  lineHeight: '1.75',
  fontFamily,
};

const greetingStyle: React.CSSProperties = {
  margin: '0 0 20px',
  color: colors.textDark,
  fontSize: '17px',
  fontWeight: 500,
  lineHeight: '1.7',
  fontFamily,
};

const mutedStyle: React.CSSProperties = {
  margin: '16px 0 0',
  color: colors.textMutedLight,
  fontSize: '13px',
  lineHeight: '1.6',
  fontFamily,
};
