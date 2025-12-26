import React, { useState, useEffect } from "react";
import { Colors, Typography } from "../styles";
import Button from "./Button";
import HorizontalLine from "./HorizontalLine";
import CustomText from "./CustomText";
import Modal from "./Modal";
import Input from "./Input";
import { useLanguageContext } from "../context/LanguageContext";

interface IGoldenTicketEmailModalProps {
  isVisible: boolean;
  onRequestClose: () => void;
  onSend: (email: string) => void;
  remainingInvites?: number;
}

/**
 * GoldenTicketEmailModal - A modal for sending golden ticket invitations
 *
 * This component displays a modal that allows the user to enter an email address
 * to send a golden ticket invitation to.
 *
 * @param isVisible - Whether the modal is visible
 * @param onRequestClose - Callback function when the modal is closed without sending
 * @param onSend - Callback function when the user confirms sending the invitation
 * @param remainingInvites - Number of remaining invites the user has
 */
const GoldenTicketEmailModal: React.FC<IGoldenTicketEmailModalProps> = ({
  isVisible,
  onRequestClose,
  onSend,
  remainingInvites = 0,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { i18n } = useLanguageContext();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // Reset state when modal is opened
  useEffect(() => {
    if (isVisible) {
      setEmail("");
      setEmailError("");
    }
  }, [isVisible]);

  // Validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError("Email address cannot be empty");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  // Handle email change
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value.trim()) {
      validateEmail(value);
    } else {
      setEmailError("");
    }
  };

  // Handle send button click
  const handleSend = () => {
    if (validateEmail(email)) {
      onSend(email);
      onRequestClose();
    }
  };

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
      <div style={{ width: "100%" }}>
        <CustomText
          style={{
            marginBottom: "15px",
            fontSize: Typography.FONT_SIZE_20,
            fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
            color: Colors.MIDNIGHT,
            textAlign: "center",
            width: "100%",
          }}
        >
          Send Golden Ticket
        </CustomText>

        <HorizontalLine color={Colors.LIGHT_GREY} />

        <div style={{ marginTop: "20px" }}>
          <CustomText
            style={{
              fontSize: Typography.FONT_SIZE_14,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              color: Colors.GREY_COLOR,
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            {`You have ${remainingInvites} golden ticket${remainingInvites !== 1 ? 's' : ''} remaining. Send an invitation to a friend to join Eeva!`}
          </CustomText>

          <CustomText
            style={{
              fontSize: Typography.FONT_SIZE_14,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              color: Colors.MIDNIGHT,
              marginBottom: "8px",
            }}
          >
            {i18n.t('EmailAddress')}
          </CustomText>

          <Input
            value={email}
            onChangeText={handleEmailChange}
            placeholder={i18n.t("EnterEmailAddress")}
            error={emailError}

          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "10px",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "30px",
          }}
        >
          <Button
            width="40%"
            height={50}
            textProps={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              text: "Cancel",
              color: Colors.BLUE,
            }}
            onButtonClick={onRequestClose}
            backgroundColor={Colors.WHITE}
            borderProps={{
              width: 1,
              radius: 10,
              color: Colors.BLUE,
            }}
          />
          <Button
            width="40%"
            height={50}
            textProps={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              text: "Send",
              color: Colors.WHITE,
            }}
            onButtonClick={handleSend}
            backgroundColor={Colors.BLUE}
            borderProps={{
              width: 1,
              radius: 10,
              color: Colors.BLUE,
            }}
            disabled={!email.trim() || !!emailError || remainingInvites <= 0}
          />
        </div>
      </div>
    </Modal>
  );
};

export default GoldenTicketEmailModal;
