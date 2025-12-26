import React from "react";
import { Colors, Typography } from "../styles";
import CustomText from "./CustomText";
import Icon from "./Icon";
import { PRIORITY_ITEMS } from "../util/constants";
import { useLanguageContext } from "../context/LanguageContext";

interface PrioritySelectionViewProps {
  currentPriority: number;
  onSelect: (value: number) => void;
}

/**
 * PrioritySelectionView - A component for selecting task priority
 *
 * This component displays a row of flag icons with different colors representing
 * different priority levels. The user can select a priority by clicking on a flag.
 *
 * @param currentPriority - The currently selected priority level (1-4)
 * @param onSelect - Callback function when a priority is selected
 */
const PrioritySelectionView: React.FC<PrioritySelectionViewProps> = ({
  currentPriority,
  onSelect,
}) => {
  const { i18n } = useLanguageContext();

  return (
    <div
      style={{
        marginTop: "10px",
        marginBottom: "10px",
        gap: "10px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Icon name="flag" width={24} height={24} color={Colors.BLACK} />

      <CustomText
        style={{
          color: Colors.PEARL,
          fontSize: Typography.FONT_SIZE_16,
          fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
        }}
      >
        {i18n.t("Priority")}
      </CustomText>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          gap: "10px",
          marginLeft: "20%",
        }}
      >
        {PRIORITY_ITEMS.map((item) => (
          <div
            key={item.value}
            onClick={() => onSelect(item.value)}
            style={{
              backgroundColor:
                currentPriority === item.value
                  ? item.selectionColor
                  : "transparent",
              borderRadius: "5px",
              cursor: "pointer",
              padding: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name="flag"
              width={20}
              height={20}
              color={item.iconColor}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrioritySelectionView;
