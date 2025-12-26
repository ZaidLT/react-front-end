import React from "react";
import { Colors } from "../styles";

interface HexagonWithImageProps {
  size?: number;
  imageUrl?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  onClick?: () => void;
  children?: React.ReactNode;
  text?: string;
  source?: string;
}

/**
 * HexagonWithImage - A hexagonal component that can display an image or children
 *
 * This component creates a hexagon shape using CSS clip-path and can display
 * either an image or children content inside it.
 *
 * @param size - The size of the hexagon (default: 100)
 * @param imageUrl - URL of the image to display inside the hexagon
 * @param backgroundColor - Background color of the hexagon (default: white)
 * @param borderColor - Border color of the hexagon (default: light grey)
 * @param borderWidth - Border width of the hexagon (default: 1)
 * @param onClick - Callback function when the hexagon is clicked
 * @param children - Content to display inside the hexagon
 */
const HexagonWithImage: React.FC<HexagonWithImageProps> = ({
  size = 100,
  imageUrl,
  backgroundColor = Colors.WHITE,
  borderColor = Colors.LIGHT_GREY,
  borderWidth = 1,
  onClick,
  children,
  text,
  source,
}) => {
  // If source is provided, use it as imageUrl
  const finalImageUrl = source || imageUrl;
  // Calculate the height of the hexagon (height = width * 0.866)
  const height = size * 0.866;

  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: height,
        position: "relative",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {/* Hexagon shape with border */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          backgroundColor: borderColor,
        }}
      />

      {/* Inner hexagon (slightly smaller to create border effect) */}
      <div
        style={{
          position: "absolute",
          top: borderWidth,
          left: borderWidth,
          width: `calc(100% - ${borderWidth * 2}px)`,
          height: `calc(100% - ${borderWidth * 2}px)`,
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          backgroundColor: backgroundColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {finalImageUrl ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: `url(${finalImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ) : text ? (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            color: Colors.WHITE,
            fontSize: size * 0.4,
            fontWeight: "bold",
          }}>
            {text}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default HexagonWithImage;
