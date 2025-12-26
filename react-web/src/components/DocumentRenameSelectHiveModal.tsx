import React, { useState, useEffect } from "react";
import { Colors, Typography } from "../styles";
import Button from "./Button";
import HorizontalLine from "./HorizontalLine";
import CustomText from "./CustomText";
import Modal from "./Modal";
import Input from "./Input";
import Dropdown, { DropdownOption } from "./Dropdown";
import { useLanguageContext } from "../context/LanguageContext";

interface IHive {
  id: string;
  name: string;
}

interface IDocumentRenameSelectHiveModalProps {
  isVisible: boolean;
  onRequestClose: () => void;
  onSave: (newName: string, selectedHiveId: string) => void;
  documentName?: string;
  documentId?: string;
  hives: IHive[];
  currentHiveId?: string;
}

/**
 * DocumentRenameSelectHiveModal - A modal for renaming documents and selecting a hive
 *
 * This component displays a modal that allows the user to rename a document and
 * select a hive to move it to.
 *
 * @param isVisible - Whether the modal is visible
 * @param onRequestClose - Callback function when the modal is closed without saving
 * @param onSave - Callback function when the user confirms the changes
 * @param documentName - Current name of the document
 * @param documentId - ID of the document
 * @param hives - Array of available hives to select from
 * @param currentHiveId - ID of the currently selected hive
 */
const DocumentRenameSelectHiveModal: React.FC<IDocumentRenameSelectHiveModalProps> = ({
  isVisible,
  onRequestClose,
  onSave,
  documentName = "",
  documentId,
  hives = [],
  currentHiveId,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { i18n } = useLanguageContext();
  const [newName, setNewName] = useState(documentName);
  const [selectedHiveId, setSelectedHiveId] = useState(currentHiveId || "");
  const [nameError, setNameError] = useState("");

  // Reset state when modal is opened
  useEffect(() => {
    if (isVisible) {
      setNewName(documentName);
      setSelectedHiveId(currentHiveId || "");
      setNameError("");
    }
  }, [isVisible, documentName, currentHiveId]);

  // Validate document name
  const validateName = (name: string) => {
    if (!name.trim()) {
      setNameError("Document name cannot be empty");
      return false;
    }
    if (name.length > 50) {
      setNameError("Document name cannot exceed 50 characters");
      return false;
    }
    setNameError("");
    return true;
  };

  // Handle name change
  const handleNameChange = (value: string) => {
    setNewName(value);
    validateName(value);
  };

  // Handle hive selection
  const handleHiveChange = (value: string) => {
    setSelectedHiveId(value);
  };

  // Handle save button click
  const handleSave = () => {
    if (validateName(newName)) {
      onSave(newName, selectedHiveId);
      onRequestClose();
    }
  };

  // Convert hives to dropdown options
  const hiveOptions: DropdownOption[] = hives.map(hive => ({
    label: hive.name,
    value: hive.id,
  }));

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
          {i18n.t('RenameDocument')}
        </CustomText>

        <HorizontalLine color={Colors.LIGHT_GREY} />

        <div style={{ marginTop: "20px" }}>
          <CustomText
            style={{
              fontSize: Typography.FONT_SIZE_14,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              color: Colors.MIDNIGHT,
              marginBottom: "8px",
            }}
          >
            Document Name
          </CustomText>

          <Input
            value={newName}
            onChangeText={handleNameChange}
            placeholder={i18n.t('EnterDocumentName')}
            error={nameError}
          />
        </div>

        <div style={{ marginTop: "20px" }}>
          <CustomText
            style={{
              fontSize: Typography.FONT_SIZE_14,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              color: Colors.MIDNIGHT,
              marginBottom: "8px",
            }}
          >
            Select Hive
          </CustomText>

          <Dropdown
            options={hiveOptions}
            selectedValue={selectedHiveId}
            onChange={handleHiveChange}
            placeholder="Select a hive"
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
              text: "Save",
              color: Colors.WHITE,
            }}
            onButtonClick={handleSave}
            backgroundColor={Colors.BLUE}
            borderProps={{
              width: 1,
              radius: 10,
              color: Colors.BLUE,
            }}
            disabled={!newName.trim() || !!nameError}
          />
        </div>
      </div>
    </Modal>
  );
};

export default DocumentRenameSelectHiveModal;
