import * as Colors from "./colors";
import * as Typography from "./typography";
import * as Mixins from "./mixins";

// Common styles for web
const commonStyles = {
  hexOuterContainer: {
    alignSelf: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "auto",
    aspectRatio: "0.6122",
  },
  horizontalLine: {
    width: "100%",
    opacity: 0.1,
    alignSelf: "center",
    marginTop: "10px",
    marginBottom: "10px",
  },
  skipTourText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_400,
    color: Colors.BLUE,
  },
};

export { Colors, Typography, Mixins, commonStyles };
