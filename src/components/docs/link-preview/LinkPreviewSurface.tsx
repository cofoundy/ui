'use client';

import { forwardRef } from 'react';
import type { LinkPreviewVariant, PreviewResult } from './types';
import type { Position } from './usePreviewPosition';
import { LinkPreviewQuiet } from './surfaces/LinkPreviewQuiet';
import { LinkPreviewCard } from './surfaces/LinkPreviewCard';
import { LinkPreviewGlass } from './surfaces/LinkPreviewGlass';

interface SurfaceProps {
  variant: LinkPreviewVariant;
  result: PreviewResult;
  href: string;
  position: Position | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  reduceMotion: boolean;
}

/**
 * Dispatches to the concrete surface renderer. The provider doesn't know
 * about visual variants; the surface does. This is the seam where the 3
 * design concepts diverge — same data, different render.
 */
export const LinkPreviewSurface = forwardRef<HTMLDivElement, SurfaceProps>(
  function LinkPreviewSurface({ variant, ...rest }, ref) {
    const sharedProps = { ...rest, ref };
    if (variant === 'card') return <LinkPreviewCard {...sharedProps} />;
    if (variant === 'glass') return <LinkPreviewGlass {...sharedProps} />;
    return <LinkPreviewQuiet {...sharedProps} />;
  },
);

export interface SurfaceRenderProps {
  result: PreviewResult;
  href: string;
  position: Position | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  reduceMotion: boolean;
}
