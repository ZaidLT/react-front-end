import React from "react";
import { Colors, Typography } from "../styles";
import Modal from "./Modal";
import Button from "./Button";
import Icon from "./Icon";
import CustomText from "./CustomText";

interface AddDocumentModalProps {
  isVisible: boolean;
  onRequestClose: () => void;
  setFile: (file: File | undefined) => void;
}

/**
 * AddDocumentModal - A modal for adding documents
 *
 * This component displays a modal with an option to upload documents.
 * Features a clean design with Eeva logo and user-friendly instructions.
 *
 * @param isVisible - Whether the modal is visible
 * @param onRequestClose - Callback function when the modal is closed
 * @param setFile - Function to set the selected file
 */
const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  isVisible,
  onRequestClose,
  setFile,
}) => {
  const handleFileUpload = async () => {
    try {
      // Create a file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.zip';
      input.multiple = false;

      // Set up the change event handler
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          const file = target.files[0];
          setFile(file);
          onRequestClose(); // Close modal after file selection
        }
      };

      // Trigger the file selection dialog
      input.click();
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };



  return (
    <Modal
      isVisible={isVisible}
      onClose={onRequestClose}
      contentStyle={{
        width: "95%",
        maxWidth: "500px",
        borderRadius: "5px",
        padding: "0",
        margin: "0 auto",
        position: "absolute",
        bottom: "3%",
        left: "50%",
        transform: "translateX(-50%)",
        boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.15)",
      }}
    >
      <div style={styles.modalContent}>
        <div style={{ alignSelf: "center", marginTop: "5%" }}>
          <Icon name="indicator" width={40} height={4} />
        </div>

        <div style={styles.contentContainer}>
          <div style={styles.logoContainer}>
            <Icon name="eeva-logo" width={60} height={70} />
          </div>

          <CustomText style={styles.instructionText}>
            Please select a document to upload
          </CustomText>

          <div style={styles.buttonContainer}>
            <Button
              textProps={{
                text: "Upload Document",
                fontSize: Typography.FONT_SIZE_16,
                color: Colors.WHITE,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              }}
              onButtonClick={handleFileUpload}
              backgroundColor={Colors.BLUE}
              borderProps={{
                width: 1,
                color: Colors.BLUE,
                radius: 8,
              }}
              style={{
                width: '100%',
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: "5px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  contentContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 30px",
    gap: "30px",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  instructionText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREY_COLOR,
    textAlign: "center",
    lineHeight: "24px",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: "300px",
  },
};

export default AddDocumentModal;
