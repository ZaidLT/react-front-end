import React from "react";
import { Colors } from "../styles";

/**
 * Squiggles - A component for displaying decorative squiggles
 * 
 * This component renders SVG squiggles for decorative purposes in the app.
 */
interface SquigglesProps {
  type: string;
  width?: number;
  height?: number;
  color?: string;
  style?: React.CSSProperties;
}

const Squiggles: React.FC<SquigglesProps> = ({
  type,
  width = 100,
  height = 100,
  color = Colors.BLUE,
  style = {},
}) => {
  // Function to render the appropriate squiggle based on type
  const renderSquiggle = () => {
    switch (type) {
      case "basic-line":
        return (
          <svg width={width} height={height} viewBox="0 0 180 30" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
            <path d="M2 15C2 15 45 -10 90 15C135 40 178 15 178 15" stroke={color} strokeWidth="4" strokeLinecap="round"/>
          </svg>
        );
      
      case "bended-arrow":
        return (
          <svg width={width} height={height} viewBox="0 0 124 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
            <path d="M122 2C122 2 42 32 42 102C42 172 2 198 2 198" stroke={color} strokeWidth="4" strokeLinecap="round"/>
            <path d="M12 178L2 198L22 198" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      
      case "bended-arrow-2":
        return (
          <svg width={width} height={height} viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
            <path d="M78 2C78 2 38 22 38 62C38 102 2 118 2 118" stroke={color} strokeWidth="4" strokeLinecap="round"/>
            <path d="M12 98L2 118L22 118" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      
      case "bended-arrow-purple":
        return (
          <svg width={width} height={height} viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
            <path d="M118 2C118 2 38 32 38 102C38 172 2 198 2 198" stroke={Colors.SECONDARY_PURPLE} strokeWidth="4" strokeLinecap="round"/>
            <path d="M12 178L2 198L22 198" stroke={Colors.SECONDARY_PURPLE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      
      case "burst":
        return (
          <svg width={width} height={height} viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
            <path d="M29 2V56" stroke={color} strokeWidth="4" strokeLinecap="round"/>
            <path d="M56 29L2 29" stroke={color} strokeWidth="4" strokeLinecap="round"/>
            <path d="M48.0815 9.91846L9.91846 48.0815" stroke={color} strokeWidth="4" strokeLinecap="round"/>
            <path d="M48.0815 48.0815L9.91846 9.91846" stroke={color} strokeWidth="4" strokeLinecap="round"/>
          </svg>
        );
      
      case "circles":
        return (
          <svg width={width} height={height} viewBox="0 0 56 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
            <circle cx="28" cy="12" r="10" stroke={color} strokeWidth="4"/>
            <circle cx="28" cy="52" r="10" stroke={color} strokeWidth="4"/>
            <circle cx="12" cy="32" r="10" stroke={color} strokeWidth="4"/>
            <circle cx="44" cy="32" r="10" stroke={color} strokeWidth="4"/>
          </svg>
        );
      
      case "horizontal-loops":
        return (
          <svg width={width} height={height} viewBox="0 0 60 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
            <path d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z" stroke={color} strokeWidth="4"/>
            <path d="M38 12C38 6.47715 42.4772 2 48 2C53.5228 2 58 6.47715 58 12C58 17.5228 53.5228 22 48 22C42.4772 22 38 17.5228 38 12Z" stroke={color} strokeWidth="4"/>
            <path d="M2 52C2 46.4772 6.47715 42 12 42C17.5228 42 22 46.4772 22 52C22 57.5228 17.5228 62 12 62C6.47715 62 2 57.5228 2 52Z" stroke={color} strokeWidth="4"/>
            <path d="M38 52C38 46.4772 42.4772 42 48 42C53.5228 42 58 46.4772 58 52C58 57.5228 53.5228 62 48 62C42.4772 62 38 57.5228 38 52Z" stroke={color} strokeWidth="4"/>
            <path d="M22 12H38" stroke={color} strokeWidth="4"/>
            <path d="M22 52H38" stroke={color} strokeWidth="4"/>
          </svg>
        );
      
      case "basic-arrow-05":
        return (
          <svg width={width} height={height} viewBox="0 0 115 104" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
            <path d="M2 2C2 2 113 2 113 52C113 102 2 102 2 102" stroke={color} strokeWidth="4" strokeLinecap="round"/>
            <path d="M22 82L2 102L22 122" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      
      case "basic-check-01":
        return (
          <svg width={width} height={height} viewBox="0 0 43 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
            <path d="M2 32L15 45L41 19" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      
      case "three-arrows-bended":
        return (
          <svg width={width} height={height} viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
            <path d="M2 12C2 12 12 2 22 12C32 22 38 12 38 12" stroke={color} strokeWidth="4" strokeLinecap="round"/>
            <path d="M2 24C2 24 12 14 22 24C32 34 38 24 38 24" stroke={color} strokeWidth="4" strokeLinecap="round"/>
            <path d="M2 36C2 36 12 26 22 36C32 46 38 36 38 36" stroke={color} strokeWidth="4" strokeLinecap="round"/>
          </svg>
        );
      
      default:
        return null;
    }
  };
  
  return renderSquiggle();
};

export default Squiggles;
