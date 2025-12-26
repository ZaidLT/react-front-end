import React from 'react';
import { Colors } from '../../../styles';

interface LoadingStateProps {
  message?: string;
}

/**
 * LoadingState - Reusable loading UI for document previews
 *
 * @param message - Loading message to display (default: "Loading...")
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
}) => {
  const styles = {
    container: {
      width: '100%',
      height: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.LIGHT_GREY,
      borderRadius: '8px',
    },
  };

  return (
    <div style={styles.container}>
      <div>{message}</div>
    </div>
  );
};
