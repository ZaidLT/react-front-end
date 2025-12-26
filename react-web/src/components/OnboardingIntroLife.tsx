'use client';

import React, { useState, useEffect } from "react";
import { Colors, Typography } from "../styles";
import { useLanguageContext } from "../context/LanguageContext";
import CustomText from "./CustomText";
import Icon from "./Icon";

/**
 * OnboardingIntroLife - A component for the life screen in the onboarding flow
 *
 * This component displays information about the life tab and its features.
 */
const OnboardingIntroLife: React.FC = () => {
  const { i18n } = useLanguageContext();
  const [isSmallDevice, setIsSmallDevice] = useState(false);

  // Update isSmallDevice on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSmallDevice(window.innerHeight < 804);
    }
  }, []);

  const [dynamicWidth1, setDynamicWidth1] = useState(276);
  const [dynamicWidth2, setDynamicWidth2] = useState(240);

  // Function to handle text layout and adjust width
  const handleTextLayout = (text: string, setWidth: (width: number) => void) => {
    // Only run on client side
    if (typeof document === 'undefined') {
      return;
    }

    // Create a temporary element to measure text width
    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute';
    tempElement.style.visibility = 'hidden';
    tempElement.style.fontFamily = Typography.FONT_FAMILY_POPPINS_REGULAR;
    tempElement.style.fontSize = `${Typography.FONT_SIZE_16}px`;
    tempElement.style.whiteSpace = 'nowrap';
    tempElement.textContent = text;
    document.body.appendChild(tempElement);

    // Measure width and calculate new width
    const width = tempElement.offsetWidth;
    const newWidth = Math.min(
      390,
      Math.max(isSmallDevice ? 260 : 240, width + 40)
    );

    // Remove temporary element
    document.body.removeChild(tempElement);

    // Set new width
    setWidth(newWidth);
  };

  // Calculate widths on component mount
  useEffect(() => {
    handleTextLayout(
      i18n.t("YepAllTheseNowLiveInOnePlaceYourLifeTabNoMoreForgettinAndStressin"),
      setDynamicWidth1
    );
    handleTextLayout(
      i18n.t("AnytimeAndAnywhereJustTapThePlusMenuToAddSomethingNewAndFindItLaterInLife"),
      setDynamicWidth2
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n]);

  return (
    <>
      <CustomText style={{...styles.title, fontSize: Typography.FONT_SIZE_30}}>
        {i18n.t("GettingLifeInOrder")}
      </CustomText>
      <div style={styles.pillsContainer}>
        {/* First Pill */}
        <div style={{
          ...styles.pill,
          width: `${dynamicWidth1}px`,
          maxHeight: "120px",
          alignSelf: "flex-start"
        }}>
          <div style={styles.scrollView}>
            <CustomText
              style={{...styles.pillText, fontSize: Typography.FONT_SIZE_16}}
            >
              {i18n.t("YepAllTheseNowLiveInOnePlaceYourLifeTabNoMoreForgettinAndStressin")}
            </CustomText>
          </div>
        </div>

        {/* Plus Menu Section */}
        <div style={styles.plusMenuContainer}>
          <div style={styles.plusMenuPlaceholder}>
            <Icon name="plus" width={48} height={48} color={Colors.WHITE} />
            <CustomText style={styles.plusMenuText}>Plus Menu</CustomText>
          </div>
        </div>

        {/* Second Pill */}
        <div style={{
          ...styles.pill,
          width: `${dynamicWidth2}px`,
          maxHeight: "120px",
          alignSelf: "flex-end",
          position: "relative"
        }}>
          <div style={styles.scrollView}>
            <CustomText
              style={{...styles.pillText, fontSize: Typography.FONT_SIZE_16}}
            >
              {i18n.t("AnytimeAndAnywhereJustTapThePlusMenuToAddSomethingNewAndFindItLaterInLife")}
            </CustomText>
          </div>
          <div style={{...styles.floatingObject, ...styles.floatingObject2}}>
            <Icon name="three-arrows-bended" width={40} height={48} />
          </div>
        </div>

        {/* Floating Objects */}
        <div style={{...styles.floatingObject, ...styles.floatingObject1}}>
          <Icon name="squiggles-bended-arrow" width={124} height={200} />
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
    marginBottom: "12px",
    textAlign: "center",
  },
  pillsContainer: {
    width: "100%",
    marginTop: "8px",
    marginBottom: "8px",
    gap: "40px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  pill: {
    height: "auto",
    padding: "16px 14px",
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
  },
  pillTextBold: {
    fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
    fontWeight: "600",
  },
  scrollView: {
    overflow: "auto",
    width: "100%",
  },
  plusMenuContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  plusMenuPlaceholder: {
    width: "300px",
    height: "220px",
    margin: "0 auto",
    backgroundColor: Colors.BLUE,
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
  },
  plusMenuText: {
    color: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_20,
    fontWeight: "600",
  },
  floatingObject: {
    position: "absolute",
  },
  floatingObject1: {
    top: "0",
    right: "-2px",
    zIndex: -1,
    transform: "rotateY(180deg)",
  },
  floatingObject2: {
    bottom: "150px",
    right: "110px",
    zIndex: -1,
  },
};

export default OnboardingIntroLife;
