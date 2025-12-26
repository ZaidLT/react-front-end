import React from "react";
import { Colors, Typography } from "../styles";
import Modal from "./Modal";
import Button from "./Button";
import CustomText from "./CustomText";
import HorizontalLine from "./HorizontalLine";
import { useLanguageContext } from "../context/LanguageContext";

interface PaywallHeadsupModelProps {
  title: string;
  isVisible: boolean;
  onRequestClose: () => void;
  onConfirmationPress: () => void;
  onExportPress: () => void;
}

/**
 * PaywallHeadsupModel - A modal for subscription expiration warning
 *
 * This component displays a modal that warns users about the consequences of not having
 * an active subscription. It provides options to acknowledge the message or export data.
 *
 * @param title - The title of the modal
 * @param isVisible - Whether the modal is visible
 * @param onRequestClose - Callback function when the modal is closed
 * @param onConfirmationPress - Callback function when the user confirms understanding
 * @param onExportPress - Callback function when the user wants to export data
 */
const PaywallHeadsupModel: React.FC<PaywallHeadsupModelProps> = ({
  title,
  isVisible,
  onRequestClose,
  onConfirmationPress,
  onExportPress,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { i18n } = useLanguageContext();

  return (
    <Modal
      isVisible={isVisible}
      onClose={onRequestClose}
      contentStyle={{
        width: "90%",
        maxWidth: "500px",
        borderRadius: "18px",
        padding: "16px",
      }}
    >
      <div style={styles.modalContainer}>
        <div style={styles.titleContainer}>
          <CustomText style={styles.titleText}>{title}</CustomText>
        </div>

        <div style={styles.horizontalLineContainer}>
          <HorizontalLine color={Colors.TROUT} />
        </div>

        <CustomText style={styles.messageText}>
          Without a subscription, your hive and all its content will be{" "}
          <span style={styles.boldText}>visible but not editable</span>{" "}
          anymore.
        </CustomText>

        <CustomText style={styles.messageText}>
          Come back and visit, will you?
        </CustomText>

        <div style={styles.buttonsContainer}>
          <Button
            width="90%"
            textProps={{
              text: "I understand",
              fontSize: Typography.FONT_SIZE_16,
              color: Colors.WHITE,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            }}
            onButtonClick={onConfirmationPress}
            backgroundColor={Colors.BLUE}
            borderProps={{
              width: 1,
              color: Colors.BLUE,
              radius: 8,
            }}
          />

          <Button
            width="90%"
            textProps={{
              text: "Export my stuff first",
              fontSize: Typography.FONT_SIZE_16,
              color: Colors.BLUE,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            }}
            leftIcon={true}
            ButtonIcon={() => (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 10L12 15L17 10" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15V3" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            onButtonClick={onExportPress}
            backgroundColor={Colors.WHITE}
            borderProps={{
              width: 1,
              color: Colors.BLUE,
              radius: 8,
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  modalContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "20px",
  },
  titleContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: "7%",
    marginLeft: "5%",
    marginRight: "5%",
  },
  titleText: {
    flex: 1,
    color: Colors.BLUE,
    textAlign: "center",
    fontSize: Typography.FONT_SIZE_20,
    fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
    marginRight: "5%",
  },
  horizontalLineContainer: {
    width: "100%",
    opacity: 0.1,
    alignSelf: "center",
  },
  messageText: {
    color: Colors.BLUE,
    textAlign: "center",
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    marginTop: "10px",
    marginBottom: "10px",
  },
  boldText: {
    fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
  },
  buttonsContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "10px",
    gap: "10px",
  },
};

export default PaywallHeadsupModel;
