'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguageContext } from '../../../../context/LanguageContext';
import NavHeader from '../../../../components/NavHeader';
import CustomText from '../../../../components/CustomText';
import HexagonWithImage from '../../../../components/HexagonWithImage';
import HorizontalLine from '../../../../components/HorizontalLine';
import PillDetail from '../../../../components/PillDetail';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import Button from '../../../../components/Button';
import { User } from '../../../../services/types';
import { getUsersByAccount } from '../../../../services/services';
import { Colors, Typography } from '../../../../styles';
import Icon from '../../../../components/Icon';
import { getInitials } from '../../../../util/constants';
import moment from 'moment';
import './edit-member.css';

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

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: Colors.WHITE
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated || !user?.id) {
    return null;
  }

  return <>{children}</>;
};

/**
 * EditMemberContent - The actual content of the Edit Member page
 */
const EditMemberContent: React.FC = () => {
  const { i18n } = useLanguageContext();
  const { user: authUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;

  // State
  const [member, setMember] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        
        // Get all users for the account
        const allUsers = await getUsersByAccount(authUser.accountId);
        
        // Find the specific member
        const foundMember = allUsers.find(u => u.UniqueId === memberId);
        
        if (!foundMember) {
          setError('Member not found');
          setIsLoading(false);
          return;
        }

        setMember(foundMember);
      } catch (error) {
        console.error('Error fetching member:', error);
        setError('Failed to load member information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMember();
  }, [authUser?.accountId, memberId]);



  if (isLoading) {
    return (
      <div className="contact-detail-container">
        <div className="main-content-container">
          <div className="content-with-padding">
            <LoadingSpinner />
          </div>
        </div>
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
                {error || 'Member not found'}
              </CustomText>
              <Button
                textProps={{
                  text: "Go Back",
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
    birthday: member.Birthday ?
      moment(member.Birthday).format('MMMM DD, YYYY') : ''
  };

  // Determine account type based on user properties
  const getAccountType = () => {
    if (isCurrentUser) {
      return 'Account Owner';
    } else if (member.ActiveFamilyMember) {
      return 'Family Member';
    } else if (member.ActiveUser) {
      return 'Active User';
    } else {
      return 'Inactive Member';
    }
  };

  // Navigation header right buttons like React Native
  const navHeaderRightButtons = [{
    key: "edit",
    icon: <Icon name="edit-pen-paper" width={24} height={24} color={Colors.BLUE} />,
    onPress: () => {
      // Navigate to edit page
      router.push(`/my-hive/member/${member.UniqueId}/edit`);
    }
  }];

  return (
    <div className="contact-detail-container">
      {/* Page Header */}
      <NavHeader
        headerText={member.FirstName || 'Anonymous'}
        left={{
          text: "Back",
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
                  Name
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
                  Account Type
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
                  Email
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
                  Phone
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
                  Birthday
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

          {/* PillDetail Component for Tasks, Notes, Docs, Events - Centered */}
          <div style={{
            width: '100%',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <PillDetail
              homeMemberId={member.UniqueId || ''}
              entityType="user"
            />
          </div>

        </div> {/* End content-with-padding */}
      </div> {/* End main-content-container */}
    </div>
  );
};

/**
 * EditMemberPage - The main component that wraps EditMemberContent with AuthGuard
 */
const EditMemberPage: React.FC = () => {
  return (
    <AuthGuard>
      <EditMemberContent />
    </AuthGuard>
  );
};

export default EditMemberPage;
