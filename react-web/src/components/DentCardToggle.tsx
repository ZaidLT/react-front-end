import React from "react";
import { Colors, Typography } from "../styles";
import { IDentToggleOptions } from "../util/types";
import Toggle from "./Toggle";
import CustomText from "./CustomText";

interface IDentCardToggleProps {
  isCompleted: boolean;
  setIsCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  eventTimeId?: string;
  task?: any;
  options?: IDentToggleOptions;
}

const DentCardToggle: React.FC<IDentCardToggleProps> = ({
  isCompleted,
  setIsCompleted,
  options,
}) => {
  // Simplified translation function (to be replaced with proper i18n)
  const translate = (key: string) => key;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <CustomText
        style={{
          fontSize: Typography.FONT_SIZE_10,
          fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
          color: Colors.PRIMARY_DARK_BLUE,
          opacity: 0.4,
        }}
      >
        {isCompleted
          ? options?.text?.activeText ?? translate("Complete")
          : options?.text?.inactiveText ?? translate("Incomplete")}
      </CustomText>
      <div
        onClick={(e) => {
          // Prevent event propagation to avoid triggering parent card's onClick
          e.stopPropagation();
          // Toggle the completion state
          setIsCompleted(!isCompleted);
        }}
        style={{ cursor: "pointer" }}
      >
        <Toggle
          isActive={isCompleted}
          containerStyle={{
            width: "40px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderColor: isCompleted
              ? options?.color?.activeColor ?? Colors.PISTACHIO_GREEN
              : options?.color?.inactiveColor ?? "#AAAAAA",
            backgroundColor: isCompleted
              ? options?.color?.activeColor ?? Colors.PISTACHIO_GREEN
              : options?.color?.inactiveColor ?? "#AAAAAA",
            zIndex: 6,
          }}
          thumbStyle={{
            width: "15px",
            height: "15px",
            backgroundColor: Colors.WHITE,
            borderRadius: "30px",
            margin: "0 2px",
          }}
        />
      </div>
    </div>
  );
};

export default DentCardToggle;
