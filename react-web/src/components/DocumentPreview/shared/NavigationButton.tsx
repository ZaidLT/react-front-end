import React from 'react';
import { Colors } from '../../../styles';
import { DOCUMENT_PREVIEW_CONSTANTS } from '../constants';

interface NavigationButtonProps {
  onClick: () => void;
  disabled: boolean;
  ariaLabel: string;
  icon: React.ReactNode;
}

/**
 * NavigationButton - Reusable navigation button for document controls
 *
 * Provides consistent styling for enabled/disabled states
 *
 * @param onClick - Click handler
 * @param disabled - Whether the button is disabled
 * @param ariaLabel - Accessible label for screen readers
 * @param icon - Icon component to display
 */
export const NavigationButton: React.FC<NavigationButtonProps> = ({
  onClick,
  disabled,
  ariaLabel,
  icon,
}) => {
  const baseStyles = {
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: `1px solid ${disabled ? Colors.GRAY : Colors.PRIMARY}`,
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    minWidth: `${DOCUMENT_PREVIEW_CONSTANTS.BUTTON_MIN_SIZE}px`,
    minHeight: `${DOCUMENT_PREVIEW_CONSTANTS.BUTTON_MIN_SIZE}px`,
    color: disabled ? Colors.GRAY : Colors.PRIMARY,
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <button
      style={baseStyles}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {icon}
    </button>
  );
};
