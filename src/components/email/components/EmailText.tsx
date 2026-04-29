import { Text } from '@react-email/components';
import { colors, fontFamily } from '../constants';

export interface EmailTextProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function EmailText({ children, style }: EmailTextProps) {
  return <Text style={{ ...textStyle, ...style }}>{children}</Text>;
}

const textStyle: React.CSSProperties = {
  margin: '0 0 16px',
  color: colors.textBody,
  fontSize: '15px',
  lineHeight: '1.7',
  fontFamily,
};
