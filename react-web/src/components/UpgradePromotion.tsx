import React from "react";
import { Colors, Typography } from "../styles";
import CustomText from "./CustomText";
import { PlusIcon } from "./SVGIcons";

interface UpgradePromotionProps {
  onPress?: () => void;
}

/**
 * UpgradePromotion - A component for promoting premium features
 *
 * This component displays a promotional card with a rocket emoji, text, and an arrow button.
 *
 * @param onPress - Callback for when the promotion is clicked
 */
const UpgradePromotion: React.FC<UpgradePromotionProps> = ({ onPress }) => {
  return (
    <div
      style={styles.container}
      onClick={onPress}
    >
      <div style={styles.rocketText}>🚀</div>
      <div style={styles.textContainer}>
        <CustomText style={styles.promotionText}>
          {`Elevate your experience `}
          <span style={{ fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR }}>
            {`today by taking it to the `}
          </span>
          <span style={{ fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD }}>next plane.</span>
        </CustomText>
      </div>

      <div
        style={styles.circularArrowButton}
        onClick={(e) => {
          e.stopPropagation();
          onPress && onPress();
        }}
      >
        <PlusIcon height={32} width={32} color={Colors.BLUE} />
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: Colors.FOAM,
    borderRadius: 20,
    width: 350,
    height: 105,
    alignSelf: "center" as const,
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
    position: "relative" as const,
    cursor: "pointer",
  },
  rocketText: {
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    fontSize: Typography.FONT_SIZE_24,
    marginLeft: "5%",
    marginRight: "5%",
  },
  textContainer: {
    flex: 1,
    paddingRight: 40, // Make room for the arrow button
  },
  promotionText: {
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    fontSize: Typography.FONT_SIZE_14,
    flexWrap: "wrap" as const,
  },
  circularArrowButton: {
    position: "absolute" as const,
    right: 10,
    bottom: 10,
    cursor: "pointer",
  },
};

export default UpgradePromotion;
