import React from "react";
import { Colors, Typography } from "../styles";
import CustomText from "./CustomText";
import { useLanguageContext } from "../context/LanguageContext";

/**
 * EmptyListViewCard - A component to display when a list is empty
 *
 * This component shows a message indicating that there are no high priority items
 * and provides information about how to add them.
 */
const EmptyListViewCard: React.FC = () => {
  const { i18n } = useLanguageContext();

  return (
    <div
      style={{
        width: "99%",
        height: "112px",
        borderRadius: "8px",
        padding: "16px",
        backgroundColor: Colors.WHITE,
        boxShadow: "0px 1px 2.22px rgba(0, 0, 0, 0.22)",
        marginTop: "2px",
        marginBottom: "2px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div style={{ width: "100%" }}>
        <CustomText
          style={{
            marginTop: "6px",
            color: Colors.BLUE,
            fontSize: Typography.FONT_SIZE_16,
            fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
            fontWeight: Typography.FONT_WEIGHT_600,
            textAlign: "center"
          }}
        >
          {i18n.t('NothingImportantForNow')}
        </CustomText>
        <CustomText
          style={{
            color: Colors.GREY_COLOR,
            textAlign: "center"
          }}
        >
          {i18n.t('WhenYouMarkSomethingAsHighPriorityItllShowUpHere')}
        </CustomText>
      </div>
    </div>
  );
};

export default EmptyListViewCard;
