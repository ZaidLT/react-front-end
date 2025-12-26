import React, { useEffect, useState, ReactNode } from 'react';
import Snackbar from './Snackbar';
import { ISnackbar } from '../util/types';

interface SnackbarProviderProps {
  children: ReactNode;
}

/**
 * SnackbarProvider - Global provider that listens to snackbar events and displays them
 * 
 * This component listens to custom 'snackbar' events dispatched by the emitSnackbar function
 * and renders snackbars globally across the application.
 */
const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [snackbars, setSnackbars] = useState<ISnackbar[]>([]);

  useEffect(() => {
    const handleSnackbarEvent = (event: CustomEvent) => {
      const { message, type, duration } = event.detail;
      
      const newSnackbar: ISnackbar = {
        id: `${Date.now()}-${Math.random()}`,
        message,
        type: type || 'info',
        duration: duration || 3000,
      };

      setSnackbars(prev => [...prev, newSnackbar]);
    };

    // Listen for snackbar events
    document.addEventListener('snackbar', handleSnackbarEvent as EventListener);

    return () => {
      document.removeEventListener('snackbar', handleSnackbarEvent as EventListener);
    };
  }, []);

  const removeSnackbar = (id: string) => {
    setSnackbars(prev => prev.filter(snackbar => snackbar.id !== id));
  };

  return (
    <>
      {children}
      
      {/* Global Snackbar Container */}
      {snackbars.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            pointerEvents: 'none', // Allow clicks to pass through the container
            width: '100%',
            maxWidth: '400px',
            padding: '0 16px',
            boxSizing: 'border-box',
          }}
        >
          {snackbars.map(snackbar => (
            <div key={snackbar.id} style={{ pointerEvents: 'auto' }}>
              <Snackbar
                snackbar={snackbar}
                onClose={removeSnackbar}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default SnackbarProvider;
