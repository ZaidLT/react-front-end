import React from "react";
import { Colors, Typography } from "../styles";
import { IDentToggleOptions } from "../util/types";
import Toggle from "./Toggle";
import CustomText from "./CustomText";

interface ITimelineTaskToggleProps {
  isCompleted: boolean;
  setIsCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  task?: any;
  options?: IDentToggleOptions;
  onToggle?: (isCompleted: boolean) => void;
}

const TimelineTaskToggle: React.FC<ITimelineTaskToggleProps> = ({
  isCompleted,
  setIsCompleted,
  options,
  onToggle,
}) => {
  // Simplified translation function (to be replaced with proper i18n)
  const translate = (key: string) => key;

  return (
    <div
      onClick={(e) => {
        // Prevent event propagation to avoid triggering parent card's onClick
        e.stopPropagation();
        // Toggle the completion state
        const newCompletedState = !isCompleted;
        setIsCompleted(newCompletedState);

        // Notify parent component for API call
        if (onToggle) {
          onToggle(newCompletedState);
        }
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
  );
};

export default TimelineTaskToggle;
