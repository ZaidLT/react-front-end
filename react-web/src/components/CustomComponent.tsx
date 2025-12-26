import React from "react";

export interface CustomComponentProps {
  componentText: React.ReactNode;
  pointingArrow?: React.ReactNode;
  additionalStyle?: React.CSSProperties;
  tileToShow?: string;
}

/**
 * CustomComponent - A flexible container component for walkthrough content
 * 
 * This component serves as a container for custom content in walkthrough screens.
 * It can display text content and pointing arrows with custom styling.
 * 
 * @param componentText - The main content to display
 * @param pointingArrow - Optional arrow element to point to UI elements
 * @param additionalStyle - Optional additional styling
 * @param tileToShow - Optional identifier for a tile to highlight
 */
const CustomComponent: React.FC<CustomComponentProps> = ({
  componentText,
  additionalStyle,
  pointingArrow,
  // tileToShow,
}) => {
  return (
    <div style={additionalStyle}>
      {componentText}
      {pointingArrow}
    </div>
  );
};

export default CustomComponent;
