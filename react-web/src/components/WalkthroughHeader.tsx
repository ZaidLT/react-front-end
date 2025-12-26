import React from "react";
import { Colors, Typography } from "../styles";
import CustomText from "./CustomText";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * WalkthroughHeader - A header component for walkthrough screens
 * 
 * This component displays a title and optional subtitle for walkthrough screens.
 * 
 * @param title - The main title text
 * @param subtitle - Optional subtitle text
 */
const WalkthroughHeader: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <div style={styles.container}>
      <CustomText style={styles.title}>{title}</CustomText>
      {subtitle && <CustomText style={styles.subtitle}>{subtitle}</CustomText>}
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "10%",
    marginBottom: "5%",
    width: "100%",
  },
  title: {
    fontSize: Typography.FONT_SIZE_24,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.WHITE,
    textAlign: "center",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.WHITE,
    textAlign: "center",
    opacity: 0.8,
  },
};

export default WalkthroughHeader;
