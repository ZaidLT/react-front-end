import React from "react";
import { Colors, Typography } from "../styles";
import { useLanguageContext } from "../context/LanguageContext";
import CustomText from "./CustomText";
import Icon from "./Icon";

/**
 * PrivacyMenuItem - A component for displaying privacy options in menus
 *
 * This component displays a privacy option with an icon and text.
 */
interface PrivacyMenuItemProps {
  isSelected: boolean;
  onPress: () => void;
  icon: string;
  title: string;
  description: string;
}

const PrivacyMenuItem: React.FC<PrivacyMenuItemProps> = ({
  isSelected,
  onPress,
  icon,
  title,
  description,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { i18n } = useLanguageContext();

  return (
    <div
      style={{
        ...styles.container,
        ...(isSelected && styles.selectedContainer),
      }}
      onClick={onPress}
    >
      <div style={styles.iconContainer}>
        <Icon
          name={icon}
          width={24}
          height={24}
          color={isSelected ? Colors.WHITE : Colors.BLUE}
        />
      </div>

      <div style={styles.textContainer}>
        <CustomText
          style={{
            ...styles.title,
            ...(isSelected && styles.selectedTitle),
          }}
        >
          {title}
        </CustomText>

        <CustomText
          style={{
            ...styles.description,
            ...(isSelected && styles.selectedDescription),
          }}
        >
          {description}
        </CustomText>
      </div>

      {isSelected && (
        <div style={styles.checkmarkContainer}>
          <Icon name="checkmark" width={24} height={24} color={Colors.WHITE} />
        </div>
      )}
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "16px",
    borderRadius: "8px",
    backgroundColor: Colors.WHITE,
    marginBottom: "10px",
    cursor: "pointer",
    border: `1px solid ${Colors.LIGHT_GREY}`,
  },
  selectedContainer: {
    backgroundColor: Colors.BLUE,
    border: `1px solid ${Colors.BLUE}`,
  },
  iconContainer: {
    marginRight: "16px",
  },
  textContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: Typography.FONT_SIZE_16,
    fontWeight: "600",
    color: Colors.BLUE,
    marginBottom: "4px",
  },
  selectedTitle: {
    color: Colors.WHITE,
  },
  description: {
    fontSize: Typography.FONT_SIZE_14,
    color: Colors.GREY_COLOR,
  },
  selectedDescription: {
    color: Colors.WHITE,
  },
  checkmarkContainer: {
    marginLeft: "16px",
  },
};

export default PrivacyMenuItem;
