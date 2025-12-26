import React from "react";
import { Colors, Typography } from "../styles";
import CustomText from "./CustomText";
import { IFilterPill } from "../util/types";
import { useLanguageContext } from "../context/LanguageContext";

interface FilterPillProps {
  isSelected?: boolean;
  text: string; // untranslated key used for comparison
  originalText?: string; // preserve original key to send back onPress
  fixedWidth?: boolean;
  count?: number;
  onPress: (pill: IFilterPill) => void;
}

interface FilterPillsProps {
  pills: IFilterPill[];
  onPillSelected?: (selectedPill: IFilterPill) => void;
  leftOffset?: number;
  rightOffset?: number;
  setSelectedItemProp?: (text: string) => void;
}

const FilterPill: React.FC<FilterPillProps> = ({
  isSelected,
  text,
  originalText,
  onPress,
  fixedWidth = false,
  count
}) => {
  const { i18n } = useLanguageContext();
  return (
    <button
      onClick={() => onPress && onPress({ isSelected, text: originalText ?? text })}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: "15px",
        paddingRight: "15px",
        paddingTop: "5px",
        paddingBottom: "5px",
        border: `1px solid ${Colors.PRIMARY_ELECTRIC_BLUE}`,
        borderRadius: "39px",
        backgroundColor: isSelected ? Colors.PRIMARY_ELECTRIC_BLUE : "transparent",
        cursor: "pointer",
        outline: "none",
      }}
    >
      <div style={{
        display: "flex",
        flexDirection: "row",
        marginLeft: "5px",
        marginRight: "5px",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
      }}>
        <CustomText
          style={{
            color: isSelected ? Colors.WHITE : Colors.BLUE,
            fontSize: Typography.FONT_SIZE_12,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
          }}
        >
          {i18n.t(text as any)}
        </CustomText>
      </div>
    </button>
  );
};

const FilterPills: React.FC<FilterPillsProps> = ({
  pills,
  onPillSelected,
  leftOffset = 20,
  rightOffset = 20,
  setSelectedItemProp,
}) => {
  const { i18n } = useLanguageContext();
  const translateText = (text: string) => i18n.t(text as any);

  return (
    <div
      style={{
        width: "100%",
        maxHeight: "34px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: `${leftOffset}px`,
        paddingRight: `${rightOffset}px`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          flexWrap: "nowrap",
        }}
      >
        {pills.map((pill, index) => (
          <FilterPill
            key={`${pill.text}-${index}=${pill.isSelected}`}
            isSelected={pill.isSelected}
            text={translateText(pill.text)}
            originalText={pill.text}
            fixedWidth={pill.fixedWidth}
            count={pill.count}
            onPress={(pill) => {
              setSelectedItemProp && setSelectedItemProp("");
              return onPillSelected && onPillSelected(pill);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default FilterPills;
