import React from "react";
import { Colors } from "../styles";

interface MenuBackgroundProps {
  children: React.ReactNode;
  yAdjustment?: number;
  anchorToPointContent?: {
    content: React.ReactNode;
    yAdjustment?: number;
  };
  isBottomStart?: boolean;
  whiteBackground?: boolean;
}

/**
 * MenuBackground - A component for creating a gradient background for menus
 * 
 * This component creates a gradient background that can be positioned at the top or bottom
 * of the screen. It can also anchor content to a specific point in the gradient.
 * 
 * @param children - The content to display on top of the background
 * @param yAdjustment - Vertical adjustment for the gradient background
 * @param anchorToPointContent - Content to anchor to a specific point in the gradient
 * @param isBottomStart - Whether the gradient should start from the bottom
 * @param whiteBackground - Whether to use a white background instead of a gradient
 */
const MenuBackground: React.FC<MenuBackgroundProps> = ({
  children,
  anchorToPointContent,
  yAdjustment = 0,
  isBottomStart = false,
  whiteBackground = false,
}) => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: Colors.WHITE,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: isBottomStart ? "80%" : "25%",
          top: isBottomStart ? "auto" : 0,
          bottom: isBottomStart ? 0 : "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: isBottomStart ? "flex-end" : "flex-start",
          transform: `scaleY(${isBottomStart ? 1 : -1}) scaleX(${isBottomStart ? 1 : -1})`,
          zIndex: 0,
        }}
      >
        {!whiteBackground && (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #C3B7FF 0%, #6FF9D8 100%)",
              transform: `translateY(${yAdjustment}px)`,
              clipPath: "polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)",
            }}
          />
        )}
        
        {anchorToPointContent && (
          <div
            style={{
              position: "absolute",
              transform: `translateY(${anchorToPointContent.yAdjustment || 0}px) scaleY(-1) scaleX(-1)`,
            }}
          >
            {anchorToPointContent.content}
          </div>
        )}
      </div>
      
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default MenuBackground;
