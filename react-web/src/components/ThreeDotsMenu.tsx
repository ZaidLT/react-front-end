import React, { useState, useRef, useEffect } from 'react';
import { Colors, Typography } from '../styles';
import CustomText from './CustomText';

export interface MenuOption {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}

interface ThreeDotsMenuProps {
  options: MenuOption[];
  disabled?: boolean;
  style?: React.CSSProperties;
}

/**
 * ThreeDotsMenu - A three-dot menu dropdown component
 * 
 * This component displays a three-dot button that opens a dropdown menu
 * with the provided options when clicked.
 */
const ThreeDotsMenu: React.FC<ThreeDotsMenuProps> = ({
  options,
  disabled = false,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionPress = (option: MenuOption) => {
    if (!option.disabled) {
      option.onPress();
      setIsOpen(false);
    }
  };

  return (
    <div 
      ref={menuRef}
      style={{ position: 'relative', ...style }}
    >
      {/* Three dots button */}
      <button
        onClick={toggleMenu}
        disabled={disabled}
        style={{
          background: 'none',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s ease',
          opacity: disabled ? 0.6 : 1,
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = Colors.LIGHT_GREY;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title="More options"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="5" r="2" fill={Colors.BLUE} />
          <circle cx="12" cy="12" r="2" fill={Colors.BLUE} />
          <circle cx="12" cy="19" r="2" fill={Colors.BLUE} />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            backgroundColor: Colors.WHITE,
            border: `1px solid ${Colors.LIGHT_GREY}`,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            minWidth: '180px',
            overflow: 'hidden'
          }}
        >
          {options.map((option, index) => (
            <div
              key={option.key}
              onClick={() => handleOptionPress(option)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                cursor: option.disabled ? 'not-allowed' : 'pointer',
                backgroundColor: Colors.WHITE,
                transition: 'background-color 0.2s',
                opacity: option.disabled ? 0.6 : 1,
                borderBottom: index < options.length - 1 ? `1px solid ${Colors.LIGHT_GREY}` : 'none'
              }}
              className="menu-option"
              onMouseEnter={(e) => {
                if (!option.disabled) {
                  e.currentTarget.style.backgroundColor = Colors.WHITE_LILAC;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = Colors.WHITE;
              }}
            >
              {option.icon && (
                <div style={{ marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                  {option.icon}
                </div>
              )}
              <CustomText style={{ 
                fontSize: Typography.FONT_SIZE_14,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                color: option.disabled ? Colors.GREY_COLOR : Colors.BLUE
              }}>
                {option.label}
              </CustomText>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThreeDotsMenu;
