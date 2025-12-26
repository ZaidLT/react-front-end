import React from 'react';
import styles from './EevaInput.module.css';

interface EevaInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
    label?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    multiline?: boolean;
    rows?: number;
}

/**
 * EevaInput
 * 
 * Standard input component with label and error states.
 * - Text input or textarea
 * - Label and error message support
 * - Responsive sizing
 */
export const EevaInput: React.FC<EevaInputProps> = ({
    value,
    onChange,
    placeholder,
    type = 'text',
    label,
    error,
    disabled = false,
    required = false,
    className = '',
    multiline = false,
    rows = 4
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className={`${styles.inputWrapper} ${className}`}>
            {label && (
                <label className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}

            {multiline ? (
                <textarea
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    rows={rows}
                    className={`${styles.input} ${styles.textarea} ${error ? styles.error : ''}`}
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={`${styles.input} ${error ? styles.error : ''}`}
                />
            )}

            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    );
};
