import React from 'react';
import styles from './PageContainer.module.css';

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * PageContainer
 * 
 * The standard wrapper for all page content.
 * - Mobile: 16px padding, 100% width
 * - Desktop: 32px padding, centered with max-width
 */
export const PageContainer: React.FC<PageContainerProps> = ({
    children,
    className = '',
    maxWidth = 'lg'
}) => {
    return (
        <div className={`${styles.container} ${styles[maxWidth]} ${className}`}>
            {children}
        </div>
    );
};
