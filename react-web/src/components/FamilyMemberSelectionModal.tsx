'use client';

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import CustomText from './CustomText';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

import { Colors } from '../styles';
import { FONT_SIZE_16, FONT_FAMILY_POPPINS_MEDIUM } from '../styles/typography';
import { User } from '../services/types';
import { FamilyMember } from '../services/familyService';
import { getInitials } from '../util/helpers';

import { useAuth } from '../context/AuthContext';
import familyService from '../services/familyService';
import { useLanguageContext } from '../context/LanguageContext';

interface FamilyMemberSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onMemberSelect: (selectedMembers: FamilyMember[], selectedMember?: FamilyMember | null) => void;
  multiSelect?: boolean;
  initialSelectedMembers?: FamilyMember[];
  initialSelectedMember?: FamilyMember | null;
}

const FamilyMemberSelectionModal: React.FC<FamilyMemberSelectionModalProps> = ({
  isVisible,
  onClose,
  onMemberSelect,
  multiSelect = true,
  initialSelectedMembers = [],
  initialSelectedMember = null,
}) => {
  const { i18n } = useLanguageContext();
  const { user } = useAuth();

  // State for selected members and family data
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<FamilyMember[]>(initialSelectedMembers);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(initialSelectedMember);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Handle member selection
  const handleMemberSelect = (member: FamilyMember) => {
    if (multiSelect) {
      const isSelected = selectedMembers.some(m => m.id === member.id);
      if (isSelected) {
        setSelectedMembers(prev => prev.filter(m => m.id !== member.id));
      } else {
        setSelectedMembers(prev => [...prev, member]);
      }
    } else {
      setSelectedMember(member);
    }
  };

  // Handle save and close
  const handleSave = () => {
    onMemberSelect(selectedMembers, selectedMember);
    onClose();
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isVisible) {
      setSelectedMembers(initialSelectedMembers);
      setSelectedMember(initialSelectedMember);
    }
  }, [isVisible, initialSelectedMembers, initialSelectedMember]);

  // Fetch family members from API
  useEffect(() => {
    const fetchFamilyMembers = async () => {
      if (!user?.accountId) {
        setError('User account information not available');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch active family members from the API
        const members = await familyService.getActiveFamilyMembers(user.accountId);

        // Exclude the current user from the selectable list; they remain implicitly associated as creator
        const selectableMembers = (members || []).filter((m: FamilyMember) => m.id !== user.id);

        if (selectableMembers && selectableMembers.length > 0) {
          setFamilyMembers(selectableMembers);
        } else {
          setFamilyMembers([]);
          setError('No family members available to assign');
        }
      } catch (err) {
        console.error('Error fetching family members:', err);
        setError('Failed to load family members. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isVisible) {
      fetchFamilyMembers();
    }
  }, [isVisible, user?.accountId]);

  return (
    <Modal
      isVisible={isVisible}
      title={i18n.t("SelectFamilyMembers") || "Select Family Members"}
      onClose={onClose}
      contentStyle={{
        maxHeight: '80vh',
        overflow: 'hidden',
      }}
      footerContent={
        <Button
          width="100%"
          disabled={multiSelect ? selectedMembers.length === 0 : false}
          textProps={{
            text: i18n.t("Save") || "Save",
            fontSize: FONT_SIZE_16,
            color: Colors.WHITE,
            fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
          }}
          onButtonClick={handleSave}
          backgroundColor={Colors.BLUE}
          borderProps={{
            width: 1,
            color: Colors.WHITE_LILAC,
            radius: 8,
          }}
        />
      }
    >
      <div style={{
        overflowY: 'auto',
        maxHeight: '60vh',
        padding: '0 10px',
      }}>
        {isLoading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '60px 20px',
            textAlign: 'center',
            gap: '20px',
          }}>
            <LoadingSpinner
              size={50}
              color={Colors.BLUE}
              borderWidth={4}
            />
            <CustomText
              style={{
                fontSize: FONT_SIZE_16,
                fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                color: Colors.PEARL,
              }}
            >
              {"Loading family members..."}
            </CustomText>
          </div>
        ) : error ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px 20px',
            textAlign: 'center',
          }}>
            <CustomText
              style={{
                fontSize: FONT_SIZE_16,
                fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                color: Colors.LIGHT_RED,
                marginBottom: '10px',
              }}
            >
              {error}
            </CustomText>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: Colors.BLUE,
                color: Colors.WHITE,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
              }}
            >
              Retry
            </button>
          </div>
        ) : familyMembers && familyMembers.length > 0 ? (
          <div>
            {/* Family Members List */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <CustomText
                  style={{
                    fontSize: FONT_SIZE_16,
                    fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                    color: Colors.BLACK,
                    marginBottom: '15px',
                  }}
                >
                  {i18n.t('FamilyMembers')}
                </CustomText>
              </div>

              {/* Family Members */}
              <div style={{ gap: '10px', display: 'flex', flexDirection: 'column' }}>
                {familyMembers.map((member) => {
                  const isSelected = multiSelect
                    ? selectedMembers.some(m => m.id === member.id)
                    : selectedMember?.id === member.id;

                  return (
                    <div key={member.id} style={{ marginBottom: '8px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '15px 15px',
                          backgroundColor: isSelected ? Colors.LIGHT_BLUE_BACKGROUND : Colors.WHITE,
                          borderRadius: '12px',
                          border: isSelected ? `2px solid ${Colors.BLUE}` : `1px solid ${Colors.LIGHT_GREY}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 2px 8px rgba(59, 130, 246, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                        }}
                        onClick={() => handleMemberSelect(member)}
                      >
                        {/* Member Avatar */}
                        <div style={{ marginRight: '15px' }}>
                          {member.avatarImagePath ? (
                            <img
                              src={member.avatarImagePath}
                              alt={`${member.firstName} ${member.lastName}`}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: Colors.BLUE_GREY,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                                color: Colors.BLACK,
                              }}
                            >
                              {getInitials({
                                FirstName: member.firstName,
                                LastName: member.lastName,
                              })}
                            </div>
                          )}
                        </div>

                        {/* Member Info */}
                        <div style={{ flex: 1 }}>
                          <CustomText
                            style={{
                              fontSize: FONT_SIZE_16,
                              fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                              color: isSelected ? Colors.BLUE : Colors.BLACK,
                              marginBottom: '2px',
                            }}
                          >
                            {`${member.firstName} ${member.lastName}`}
                          </CustomText>
                          {member.emailAddress && (
                            <CustomText
                              style={{
                                fontSize: 12,
                                fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                                color: Colors.PEARL,
                                marginLeft: '8px',
                              }}
                            >
                              {member.emailAddress}
                            </CustomText>
                          )}
                        </div>

                        {/* Selection Indicator */}
                        {isSelected && (
                          <img
                            src="/hive-icons/checkmark.svg"
                            alt="selected"
                            style={{ width: '20px', height: '20px' }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px 20px',
            textAlign: 'center',
          }}>
            <CustomText
              style={{
                fontSize: FONT_SIZE_16,
                fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                color: Colors.PEARL,
              }}
            >
              {"No family members available"}
            </CustomText>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default FamilyMemberSelectionModal;
