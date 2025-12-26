import React, { useState, useEffect } from "react";
import { Colors, Typography } from "../styles";
import { useLanguageContext } from "../context/LanguageContext";
import CustomText from "./CustomText";
import Icon from "./Icon";

/**
 * OnboardingIntroPeople - A component for the people screen in the onboarding flow
 *
 * This component displays information about the people features in the app.
 */
const OnboardingIntroPeople: React.FC = () => {
  const { i18n } = useLanguageContext();

  const [dynamicWidth1, setDynamicWidth1] = useState(263);
  const [dynamicWidth2, setDynamicWidth2] = useState(266);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dynamicWidth3, setDynamicWidth3] = useState(320);

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
      Math.max(260, width + 40)
    );

    // Remove temporary element
    document.body.removeChild(tempElement);

    // Set new width
    setWidth(newWidth);
  };

  // Calculate widths on component mount
  useEffect(() => {
    handleTextLayout(
      i18n.t("InviteUpto5MembersToHiveAndGetCollaboration"),
      setDynamicWidth1
    );
    handleTextLayout(
      i18n.t("AddAllYourContactsTagThemLabelThemSortThemEasy"),
      setDynamicWidth2
    );
    handleTextLayout(
      i18n.t("TagPeopleOrPetsOnAnythingInTheAppTasksEventsDocsNotes"),
      setDynamicWidth3
    );
  }, [i18n]);

  return (
    <>
      <CustomText style={styles.title}>{i18n.t("SyncWithYourPeople")}</CustomText>
      <div style={styles.pillsContainer}>
        {/* First Pill */}
        <div style={{
          ...styles.pill,
          width: `${dynamicWidth1}px`,
          maxHeight: "100px",
          alignSelf: "flex-end"
        }}>
          <div style={styles.scrollView}>
            <CustomText
              style={{...styles.pillText, fontSize: Typography.FONT_SIZE_16}}
            >
              {i18n.t("InviteUpto5MembersToHiveAndGetCollaboration")}
            </CustomText>
          </div>
        </div>

        {/* Second Pill */}
        <div style={{
          ...styles.pill,
          width: `${dynamicWidth2}px`,
          maxHeight: "100px",
          alignSelf: "flex-start"
        }}>
          <div style={styles.scrollView}>
            <CustomText
              style={{...styles.pillText, fontSize: Typography.FONT_SIZE_16}}
            >
              {i18n.t("AddAllYourContactsTagThemLabelThemSortThemEasy")}
            </CustomText>
          </div>
        </div>

        {/* Third Pill */}
        <div style={{
          ...styles.pill,
          width: "300px",
          maxHeight: "105px",
          alignSelf: "flex-end"
        }}>
          <div style={styles.scrollView}>
            <CustomText
              style={{...styles.pillText, fontSize: Typography.FONT_SIZE_16}}
            >
              {i18n.t("TagPeopleOrPetsOnAnythingInTheAppTasksEventsDocsNotes")}
            </CustomText>
          </div>
        </div>

        {/* Floating Objects */}
        <div style={{...styles.floatingObject, ...styles.floatingObject1}}>
          <Icon name="family-holding-hands" width={55} height={48} />
        </div>
        <div style={{...styles.floatingObject, ...styles.floatingObject2}}>
          <Icon name="squiggles-bended-arrow-purple" width={120} height={200} />
        </div>
        <div style={{...styles.floatingObject, ...styles.floatingObject3}}>
          <Icon name="beeva-clear" width={50} height={64} />
        </div>
        <div style={{...styles.floatingObject, ...styles.floatingObject4}}>
          <Icon name="squiggles-bended-arrow-2" width={80} height={120} />
        </div>
        <div style={{...styles.floatingObject, ...styles.floatingObject5}}>
          <Icon name="dog" width={75} height={56} />
        </div>
        <div style={{...styles.floatingObject, ...styles.floatingObject6}}>
          <Icon name="squiggles-circles" width={56} height={64} />
        </div>
      </div>
    </>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  title: {
    width: "100%",
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    fontSize: Typography.FONT_SIZE_28,
    fontWeight: "400",
    color: Colors.WHITE,
    marginBottom: "12px",
    textAlign: "center",
  },
  // Pills
  pillsContainer: {
    width: "100%",
    marginTop: "8px",
    marginBottom: "8px",
    gap: "90px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  pill: {
    height: "auto",
    padding: "20px 24px",
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
    top: "120px",
    left: "112px",
    zIndex: -1,
  },
  floatingObject2: {
    top: "0",
    left: "24px",
    zIndex: -1,
  },
  floatingObject3: {
    top: "150px",
    right: "5px",
  },
  floatingObject4: {
    top: "240px",
    right: "72px",
  },
  floatingObject5: {
    bottom: "112px",
    right: "140px",
  },
  floatingObject6: {
    bottom: "82px",
    left: "0",
  },
};

export default OnboardingIntroPeople;
