import React, { useState, useEffect } from "react";
import { Colors, Typography } from "../styles";
import { useLanguageContext } from "../context/LanguageContext";
import CustomText from "./CustomText";
import Icon from "./Icon";

/**
 * OnboardingIntroTime - A component for the time screen in the onboarding flow
 *
 * This component displays information about the time management features in the app.
 */
const OnboardingIntroTime: React.FC = () => {
  const { i18n } = useLanguageContext();

  const [dynamicWidth1, setDynamicWidth1] = useState(240);
  const [dynamicWidth2, setDynamicWidth2] = useState(240);
  const [dynamicWidth3, setDynamicWidth3] = useState(240);

  // Function to handle text layout and adjust width
  const handleTextLayout = (text: string, setWidth: (width: number) => void) => {
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
      Math.max(240, width + 40)
    );

    // Remove temporary element
    document.body.removeChild(tempElement);

    // Set new width
    setWidth(newWidth);
  };

  // Calculate widths on component mount
  useEffect(() => {
    handleTextLayout(
      i18n.t("SyncYourCalendarsAndShareThemWithYourHive"),
      setDynamicWidth1
    );
    handleTextLayout(
      i18n.t("DailyWeeklyMonthlyViewsYourTimeInBirdsEyeView"),
      setDynamicWidth2
    );
    handleTextLayout(
      i18n.t("ConnectAnyEventOrTaskToAnyHexKeepItAllTogether"),
      setDynamicWidth3
    );
  }, [i18n]);

  return (
    <>
      <CustomText style={styles.title}>{i18n.t("AllInGoodTime")}</CustomText>
      <div style={styles.pillsContainer}>
        {/* First Pill */}
        <div style={{
          ...styles.pill,
          width: `${dynamicWidth1}px`,
          maxHeight: "100px",
          alignSelf: "flex-start"
        }}>
          <div style={styles.scrollView}>
            <CustomText
              style={{...styles.pillText, fontSize: Typography.FONT_SIZE_16}}
            >
              {i18n.t("SyncYourCalendarsAndShareThemWithYourHive")}
            </CustomText>
          </div>
        </div>

        {/* Second Pill */}
        <div style={{
          ...styles.pill,
          width: `${dynamicWidth2}px`,
          maxHeight: "100px",
          alignSelf: "flex-end"
        }}>
          <div style={styles.scrollView}>
            <CustomText
              style={{...styles.pillText, fontSize: Typography.FONT_SIZE_16}}
            >
              {i18n.t("DailyWeeklyMonthlyViewsYourTimeInBirdsEyeView")}
            </CustomText>
          </div>
        </div>

        {/* Third Pill */}
        <div style={{
          ...styles.pill,
          width: `${dynamicWidth3}px`,
          maxHeight: "100px",
          alignSelf: "flex-start"
        }}>
          <div style={styles.scrollView}>
            <CustomText
              style={{...styles.pillText, fontSize: Typography.FONT_SIZE_16}}
            >
              {i18n.t("ConnectAnyEventOrTaskToAnyHexKeepItAllTogether")}
            </CustomText>
          </div>
        </div>

        {/* Floating Objects */}
        <div style={{...styles.floatingObject, ...styles.floatingObject1}}>
          <Icon name="squiggles-horizontal-loops" width={60} height={64} />
        </div>
        <div style={{...styles.floatingObject, ...styles.floatingObject2}}>
          <Icon name="squiggles-bended-arrow" width={100} height={160} />
        </div>
        <div style={{...styles.floatingObject, ...styles.floatingObject3}}>
          <Icon name="calendar-month" width={70} height={64} />
        </div>
        <div style={{...styles.floatingObject, ...styles.floatingObject4}}>
          <Icon name="beeva-clear" width={50} height={64} />
        </div>
        <div style={{...styles.floatingObject, ...styles.floatingObject5}}>
          <Icon name="three-arrows-bended" width={43} height={52} />
        </div>
        <div style={{...styles.floatingObject, ...styles.floatingObject6}}>
          <Icon name="squiggles-basic-check-01" width={43} height={64} color="#C3B7FF" />
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
    marginBottom: "24px",
    textAlign: "center",
  },
  // Pills
  pillsContainer: {
    width: "100%",
    marginTop: "8px",
    marginBottom: "8px",
    gap: "88px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  pill: {
    height: "auto",
    padding: "16px 12px",
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
  scrollView: {
    overflow: "auto",
    width: "100%",
  },
  // Floating Objects
  floatingObject: {
    position: "absolute",
  },
  floatingObject1: {
    top: "-32px",
    right: "56px",
    zIndex: -1,
  },
  floatingObject2: {
    top: "44px",
    left: "12px",
    zIndex: -1,
  },
  floatingObject3: {
    top: "82px",
    right: "24px",
    transform: "rotateY(180deg)",
  },
  floatingObject4: {
    bottom: "142px",
    left: "12px",
    zIndex: -1,
    transform: "rotateY(180deg)",
  },
  floatingObject5: {
    bottom: "92px",
    right: "42px",
    zIndex: -1,
    transform: "rotateZ(180deg) rotateY(180deg)",
  },
  floatingObject6: {
    bottom: "82px",
    left: "24px",
  },
};

export default OnboardingIntroTime;
