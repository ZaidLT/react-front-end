import React, { useState } from 'react';
import { Colors, Typography } from '../styles';
import CustomText from './CustomText';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onIconPress?: () => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry = false,
  autoFocus = false,
  disabled = false,
  multiline = false,
  rows = 3,
  maxLength,
  style,
  inputStyle,
  icon,
  iconPosition = 'right',
  onIconPress,
  onBlur,
  onFocus,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChangeText(e.target.value);
  };

  const InputComponent = multiline ? 'textarea' as const : 'input' as const;

  return (
    <div style={{ width: '100%', ...style }}>
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
      <div style={{ 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}>
        {icon && iconPosition === 'left' && (
          <div 
            style={{ 
              position: 'absolute', 
              left: '12px',
              cursor: onIconPress ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={onIconPress}
          >
            {icon}
          </div>
        )}
        <InputComponent
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          type={secureTextEntry ? 'password' : 'text'}
          autoFocus={autoFocus}
          disabled={disabled}
          maxLength={maxLength}
          rows={multiline ? rows : undefined}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            width: '100%',
            padding: '10px 12px',
            paddingLeft: icon && iconPosition === 'left' ? '40px' : '12px',
            paddingRight: icon && iconPosition === 'right' ? '40px' : '12px',
            border: `1px solid ${error ? Colors.RED : isFocused ? Colors.BLUE : Colors.COSMIC}`,
            borderRadius: '4px',
            outline: 'none',
            fontSize: '16px', // Prevent iOS mobile zoom
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            backgroundColor: disabled ? Colors.WHITE_LILAC : Colors.WHITE,
            color: Colors.MIDNIGHT,
            resize: multiline ? 'vertical' : 'none',
            ...inputStyle,
          }}
        />
        {icon && iconPosition === 'right' && (
          <div 
            style={{ 
              position: 'absolute', 
              right: '12px',
              cursor: onIconPress ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={onIconPress}
          >
            {icon}
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

export default Input;
