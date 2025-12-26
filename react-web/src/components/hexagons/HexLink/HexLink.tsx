'use client';

import React from 'react';
import Link from 'next/link';
import HexBackground from '../HexBackground/HexBackground';
import { HexHoverType, HexBackgroundType } from '../types';
import sharedStyles from '../hex-shared.module.css';

export interface HexLinkProps {
  /** Navigation destination */
  href: string;

  /** Content to render inside the hex */
  children: React.ReactNode;

  /** Hover animation type */
  hover?: HexHoverType;

  /** Background variant */
  background?: HexBackgroundType;

  /** Additional className for custom styling */
  className?: string;

  /** Additional inline styles if needed */
  style?: React.CSSProperties;

  /** Next.js Link: Enable prefetching */
  prefetch?: boolean;

  /** Next.js Link: Replace current history entry instead of adding new one */
  replace?: boolean;

  /** Next.js Link: Scroll to top of page after navigation */
  scroll?: boolean;

  /** Anchor: Target window/frame */
  target?: string;

  /** Anchor: Relationship between current document and linked document */
  rel?: string;
}

/**
 * HexLink - Navigational hexagon link using Next.js Link
 * Use this for all navigation (internal and external links)
 * For actions, use HexButton instead.
 */
const HexLink: React.FC<HexLinkProps> = ({
  href,
  children,
  hover,
  background,
  className = '',
  style,
  prefetch,
  replace,
  scroll,
  target,
  rel,
}) => {
  const hoverClass = hover === HexHoverType.Scale ? sharedStyles['hover-scale'] : '';

  // Detect external links
  const isExternal = href.startsWith('http') || href.startsWith('//');
  const finalTarget = target || (isExternal ? '_blank' : undefined);
  const finalRel = rel || (isExternal ? 'noopener noreferrer' : undefined);

  return (
    <Link
      href={href}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
      target={finalTarget}
      rel={finalRel}
      className={`${sharedStyles['hex-base']} ${sharedStyles['cursor-pointer']} ${hoverClass} ${className}`}
      style={style}
    >
      <HexBackground variant={background} />
      <div className={sharedStyles['hex-content']}>
        {children}
      </div>
    </Link>
  );
};

export default HexLink;
