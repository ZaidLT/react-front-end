import React from 'react';
import { Typography } from '../styles';

interface CustomTextProps {
  style?: React.CSSProperties;
  children: React.ReactNode;
  className?: string;
  numberOfLines?: number;
  onClick?: () => void;
}

// Custom Text component for web that maintains consistent styling
const CustomText: React.FC<CustomTextProps> = ({
  style,
  children,
  className,
  numberOfLines,
  onClick
}) => {
  return (
    <span
      className={className}
      onClick={onClick}
      style={{
        fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
        fontSize: Typography.FONT_SIZE_16,
        fontWeight: Typography.FONT_WEIGHT_REGULAR,
        ...(numberOfLines && {
          display: '-webkit-box',
          WebkitLineClamp: numberOfLines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }),
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export default CustomText;
