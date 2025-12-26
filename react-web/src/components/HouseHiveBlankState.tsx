import React from "react";
import { Colors, Typography } from "../styles";
import CustomText from "./CustomText";
import Button from "./Button";
import { HouseIcon } from "./SVGIcons";

interface IHouseHiveBlankStateProps {
  heading: string;
  subHeading: string;
  onButtonPress?: () => void;
  iconName?: string;
  buttonText?: string;
}

/**
 * HouseHiveBlankState - A component for displaying a blank state for house hives
 *
 * This component displays a blank state with an icon, heading, subheading, and optional button.
 *
 * @param heading - The main heading text
 * @param subHeading - The subheading text
 * @param onButtonPress - Callback for when the button is pressed
 * @param iconName - The name of the icon to display
 * @param buttonText - The text to display on the button
 */
const HouseHiveBlankState: React.FC<IHouseHiveBlankStateProps> = ({
  heading,
  subHeading,
  onButtonPress,
  iconName,
  buttonText,
}) => {
  return (
    <div style={styles.container}>
      {iconName && (
        <div style={styles.iconContainer}>
          <HouseIcon width={24} height={24} color={Colors.RED} />
        </div>
      )}
      <CustomText style={styles.headingText}>{heading}</CustomText>
      <CustomText style={styles.subText}>{subHeading}</CustomText>

      {buttonText && (
        <Button
          width="90%"
          textProps={{
            text: buttonText,
            fontSize: Typography.FONT_SIZE_16,
            color: Colors.WHITE,
            fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
          }}
          onButtonClick={() => {
            onButtonPress && onButtonPress();
          }}
          backgroundColor={Colors.BLUE}
          borderProps={{
            radius: 8,
            width: 1,
            color: Colors.BLUE,
          }}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: "10%",
    padding: "20px",
  },
  iconContainer: {
    backgroundColor: "rgba(250, 78, 78, 0.1)",
    width: 64,
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
  },
  headingText: {
    color: Colors.MIDNIGHT,
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
    textAlign: "center" as const,
  },
  subText: {
    color: Colors.MIDNIGHT,
    fontSize: Typography.FONT_SIZE_12,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    textAlign: "center" as const,
  },
};

export default HouseHiveBlankState;
