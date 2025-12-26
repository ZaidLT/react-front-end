'use client';

import React from 'react';
import HexBackground from '../HexBackground/HexBackground';
import { HexHoverType, HexBackgroundType } from '../types';
import sharedStyles from '../hex-shared.module.css';

export interface HexContainerProps {
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
}

/**
 * HexContainer - Static hexagon for displaying content
 * This is a non-interactive div element. For clickable hexagons, use HexButton or HexLink.
 */
const HexContainer: React.FC<HexContainerProps> = ({
  children,
  hover,
  background,
  className = '',
  style,
}) => {
  const hoverClass = hover === HexHoverType.Scale ? sharedStyles['hover-scale'] : '';

  return (
    <div
      className={`${sharedStyles['hex-base']} ${sharedStyles['cursor-default']} ${hoverClass} ${className}`}
      style={style}
    >
      <HexBackground variant={background} />
      <div className={sharedStyles['hex-content']}>
        {children}
      </div>
    </div>
  );
};

export default HexContainer;
