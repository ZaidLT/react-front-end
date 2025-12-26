import React, { useState } from "react";
import { Colors, Typography } from "../styles";
import Modal from "./Modal";
import Button from "./Button";
import CustomText from "./CustomText";
import HorizontalLine from "./HorizontalLine";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Icon from "./Icon";
import { useLanguageContext } from "../context/LanguageContext";

interface IUserSelectionModalProps {
  isVisible: boolean;
  onRequestClose: () => void;
  onUserSelect: (userId: string) => void;
  users: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
  title?: string;
  description?: string;
}

/**
 * UserSelectionModal - A modal for selecting users
 *
 * This component displays a modal that allows users to select from a list of users.
 * Each user is displayed with their name, email, and avatar if available.
 *
 * @param isVisible - Whether the modal is visible
 * @param onRequestClose - Callback function when the modal is closed
 * @param onUserSelect - Callback function when a user is selected
 * @param users - Array of user objects to display
 * @param title - Optional title for the modal
 * @param description - Optional description text for the modal
 */
const UserSelectionModal: React.FC<IUserSelectionModalProps> = ({
  isVisible,
  onRequestClose,
  onUserSelect,
  users,
  title,
  description,
}) => {
  const { i18n } = useLanguageContext();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
  };

  const handleConfirm = () => {
    if (selectedUser) {
      onUserSelect(selectedUser);
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
      <div style={styles.modalContainer}>
        <CustomText style={styles.titleText}>
          {title || 'Select User'}
        </CustomText>

        {description && (
          <CustomText style={styles.descriptionText}>
            {description}
          </CustomText>
        )}

        <div style={styles.horizontalLineContainer}>
          <HorizontalLine color={Colors.TROUT} />
        </div>

        <div style={styles.usersContainer}>
          {users.map((user) => (
            <div
              key={user.id}
              style={{
                ...styles.userItem,
                backgroundColor: selectedUser === user.id ? Colors.LIGHT_BLUE_BACKGROUND : Colors.WHITE,
              }}
              onClick={() => handleUserSelect(user.id)}
            >
              <div style={styles.avatarContainer}>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={styles.avatar}
                  />
                ) : (
                  <div style={styles.defaultAvatar}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div style={styles.userInfo}>
                <CustomText style={styles.userName}>{user.name}</CustomText>
                <CustomText style={styles.userEmail}>{user.email}</CustomText>
              </div>
              {selectedUser === user.id && (
                <div style={styles.checkmark}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z" fill={Colors.BLUE} />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={styles.buttonsContainer}>
          <Button
            width="90%"
            textProps={{
              text: i18n.t('Cancel'),
              fontSize: Typography.FONT_SIZE_16,
              color: Colors.BLUE,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            }}
            onButtonClick={onRequestClose}
            backgroundColor={Colors.WHITE}
            borderProps={{
              width: 1,
              color: Colors.BLUE,
              radius: 8,
            }}
          />

          <Button
            disabled={!selectedUser}
            width="90%"
            textProps={{
              text: i18n.t('Confirm'),
              fontSize: Typography.FONT_SIZE_16,
              color: Colors.WHITE,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            }}
            onButtonClick={handleConfirm}
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
    width: "100%",
    padding: "16px",
  },
  titleText: {
    fontSize: Typography.FONT_SIZE_20,
    fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
    color: Colors.BLUE,
    textAlign: "center",
    marginBottom: "10px",
  },
  descriptionText: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREY_COLOR,
    textAlign: "center",
    marginBottom: "15px",
  },
  horizontalLineContainer: {
    width: "100%",
    opacity: 0.1,
    marginBottom: "15px",
  },
  usersContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxHeight: "300px",
    overflowY: "auto",
    marginBottom: "20px",
  },
  userItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  avatarContainer: {
    marginRight: "10px",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "20px",
    objectFit: "cover",
  },
  defaultAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "20px",
    backgroundColor: Colors.LIGHT_GREY,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
    color: Colors.BLUE,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
    color: Colors.MIDNIGHT,
  },
  userEmail: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREY_COLOR,
  },
  checkmark: {
    marginLeft: "10px",
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignItems: "center",
  },
};

export default UserSelectionModal;
