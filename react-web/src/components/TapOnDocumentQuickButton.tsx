import React from "react";
import { Colors, Typography } from "../styles";
import CustomText from "./CustomText";
import Icon from "./Icon";

/**
 * TapOnDocumentQuickButton - A component for the document quick button walkthrough
 * 
 * This component displays instructions for using the document quick button
 * with an arrow pointing to the relevant UI element.
 */
const TapOnDocumentQuickButton: React.FC = () => {
  return (
    <div style={styles.container}>
      <CustomText style={styles.text}>
        <span style={styles.textRegular}>
          Tap on the
        </span>
        <span style={styles.textBold}> quick button </span>
        <span style={styles.textRegular}>
          to add a document
        </span>
      </CustomText>
      <div style={styles.arrowContainer}>
        <Icon name="round-arrow" width={80} height={80} />
      </div>
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    position: "relative",
    marginTop: "20%",
  },
  text: {
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.WHITE,
  },
  textRegular: {
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
  },
  textBold: {
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
  },
  arrowContainer: {
    position: "absolute",
    left: "-10%",
    top: "30%",
  },
};

export default TapOnDocumentQuickButton;
