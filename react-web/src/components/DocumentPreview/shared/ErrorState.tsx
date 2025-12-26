import React from 'react';
import { Colors } from '../../../styles';
import { DOCUMENT_PREVIEW_CONSTANTS } from '../constants';
import { useLanguageContext } from '../../../context/LanguageContext';

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

/**
 * ErrorState - Reusable error UI for document previews
 *
 * @param title - Error title
 * @param message - Error message
 * @param onRetry - Optional retry handler (shows button if provided)
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
}) => {
  const { i18n } = useLanguageContext();

  const styles = {
    container: {
      width: '100%',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      backgroundColor: Colors.LIGHT_GREY,
      borderRadius: '8px',
    },
    textContainer: {
      textAlign: 'center' as const,
      color: Colors.GRAY,
      maxWidth: '400px',
    },
    title: {
      marginBottom: '8px',
      fontWeight: 'bold',
    },
    retryButton: {
      padding: '8px 16px',
      backgroundColor: Colors.PRIMARY,
      color: Colors.WHITE,
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      minWidth: `${DOCUMENT_PREVIEW_CONSTANTS.BUTTON_MIN_SIZE}px`,
      minHeight: `${DOCUMENT_PREVIEW_CONSTANTS.BUTTON_MIN_SIZE}px`,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.textContainer}>
        <div style={styles.title}>{title}</div>
        <div>{message}</div>
      </div>
      {onRetry && (
        <button style={styles.retryButton} onClick={onRetry}>
          {i18n.t('Retry')}
        </button>
      )}
    </div>
  );
};
