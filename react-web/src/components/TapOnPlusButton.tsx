import React from "react";
import { Colors, Typography } from "../styles";
import CustomText from "./CustomText";
import Icon from "./Icon";

/**
 * TapOnPlusButton - A component for the plus button walkthrough
 * 
 * This component displays instructions for using the plus button
 * with an arrow pointing to the relevant UI element.
 */
const TapOnPlusButton: React.FC = () => {
  return (
    <div style={styles.container}>
      <CustomText style={styles.text}>
        <span style={styles.textRegular}>
          Alright let's set up your{" "}
        </span>
        <span style={styles.textBold}>
          property papers!
        </span>
        <span style={styles.textRegular}> Tap here to start.</span>
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
    alignItems: "flex-end",
    justifyContent: "flex-end",
    marginBottom: "50%",
    position: "relative",
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
    right: "-10%",
    bottom: "-30%",
  },
};

export default TapOnPlusButton;
