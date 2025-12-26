import React, { useState, useEffect } from "react";
import { Colors, Typography } from "../styles";
import { useLanguageContext } from "../context/LanguageContext";
import CustomText from "./CustomText";
import Icon from "./Icon";
import HiveHexTile from "./HiveHexTile";

/**
 * OnboardingIntroHome - A component for the home screen in the onboarding flow
 *
 * This component displays information about hives and hexes in the home tab.
 */
const OnboardingIntroHome: React.FC = () => {
  const { i18n } = useLanguageContext();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSmallDevice, setIsSmallDevice] = useState(false);

  useEffect(() => {
    // Only access window in the browser environment
    if (typeof window !== 'undefined') {
      setIsSmallDevice(window.innerHeight < 804);
    }
  }, []);

  return (
    <>
      <CustomText style={styles.title}>{i18n.t("NoPlaceLikeHome")}</CustomText>
      <div style={styles.pillsContainer}>
        <div style={{...styles.pill, maxWidth: "276px", alignSelf: "flex-end"}}>
          <CustomText style={{...styles.pillText, fontSize: Typography.FONT_SIZE_16}}>
            {i18n.t("TheseAreHivesTheMainPlaceAllYourImportantStuffGetsStoredInYourHomeTab")}
          </CustomText>
        </div>

        <div style={styles.hexContainer}>
          <HiveHexTile
            noBorderTile
            content={{
              icon: "house",
              title: i18n.t("House"),
            }}
            width={135}
            height={152}
          />
          <div style={styles.hiveHexes}>
            <Icon name="hive-hexes" width={180} height={200} />
          </div>
        </div>

        <div style={{...styles.pill, maxWidth: "216px", alignSelf: "flex-start"}}>
          <CustomText style={{...styles.pillText, fontSize: Typography.FONT_SIZE_16}}>
            {i18n.t("AndTheseAreHexesTheyAreTheWayYourHivesAreOrganized")}
          </CustomText>
        </div>

        {/* Floating Objects */}
        <div style={{...styles.floatingObject, ...styles.floatingObject1}}>
          <Icon name="squiggles-bended-arrow" width={124} height={200} />
        </div>
        <div style={{...styles.floatingObject, ...styles.floatingObject2}}>
          <Icon name="squiggles-burst" width={58} height={58} />
        </div>
        <div style={{...styles.floatingObject, ...styles.floatingObject3}}>
          <Icon name="beeva-clear" width={50} height={64} />
        </div>
        <div style={{...styles.floatingObject, ...styles.floatingObject4}}>
          <Icon name="squiggles-basic-arrow-05" width={115} height={104} color={Colors.SECONDARY_PURPLE} />
        </div>
      </div>
    </>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  title: {
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    fontSize: Typography.FONT_SIZE_32,
    fontWeight: "400",
    color: Colors.WHITE,
    marginBottom: "10px",
    textAlign: "center",
  },
  subtitle: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
    fontSize: Typography.FONT_SIZE_24,
    fontWeight: "400",
    color: Colors.BLUE_GREY,
    textAlign: "center",
    lineHeight: "30px",
  },
  // Pills
  pillsContainer: {
    width: "100%",
    height: "auto",
    gap: "20px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  pill: {
    width: "100%",
    height: "auto",
    minHeight: "60px",
    backgroundColor: Colors.WHITE,
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px 12px",
  },
  pillText: {
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    fontSize: Typography.FONT_SIZE_20,
    fontWeight: "400",
    color: Colors.PRIMARY_ELECTRIC_BLUE,
    textAlign: "center",
  },
  pillTextBold: {
    fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
    fontWeight: "600",
  },
  // Floating objects
  floatingObject: {
    position: "absolute",
  },
  floatingObject1: {
    top: "-32px",
    left: "8px",
    zIndex: -1,
  },
  floatingObject2: {
    top: "152px",
    right: "68px",
    zIndex: -1,
  },
  floatingObject3: {
    top: "264px",
    left: "12px",
    transform: "rotateY(180deg)",
  },
  floatingObject4: {
    bottom: "74px",
    left: "24px",
    zIndex: -1,
  },
  hexContainer: {
    display: "flex",
    flexDirection: "row",
    position: "relative",
    maxHeight: "280px",
    height: "280px",
    marginLeft: "40px",
    marginRight: "40px",
  },
  hiveHexes: {
    position: "absolute",
    top: "52px",
    right: "52px",
  }
};

export default OnboardingIntroHome;
