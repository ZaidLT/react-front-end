import React from "react";
import { Colors } from "../styles";

interface HorizontalLineProps {
  color?: string;
}

const HorizontalLine: React.FC<HorizontalLineProps> = ({
  color = Colors.WHITE,
}) => {
  return <div style={{ backgroundColor: color, width: "100%", height: "1px" }} />;
};

export default HorizontalLine;
