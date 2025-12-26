import React, { useEffect, useState } from "react";
import { Colors, Typography } from "../styles";
import Modal from "./Modal";
import Button from "./Button";
import HorizontalLine from "./HorizontalLine";
import Icon from "./Icon";
import { useLanguageContext } from "../context/LanguageContext";
import CustomText from "./CustomText";
import { INestedTile } from "../util/types";
import { IContact, User } from "../services/types";
import { TILE_DATA_MAP } from "../util/constants";
import { useNavigate } from "react-router-dom";
import MenuListItem from "./MenuListItem";

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

interface DocumentUploadModalProps {
  isVisible: boolean;
  onRequestClose: () => void;
  clickCancel: () => void;
  hive: INestedTile | IContact | User;
  uploadDoc: (name: string) => void;
  file: File | undefined;
  hiveFromScreen?: string;
  homeMemberId?: string;
}

/**
 * DocumentUploadModal - A modal for uploading documents and selecting a hive
 * 
 * This component displays a modal for naming a document and selecting which hive
 * to associate it with before uploading.
 * 
 * @param isVisible - Whether the modal is visible
 * @param onRequestClose - Callback function when the modal is closed
 * @param clickCancel - Callback function when the cancel button is clicked
 * @param hive - The hive object to associate the document with
 * @param uploadDoc - Function to upload the document
 * @param file - The file to upload
 * @param hiveFromScreen - The screen the modal was opened from
 * @param homeMemberId - The ID of the home member
 */
const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isVisible,
  onRequestClose,
  clickCancel,
  hive,
  uploadDoc,
  file,
  hiveFromScreen,
  homeMemberId,
}) => {
  const { i18n } = useLanguageContext();
  const navigate = useNavigate();
  
  const hiveData = TILE_DATA_MAP[(hive as INestedTile)?.Type] || {};
  const [visible, setVisible] = useState<boolean>(isVisible);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    if (hive && !visible) {
      setVisible(true);
    }
  }, [hive, visible]);

  return (
    <Modal
      isVisible={visible}
      onClose={onRequestClose}
      contentStyle={{
        width: "90%",
        maxWidth: "500px",
        borderRadius: "20px",
        padding: "0",
        margin: "0 auto",
        position: "absolute",
        top: "25%",
        left: "50%",
        transform: "translateX(-50%)",
        boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.15)",
      }}
    >
      <div style={styles.modalContent}>
        <CustomText style={styles.headerText}>{i18n.t('NewDocument')}</CustomText>
        
        <div style={styles.horizontalLineContainer}>
          <HorizontalLine color={Colors.BLACK} />
        </div>
        
        <CustomText style={styles.descriptionText}>
          {i18n.t('YouCanRenameYourDocumentAndLocateItHere')}
        </CustomText>
        
        <div style={styles.formContainer}>
          <div style={styles.inputContainer}>
            <Icon name="document" width={25} height={25} />
            <div style={styles.textInputWrapper} className="text-input-wrapper">
              <input
                style={styles.textInput}
                placeholder={i18n.t('RenameTheDocument')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Icon name="short-text" width={20} height={20} color={Colors.GREY_COLOR} />
            </div>
          </div>

          <div style={styles.hiveSelectContainer}>
            <MenuListItem
              content={{
                icon: hiveData.icon || 
                      ((hive as User)?.FirstName ? "family" : "hive"),
                name: (hive as INestedTile)?.Name ||
                      (hive as IContact)?.FirstName ||
                      (hive as User)?.FirstName ||
                      i18n.t("SelectHive"),
              }}
              textColor={hive ? Colors.BLUE : Colors.PEARL}
              onPress={() => {
                navigate(`/hive-selection?fromScreen=${hiveFromScreen || 'home'}&isDoc=true`);
                setVisible(false);
              }}
              isFullWidth={true}
              containerStyle={{ paddingLeft: 0, paddingRight: 0 }}
            />
          </div>
        </div>
        
        <div style={styles.buttonsContainer}>
          <Button
            width="35%"
            textProps={{
              text: i18n.t("Cancel"),
              fontSize: Typography.FONT_SIZE_16,
              color: Colors.BLUE,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            }}
            onButtonClick={clickCancel}
            backgroundColor={Colors.WHITE}
            borderProps={{
              width: 1,
              color: Colors.BLUE,
              radius: 8,
            }}
          />

          <Button
            width="35%"
            textProps={{
              text: "Upload",
              fontSize: Typography.FONT_SIZE_16,
              color: Colors.WHITE,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            }}
            disabled={!hive || !name}
            onButtonClick={() => {
              uploadDoc(name);
              onRequestClose();
            }}
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
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  headerText: {
    margin: "15px",
    marginTop: "20px",
    marginBottom: "20px",
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.MIDNIGHT,
    textAlign: "center",
  },
  horizontalLineContainer: {
    width: "100%",
    opacity: 0.1,
  },
  descriptionText: {
    color: Colors.PRIMARY_DARKER_BLUE,
    textAlign: "center",
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    marginTop: "10px",
    marginBottom: "10px",
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginTop: "10px",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "row",
    marginLeft: "7%",
    marginRight: "7%",
    gap: "10px",
    alignItems: "center",
    justifyContent: "center",
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
  hiveSelectContainer: {
    marginLeft: "7%",
    marginRight: "7%",
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    marginTop: "7%",
    marginBottom: "7%",
  },
};

export default DocumentUploadModal;
