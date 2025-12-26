'use client';

import React, { useMemo } from 'react';
import styles from './HexagonGrid.module.css';

export interface HexagonGridProps {
  /** Hexagon components to render */
  children: React.ReactNode[];

  /** Number of hexagons per row */
  tilesPerRow: number[];

  /** Additional className */
  className?: string;

  /** Additional inline styles */
  style?: React.CSSProperties;
}

/**
 * HexagonGrid - Arranges hexagons in a honeycomb pattern
 * Uses CSS custom properties from globals for dimensions
 */
const HexagonGrid: React.FC<HexagonGridProps> = ({
  children,
  tilesPerRow,
  className = '',
  style,
}) => {
  // Group children into rows based on tilesPerRow
  const rows = useMemo(() => {
    const result: React.ReactNode[][] = [];
    let index = 0;

    // Add empty spacer div if there are more than 3 items
    const childrenWithSpacer = children.length > 3
      ? [...children, <div key="spacer" style={{ width: 'var(--hex-width)' }} />]
      : children;

    for (const count of tilesPerRow) {
      const rowChildren = childrenWithSpacer.slice(index, index + count);
      if (rowChildren.length > 0) {
        result.push(rowChildren);
      }
      index += count;
    }

    return result;
  }, [children, tilesPerRow]);

  return (
    <div className={`${styles.grid} ${className}`} style={style}>
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`${styles.row}`}
          style={{
            zIndex: rows.length - rowIndex, // Stack order for overlap
          }}
        >
          {row.map((hex, hexIndex) => (
            <React.Fragment key={hexIndex}>
              {hex}
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
};

export default HexagonGrid;
