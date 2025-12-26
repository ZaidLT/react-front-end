import React from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Colors, Typography } from "../styles";
import Button from "./Button";
import { useLanguageContext } from "../context/LanguageContext";

interface WalkthroughWithMaskedAreaProps {
  zIndex?: number;
  content: {
    topComponent: React.ReactNode;
    bottomComponent: React.ReactNode;
    maskWidth: number;
    maskHeight: number;
    topMaskHeight: number;
    bottomMaskHeight: number;
  };
  stepData?: {
    actionButtons?: Array<{
      textProps: {
        text: string;
        [key: string]: any;
      };
      buttonWidth?: string;
      backgroundColor?: string;
      borderProps?: {
        width?: number;
        radius?: number;
        color?: string;
      };
      onPress: () => void;
    }>;
  };
  nextStep?: () => void;
  setTileData?: (data: any) => void;
  setCategory?: (category: string | null) => void;
}

/**
 * WalkthroughWithMaskedArea - A component for creating masked walkthrough screens
 *
 * This component creates a walkthrough screen with masked areas at the top and bottom,
 * leaving the middle area visible for interaction. It includes action buttons and
 * custom content for the masked areas.
 *
 * @param zIndex - Z-index for the component
 * @param content - Configuration for the masked areas and content
 * @param stepData - Data for the current walkthrough step
 * @param nextStep - Function to advance to the next step
 * @param setTileData - Function to set tile data
 * @param setCategory - Function to set the current category
 */
const WalkthroughWithMaskedArea: React.FC<WalkthroughWithMaskedAreaProps> = ({
  zIndex = 120,
  content,
  stepData = {},
  nextStep = () => {},
  setTileData = () => {},
  setCategory = () => {},
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { i18n } = useLanguageContext();

  // Calculate the heights for the top and bottom masked areas
  const topMaskedHeight = `${(content.topMaskHeight || 0.2) * 100}vh`; // Top 20%
  const bottomMaskedHeight = `${(content.bottomMaskHeight || 0.3) * 100}vh`; // Bottom 30%
  const middleVisibleHeight = `${(1 - (content.topMaskHeight || 0.2) - (content.bottomMaskHeight || 0.3)) * 100}vh`; // Middle 50%

  return (
    <div style={{...styles.container, zIndex}} onClick={(e) => e.stopPropagation()}>
      {/* Top masked area */}
      <div style={{...styles.mask, height: topMaskedHeight}}>
        {content.topComponent}
      </div>

      {/* Middle visible area - Allow interaction */}
      <div style={{height: middleVisibleHeight}} />

      {/* Bottom masked area */}
      <div style={{...styles.mask, height: bottomMaskedHeight}}>
        {content.bottomComponent}
        {stepData.actionButtons && (
          <div style={styles.actionButtonsContainer}>
            {stepData.actionButtons.map((actionButton) => (
              <Button
                key={actionButton.textProps.text}
                width={
                  actionButton.buttonWidth ? actionButton.buttonWidth : "90%"
                }
                height={50}
                textProps={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                  ...actionButton.textProps,
                  text: actionButton.textProps.text
                }}
                onButtonClick={() => {
                  nextStep();
                  setTileData(undefined);
                  actionButton.onPress();
                  if (actionButton.textProps.text === "Finish")
                    setCategory(null);
                }}
                backgroundColor={actionButton.backgroundColor}
                borderProps={{
                  width: 1,
                  radius: 10,
                  ...actionButton.borderProps,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
  mask: {
    width: "100%",
    backgroundColor: "rgba(0, 14, 80, 0.8)",
    backdropFilter: "blur(5px)",
  },
  actionButtonsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: "10%",
    width: "100%",
  },
};

export default WalkthroughWithMaskedArea;
