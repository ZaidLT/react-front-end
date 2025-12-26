import React from 'react';

interface ChevronRightProps {
  size?: number;
  color?: string;
}

/**
 * ChevronRight - Right arrow icon for navigation
 *
 * @param size - Icon size in pixels (default: 20)
 * @param color - Icon color (default: currentColor)
 */
export const ChevronRight: React.FC<ChevronRightProps> = ({
  size = 20,
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
