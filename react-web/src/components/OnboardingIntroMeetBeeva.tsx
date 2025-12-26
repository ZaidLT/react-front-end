import React, { useState, useEffect } from "react";
import { Colors, Typography } from "../styles";
import { useLanguageContext } from "../context/LanguageContext";
import CustomText from "./CustomText";
import Icon from "./Icon";

/**
 * OnboardingIntroMeetBeeva - A component for the Beeva introduction screen in the onboarding flow
 *
 * This component introduces Beeva, the AI assistant, and its capabilities.
 */
const OnboardingIntroMeetBeeva: React.FC = () => {
  const { i18n } = useLanguageContext();

  const [dynamicWidth, setDynamicWidth] = useState(216);

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
      Math.max(216, width)
    );

    // Remove temporary element
    document.body.removeChild(tempElement);

    // Set new width
    setWidth(newWidth);
  };

  // Calculate width on component mount
  useEffect(() => {
    handleTextLayout(
      i18n.t("OurAIThatKicksEevaUpANotchBeevaHelpsYouGetThingsDoneBetterAndFaster"),
      setDynamicWidth
    );
  }, [i18n]);

  return (
    <>
      <CustomText style={styles.subtitle}>{i18n.t("AndLastButNotLeast")}</CustomText>
      <CustomText style={styles.title}>{i18n.t("MeetBeeva")}</CustomText>
      <div style={styles.pillsContainer}>
        {/* Pill */}
        <div style={{
          ...styles.pill,
          width: `${dynamicWidth}px`,
          maxHeight: "120px",
          alignSelf: "flex-end"
        }}>
          <div style={styles.scrollView}>
            <CustomText
              style={{...styles.pillText, fontSize: Typography.FONT_SIZE_16}}
            >
              {i18n.t("OurAIThatKicksEevaUpANotchBeevaHelpsYouGetThingsDoneBetterAndFaster")}
            </CustomText>
          </div>
        </div>

        {/* Floating Objects */}
        <div style={{...styles.floatingObject, ...styles.floatingObject1}}>
          <Icon name="squiggles-basic-line" width={180} height={30} />
        </div>
        <div style={{...styles.floatingObject, ...styles.floatingObject2}}>
          <Icon name="beeva-clear" width={182} height={234} />
        </div>
      </div>

      {/* Hexagons */}
      <div style={styles.hexContainer}>
        <Hexagon
          number="2"
          text={i18n.t("AlwaysReadyToChatAndHelpSolveYourProblems")}
        />
        <Hexagon
          number="3"
          text={i18n.t("GivesTipsTricksToMakeAdultingEasierWithEeva")}
        />
        <Hexagon
          number="1"
          text={i18n.t("ScansYourDocumentsAndApplianceStickers")}
        />
      </div>
    </>
  );
};

// Hexagon component
interface HexagonProps {
  number: string;
  text: string;
}

const Hexagon: React.FC<HexagonProps> = ({ number, text }) => {
  return (
    <div style={styles.polygonContainer}>
      <div style={styles.polygon}>
        <Icon name="polygon" width={153} height={135} />
      </div>
      <div style={styles.content}>
        <CustomText style={styles.number}>{number}</CustomText>
        <CustomText style={styles.text}>{text}</CustomText>
      </div>
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  hexContainer: {
    display: "flex",
    flexWrap: "wrap-reverse",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingLeft: "40px",
    paddingRight: "40px",
    gap: "20px",
    marginTop: "42px",
    marginBottom: "42px",
  },
  title: {
    fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
    fontSize: "48px",
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
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    fontSize: Typography.FONT_SIZE_16,
    fontWeight: "400",
    color: Colors.BLUE_GREY,
    textAlign: "center",
    lineHeight: "24px",
  },
  // Pills
  pillsContainer: {
    width: "100%",
    marginTop: "8px",
    marginBottom: "8px",
    gap: "20px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  pill: {
    height: "auto",
    padding: "16px",
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
    top: "-40px",
    right: "20px",
    zIndex: -1,
  },
  floatingObject2: {
    top: "-24px",
    left: "-52px",
    zIndex: -1,
    transform: "rotateY(180deg)",
  },
  // Polygons
  polygonContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100px",
    height: "100px",
    marginTop: "0",
  },
  polygon: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    maxWidth: "75px",
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  number: {
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
    fontSize: Typography.FONT_SIZE_22,
    fontWeight: "600",
    color: Colors.PRIMARY_ELECTRIC_BLUE,
    lineHeight: "30px",
  },
  text: {
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    fontSize: Typography.FONT_SIZE_10,
    textAlign: "center",
    color: Colors.PRIMARY_ELECTRIC_BLUE,
  },
};

export default OnboardingIntroMeetBeeva;
