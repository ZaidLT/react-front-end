import React, { useState, useRef, useEffect } from 'react';
import { Colors, Typography } from '../styles';
import CustomText from './CustomText';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  selectedValue?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
  width?: string | number;
  style?: React.CSSProperties;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  placeholder = 'Select an option',
  onChange,
  label,
  disabled = false,
  error,
  width = '100%',
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(option => option.value === selectedValue);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionSelect = (value: string) => {
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div style={{ width, ...style }}>
      {label && (
        <CustomText 
          style={{ 
            marginBottom: '8px', 
            fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            fontSize: '14px',
          }}
        >
          {label}
        </CustomText>
      )}
      <div 
        ref={dropdownRef}
        style={{ position: 'relative' }}
      >
        <div
          onClick={toggleDropdown}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            border: `1px solid ${error ? Colors.RED : Colors.COSMIC}`,
            borderRadius: '4px',
            backgroundColor: disabled ? Colors.WHITE_LILAC : Colors.WHITE,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.7 : 1,
          }}
        >
          <CustomText style={{ 
            color: selectedOption ? Colors.MIDNIGHT : Colors.GREY_COLOR,
            fontSize: '14px',
          }}>
            {selectedOption ? selectedOption.label : placeholder}
          </CustomText>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <path
              d="M7 10L12 15L17 10"
              stroke={Colors.GREY_COLOR}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              backgroundColor: Colors.WHITE,
              border: `1px solid ${Colors.COSMIC}`,
              borderRadius: '4px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              zIndex: 10,
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  backgroundColor: option.value === selectedValue ? Colors.WHITE_LILAC : Colors.WHITE,
                  transition: 'background-color 0.2s',
                }}
                className="dropdown-option"
              >
                {option.icon && (
                  <div style={{ marginRight: '8px' }}>
                    {option.icon}
                  </div>
                )}
                <CustomText style={{ fontSize: '14px' }}>
                  {option.label}
                </CustomText>
              </div>
            ))}
          </div>
        )}
      </div>
      {error && (
        <CustomText style={{ 
          color: Colors.RED, 
          fontSize: '12px',
          marginTop: '4px',
        }}>
          {error}
        </CustomText>
      )}
    </div>
  );
};

export default Dropdown;
