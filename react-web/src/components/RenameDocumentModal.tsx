import React, { useState } from "react";
import { Colors, Typography } from "../styles";
import Modal from "./Modal";
import Button from "./Button";
import HorizontalLine from "./HorizontalLine";
import Icon from "./Icon";
import { useLanguageContext } from "../context/LanguageContext";
import CustomText from "./CustomText";

// Add CSS for focus state
const focusStyles = `
  .text-input-wrapper:focus-within {
    border-color: ${Colors.BLUE} !important;
    box-shadow: 0 0 0 3px rgba(0, 14, 80, 0.1);
  }
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = focusStyles;
  document.head.appendChild(styleElement);
}

interface RenameDocumentModalProps {
  isVisible: boolean;
  onRequestClose: () => void;
  submit?: (name: string) => Promise<void>;
  loading?: boolean;
}

/**
 * RenameDocumentModal - A modal for renaming documents
 * 
 * This component displays a modal with an input field for renaming a document.
 * It includes save and cancel buttons.
 * 
 * @param isVisible - Whether the modal is visible
 * @param onRequestClose - Callback function when the modal is closed
 * @param submit - Callback function when the form is submitted with the new name
 * @param loading - Whether the modal is in a loading state
 */
const RenameDocumentModal: React.FC<RenameDocumentModalProps> = ({
  isVisible,
  onRequestClose,
  submit,
  loading,
}) => {
  const { i18n } = useLanguageContext();
  const [name, setName] = useState<string>("");
  
  const handleSubmit = () => {
    if (name && submit) {
      void submit(name);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onClose={onRequestClose}
      contentStyle={{
        width: "100%",
        maxWidth: "500px",
        borderRadius: "18px",
        padding: "0",
        margin: "0 auto",
      }}
    >
      <div style={styles.mainContainer}>
        <div style={{ alignSelf: "center", marginTop: "20px" }}>
          <Icon name="indicator" width={40} height={4} />
        </div>
        
        <CustomText style={styles.headerText}>{i18n.t('RenameDocument')}</CustomText>

        <div style={styles.horizontalLineContainer}>
          <HorizontalLine color={Colors.BLACK} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={styles.inputContainer}>
            <Icon name="document" width={24} height={24} color={Colors.BLUE} />
            <div style={styles.textInputWrapper} className="text-input-wrapper">
              <input
                style={styles.textInput}
                placeholder={i18n.t('EnterNewDocumentName')}
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
              <Icon name="short-text" width={20} height={20} color={Colors.GREY_COLOR} />
            </div>
          </div>

          <div style={styles.buttonsContainer}>
            <Button
              width="40%"
              textProps={{
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                text: i18n.t('Cancel'),
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
              textProps={{
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                text: "Save",
                color: Colors.WHITE,
              }}
              onButtonClick={handleSubmit}
              backgroundColor={Colors.BLUE}
              borderProps={{
                width: 1,
                radius: 10,
                color: Colors.BLUE,
              }}
            />
          </div>
        </div>
      </div>
      
      {loading && (
        <div style={styles.loadingIndicatorContainer}>
          <div className="loading-spinner"></div>
        </div>
      )}
    </Modal>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
    backgroundColor: Colors.WHITE,
    borderRadius: "18px",
    paddingBottom: "20px",
  },
  headerText: {
    marginTop: "15px",
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.MIDNIGHT,
    textAlign: "center",
  },
  horizontalLineContainer: {
    width: "100%",
    opacity: 0.1,
  },
  inputContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "10px",
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
  },
  textInputWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.LIGHT_GREY_BACKGROUND,
    border: `2px solid ${Colors.LIGHT_GREY}`,
    borderRadius: "8px",
    padding: "12px 16px",
    gap: "8px",
    transition: "border-color 0.2s ease",
  },
  textInput: {
    flex: 1,
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    color: Colors.BLACK,
  },
  buttonsContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
    gap: "15px",
    flexDirection: "row",
    justifyContent: "center",
  },
  loadingIndicatorContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
};

export default RenameDocumentModal;
