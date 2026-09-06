import React from 'react';

/**
 * Preview theme wrapper for design-sync.
 *
 * Mirrors the `data-theme` + background wrapper that .storybook/preview.tsx
 * applies via decorator, so compiled previews get the same themed context the
 * reference storybook renders stories in. The DS has no ThemeProvider export —
 * theming is the `data-theme` attribute alone (src/styles/index.css).
 */
export function DsPreviewTheme({
  theme = 'dark',
  children,
}: {
  theme?: 'dark' | 'light';
  children?: React.ReactNode;
}) {
  return (
    <div
      data-theme={theme}
      style={{
        background: theme === 'light' ? '#f8fafc' : '#020916',
        padding: '2rem',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
}
