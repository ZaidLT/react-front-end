import React from "react";
import { Colors, Typography } from "../styles";
import Button from "./Button";
import HorizontalLine from "./HorizontalLine";
import CustomText from "./CustomText";
import Modal from "./Modal";
import { useLanguageContext } from "../context/LanguageContext";

interface IDeleteTaskModalProps {
  isVisible: boolean;
  onRequestClose: () => void;
  onDelete: () => void;
  taskName?: string;
}

/**
 * DeleteTaskModal - A confirmation modal for deleting tasks
 * 
 * This component displays a modal asking the user to confirm deletion of a task.
 * It shows the task name (if provided) and warns about the irreversible nature of deletion.
 * 
 * @param isVisible - Whether the modal is visible
 * @param onRequestClose - Callback function when the modal is closed without deleting
 * @param onDelete - Callback function when the user confirms deletion
 * @param taskName - Optional name of the task to be deleted
 */
const DeleteTaskModal: React.FC<IDeleteTaskModalProps> = ({
  isVisible,
  onRequestClose,
  onDelete,
  taskName,
}) => {
  const { i18n } = useLanguageContext();

  return (
    <Modal
      isVisible={isVisible}
      onClose={onRequestClose}
      showCloseButton={false}
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
            textAlign: "left",
            width: "100%",
          }}
        >
          {taskName
            ? `Are you sure you want to delete "${taskName}"?`
            : "Are you sure you want to delete this task?"}
        </CustomText>
        
        <div style={{ gap: "15px", marginTop: "15px" }}>
          <div style={{ width: "100%", opacity: 0.1, marginBottom: "10px" }}>
            <HorizontalLine color={Colors.TROUT} />
          </div>

          <CustomText
            style={{
              fontSize: Typography.FONT_SIZE_14,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              color: Colors.GREY_COLOR,
              textAlign: "left",
              padding: 0,
              marginBottom: "16px",
            }}
          >
            Deleting this task would be irreversible and you would lose all associated data
          </CustomText>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "10px",
            justifyContent: "flex-start",
            alignItems: "center",
            marginTop: "8px",
          }}
        >
          <Button
            width="40%"
            height={50}
            textProps={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              text: i18n.t("No"),
              color: Colors.RACING_RED,
            }}
            onButtonClick={onRequestClose}
            backgroundColor={Colors.WHITE}
            borderProps={{
              width: 1,
              radius: 10,
              color: Colors.RACING_RED,
            }}
          />
          <Button
            width="40%"
            height={50}
            textProps={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              text: i18n.t("Yes"),
              color: Colors.WHITE,
            }}
            onButtonClick={onDelete}
            backgroundColor={Colors.BLUE}
            borderProps={{
              width: 1,
              radius: 10,
              color: Colors.BLUE,
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default DeleteTaskModal;
