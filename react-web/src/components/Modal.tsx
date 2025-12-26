import React, { useEffect } from 'react';
import { Colors, Typography } from '../styles';

interface ModalProps {
  isVisible: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  showCloseButton?: boolean;
  contentStyle?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  footerStyle?: React.CSSProperties;
  footerContent?: React.ReactNode;
  closeOnBackdropPress?: boolean;
  // New optional controls
  closeIconSize?: number;
  closeButtonStyle?: React.CSSProperties;
}

const Modal: React.FC<ModalProps> = ({
  isVisible,
  title,
  children,
  onClose,
  showCloseButton = true,
  contentStyle,
  headerStyle,
  footerStyle,
  footerContent,
  closeOnBackdropPress = true,
  closeIconSize,
  closeButtonStyle,
}) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isVisible]);

  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={closeOnBackdropPress ? onClose : undefined}
    >
      <div
        style={{
          backgroundColor: Colors.WHITE,
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          width: '90%',
          maxWidth: 500,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          margin: '20px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div
            style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${Colors.COSMIC}`,
              display: 'flex',
              justifyContent: title ? 'center' : 'flex-end',
              alignItems: 'center',
              position: 'relative',
              ...headerStyle,
              width: '100%',
            }}
          >
            {title && (
              <h3
                style={{
                  margin: 0,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                  fontSize: 18,
                  color: Colors.MIDNIGHT,
                }}
              >
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  position: 'absolute',
                  right: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...closeButtonStyle,
                }}
                aria-label='Close'
              >
                <svg
                  width={closeIconSize ?? 16}
                  height={closeIconSize ?? 16}
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke={Colors.GREY_COLOR}
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <line x1='18' y1='6' x2='6' y2='18' />
                  <line x1='6' y1='6' x2='18' y2='18' />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Modal Content */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
            ...contentStyle,
          }}
        >
          {children}
        </div>

        {/* Modal Footer */}
        {footerContent && (
          <div
            style={{
              padding: '16px 20px',
              borderTop: `1px solid ${Colors.COSMIC}`,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              flexShrink: 0,
              ...footerStyle,
            }}
          >
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
