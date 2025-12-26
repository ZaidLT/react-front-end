import React, { useState } from "react";
import { Colors, Typography } from "../styles";
import Button from "./Button";
import HorizontalLine from "./HorizontalLine";
import CustomText from "./CustomText";
import Modal from "./Modal";
import { useLanguageContext } from "../context/LanguageContext";
import Icon from "./Icon";

interface IAddUtilityModalProps {
  isVisible: boolean;
  onRequestClose: () => void;
  onCancelClose?: () => void;
  title?: string;
  setTitle?: (text: string) => void;
  icon?: string;
}

/**
 * AddUtilityModal - A modal for adding a new utility
 *
 * This component displays a modal that allows the user to add a new utility
 * with an optional name.
 *
 * @param isVisible - Whether the modal is visible
 * @param onRequestClose - Callback function when the modal is closed with confirmation
 * @param onCancelClose - Callback function when the modal is canceled
 * @param title - The current title/name of the utility
 * @param setTitle - Function to update the title/name
 * @param icon - Icon name to display
 */
const AddUtilityModal: React.FC<IAddUtilityModalProps> = ({
  isVisible,
  onRequestClose,
  onCancelClose,
  title = "",
  setTitle = () => {},
  icon = "home",
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { i18n } = useLanguageContext();
  const [localTitle, setLocalTitle] = useState(title);

  // Update local title when prop changes
  React.useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalTitle(newValue);
    setTitle(newValue);
  };

  // Handle confirm button click
  const handleConfirm = () => {
    if (localTitle !== "") {
      onRequestClose();
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onClose={onCancelClose || (() => {})}
      contentStyle={{
        width: "90%",
        maxWidth: "500px",
        borderRadius: "18px",
        padding: "0",
      }}
    >
      <div style={styles.mainContainer}>
        <CustomText style={styles.headerText}>
          Add Utility
        </CustomText>

        <div style={styles.horizontalLine}>
          <HorizontalLine color={Colors.BLACK} />
        </div>

        <div style={{ padding: "0 13px 16px" }}>
          <CustomText style={styles.descText}>
            Name this utility (optional)
          </CustomText>

          <div style={{ gap: "10px" }}>
            <div style={styles.inputContainer}>
              <Icon name={icon} width={24} height={24} />
              <input
                style={styles.input}
                placeholder="Add utility name"
                value={localTitle}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div style={styles.buttonsContainer}>
          <Button
            width="40%"
            textProps={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              text: 'Cancel',
              color: Colors.BLUE,
            }}
            onButtonClick={onCancelClose}
            backgroundColor={Colors.WHITE}
            borderProps={{
              width: 1,
              radius: 10,
              color: Colors.BLUE,
            }}
          />

          <Button
            disabled={localTitle === ""}
            width="40%"
            textProps={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              text: 'Confirm',
            }}
            onButtonClick={handleConfirm}
            backgroundColor={Colors.BLUE}
            borderProps={{
              width: 1,
              radius: 10,
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  overlayContainer: {
    width: "100%",
    height: "100%",
  },
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    backgroundColor: Colors.WHITE,
    borderRadius: "18px",
  },
  headerText: {
    textAlign: "center",
    padding: "16px 24px",
    fontSize: Typography.FONT_SIZE_20,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.MIDNIGHT,
  },
  horizontalLine: {
    marginTop: "16px",
    opacity: 0.1,
    width: "100%",
    marginBottom: "8px",
  },
  descText: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREY_COLOR,
    textAlign: "center",
    paddingBottom: "16px",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "10px",
    width: "100%",
    padding: "0 16px",
    alignItems: "center",
  },
  input: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    width: "90%",
    color: Colors.GREY_COLOR,
    border: "none",
    outline: "none",
    padding: "8px 0",
  },
  buttonsContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "24px",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
};

export default AddUtilityModal;
