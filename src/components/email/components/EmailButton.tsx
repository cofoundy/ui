import { Button } from '@react-email/components';
import { colors, fontFamily } from '../constants';

export interface EmailButtonProps {
  href: string;
  children: string;
}

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Button href={href} style={buttonStyle}>
      {children} &rarr;
    </Button>
  );
}

const buttonStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '14px 32px',
  backgroundColor: colors.primary,
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '14px',
  letterSpacing: '0.01em',
  margin: '8px 0',
  fontFamily,
  textAlign: 'center' as const,
  boxShadow: '0 1px 3px rgba(70,160,208,0.3), 0 4px 12px rgba(70,160,208,0.15)',
};
