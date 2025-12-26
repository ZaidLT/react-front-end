'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguageContext } from '../../../../context/LanguageContext';
import { emitSnackbar } from '../../../../util/helpers';
import NavHeader from '../../../../components/NavHeader';
import CustomText from '../../../../components/CustomText';
import HexagonWithImage from '../../../../components/HexagonWithImage';
import HorizontalLine from '../../../../components/HorizontalLine';
import PillDetail from '../../../../components/PillDetail';
import MyHiveToggleView from '../../../../components/MyHiveToggleView';
import DeleteModal from '../../../../components/DeleteModal';

import Button from '../../../../components/Button';
import { User } from '../../../../services/types';
import { getUserById } from '../../../../services/services';
import { Colors, Typography } from '../../../../styles';
import Icon from '../../../../components/Icon';
import { getInitials } from '../../../../util/constants';
import moment from 'moment';
import { trackEvent, AmplitudeEvents } from '../../../../services/analytics';

import { formatBirthdayForDisplay } from '../../../../util/dateUtils';
import './member-detail.css';

/**
 * AuthGuard - A component that ensures authentication is complete before rendering children
 */
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // While loading auth state, render minimal container (no skeleton)
  if (isLoading) {
    return (
      <div className="contact-detail-container">
        <div className="main-content-container" />
      </div>
    );
  }

  if (!isAuthenticated || !user?.id) {
    return null;
  }

  return <>{children}</>;
};

/**
 * MemberDetailContent - The actual content of the Member Detail page
 */
