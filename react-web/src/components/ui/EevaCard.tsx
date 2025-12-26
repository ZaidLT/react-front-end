import React from 'react';
import styles from './EevaCard.module.css';

interface EevaCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    variant?: 'default' | 'elevated' | 'outlined';
    padding?: 'sm' | 'md' | 'lg';
}

/**
 * EevaCard
 * 
 * Standard card component with consistent styling.
 * - Responsive padding
 * - Shadow variants
 * - Optional click handler
 */
export const EevaCard: React.FC<EevaCardProps> = ({
    children,
    className = '',
    onClick,
    variant = 'default',
    padding = 'md'
}) => {
    return (
        <div
            className={`${styles.card} ${styles[variant]} ${styles[`padding-${padding}`]} ${className}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
        </div>
    );
};
