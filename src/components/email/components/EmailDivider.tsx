import { Hr } from '@react-email/components';
import { colors } from '../constants';

export function EmailDivider() {
  return <Hr style={hrStyle} />;
}

const hrStyle: React.CSSProperties = {
  borderColor: colors.border,
  borderTop: `1px solid ${colors.border}`,
  margin: '24px 0',
};
