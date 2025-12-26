import React, { useState } from 'react';
import { Colors, Typography } from '../styles';
import HorizontalLine from './HorizontalLine';
import CustomText from './CustomText';
import Modal from './Modal';
import Icon from './Icon';
import { useLanguageContext } from '../context/LanguageContext';
import { useFamilyStore } from '../context/store';
import { useAuth } from '../context/AuthContext';
import PrioritySelectionView from './PrioritySelectionView';
import UserAvatarsGroup from './UserAvatarsGroup';
import HiveSelectionModal from './HiveSelectionModal';
import PeopleSelectionModal from './PeopleSelectionModal';
import { INestedTile, Tile } from '../util/types';
import { User } from '../services/types';

interface NoteSettingsDialogProps {
  onRequestClose: () => void;
  isOpen: boolean;
  selectedHive: INestedTile | null;
  setSelectedHive: React.Dispatch<React.SetStateAction<INestedTile | null>>;
  priority: number;
  setPriority: React.Dispatch<React.SetStateAction<number>>;
  peopleInvolved: User[];
  setPeopleInvolved: React.Dispatch<React.SetStateAction<User[]>>;
  isPrivacyEnabled: boolean;
  setIsPrivacyEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  hideFromPeople: User[];
  setHideFromPeople: React.Dispatch<React.SetStateAction<User[]>>;
  onSelectHive?: () => void;
  onSelectPeople?: () => void;
  onTogglePrivacy?: () => void;
}

/**
 * NoteSettingsDialog - A modal for modifying note settings
 *
 * This component displays a modal with various settings for notes,
 * such as hive selection, priority, people involved, and privacy settings.
 */
