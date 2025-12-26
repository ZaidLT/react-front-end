import React from 'react';
import styles from './ResponsiveGrid.module.css';

interface ResponsiveGridProps {
    children: React.ReactNode;
    className?: string;
    columns?: 1 | 2 | 3 | 4;
    gap?: 'sm' | 'md' | 'lg';
}

/**
 * ResponsiveGrid
 * 
 * A smart grid that adapts columns based on screen size.
 * - Mobile: Always 1 column (stack)
 * - Tablet: 2 columns
 * - Desktop: Up to specified 'columns' prop (default 3)
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
    children,
    className = '',
    columns = 3,
    gap = 'md'
}) => {
    return (
        <div
            className={`${styles.grid} ${styles[`cols-${columns}`]} ${styles[`gap-${gap}`]} ${className}`}
        >
            {children}
        </div>
    );
};
