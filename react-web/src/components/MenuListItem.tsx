import React from 'react';
import { Colors, Typography } from '../styles';
import CustomText from './CustomText';

interface MenuListItemProps {
  title?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
  content?: {
    icon?: string;
    name?: string;
  };
  textColor?: string;
  isFullWidth?: boolean;
  containerStyle?: React.CSSProperties;
}

/**
 * MenuListItem - A component for displaying a menu item with an icon and title
 *
 * @param title - The text to display
 * @param icon - Optional icon to display on the left
 * @param onPress - Optional callback function when the item is clicked
 * @param rightIcon - Optional icon to display on the right
 * @param disabled - Whether the item is disabled
 * @param style - Additional styles to apply to the container
 */
const MenuListItem: React.FC<MenuListItemProps> = ({
  title,
  icon,
  onPress,
  rightIcon,
  disabled = false,
  style,
  content,
  textColor,
  isFullWidth,
  containerStyle,
}) => {
  const displayTitle = title || (content?.name || "");

  return (
    <div
      onClick={disabled ? undefined : onPress}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '0px',
        backgroundColor: Colors.WHITE,
        borderRadius: '8px',
        marginBottom: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: isFullWidth ? '100%' : 'auto',
        ...style,
        ...containerStyle,
      }}
    >
      {(icon || content?.icon) && (
        <div style={{ marginRight: '12px' }}>
          {icon || (content?.icon ? (
            <img
              src={content.icon}
              alt="icon"
              style={{
                width: '24px',
                height: '24px'
              }}
            />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z" fill={Colors.BLUE} />
            </svg>
          ))}
        </div>
      )}
      <CustomText
        style={{
          flex: 1,
          color: textColor || Colors.MIDNIGHT,
          fontSize: '16px',
          fontFamily: textColor === 'var(--primary-dark-blue-20, #CCCFDC)' ? 'Poppins' : Typography.FONT_FAMILY_POPPINS_MEDIUM,
          fontStyle: 'normal',
          fontWeight: textColor === 'var(--primary-dark-blue-20, #CCCFDC)' ? '400' : '500',
          lineHeight: '21px',
          letterSpacing: textColor === 'var(--primary-dark-blue-20, #CCCFDC)' ? '-0.408px' : 'normal',
        }}
      >
        {displayTitle}
      </CustomText>
      {rightIcon && <div>{rightIcon}</div>}
    </div>
  );
};

export default MenuListItem;