const NoteSettingsDialog: React.FC<NoteSettingsDialogProps> = ({
  onRequestClose,
  isOpen,
  selectedHive,
  setSelectedHive,
  priority,
  setPriority,
  peopleInvolved,
  setPeopleInvolved,
  isPrivacyEnabled,
  setIsPrivacyEnabled,
  hideFromPeople,
  setHideFromPeople,
  onSelectHive,
  onSelectPeople,
  onTogglePrivacy,
}) => {
  const { i18n } = useLanguageContext();
  const { user } = useAuth();
  const family = useFamilyStore((state) => state.family);
  const [isHiveSelectionModalOpen, setIsHiveSelectionModalOpen] =
    useState(false);
  const [isPeopleSelectionModalOpen, setIsPeopleSelectionModalOpen] =
    useState(false);

  // Ensure current user is always included in people selection
  const ensureCurrentUserIncluded = (people: User[]): User[] => {
    if (!user) return people;

    const currentUserInList = people.some(
      (person) => person.UniqueId === user.id
    );
    if (!currentUserInList) {
      const currentUserAsUser: User = {
        UniqueId: user.id,
        Account_uniqueId: user.accountId || '',
        FirstName: user.firstName || '',
        LastName: user.lastName || '',
        EmailAddress: user.email || '',
        EncryptedPassword: '',
        HouseDetails_Image: '',
        HouseDetails_Data: '',
        ActiveUser: true,
        ActiveFamilyMember: true,
      };
      return [currentUserAsUser, ...people];
    }
    return people;
  };

  // Helper component for horizontal line
  const Line = () => (
    <div style={{ width: '100%', opacity: 0.1 }}>
      <HorizontalLine color={Colors.TROUT} />
    </div>
  );

  return (
    <Modal
      isVisible={isOpen}
      onClose={onRequestClose}
      title={i18n.t('Settings')}
      contentStyle={{
        width: '100%',
      }}
    >
      <div style={styles.modalContent}>
        <div style={styles.scrollContainer}>
          {/* Hive Selection */}
          <div
            style={styles.menuItem}
            onClick={() => setIsHiveSelectionModalOpen(true)}
          >
            <div style={styles.menuItemContent}>
              <div style={styles.iconContainer}>
                <Icon
                  name='hive'
                  width={24}
                  height={24}
                  color={selectedHive ? Colors.BLUE : Colors.PEARL}
                />
              </div>
              <CustomText
                style={{
                  ...styles.menuItemText,
                  color: selectedHive ? Colors.BLUE : Colors.PEARL,
                }}
              >
                {selectedHive?.Name || i18n.t('SelectHive')}
              </CustomText>
            </div>
          </div>

          {/* Priority Selection */}
          <PrioritySelectionView
            currentPriority={priority}
            onSelect={setPriority}
          />

          {/* People Involved */}
          {peopleInvolved && peopleInvolved.length > 0 ? (
            <div
              style={styles.peopleContainer}
              onClick={() => setIsPeopleSelectionModalOpen(true)}
            >
              <Icon name='people' width={24} height={24} color={Colors.BLUE} />
              <UserAvatarsGroup
                users={peopleInvolved}
                size={10}
                style={{ width: 32, height: 32 }}
              />
            </div>
          ) : (
            <div
              style={styles.menuItem}
              onClick={() => setIsPeopleSelectionModalOpen(true)}
            >
              <div style={styles.menuItemContent}>
                <div style={styles.iconContainer}>
                  <Icon
                    name='people'
                    width={24}
                    height={24}
                    color={Colors.PEARL}
                  />
                </div>
                <CustomText
                  style={{
                    ...styles.menuItemText,
                    color: Colors.PEARL,
                  }}
                >
                  {i18n.t('PeopleInvolved')}
                </CustomText>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          <div
            style={styles.privacyContainer}
            onClick={
              onTogglePrivacy || (() => setIsPrivacyEnabled(!isPrivacyEnabled))
            }
          >
            <div style={styles.privacyContent}>
              <Icon
                name='lock'
                width={24}
                height={24}
                color={Colors.MIDNIGHT}
              />
              <CustomText style={styles.privacyText}>
                {i18n.t('Privacy')}
              </CustomText>
            </div>
            <div style={styles.toggleContainer}>
              <div
                style={{
                  ...styles.toggle,
                  backgroundColor: isPrivacyEnabled
                    ? Colors.BLUE
                    : Colors.LIGHT_GREY,
                }}
              >
                <div
                  style={{
                    ...styles.toggleHandle,
                    transform: isPrivacyEnabled
                      ? 'translateX(20px)'
                      : 'translateX(0)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hive Selection Modal */}
      <HiveSelectionModal
        isVisible={isHiveSelectionModalOpen}
        onClose={() => setIsHiveSelectionModalOpen(false)}
        onHiveSelect={(
          selectedHives: (INestedTile | Tile | User)[],
          selectedHive?: INestedTile | User | null
        ) => {
          if (selectedHive) {
            setSelectedHive(selectedHive as INestedTile);
          } else if (selectedHives && selectedHives.length > 0) {
            setSelectedHive(selectedHives[0] as INestedTile);
          } else {
            setSelectedHive(null);
          }
          setIsHiveSelectionModalOpen(false);
        }}
        multiSelect={false}
        initialSelectedHive={selectedHive}
      />

      {/* People Selection Modal */}
      <PeopleSelectionModal
        isVisible={isPeopleSelectionModalOpen}
        onRequestClose={() => setIsPeopleSelectionModalOpen(false)}
        onPeopleSelect={(selectedPeople: User[]) => {
          const peopleWithCurrentUser =
            ensureCurrentUserIncluded(selectedPeople);
          setPeopleInvolved(peopleWithCurrentUser);
          setIsPeopleSelectionModalOpen(false);
        }}
        people={family.filter(
          (member) => member.ActiveFamilyMember && member.ActiveUser
        )}
        title={i18n.t('PeopleInvolved')}
        description='Select people to involve in this note'
        initialSelectedPeople={ensureCurrentUserIncluded(peopleInvolved)}
      />
    </Modal>
  );
};

const styles = {
  modalContent: {
    width: '100%',
    backgroundColor: Colors.WHITE,
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  header: {
    width: '100%',
    position: 'relative' as const,
    display: 'flex',
    justifyContent: 'flex-start' as const,
    alignItems: 'flex-start' as const,
    paddingBottom: '16px',
    paddingHorizontal: '24px',
  },
  headerText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.MIDNIGHT,
    textAlign: 'center' as const,
    width: '100%',
  },
  scrollContainer: {
    width: '100%',
    padding: '0 24px',
    overflowY: 'auto' as const,
    maxHeight: 'calc(90vh - 100px)',
  },
  menuItem: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: '15px 0',
    cursor: 'pointer',
  },
  menuItemContent: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  iconContainer: {
    marginRight: '10px',
  },
  menuItemText: {
    fontSize: Typography.FONT_SIZE_16,
  },
  peopleContainer: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: '10px',
    width: '100%',
    marginBottom: '6%',
    cursor: 'pointer',
  },
  privacyContainer: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: '15px 0',
    cursor: 'pointer',
  },
  privacyContent: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: '10px',
  },
  privacyText: {
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.MIDNIGHT,
  },
  toggleContainer: {
    cursor: 'pointer',
  },
  toggle: {
    width: '40px',
    height: '20px',
    borderRadius: '10px',
    position: 'relative' as const,
    transition: 'background-color 0.3s',
  },
  toggleHandle: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: Colors.WHITE,
    position: 'absolute' as const,
    top: '2px',
    left: '2px',
    transition: 'transform 0.3s',
  },
};

export default NoteSettingsDialog;
