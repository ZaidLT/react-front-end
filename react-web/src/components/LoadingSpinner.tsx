import React from 'react';
import { Colors } from '../styles';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  borderWidth?: number;
  style?: React.CSSProperties;
  trackColor?: string;
  transparent?: boolean;
}

/**
 * LoadingSpinner - A reusable loading spinner component
 *
 * This component displays a circular loading spinner with customizable size, color, and border width.
 *
 * @param size - The size of the spinner in pixels (default: 40)
 * @param color - The color of the spinner (default: Colors.BLUE)
 * @param borderWidth - The width of the spinner's border (default: 4)
 * @param trackColor - The color of the track/background (default: Colors.LIGHT_GREY)
 * @param transparent - If true, makes the track transparent for better visibility on colored backgrounds (default: false)
 * @param style - Additional styles to apply to the spinner
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color = Colors.BLUE,
  borderWidth = 4,
  trackColor = Colors.LIGHT_GREY,
  transparent = false,
  style,
}) => {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: transparent
          ? `${borderWidth}px solid transparent`
          : `${borderWidth}px solid ${trackColor}`,
        borderTopColor: color,
        borderLeftColor: transparent ? 'transparent' : `rgba(${color.startsWith('#')
          ? parseInt(color.slice(1, 3), 16) + ',' + parseInt(color.slice(3, 5), 16) + ',' + parseInt(color.slice(5, 7), 16)
          : '255,255,255'}, 0.3)`,
        borderRightColor: transparent ? 'transparent' : trackColor,
        borderBottomColor: transparent ? 'transparent' : trackColor,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        ...style,
      }}
    />
  );
};

export default LoadingSpinner;
