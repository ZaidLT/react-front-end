import React, { useState, useEffect } from 'react';
import { Colors, Typography } from '../styles';
import Modal from './Modal';
import Icon from './Icon';
import Button from './Button';
import HorizontalLine from './HorizontalLine';
import { useLanguageContext } from '../context/LanguageContext';
import CustomText from './CustomText';
import { User } from '../services/types';

interface IPeopleSelectionModalProps {
  isVisible: boolean;
  onRequestClose: () => void;
  onPeopleSelect?: (selectedPeople: User[]) => void;
  people?: User[];
  title?: string;
  description?: string;
  initialSelectedPeople?: User[];
}

/**
 * PeopleSelectionModal - A modal for selecting people
 *
 * This component displays a modal that allows users to select people from their contacts.
 * It supports multi-selection and provides a lightweight popup interface.
 *
 * @param isVisible - Whether the modal is visible
 * @param onRequestClose - Callback function when the modal is closed
 * @param onPeopleSelect - Callback function when people are selected
 * @param people - Array of people to display for selection
 * @param title - Optional title for the modal
 * @param description - Optional description text for the modal
 */
const PeopleSelectionModal: React.FC<IPeopleSelectionModalProps> = ({
  isVisible,
  onRequestClose,
  onPeopleSelect,
  people = [],
  title,
  description,
  initialSelectedPeople = [],
}) => {
  const { i18n } = useLanguageContext();
  const [selectedPeople, setSelectedPeople] = useState<User[]>(
    initialSelectedPeople
  );

  // Update selected people when modal opens with new initial data
  useEffect(() => {
    if (isVisible) {
      setSelectedPeople(initialSelectedPeople);
    }
  }, [isVisible, initialSelectedPeople]);

  const handlePersonSelect = (person: User) => {
    const isSelected = selectedPeople.some(
      (p) => p.UniqueId === person.UniqueId
    );
    if (isSelected) {
      setSelectedPeople(
        selectedPeople.filter((p) => p.UniqueId !== person.UniqueId)
      );
    } else {
      setSelectedPeople([...selectedPeople, person]);
    }
  };

  const handleConfirm = () => {
    if (onPeopleSelect) {
      onPeopleSelect(selectedPeople);
    }
    onRequestClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      onClose={onRequestClose}
      contentStyle={{
        maxWidth: '500px',
        borderRadius: '18px',
        padding: '16px',
      }}
    >
      <div style={styles.modalContainer}>
        <CustomText style={styles.titleText}>
          {title || 'Select People'}
        </CustomText>

        {description && (
          <CustomText style={styles.descriptionText}>{description}</CustomText>
        )}

        <div style={styles.horizontalLineContainer}>
          <HorizontalLine color={Colors.TROUT} />
        </div>

        {people.length === 0 ? (
          <div style={styles.emptyState}>
            <CustomText style={styles.emptyStateText}>
              No people available for selection
            </CustomText>
            <CustomText style={styles.emptyStateSubtext}>
              Add family members or contacts to assign them to events
            </CustomText>
          </div>
        ) : (
          <div style={styles.peopleList}>
            {people.map((person) => (
              <div
                key={person.UniqueId}
                style={{
                  ...styles.personItem,
                  backgroundColor: selectedPeople.some(
                    (p) => p.UniqueId === person.UniqueId
                  )
                    ? Colors.LIGHT_BLUE_BACKGROUND
                    : 'transparent',
                }}
                onClick={() => handlePersonSelect(person)}
              >
                <div style={styles.avatarContainer}>
                  {person.AvatarImagePath ? (
                    <img
                      src={person.AvatarImagePath}
                      alt={person.FirstName}
                      style={styles.avatar}
                    />
                  ) : (
                    <div style={styles.defaultAvatar}>
                      {person.FirstName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div style={styles.personInfo}>
                  <CustomText style={styles.personName}>
                    {person.FirstName} {person.LastName}
                  </CustomText>
                  <CustomText style={styles.personEmail}>
                    {person.EmailAddress}
                  </CustomText>
                </div>
                {selectedPeople.some((p) => p.UniqueId === person.UniqueId) && (
                  <div style={styles.checkmark}>
                    <svg
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z'
                        fill={Colors.BLUE}
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={styles.buttonContainer}>
          <Button
            textProps={{
              text: 'Cancel',
              color: Colors.BLUE,
            }}
            backgroundColor={Colors.WHITE}
            borderProps={{
              color: Colors.BLUE,
              width: 1,
              radius: 8,
            }}
            onButtonClick={onRequestClose}
            style={{ flex: 1, marginRight: '8px' }}
          />
          <Button
            textProps={{
              text: `Confirm${
                selectedPeople.length > 0 ? ` (${selectedPeople.length})` : ''
              }`,
              color: Colors.WHITE,
            }}
            backgroundColor={Colors.BLUE}
            borderProps={{
              color: Colors.BLUE,
              width: 1,
              radius: 8,
            }}
            onButtonClick={handleConfirm}
            style={{ flex: 1, marginLeft: '8px' }}
            disabled={selectedPeople.length === 0}
          />
        </div>
      </div>
    </Modal>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  modalContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    backgroundColor: Colors.WHITE,
    borderRadius: '18px',
  },
  titleText: {
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.MIDNIGHT,
    textAlign: 'center',
    marginBottom: '8px',
  },
  descriptionText: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREY_COLOR,
    textAlign: 'center',
    marginBottom: '16px',
  },
  horizontalLineContainer: {
    width: '100%',
    opacity: 0.1,
    marginBottom: '16px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  emptyStateText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
    color: Colors.MIDNIGHT,
    textAlign: 'center',
    marginBottom: '8px',
  },
  emptyStateSubtext: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREY_COLOR,
    textAlign: 'center',
  },
  peopleList: {
    maxHeight: '300px',
    overflowY: 'auto',
    marginBottom: '16px',
  },
  personItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '8px',
    transition: 'background-color 0.2s ease',
  },
  avatarContainer: {
    marginRight: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    objectFit: 'cover',
  },
  defaultAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    backgroundColor: Colors.BLUE,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
    color: Colors.MIDNIGHT,
    marginBottom: '2px',
  },
  personEmail: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREY_COLOR,
  },
  checkmark: {
    marginLeft: '12px',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    marginTop: '16px',
  },
};

export default PeopleSelectionModal;
