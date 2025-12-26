import React from "react";
import { Colors, Typography } from "../styles";

interface FilterChipProps {
  label: string;
  onRemove: () => void;
  pillColor?: string; // optional if we want them color-coded
}

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  onRemove,
  pillColor = Colors.POLAR,
}) => {
  return (
    <div 
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderRadius: "24px",
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "9px",
        paddingBottom: "9px",
        backgroundColor: pillColor,
      }}
    >
      <span
        style={{
          fontSize: Typography.FONT_SIZE_14,
          marginRight: "6px",
          fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
          color: Colors.PRIMARY_ELECTRIC_BLUE,
        }}
      >
        {label}
      </span>
      <button
        onClick={onRemove}
        style={{
          height: "16px",
          width: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          backgroundColor: Colors.PRIMARY_ELECTRIC_BLUE,
          borderRadius: "9999px",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        <span
          style={{
            lineHeight: `${Typography.FONT_SIZE_18}px`,
            fontSize: Typography.FONT_SIZE_14,
            fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
            color: "#DEF7F6",
          }}
        >
          ×
        </span>
      </button>
    </div>
  );
};

export default FilterChip;
