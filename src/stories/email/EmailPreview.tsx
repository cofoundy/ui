import { useState, useEffect, type ReactElement } from 'react';
import { render } from '@react-email/render';

interface EmailPreviewProps {
  children: ReactElement;
}

export function EmailPreview({ children }: EmailPreviewProps) {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    render(children).then(setHtml);
  }, [children]);

  if (!html) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#e5e7eb', fontFamily: 'Inter, sans-serif', color: '#848386' }}>
        Rendering email...
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      style={{ width: '100%', height: '100vh', border: 'none', background: '#F4F8FB' }}
      title="Email Preview"
    />
  );
}
