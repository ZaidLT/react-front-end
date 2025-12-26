import React from "react";
import { Colors } from "../styles";
import { CheckmarkIcon } from "./SVGIcons";

interface IItemSelectionBoxProps {
  isSelected: boolean;
  onChange?: (isSelected: boolean) => void;
}

/**
 * ItemSelectionBox - A checkbox-like component for item selection
 *
 * This component displays a square box that can be selected or unselected.
 * When selected, it shows a checkmark icon.
 *
 * @param isSelected - Whether the item is selected
 * @param onChange - Callback for when the selection state changes
 */
const ItemSelectionBox: React.FC<IItemSelectionBoxProps> = ({
  isSelected,
  onChange
}) => {
  const handleClick = () => {
    if (onChange) {
      onChange(!isSelected);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        width: "18px",
        height: "18px",
        border: `1px solid ${Colors.GREY_COLOR}`,
        backgroundColor: isSelected ? Colors.GREY_COLOR : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: onChange ? "pointer" : "default",
      }}
    >
      {isSelected && (
        <CheckmarkIcon width={18} height={18} color={Colors.WHITE} />
      )}
    </div>
  );
};

export default ItemSelectionBox;
