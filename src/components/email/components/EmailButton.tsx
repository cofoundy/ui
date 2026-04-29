import { Button } from '@react-email/components';
import { colors, fontFamily } from '../constants';

export interface EmailButtonProps {
  href: string;
  children: string;
}

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Button href={href} style={buttonStyle}>
      {children}
    </Button>
  );
}

const buttonStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '14px 28px',
  backgroundColor: colors.primary,
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '14px',
  letterSpacing: '0.01em',
  margin: '8px 0',
  fontFamily,
  textAlign: 'center' as const,
};
