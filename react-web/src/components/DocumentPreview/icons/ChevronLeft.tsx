import React from 'react';

interface ChevronLeftProps {
  size?: number;
  color?: string;
}

/**
 * ChevronLeft - Left arrow icon for navigation
 *
 * @param size - Icon size in pixels (default: 20)
 * @param color - Icon color (default: currentColor)
 */
export const ChevronLeft: React.FC<ChevronLeftProps> = ({
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
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
