import React from "react";
import { Colors, Typography } from "../styles";
import Toggle from "./Toggle";
import { useLanguageContext } from "../context/LanguageContext";
import CustomText from "./CustomText";

interface MyHiveToggleViewProps {
  isActive: boolean;
  onTogglePress?: () => void;
  label?: string; // Optional custom label
}

/**
 * MyHiveToggleView - A component for toggling whether a contact is in "My Hive"
 * 
 * This component displays a toggle switch with a label for adding contacts to "My Hive".
 * 
 * @param isActive - Whether the toggle is active
 * @param onTogglePress - Callback function when the toggle is pressed
 */
const MyHiveToggleView: React.FC<MyHiveToggleViewProps> = ({
  isActive,
  onTogglePress,
  label,
}) => {
  const { i18n } = useLanguageContext();

  return (
    <div style={styles.myHiveToggleViewContainer}>
      <div style={styles.myHiveToggleViewHeadingContainer}>
        <CustomText style={styles.sectionHeadingContainer}>
          {label || i18n.t("AddToMyHive")}
        </CustomText>
        <div onClick={onTogglePress}>
          <Toggle
            isActive={isActive}
            containerStyle={{
              ...styles.toggleContainer,
              borderColor: isActive ? "#2DBE2A" : "#E6E6E6",
              backgroundColor: isActive ? "#2DBE2A" : "#E6E6E6",
            }}
            thumbStyle={styles.toggleThumb}
          />
        </div>
      </div>
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  myHiveToggleViewContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  myHiveToggleViewHeadingContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  toggleContainer: {
    width: "40px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    cursor: "pointer",
  },
  toggleThumb: {
    width: "16px",
    height: "16px",
    backgroundColor: Colors.WHITE,
    borderRadius: "10px",
    margin: "0 2px",
  },
  inMyHiveText: {
    fontSize: Typography.FONT_SIZE_12,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREY_COLOR,
  },
  sectionHeadingContainer: {
    flex: 1,
    color: '#000E50',
    fontFamily: 'Poppins',
    fontSize: '18px',
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: '100%', /* 18px */
  },
};

export default MyHiveToggleView;
