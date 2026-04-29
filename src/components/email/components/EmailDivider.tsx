import { Hr } from '@react-email/components';
import { colors } from '../constants';

export function EmailDivider() {
  return <Hr style={hrStyle} />;
}

const hrStyle: React.CSSProperties = {
  borderColor: colors.divider,
  borderTop: `1px solid ${colors.divider}`,
  margin: '24px 0',
};
