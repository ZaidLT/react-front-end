'use client';

import React from 'react';
import { useNotificationContext } from '../context/NotificationContext';
import { Colors, Typography } from '../styles';

/**
 * ToastNotifications - Displays toast notifications
 *
 * Shows success, error, info, and warning messages at the top of the screen
 */
const ToastNotifications: React.FC = () => {
  const { notifications, removeNotification } = useNotificationContext();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div style={styles.container}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            ...styles.toast,
            ...styles[notification.type],
          }}
          onClick={() => removeNotification(notification.id)}
        >
          <div style={styles.iconContainer}>
            {notification.type === 'success' && '✓'}
            {notification.type === 'error' && '✕'}
            {notification.type === 'info' && 'ℹ'}
            {notification.type === 'warning' && '⚠'}
          </div>
          <span style={styles.message}>{notification.message}</span>
        </div>
      ))}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    pointerEvents: 'none',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    minWidth: '300px',
    maxWidth: '500px',
    pointerEvents: 'auto',
    cursor: 'pointer',
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    fontSize: '14px',
    animation: 'slideIn 0.3s ease-out',
  },
  success: {
    backgroundColor: '#4CAF50',
    color: '#FFFFFF',
  },
  error: {
    backgroundColor: '#F44336',
    color: '#FFFFFF',
  },
  info: {
    backgroundColor: '#2196F3',
    color: '#FFFFFF',
  },
  warning: {
    backgroundColor: '#FF9800',
    color: '#FFFFFF',
  },
  iconContainer: {
    fontSize: '18px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
  },
};

export default ToastNotifications;
