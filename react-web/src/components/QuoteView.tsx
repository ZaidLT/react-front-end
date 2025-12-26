import React from "react";
import { Colors, Typography } from "../styles";
import { IQuote } from "../util/types";
import CustomText from "./CustomText";

interface QuoteViewProps {
  quote: IQuote;
  locale?: string;
}

const QuoteView: React.FC<QuoteViewProps> = ({ quote, locale = "en" }) => {
  const isFrench = locale === "fr";

  return (
    <div className="quote-view-container" style={{
      marginTop: "0px",
      marginBottom: "20px",
      paddingLeft: "44px",
      paddingRight: "44px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center"
    }}>
      <CustomText className="custom-text" style={{
        fontSize: Typography.FONT_SIZE_10,
        fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
        color: Colors.MIDNIGHT,
        textAlign: "center",
        display: "block",
        width: "100%"
      }}>
        {isFrench ? quote.attributes.frQuote || quote.attributes.quote : quote.attributes.quote}
      </CustomText>
      <CustomText className="custom-text" style={{
        fontSize: Typography.FONT_SIZE_10,
        fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
        fontWeight: Typography.FONT_WEIGHT_600,
        color: Colors.MIDNIGHT,
        textAlign: "center",
        marginTop: "4px",
        display: "block",
        width: "100%"
      }}>
        {quote.attributes.author}
      </CustomText>
    </div>
  );
};

export default QuoteView;
