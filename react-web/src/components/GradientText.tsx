import React from 'react';
import { Typography } from '../styles';

interface GradientTextProps {
  text: string;
  colors: string[];
  start?: { x: string; y: string };
  end?: { x: string; y: string };
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  style?: React.CSSProperties;
}

const GradientText: React.FC<GradientTextProps> = ({
  text,
  colors,
  start = { x: "0%", y: "0%" },
  end = { x: "100%", y: "0%" },
  fontSize = 30,
  fontFamily = Typography.FONT_FAMILY_POPPINS_REGULAR,
  fontWeight = Typography.FONT_WEIGHT_REGULAR,
  style = {},
}) => {
  // Create the gradient string for CSS
  const gradientDirection = `to right`; // Default horizontal gradient
  const gradientColors = colors.map((color, index) => {
    const percentage = (index / (colors.length - 1)) * 100;
    return `${color} ${percentage}%`;
  }).join(', ');

  return (
    <div
      style={{
        display: 'inline-block',
        fontSize: `${fontSize}px`,
        fontFamily,
        fontWeight,
        background: `linear-gradient(${gradientDirection}, ${gradientColors})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        color: 'transparent',
        ...style,
      }}
    >
      {text}
    </div>
  );
};

export default GradientText;
