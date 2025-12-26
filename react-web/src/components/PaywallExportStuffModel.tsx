import React, { useState } from "react";
import { Colors, Typography } from "../styles";
import Modal from "./Modal";
import Button from "./Button";
import CustomText from "./CustomText";
import HorizontalLine from "./HorizontalLine";
import { useLanguageContext } from "../context/LanguageContext";

interface PaywallExportStuffModelProps {
  title: string;
  isVisible: boolean;
  onRequestClose: () => void;
}

/**
 * PaywallExportStuffModel - A modal for exporting user data
 *
 * This component displays a modal that allows users to export their data as a CSV file.
 * It includes an email input field for the user to specify where to send the exported data.
 *
 * @param title - The title of the modal
 * @param isVisible - Whether the modal is visible
 * @param onRequestClose - Callback function when the modal is closed
 */
const PaywallExportStuffModel: React.FC<PaywallExportStuffModelProps> = ({
  title,
  isVisible,
  onRequestClose,
}) => {
  const [email, setEmail] = useState("");
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
          {`Bring your data home 📦\nExport your data as `}
          <span style={styles.boldText}>a CSV file.</span>
        </CustomText>

        <CustomText style={styles.messageText}>
          {`Just pop in your email below, and we'll send it straight to your inbox 📥`}
        </CustomText>

        <div style={styles.inputContainer}>
          <CustomText style={styles.inputLabel}>Email</CustomText>
          <div style={styles.inputWrapper}>
            {/* Email Icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.84 8.8 17 8.96 17 9.16V14.84C17 15.04 16.84 15.2 16.64 15.2H7.36C7.16 15.2 7 15.04 7 14.84V9.16C7 8.96 7.16 8.8 7.36 8.8H16.64ZM16 8L12 11L8 8H16ZM16 16V10.5L12 13.5L8 10.5V16H16Z" fill="black"/>
            </svg>
            <input
              style={styles.textInput}
              placeholder={i18n.t("EnterYourEmail")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </div>
        </div>

        <div style={styles.buttonsContainer}>
          <Button
            disabled={!email}
            width="100%"
            textProps={{
              text: "Get my data",
              fontSize: Typography.FONT_SIZE_16,
              color: Colors.WHITE,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            }}
            onButtonClick={onRequestClose}
            backgroundColor={Colors.BLUE}
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
    whiteSpace: "pre-line",
  },
  boldText: {
    fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
  },
  inputContainer: {
    alignItems: "flex-start",
    alignSelf: "flex-start",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    margin: "10px",
    width: "100%",
  },
  inputLabel: {
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    fontSize: Typography.FONT_SIZE_14,
    color: Colors.PRIMARY_DARK_BLUE,
  },
  inputWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "10px",
    width: "100%",
  },
  textInput: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    flex: 1,
    border: "none",
    outline: "none",
    padding: "8px 0",
  },
  buttonsContainer: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
    marginBottom: "10px",
    gap: "10px",
  },
};

export default PaywallExportStuffModel;
