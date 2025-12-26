import React from 'react';
import { Colors } from '../styles';
import CustomText from './CustomText';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
  style?: React.CSSProperties;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  error,
  style,
}) => {
  const handleChange = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'flex-start',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        ...style,
      }}
      onClick={handleChange}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '4px',
          border: `2px solid ${error ? Colors.RED : checked ? Colors.BLUE : Colors.COSMIC}`,
          backgroundColor: checked ? Colors.BLUE : Colors.WHITE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '8px',
          marginTop: '2px',
          flexShrink: 0,
        }}
      >
        {checked && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M5 12L10 17L19 8" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      {label && (
        <div>
          <CustomText style={{ fontSize: '14px' }}>
            {label}
          </CustomText>
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
      )}
    </div>
  );
};

export default Checkbox;
