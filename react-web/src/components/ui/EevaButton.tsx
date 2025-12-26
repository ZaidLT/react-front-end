import React from 'react';
import styles from './EevaButton.module.css';

interface EevaButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    fullWidth?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
}

/**
 * EevaButton
 * 
 * Standard button component with variants.
 * - Primary, secondary, ghost, and danger styles
 * - Responsive sizing
 * - Disabled state
 */
export const EevaButton: React.FC<EevaButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    fullWidth = false,
    type = 'button',
    className = ''
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
        ${styles.button} 
        ${styles[variant]} 
        ${styles[size]} 
        ${fullWidth ? styles.fullWidth : ''}
        ${className}
      `}
        >
            {children}
        </button>
    );
};