const MemberDetailContent: React.FC = () => {
  const { i18n } = useLanguageContext();
  const { user: authUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;

  // State
  const [member, setMember] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passiveToggleActive, setPassiveToggleActive] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // Check if this is the current user
  const isCurrentUser = member?.UniqueId === authUser?.id;

  // Fetch member data
  useEffect(() => {
    const fetchMember = async () => {
      if (!authUser?.accountId || !memberId) {
        setError('Missing required information');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get the specific member directly
        const foundMember = await getUserById(authUser.accountId, memberId);

        if (!foundMember) {
          setError('Member not found');
          setIsLoading(false);
          return;
        }

        setMember(foundMember);

        // Initialize passive toggle state - passive members have ActiveFamilyMember = false
        setPassiveToggleActive(!foundMember.ActiveFamilyMember);
      } catch (error) {
        console.error('Error fetching member:', error);
        setError('Failed to load member information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMember();
  }, [authUser?.accountId, memberId]);



  // While loading, render empty container without skeleton
  if (isLoading) {
    return (
      <div className="contact-detail-container">
        <div className="main-content-container" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="contact-detail-container">
        <div className="main-content-container">
          <div className="content-with-padding">
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px',
              maxWidth: '400px',
              margin: '0 auto',
            }}>
              <CustomText style={{
                fontSize: Typography.FONT_SIZE_20,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                color: Colors.RED,
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                {error || i18n.t('MemberNotFound')}
              </CustomText>
              <Button
                textProps={{
                  text: i18n.t('GoBack'),
                  fontSize: Typography.FONT_SIZE_16,
                  color: Colors.WHITE,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                }}
                onButtonClick={() => router.push('/my-hive')}
                backgroundColor={Colors.BLUE}
                borderProps={{
                  width: 1,
                  color: Colors.BLUE,
                  radius: 8,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format basic info like React Native
  const basicInfoForm = {
    email: member.EmailAddress || '',
    phone: member.Cell_Phone_Number || '',
    birthday: formatBirthdayForDisplay(member.Birthday)
  };





  // Determine account type based on user properties
  const getAccountType = () => {
    if (isCurrentUser) {
      return 'Account Owner';
    } else if (member.ActiveFamilyMember) {
      return 'Active';
    } else {
      return 'Passive';
    }
  };

  // Handle passive member toggle
  const handlePassiveToggle = async () => {
    if (!member || !authUser || isCurrentUser) {
      console.error('Cannot toggle passive status: missing data or trying to toggle self');
      return;
    }

    const newToggleState = !passiveToggleActive;
    const newActiveFamilyMemberStatus = !newToggleState; // If passive toggle is ON, ActiveFamilyMember should be false

    console.log('Passive member toggle:', {
      newToggleState,
      newActiveFamilyMemberStatus,
      currentActiveFamilyMember: member.ActiveFamilyMember
    });

    try {
      const response = await fetch(`/api/users/${member.UniqueId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: member.UniqueId,
          accountId: member.Account_uniqueId || authUser.accountId,
          activeFamilyMember: newActiveFamilyMemberStatus,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Toggle passive member result:', result);

        // Update the toggle state
        setPassiveToggleActive(newToggleState);

        // Update the member's ActiveFamilyMember status
        setMember(prev => prev ? {
          ...prev,
          ActiveFamilyMember: newActiveFamilyMemberStatus
        } : null);

        // Track role changed
        try {
          const role = newActiveFamilyMemberStatus ? 'active' : 'passive';
          trackEvent(AmplitudeEvents.hiveMemberRoleChanged, { memberId: member.UniqueId, role });
        } catch {}

        // Success - toggle state change provides visual feedback
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to toggle passive member:', errorData);
        const errorMessage = errorData.error || 'Failed to toggle member status';
        emitSnackbar({
          message: errorMessage,
          type: 'error',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Error toggling passive member:', error);
      emitSnackbar({
        message: 'An unexpected error occurred. Please try again.',
        type: 'error',
        duration: 4000,
      });
    }
  };

  // Handle removing hive member (same logic as people page toggle)
  const handleRemoveHiveMember = async () => {
    if (!member || !authUser) {
      console.error('Cannot remove hive member: missing data');
      return;
    }

    try {
      // Use the dedicated API endpoint for removing users from hive
      const response = await fetch(`/api/users/${member.UniqueId}/remove-from-hive`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          accountId: member.Account_uniqueId || authUser.accountId,
          requestingUserId: authUser.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Remove hive member result:', result);

        // Navigate back to my-hive page (UI refresh will show the change)
        router.push('/my-hive');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to remove hive member:', errorData);
        const errorMessage = errorData.error || 'Failed to remove hive member';
        emitSnackbar({
          message: errorMessage,
          type: 'error',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Error removing hive member:', error);
      emitSnackbar({
        message: 'An unexpected error occurred. Please try again.',
        type: 'error',
        duration: 4000,
      });
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Navigation header right buttons like React Native
  const navHeaderRightButtons = [
    {
      key: "edit",
      icon: <Icon name="edit-pen-paper" width={24} height={24} color={Colors.BLUE} />,
      onPress: () => {
        // Navigate to edit page
        router.push(`/my-hive/member/${member.UniqueId}/edit`);
      }
    },
    // Only show delete button for other members, not current user
    ...(!isCurrentUser ? [{
      key: "delete",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6H5H21" stroke={Colors.RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke={Colors.RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      onPress: () => setShowDeleteModal(true)
    }] : [])
  ];

  return (
    <div className="contact-detail-container">
      {/* Page Header */}
      <NavHeader
        headerText={member.FirstName || i18n.t('Anonymous')}
        left={{
          text: i18n.t('Back'),
          goBack: true,
          onPress: () => router.push('/my-hive')
        }}
        right={navHeaderRightButtons}
      />

      {/* Main Content */}
      <div className="main-content-container">
        {/* Background gradient using pseudo-element approach - Match React Native exactly */}
        <div style={{
          position: 'absolute',
          top: '105px',
          left: 0,
          right: 0,
          width: '100%',
          height: '2995px',
          backgroundImage: 'url("/pointed-gradient-background.svg")',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
          content: '""',
        }} />

        {/* Content with padding */}
        <div className="content-with-padding">

        {/* Hexagon Avatar - Exact match to People Page */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '20px 0 30px 0',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '104px',
            height: '120px',
          }}>
            {/* White border hexagon (larger, behind) */}
            <div style={{
              content: '',
              position: 'absolute',
              width: '88px',
              height: '88px',
              backgroundColor: 'white',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              zIndex: 1,
            }} />

            {/* Main hexagon */}
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: Colors.GRAY,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              overflow: 'hidden',
              zIndex: 2,
            }}>
              {member.AvatarImagePath ? (
                <img
                  src={member.AvatarImagePath}
                  alt="Member Avatar"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: Colors.GRAY,
                }}>
                  <CustomText style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: Colors.BLACK,
                    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR
                  }}>
                    {getInitials(member)}
                  </CustomText>
                </div>
              )}
            </div>
          </div>
        </div>

          {/* Summary Card - Exact match to People Page */}
          <div style={{
            backgroundColor: Colors.WHITE,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            width: '100%',
            boxSizing: 'border-box',
          }}>
            {/* Name Header - Match People Page */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px',
            }}>
              <CustomText style={{
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                color: Colors.BLACK,
                fontWeight: '600',
              }}>
                {`${member.FirstName || ''} ${member.LastName || ''}`.trim()}
              </CustomText>
            </div>

            {/* Contact Details - Match People Page format exactly */}
            <div style={{ marginBottom: '16px' }}>
              {/* Name (Full Name) */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: '14px',
              }}>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_14,
                  color: Colors.GREY_COLOR,
                }}>
                  {i18n.t('Name')}
                </CustomText>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_14,
                  color: Colors.BLACK,
                }}>
                  {`${member.FirstName || ''} ${member.LastName || ''}`.trim() || '-'}
                </CustomText>
              </div>

              {/* Account Type */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: '14px',
              }}>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_14,
                  color: Colors.GREY_COLOR,
                }}>
                  {i18n.t('AccountType')}
                </CustomText>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_14,
                  color: Colors.BLACK,
                }}>
                  {getAccountType()}
                </CustomText>
              </div>

              {/* Email */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: '14px',
              }}>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_14,
                  color: Colors.GREY_COLOR,
                }}>
                  {i18n.t('Email')}
                </CustomText>
                {basicInfoForm.email ? (
                  <a
                    href={`mailto:${basicInfoForm.email}`}
                    style={{
                      fontSize: Typography.FONT_SIZE_14,
                      color: Colors.BLUE,
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    {basicInfoForm.email}
                  </a>
                ) : (
                  <CustomText style={{
                    fontSize: Typography.FONT_SIZE_14,
                    color: Colors.BLACK,
                  }}>
                    -
                  </CustomText>
                )}
              </div>

              {/* Phone */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: '14px',
              }}>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_14,
                  color: Colors.GREY_COLOR,
                }}>
                  {i18n.t('Phone')}
                </CustomText>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_14,
                  color: Colors.BLACK,
                }}>
                  {basicInfoForm.phone || '-'}
                </CustomText>
              </div>

              {/* Birthday */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: '14px',
              }}>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_14,
                  color: Colors.GREY_COLOR,
                }}>
                  {i18n.t('Birthday')}
                </CustomText>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_14,
                  color: Colors.BLACK,
                }}>
                  {basicInfoForm.birthday || '-'}
                </CustomText>
              </div>
            </div>
          </div>

          {/* Passive Member Toggle - Only show for other members, not current user */}
          {!isCurrentUser && (
            <div style={{ width: '100%', marginBottom: '20px' }}>
              <MyHiveToggleView
                isActive={passiveToggleActive}
                onTogglePress={handlePassiveToggle}
                label="Passive Member"
              />
            </div>
          )}

          {/* PillDetail Component for Tasks, Notes, Docs, Events - Match People Page */}
          <div style={{ width: '100%', marginBottom: '20px' }}>
            <PillDetail
              homeMemberId={member.UniqueId || ''}
              entityType="user"
              firstName={member.FirstName || ''}
              lastName={member.LastName || ''}
            />
          </div>

        </div> {/* End content-with-padding */}
      </div> {/* End main-content-container */}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isVisible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
        category="hive member"
        customTitle="Are you sure you want to remove this hive member?"
        customMessage="This will remove them from your hive. They can be re-added later if needed."
        onDelete={handleRemoveHiveMember}
      />
    </div>
  );
};

/**
 * MemberDetailPage - The main component that wraps MemberDetailContent with AuthGuard
 */
const MemberDetailPage: React.FC = () => {
  return (
    <AuthGuard>
      <MemberDetailContent />
    </AuthGuard>
  );
};

export default MemberDetailPage;
