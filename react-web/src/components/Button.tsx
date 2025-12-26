import React from 'react';
import { Colors } from '../styles';
import CustomText from './CustomText';
import LoadingSpinner from './LoadingSpinner';

interface ButtonIconProps {
  width?: number;
  height?: number;
  fill?: string;
}

interface IButtonProps {
  textProps: {
    text: string;
    color?: string;
    fontFamily?: string;
    fontSize?: number;
  };
  ButtonIcon?: React.FC<ButtonIconProps> | null;
  buttonIconColor?: string;
  onButtonClick?: () => void;
  width?: string | number;
  height?: string | number;
  backgroundColor?: string;
  borderProps?: {
    width?: number;
    color?: string;
    radius?: number;
  };
  disabled?: boolean;
  leftIcon?: boolean;
  loading?: boolean;
  style?: React.CSSProperties;
}

const Button: React.FC<IButtonProps> = ({
  textProps,
  onButtonClick,
  width,
  height,
  backgroundColor,
  borderProps,
  disabled,
  ButtonIcon,
  leftIcon = true,
  buttonIconColor,
  loading = false,
  style,
}) => {
  return (
    <button
      onClick={() => {
        if (onButtonClick && !disabled) {
          onButtonClick();
        }
      }}
      disabled={disabled}
      style={{
        maxWidth: 600,
        width: width || '100%',
        backgroundColor: backgroundColor || '#000E50',
        borderRadius: borderProps?.radius || 8,
        borderWidth: borderProps?.width || 0,
        borderColor: borderProps?.color || 'transparent',
        borderStyle: 'solid',
        height: height || 52,
        opacity: disabled ? 0.5 : 1,
        paddingRight: (leftIcon && ButtonIcon) ? 24 : 0,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        outline: 'none',
        ...style,
      }}
    >
      {leftIcon && ButtonIcon && (
        <ButtonIcon width={24} height={24} fill={buttonIconColor} />
      )}
      {!loading ? (
        <>
          <CustomText
            style={{
              color: textProps.color || '#fff',
              fontFamily: textProps.fontFamily || 'Poppins, sans-serif',
              fontSize: textProps.fontSize || 16,
              lineHeight: '32px',
              textAlign: 'center',
            }}
          >
            {textProps.text}
          </CustomText>
          {!leftIcon && ButtonIcon && (
            <ButtonIcon width={24} height={24} fill={buttonIconColor} />
          )}
        </>
      ) : (
        <>
          <CustomText
            style={{
              color: textProps.color || '#fff',
              fontFamily: textProps.fontFamily || 'Poppins, sans-serif',
              fontSize: textProps.fontSize || 16,
              lineHeight: '32px',
              textAlign: 'center',
              marginRight: '10px',
            }}
          >
            {textProps.text}
          </CustomText>
          <LoadingSpinner
            size={20}
            borderWidth={3}
            color={textProps.color || Colors.WHITE}
            transparent={true}
          />
        </>
      )}
    </button>
  );
};

export default Button;
