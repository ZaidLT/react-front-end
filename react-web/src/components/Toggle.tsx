import React from "react";
import { Colors } from "../styles";

interface ToggleProps {
  isActive?: boolean;
  containerStyle?: React.CSSProperties;
  thumbStyle?: React.CSSProperties;
}

const Toggle: React.FC<ToggleProps> = ({ isActive, containerStyle, thumbStyle }) => {
  return (
    <div 
      style={{
        width: "30px",
        height: "15px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: Colors.BLUE,
        borderRadius: "20px",
        position: "relative",
        ...containerStyle,
      }}
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "10px",
          margin: "2.5px",
          backgroundColor: Colors.BLUE,
          position: "absolute",
          left: isActive ? "auto" : "0",
          right: isActive ? "0" : "auto",
          ...thumbStyle,
        }}
      />
    </div>
  );
};

export default Toggle;
