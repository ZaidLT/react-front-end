import React from "react";
import { Colors, Typography } from "../styles";
import { useLanguageContext } from "../context/LanguageContext";
import CustomText from "./CustomText";
import { I18nKeys } from "../util/i18n";

/**
 * CreateComponentText - A component for displaying multiple lines of text
 * 
 * This component takes an array of text keys and displays them as separate lines.
 * 
 * @param textArray - Array of i18n keys to display as separate lines
 */
const CreateComponentText = (textArray: I18nKeys[]) => {
  const { i18n } = useLanguageContext();

  return (
    <CustomText style={styles.componentTextRegular}>
      {textArray.map((line, index) => (
        <React.Fragment key={index}>
          {i18n.t(line)}
          {index < textArray.length - 1 && <br />}
        </React.Fragment>
      ))}
    </CustomText>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  componentTextRegular: {
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.WHITE,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    flex: 1,
    textAlign: "center",
    marginLeft: "5%",
    marginRight: "5%",
  },
};

export default CreateComponentText;
