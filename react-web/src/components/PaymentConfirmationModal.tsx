import React from "react";
import { Colors, Typography } from "../styles";
import Modal from "./Modal";
import Button from "./Button";
import CustomText from "./CustomText";

interface PaymentConfirmationModalProps {
  isVisible: boolean;
  onRequestClose: () => void;
}

/**
 * PaymentConfirmationModal - A modal for confirming subscription payment
 *
 * This component displays a modal with information about continuing a subscription
 * and a button to confirm the action.
 *
 * @param isVisible - Whether the modal is visible
 * @param onRequestClose - Callback function when the modal is closed
 */
const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  isVisible,
  onRequestClose,
}) => {
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
        <div style={{ alignSelf: "center", marginTop: "20px" }}>
          {/* Double Check Verified Icon */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="#E6F7FF" />
            <path d="M32 18L21 29L16 24" stroke="#000E50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M36 18L25 29L20 24" stroke="#000E50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <CustomText style={styles.titleText}>
          Let's keep a good thing going!
        </CustomText>

        <CustomText style={styles.messageText}>
          Continue accessing your eeva hive and all premium features for{" "}
          <span style={styles.boldBlueText}>$4.99 / mo</span>
        </CustomText>

        <CustomText style={styles.readyText}>
          Ready to dive back in?
        </CustomText>

        <img
          style={{ width: "90%", height: "200px", objectFit: "contain" }}
          src="/assets/PaywallAssets.png"
          alt="Paywall assets"
        />

        <div style={styles.buttonsContainer}>
          <Button
            width="90%"
            textProps={{
              text: "Continue",
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
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
    padding: "16px",
  },
  titleText: {
    fontSize: Typography.FONT_SIZE_20,
    fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
    color: Colors.BLUE,
    textAlign: "center",
  },
  messageText: {
    marginLeft: "10px",
    marginRight: "10px",
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.PEARL,
    textAlign: "center",
  },
  boldBlueText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
    color: Colors.BLUE,
  },
  readyText: {
    marginTop: "20px",
    marginBottom: "20px",
    marginLeft: "10px",
    marginRight: "10px",
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.PEARL,
    textAlign: "center",
  },
  buttonsContainer: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
    gap: "10px",
    marginBottom: "10%",
  },
};

export default PaymentConfirmationModal;
