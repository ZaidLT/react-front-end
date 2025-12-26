'use client';

import React, { useState, useEffect } from "react";
import { Colors, Typography } from "../styles";
import { useLanguageContext } from "../context/LanguageContext";
import CustomText from "./CustomText";
import Icon from "./Icon";

/**
 * OnboardingIntroWelcome - A component for the welcome screen in the onboarding flow
 *
 * This component displays a welcome message with animated elements and pills
 * describing the app's features.
 */
const OnboardingIntroWelcome: React.FC = () => {
  const { i18n } = useLanguageContext();
  // Initialize with a default value
  const [isSmallDevice, setIsSmallDevice] = useState(false);

  // Update the value on the client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSmallDevice(window.innerHeight < 804);
    }
  }, []);

  return (
    <>
      <CustomText style={styles.title}>{i18n.t("WelcomeFriend")}</CustomText>
      <div style={styles.eevasContainer}>
        <div style={styles.ovalIcon}>
          <Icon name="squiggles-oval" width={70} height={28} />
        </div>
        <CustomText style={styles.subtitle}>
          {i18n.t("EevaIsAboutToMakeAdultingMuchEasierForYou")}
        </CustomText>
      </div>

      {/* Pills */}
      <div style={styles.pillsContainer}>
        <div style={{...styles.pill, maxWidth: "240px"}}>
          <CustomText style={styles.pillText}>{i18n.t("ManageYourHome")}</CustomText>
        </div>
        <div style={{...styles.pill, maxWidth: "216px", alignSelf: "flex-end"}}>
          <CustomText style={styles.pillText}>{i18n.t("OrganizeYourLife")}</CustomText>
        </div>
        <div style={styles.pill}>
          <CustomText style={styles.pillText}>
            {i18n.t("CollaborateWithYourPeople")}
          </CustomText>
        </div>

        {/* Floating objects */}
        <div style={{...styles.floatingObject, ...styles.floatingObject1}}>
          <Icon name="squiggles-basic-star-02" width={50} height={64} color={Colors.AQUA} />
        </div>
        <div style={{...styles.floatingObject, ...styles.floatingObject2}}>
          <Icon name="beeva-clear" width={84} height={108} />
        </div>
        <div style={{...styles.floatingObject, ...styles.floatingObject3}}>
          <Icon name="squiggles-basic-loops-03" width={40} height={64} color={Colors.POLAR} />
        </div>
      </div>
      <div style={styles.lineThroughContainer}>
        <div style={styles.lineThrough}>
          <Icon name="squiggles-basic-line" width={190} height={26} />
        </div>
        <CustomText style={styles.subtitle}>{i18n.t("InOnePowerfulPlatform")}</CustomText>
      </div>
    </>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  title: {
    fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
    fontSize: Typography.FONT_SIZE_32,
    fontWeight: "600",
    color: Colors.WHITE,
    marginBottom: "12px",
    textAlign: "center",
  },
  subtitle: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    fontSize: Typography.FONT_SIZE_22,
    fontWeight: "400",
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.BLUE_GREY,
    textAlign: "center",
    lineHeight: "30px",
  },
  eevasContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    marginLeft: "auto",
    marginRight: "auto",
    width: "88%",
  },
  ovalIcon: {
    position: "absolute",
    top: "0",
    left: "16px",
    zIndex: -1,
  },
  lineThrough: {
    position: "absolute",
    top: "10px",
    right: "36px",
    zIndex: -1,
  },
  // Pills
  pillsContainer: {
    width: "100%",
    marginTop: "8px",
    marginBottom: "8px",
    paddingTop: "48px",
    display: "flex",
    flexDirection: "column",
    gap: "40px",
    position: "relative",
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
  },
  pillText: {
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    fontSize: Typography.FONT_SIZE_20,
    fontWeight: "400",
    color: Colors.PRIMARY_ELECTRIC_BLUE,
    padding: "10px",
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
    top: "2px",
    left: "1px",
    zIndex: -1,
    transform: "rotate(45deg)",
  },
  floatingObject2: {
    top: "2px",
    right: "1px",
  },
  floatingObject3: {
    top: "160px",
    left: "36px",
    transform: "rotate(10deg)",
  },
  lineThroughContainer: {
    position: "relative",
    marginTop: "55px",
  },
};

export default OnboardingIntroWelcome;
