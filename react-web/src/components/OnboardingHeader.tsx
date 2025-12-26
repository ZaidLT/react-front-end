import React from "react";
import { Colors, Typography } from "../styles";
import HexagonWithImage from "./HexagonWithImage";
import { useLanguageContext } from "../context/LanguageContext";
import CustomText from "./CustomText";

interface OnboardingHeaderProps {
  heading: string;
  subheading?: string;
  iconText?: string;
  iconBackgroundColor?: string;
  onBackPress?: () => void;
}

/**
 * OnboardingHeader - A component for displaying headers in onboarding screens
 * 
 * This component displays a header with an optional back button, icon, and subheading.
 * 
 * @param heading - The main heading text
 * @param subheading - Optional subheading text
 * @param iconText - Optional text to display in the icon
 * @param iconBackgroundColor - Optional background color for the icon
 * @param onBackPress - Callback function when the back button is pressed
 */
const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  heading,
  subheading,
  iconText,
  iconBackgroundColor,
  onBackPress,
}) => {
  const { i18n } = useLanguageContext();

  return (
    <div style={styles.container}>
      <div onClick={onBackPress} style={styles.backButton}>
        <CustomText style={styles.backText}>{i18n.t("Back")}</CustomText>
      </div>
      
      {iconText && iconBackgroundColor && (
        <div style={styles.helpItemIconContainer}>
          <HexagonWithImage
            text={iconText}
            backgroundColor={iconBackgroundColor}
            source=""
          />
        </div>
      )}
      
      <CustomText style={{
        ...styles.headingText,
        marginTop: !iconText ? "20px" : undefined,
      }}>
        {heading}
      </CustomText>
      
      {subheading && (
        <CustomText style={styles.descText}>{subheading}</CustomText>
      )}
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
  },
  backButton: {
    cursor: "pointer",
  },
  backText: {
    fontSize: "16px",
    fontFamily: "Poppins-Regular",
    fontWeight: "400",
  },
  helpItemIconContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48px",
    height: "44px",
    marginTop: "20px",
    marginBottom: "20px",
  },
  headingText: {
    fontSize: Typography.FONT_SIZE_24,
    fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
    fontWeight: "600",
    color: Colors.BLUE,
  },
  descText: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    fontWeight: "400",
    color: Colors.BLUE,
    marginTop: "5%",
    marginBottom: "5%",
  },
};

export default OnboardingHeader;
