'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguageContext } from '../../../context/LanguageContext';
import { emitSnackbar } from '../../../util/helpers';
import { useIsMobileApp } from '../../../hooks/useMobileDetection';
import CustomText from '../../../components/CustomText';

import MyHiveToggleView from '../../../components/MyHiveToggleView';
import Icon from '../../../components/Icon';
import DeleteModal from '../../../components/DeleteModal';

import PillDetail from '../../../components/PillDetail';


import { Colors } from '../../../styles/index';
import { formatBirthdayForDisplay } from '../../../util/dateUtils';
import { initiateCall, initiateSMS, initiateEmail, initiateMapNavigation } from '../../../util/mobileUrlSchemes';
import {
  FONT_FAMILY_POPPINS_REGULAR,
} from '../../../styles/typography';
import { IContact } from '../../../services/types';

// Import styles
import './contact-detail.css';

// AuthGuard component to protect the route
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);



  if (!isAuthenticated || !user?.id) {
    return null;
  }

  return <>{children}</>;
};

/**
 * ContactDetailContent - The main content of the contact detail page
 */
const ContactDetailContent: React.FC = () => {
  const { i18n } = useLanguageContext();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const contactId = params.id as string;
  const isMobileApp = useIsMobileApp();

  const [contact, setContact] = useState<IContact | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [expanded, setExpanded] = useState<boolean>(false);
  const [myHiveToggleActive, setMyHiveToggleActive] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);



  // Check if contact has additional details to show
  const moreDetailFields = [
    'SecondaryEmailAddress',
    'TertiaryEmailAddress',
    'TertiaryPhoneNumber',
    'Home_Phone_Number',
    'SecondaryAddress',
    'TertiaryAddress'
  ];
  const hasMoreDetails = contact && moreDetailFields.some((field) => contact[field as keyof IContact]);

  // Contact type color mapping - matching /people page exactly
  const getContactTypeColor = (type: string): string => {
    const typeColors: Record<string, string> = {
      'Family': '#DEF7F6',      // Water Blue Default
      'Medical': '#FFE2E0',     // Light Pink
      'Education': '#DBD4FF',   // Light Purple
      'Lifestyle': '#FFEACD',   // Light Orange
      'Provider': '#D4DAF2',    // Light Blue
      'Community': '#FFEACD',   // Light Orange for all Community contacts
    };
    return typeColors[type] || '#DEF7F6'; // Default to Water Blue
  };

  const loadContact = useCallback(async () => {
    if (!contactId || !user?.id) return;

    setIsLoading(true);


    try {
      // Add userId and accountId as query parameters
      const url = new URL(`/api/contacts/${contactId}`, window.location.origin);
      if (user.id) url.searchParams.append('userId', user.id);
      if (user.accountId) url.searchParams.append('accountId', user.accountId);



      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const contactData = await response.json();

        // Transform the response - the API returns {contact: {...}, files: [...]}
        // Extract the contact data from the nested structure
        const rawContact = contactData.contact || contactData;

        // Transform camelCase fields to match IContact interface
        const transformedContact = {
          UniqueId: rawContact.id,
          FirstName: rawContact.firstName || '',
          LastName: rawContact.lastName || '',
          DisplayName: rawContact.displayName || '',
          EmailAddress: rawContact.emailAddress,
          SecondaryEmailAddress: rawContact.secondaryEmailAddress,
          TertiaryEmailAddress: rawContact.tertiaryEmailAddress,
          Cell_Phone_Number: rawContact.cellPhoneNumber,
          Home_Phone_Number: rawContact.homePhoneNumber,
          TertiaryPhoneNumber: rawContact.tertiaryPhoneNumber,
          Address: rawContact.address,
          SecondaryAddress: rawContact.secondaryAddress,
          TertiaryAddress: rawContact.tertiaryAddress,
          StreetName: rawContact.streetName,
          City: rawContact.city,
          State: rawContact.state,
          Country: rawContact.country,
          ZipCode: rawContact.zipCode,
          Birthday: rawContact.birthday,
          Workplace: rawContact.workplace,
          Type: rawContact.type,
          Relationship: rawContact.relationship,
          RelevantNotes: rawContact.relevantNotes,
          AvatarImagePath: rawContact.avatarImagePath,
          Account_uniqueId: rawContact.accountId,
          User_uniqueId: rawContact.userId,
          CreationTimestamp: rawContact.creationTimestamp,
          UpdateTimestamp: rawContact.updateTimestamp,
          Active: rawContact.active,
          Deleted: rawContact.deleted,
          MobileDeviceContactId: rawContact.mobileDeviceContactId,
          Invited_User_uniqueId: rawContact.invitedUserId,
        };

        setContact(transformedContact);

        // Initialize toggle state based on whether contact has an invitedUserId
        setMyHiveToggleActive(!!rawContact.invitedUserId);

      } else {
        console.error("Failed to load contact:", response.status);
        const errorData = await response.json().catch(() => ({}));
        console.error("Error details:", errorData);

        // Navigate back if contact not found
        if (response.status === 404) {
          router.push('/people');
        }
      }
    } catch (error) {
      console.error("Failed to load contact:", error);
    } finally {
      setIsLoading(false);
    }
  }, [contactId, user?.id, user?.accountId, router]);

  const handleDeleteContact = async () => {
    if (!contact || !user) {
      return;
    }

    try {
      const response = await fetch('/api/contacts', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: contact.UniqueId,
          accountId: contact.Account_uniqueId || user.accountId,
          userId: contact.User_uniqueId || user.id,
        }),
      });

      if (response.ok) {
        // Navigate back to people page
        router.push('/people');
      } else {
        console.error("Failed to delete contact:", response.status);
        alert('Failed to delete contact. Please try again.');
      }
    } catch (error) {
      console.error("Failed to delete contact:", error);
      alert('Failed to delete contact. Please try again.');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const getDisplayName = () => {
    if (!contact) return 'Unknown Contact';

    // Prioritize display name if available
    if (contact.DisplayName && contact.DisplayName.trim()) {
      return contact.DisplayName.trim();
    }

    // Fall back to first/last name combination
    if (contact.FirstName && contact.LastName) {
      return `${contact.FirstName} ${contact.LastName}`;
    } else if (contact.FirstName) {
      return contact.FirstName;
    } else if (contact.LastName) {
      return contact.LastName;
    } else if (contact.EmailAddress) {
      return contact.EmailAddress;
    }
    return 'Unknown Contact';
  };

  const getInitials = () => {
    const displayName = getDisplayName();
    if (displayName === 'Unknown Contact') return 'UC';
    
    const names = displayName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    } else if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return 'UC';
  };

  const handleCall = () => {
    if (contact?.Cell_Phone_Number) {
      if (isMobileApp) {
        // Use mobile URL scheme for native app
        initiateCall(contact.Cell_Phone_Number);
      } else {
        // Use web tel: link
        window.location.href = `tel:${contact.Cell_Phone_Number}`;
      }
    }
  };

  const handleEmail = () => {
    if (contact?.EmailAddress) {
      if (isMobileApp) {
        // Use mobile URL scheme for native app
        initiateEmail(contact.EmailAddress);
      } else {
        // Use web mailto: link
        window.location.href = `mailto:${contact.EmailAddress}`;
      }
    }
  };

  const handleText = () => {
    if (contact?.Cell_Phone_Number) {
      if (isMobileApp) {
        // Use mobile URL scheme for native app
        initiateSMS(contact.Cell_Phone_Number);
      } else {
        // Use web sms: link
        window.location.href = `sms:${contact.Cell_Phone_Number}`;
      }
    }
  };

  const toggleDetails = () => {
    setExpanded(prev => !prev);
  };



  const handleMyHiveToggle = async () => {
    if (!contact || !user) {
      console.error('Missing contact or user data');
      return;
    }

    const newToggleState = !myHiveToggleActive;
    console.log('My Hive toggle:', newToggleState);

    try {
      const response = await fetch(`/api/contacts/${contactId}/toggle-hive-member`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: user.accountId,
          userId: user.id,
          enabled: newToggleState,
          activeFamilyMember: newToggleState, // When adding to hive, make them active; when removing, this doesn't matter
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Toggle hive member result:', result);

        // Update the toggle state
        setMyHiveToggleActive(newToggleState);

        // Update the contact's invitedUserId based on the result
        if (newToggleState && result.createdUserId) {
          setContact(prev => prev ? {
            ...prev,
            Invited_User_uniqueId: result.createdUserId
          } : null);
        } else if (!newToggleState) {
          setContact(prev => prev ? {
            ...prev,
            Invited_User_uniqueId: undefined
          } : null);
        }

        // Success - no toast needed, toggle state change provides visual feedback
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to toggle hive member:', errorData);
        const errorMessage = errorData.error || 'Failed to toggle hive member status';
        emitSnackbar({
          message: errorMessage,
          type: 'error',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Error toggling hive member:', error);
      emitSnackbar({
        message: 'An unexpected error occurred. Please try again.',
        type: 'error',
        duration: 4000,
      });
    }
  };

  useEffect(() => {
    loadContact();
  }, [contactId, user?.id, loadContact]);









  if (isLoading) {
    return (
      <div className="contact-detail-container">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            padding: isMobileApp ? '16px' : '20px',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <button
            onClick={() => router.push('/people')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              zIndex: 2,
            }}
          >
            <img
              src="/icons/icon-menu-back.svg"
              width={24}
              height={24}
              alt="Back"
              style={{ cursor: 'pointer' }}
            />
          </button>

          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CustomText
              style={{
                color: '#000E50',
                fontFamily: 'Poppins',
                fontSize: '20px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
                letterSpacing: '-0.408px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              Loading
            </CustomText>
          </div>

          <div style={{ width: '24px', height: '24px' }} />
        </div>

        {/* Body section with loading message */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          padding: '20px'
        }}>
          <CustomText style={{
            color: '#000E50',
            fontFamily: 'Poppins',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal',
            textAlign: 'center',
          }}>
            Loading contact details
          </CustomText>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="contact-detail-container">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            padding: isMobileApp ? '16px' : '20px',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <button
            onClick={() => router.push('/people')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              zIndex: 2,
            }}
          >
            <img
              src="/icons/icon-menu-back.svg"
              width={24}
              height={24}
              alt="Back"
              style={{ cursor: 'pointer' }}
            />
          </button>

          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CustomText
              style={{
                color: '#000E50',
                fontFamily: 'Poppins',
                fontSize: '20px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
                letterSpacing: '-0.408px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              Contact Not Found
            </CustomText>
          </div>

          <div style={{ width: '24px', height: '24px' }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px'
        }}>
          <CustomText>Contact not found</CustomText>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-detail-container">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          padding: isMobileApp ? '16px' : '20px',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <button
          onClick={() => router.push('/people')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          <img
            src="/icons/icon-menu-back.svg"
            width={24}
            height={24}
            alt="Back"
            style={{ cursor: 'pointer' }}
          />
        </button>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <CustomText
            style={{
              color: '#000E50',
              fontFamily: 'Poppins',
              fontSize: '20px',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: 'normal',
              letterSpacing: '-0.408px',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {contact?.DisplayName || contact?.FirstName || i18n.t("ContactDetails")}
          </CustomText>
        </div>

        <div style={{ display: 'flex', gap: '8px', zIndex: 2 }}>

          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Icon name="bin-lid" width={24} height={24} color={Colors.BLUE} />
          </button>
        </div>
      </div>

      {/* Areas div */}
      <div style={{ marginTop: '66px' }}>
        {/* Background */}
        <div style={{
          backgroundImage: 'url(/backgrounds/home-background.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          height: '100vh',
          position: 'relative',
        }}>
          {/* User Avatar positioned where hex tile would be - centered horizontally, midpoint at top of background */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '96px',
            height: '106px',
            flexShrink: 0,
            zIndex: 10,
          }}>
            {contact.AvatarImagePath ? (
              // Show hexagonal cropped avatar with white border (no hex tile background)
              <>
                {/* White border hexagon (larger, behind) */}
                <div style={{
                  position: 'absolute',
                  width: '96px',
                  height: '106px',
                  backgroundColor: 'white',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 11,
                }} />

                {/* Main hexagon avatar */}
                <div style={{
                  width: '86px',
                  height: '96px',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  overflow: 'hidden',
                  zIndex: 12,
                  backgroundColor: Colors.GRAY,
                }}>
                  <img
                    src={contact.AvatarImagePath}
                    alt="Contact Avatar"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              </>
            ) : (
              // Show initials over hex tile background
              <>
                {/* Plus button background */}
                <img
                  src="/icons/tab-bar/icon-tab-bar-plus-button.svg"
                  width={96}
                  height={106}
                  alt="Plus Button"
                  style={{
                    width: '96px',
                    height: '106px',
                    flexShrink: 0,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                />

                {/* Initials overlay - centered within hex tile */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 11,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CustomText style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: Colors.BLACK,
                    fontFamily: FONT_FAMILY_POPPINS_REGULAR,
                  }}>
                    {getInitials()}
                  </CustomText>
                </div>
              </>
            )}
          </div>
        </div>

          {/* Content positioned within background */}
          <div style={{
            position: 'absolute',
            top: '120px',
            left: '0',
            right: '0',
            padding: '20px 24px',
            zIndex: 5,
          }}>
            {/* Quick Action Buttons - 66px from top of content area */}
            <div style={{
              display: 'flex',
              width: '342px',
              padding: '0 40px',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '66px',
              marginBottom: '24px',
              marginLeft: 'auto',
              marginRight: 'auto',
              zIndex: 1,
            }}>
              <button
                style={{
                  display: 'flex',
                  padding: '0 9px',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  cursor: contact?.Cell_Phone_Number ? 'pointer' : 'not-allowed',
                  opacity: contact?.Cell_Phone_Number ? 1 : 0.5,
                }}
                onClick={handleCall}
                disabled={!contact?.Cell_Phone_Number}
              >
                <img
                  src="/hive-icons/phone.svg"
                  alt="Phone"
                  width={24}
                  height={24}
                  style={{
                    opacity: contact?.Cell_Phone_Number ? 1 : 0.5,
                  }}
                />
                <CustomText style={{
                  color: '#000E50',
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '21px',
                  letterSpacing: '-0.408px',
                  opacity: contact?.Cell_Phone_Number ? 1 : 0.5,
                }}>
                  {i18n.t('Call' as any)}
                </CustomText>
              </button>

              <button
                style={{
                  display: 'flex',
                  padding: '0 9px',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  cursor: contact?.Cell_Phone_Number ? 'pointer' : 'not-allowed',
                  opacity: contact?.Cell_Phone_Number ? 1 : 0.5,
                }}
                onClick={handleText}
                disabled={!contact?.Cell_Phone_Number}
              >
                <img
                  src="/hive-icons/sms-bubble.svg"
                  alt="Text"
                  width={24}
                  height={24}
                  style={{
                    opacity: contact?.Cell_Phone_Number ? 1 : 0.5,
                  }}
                />
                <CustomText style={{
                  color: '#000E50',
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '21px',
                  letterSpacing: '-0.408px',
                  opacity: contact?.Cell_Phone_Number ? 1 : 0.5,
                }}>
                  {i18n.t('Text' as any)}
                </CustomText>
              </button>

              <button
                style={{
                  display: 'flex',
                  padding: '0 9px',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  cursor: contact?.EmailAddress ? 'pointer' : 'not-allowed',
                  opacity: contact?.EmailAddress ? 1 : 0.5,
                }}
                onClick={handleEmail}
                disabled={!contact?.EmailAddress}
              >
                <img
                  src="/hive-icons/email.svg"
                  alt="Email"
                  width={24}
                  height={24}
                  style={{
                    opacity: contact?.EmailAddress ? 1 : 0.5,
                  }}
                />
                <CustomText style={{
                  color: '#000E50',
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '21px',
                  letterSpacing: '-0.408px',
                  opacity: contact?.EmailAddress ? 1 : 0.5,
                }}>
                  {i18n.t('Email' as any)}
                </CustomText>
              </button>
            </div>

        {/* Scrollable Content */}
        <div style={{
          width: '100%',
          marginBottom: '20px',
          overflowY: 'auto',
          flex: 1,
          boxSizing: 'border-box',
        }}>

          {/* Summary Card */}
          <div style={{
            backgroundColor: Colors.WHITE,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            width: '100%',
            boxSizing: 'border-box',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <CustomText style={{
                color: '#000E50',
                fontFamily: 'Poppins',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '15px', /* 93.75% */
              }}>
                {getDisplayName()}
              </CustomText>

              {contact.Type && (
                <div style={{
                  backgroundColor: getContactTypeColor(contact.Type),
                  borderRadius: '39px',
                  padding: '4px 15px',
                  height: '27px',
                  minWidth: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CustomText style={{
                    color: '#000E50',
                    textAlign: 'center',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '15px', /* 125% */
                  }}>
                    {contact.Type === 'Community'
                      ? (contact.Relationship ? i18n.t(contact.Relationship as any) : i18n.t('Community'))
                      : (contact.Type ? i18n.t(contact.Type as any) : '')}
                  </CustomText>
                </div>
              )}
            </div>

            {/* Contact Details - Match React Native layout exactly */}
            <div style={{ marginBottom: '16px' }}>
              {/* Email */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: '14px',
              }}>
                <CustomText style={{
                  color: '#000E50',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '19px', /* 135.714% */
                  letterSpacing: '-0.084px',
                }}>
                  {i18n.t("Email")}
                </CustomText>
                {contact.EmailAddress ? (
                  <a
                    href={`mailto:${contact.EmailAddress}`}
                    style={{
                      color: '#000E50',
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      lineHeight: '100%', /* 14px */
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                    onClick={(e) => {
                      if (isMobileApp && contact.EmailAddress) {
                        e.preventDefault();
                        initiateEmail(contact.EmailAddress);
                      }
                    }}
                  >
                    {contact.EmailAddress}
                  </a>
                ) : (
                  <CustomText style={{
                    color: '#000E50',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '100%', /* 14px */
                  }}>
                    -
                  </CustomText>
                )}
              </div>

              {/* Phone Number */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: '14px',
              }}>
                <CustomText style={{
                  color: '#000E50',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '19px', /* 135.714% */
                  letterSpacing: '-0.084px',
                }}>
                  {i18n.t("PhoneNumber")}
                </CustomText>
                {contact.Cell_Phone_Number ? (
                  <a
                    href={`tel:${contact.Cell_Phone_Number}`}
                    style={{
                      color: '#000E50',
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      lineHeight: '100%', /* 14px */
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                    onClick={(e) => {
                      if (isMobileApp && contact.Cell_Phone_Number) {
                        e.preventDefault();
                        initiateCall(contact.Cell_Phone_Number);
                      }
                    }}
                  >
                    {contact.Cell_Phone_Number}
                  </a>
                ) : (
                  <CustomText style={{
                    color: '#000E50',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '100%', /* 14px */
                  }}>
                    -
                  </CustomText>
                )}
              </div>

              {/* Birthday */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: '14px',
              }}>
                <CustomText style={{
                  color: '#000E50',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '19px', /* 135.714% */
                  letterSpacing: '-0.084px',
                }}>
                  {i18n.t("Birthday")}
                </CustomText>
                <CustomText style={{
                  color: '#000E50',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '100%', /* 14px */
                }}>
                  {formatBirthdayForDisplay(contact.Birthday) || "-"}
                </CustomText>
              </div>

              {/* Relationship */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: '14px',
              }}>
                <CustomText style={{
                  color: '#000E50',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '19px', /* 135.714% */
                  letterSpacing: '-0.084px',
                }}>
                  {i18n.t("Relationship")}
                </CustomText>
                <CustomText style={{
                  color: '#000E50',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '100%', /* 14px */
                }}>
                  {contact.Relationship ? i18n.t(contact.Relationship as any) : "-"}
                </CustomText>
              </div>

              {/* Address */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: '14px',
              }}>
                <CustomText style={{
                  color: '#000E50',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '19px', /* 135.714% */
                  letterSpacing: '-0.084px',
                }}>
                  {i18n.t("Address")}
                </CustomText>
                {contact.Address ? (
                  <a
                    href={`https://maps.apple.com/?q=${encodeURIComponent(contact.Address)}`}
                    style={{
                      color: '#000E50',
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      lineHeight: '100%', /* 14px */
                      textDecoration: 'none',
                      cursor: 'pointer',
                      textAlign: 'right',
                      maxWidth: '200px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                    onClick={(e) => {
                      if (isMobileApp && contact.Address) {
                        e.preventDefault();
                        initiateMapNavigation(contact.Address);
                      }
                    }}
                  >
                    {contact.Address}
                  </a>
                ) : (
                  <CustomText style={{
                    color: '#000E50',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '100%', /* 14px */
                  }}>
                    -
                  </CustomText>
                )}
              </div>
            </div>

            {/* More Details Button - Only show if there are additional details */}
            {hasMoreDetails && (
              <button
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  padding: '16px 0',
                }}
                onClick={toggleDetails}
              >
                <CustomText style={{
                  color: '#666E96',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '19px', /* 135.714% */
                  letterSpacing: '-0.084px',
                }}>
                  {i18n.t("MoreDetails")}
                </CustomText>
                <img
                  src="/icons/icon-menu-back.svg"
                  width={24}
                  height={24}
                  alt="Expand"
                  style={{
                    transform: expanded ? 'rotate(90deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.3s ease',
                    opacity: 0.5,
                  }}
                />
              </button>
            )}

            {/* Expanded Details - Match React Native structure */}
            {expanded && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                maxHeight: '200px',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
              }}>
                {/* Additional Email Addresses */}
                {(contact.SecondaryEmailAddress || contact.TertiaryEmailAddress) && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    padding: '12px',
                  }}>
                    <CustomText style={{
                      color: '#000E50',
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '19px', /* 135.714% */
                      letterSpacing: '-0.084px',
                    }}>
                      {i18n.t("AdditionalEmailAddresses")}
                    </CustomText>
                    {contact.SecondaryEmailAddress && (
                      <a
                        href={`mailto:${contact.SecondaryEmailAddress}`}
                        style={{
                          color: '#000E50',
                          fontFamily: 'Poppins',
                          fontSize: '14px',
                          fontStyle: 'normal',
                          fontWeight: 500,
                          lineHeight: '100%', /* 14px */
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = 'none';
                        }}
                        onClick={(e) => {
                          if (isMobileApp && contact.SecondaryEmailAddress) {
                            e.preventDefault();
                            initiateEmail(contact.SecondaryEmailAddress);
                          }
                        }}
                      >
                        {contact.SecondaryEmailAddress}
                      </a>
                    )}
                    {contact.TertiaryEmailAddress && (
                      <a
                        href={`mailto:${contact.TertiaryEmailAddress}`}
                        style={{
                          color: '#000E50',
                          fontFamily: 'Poppins',
                          fontSize: '14px',
                          fontStyle: 'normal',
                          fontWeight: 500,
                          lineHeight: '100%', /* 14px */
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = 'none';
                        }}
                        onClick={(e) => {
                          if (isMobileApp && contact.TertiaryEmailAddress) {
                            e.preventDefault();
                            initiateEmail(contact.TertiaryEmailAddress);
                          }
                        }}
                      >
                        {contact.TertiaryEmailAddress}
                      </a>
                    )}
                  </div>
                )}

                {/* Additional Phone Numbers */}
                {(contact.Home_Phone_Number || contact.TertiaryPhoneNumber) && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    padding: '12px',
                  }}>
                    <CustomText style={{
                      color: '#000E50',
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '19px', /* 135.714% */
                      letterSpacing: '-0.084px',
                    }}>
                      {i18n.t("AdditionalPhoneNumbers")}
                    </CustomText>
                    {contact.Home_Phone_Number && (
                      <a
                        href={`tel:${contact.Home_Phone_Number}`}
                        style={{
                          color: '#000E50',
                          fontFamily: 'Poppins',
                          fontSize: '14px',
                          fontStyle: 'normal',
                          fontWeight: 500,
                          lineHeight: '100%', /* 14px */
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = 'none';
                        }}
                        onClick={(e) => {
                          if (isMobileApp && contact.Home_Phone_Number) {
                            e.preventDefault();
                            initiateCall(contact.Home_Phone_Number);
                          }
                        }}
                      >
                        {contact.Home_Phone_Number}
                      </a>
                    )}
                    {contact.TertiaryPhoneNumber && (
                      <a
                        href={`tel:${contact.TertiaryPhoneNumber}`}
                        style={{
                          color: '#000E50',
                          fontFamily: 'Poppins',
                          fontSize: '14px',
                          fontStyle: 'normal',
                          fontWeight: 500,
                          lineHeight: '100%', /* 14px */
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = 'none';
                        }}
                        onClick={(e) => {
                          if (isMobileApp && contact.TertiaryPhoneNumber) {
                            e.preventDefault();
                            initiateCall(contact.TertiaryPhoneNumber);
                          }
                        }}
                      >
                        {contact.TertiaryPhoneNumber}
                      </a>
                    )}
                  </div>
                )}

                {/* Additional Addresses */}
                {(contact.SecondaryAddress || contact.TertiaryAddress) && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    padding: '12px',
                  }}>
                    <CustomText style={{
                      color: '#000E50',
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '19px', /* 135.714% */
                      letterSpacing: '-0.084px',
                    }}>
                      {i18n.t("AdditionalAddresses")}
                    </CustomText>
                    {contact.SecondaryAddress && (
                      <a
                        href={`https://maps.apple.com/?q=${encodeURIComponent(contact.SecondaryAddress)}`}
                        style={{
                          color: '#000E50',
                          fontFamily: 'Poppins',
                          fontSize: '14px',
                          fontStyle: 'normal',
                          fontWeight: 500,
                          lineHeight: '100%', /* 14px */
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = 'none';
                        }}
                        onClick={(e) => {
                          if (isMobileApp && contact.SecondaryAddress) {
                            e.preventDefault();
                            initiateMapNavigation(contact.SecondaryAddress);
                          }
                        }}
                      >
                        {contact.SecondaryAddress}
                      </a>
                    )}
                    {contact.TertiaryAddress && (
                      <a
                        href={`https://maps.apple.com/?q=${encodeURIComponent(contact.TertiaryAddress)}`}
                        style={{
                          color: '#000E50',
                          fontFamily: 'Poppins',
                          fontSize: '14px',
                          fontStyle: 'normal',
                          fontWeight: 500,
                          lineHeight: '100%', /* 14px */
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = 'none';
                        }}
                        onClick={(e) => {
                          if (isMobileApp && contact.TertiaryAddress) {
                            e.preventDefault();
                            initiateMapNavigation(contact.TertiaryAddress);
                          }
                        }}
                      >
                        {contact.TertiaryAddress}
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Edit Button - At the bottom of the content area */}
            <button
              onClick={() => router.push(`/people/${contactId}/edit`)}
              style={{
                display: 'flex',
                minHeight: '44px',
                padding: '10px 16px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                alignSelf: 'stretch',
                borderRadius: '100px',
                background: '#EAEDF8',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                marginTop: '16px',
              }}
            >
              <Icon name="edit-pen-paper" width={24} height={24} color="#666E96" />
              <CustomText style={{
                color: '#666E96',
                fontFamily: 'Poppins',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '120%', /* 19.2px */
              }}>
                {i18n.t('Edit')}
              </CustomText>
            </button>
          </div>



          {/* My Hive Toggle */}
          <div style={{ width: '100%', marginTop: '24px', marginBottom: '24px' }}>
            <MyHiveToggleView
              isActive={myHiveToggleActive}
              onTogglePress={handleMyHiveToggle}
            />
          </div>

          {/* Divider */}
          <div style={{
            width: '100%',
            height: '1px',
            backgroundColor: '#D4DAF2',
            marginBottom: '24px',
          }} />



          {/* PillDetail Component for Tasks, Notes, Docs, Events */}
          <div style={{
            width: '100%',
            marginBottom: '20px',
          }}>
            <PillDetail
              homeMemberId={contact?.UniqueId || ''}
              contactInfo={contact}
              entityType="contact"
              firstName={contact?.FirstName || ''}
              lastName={contact?.LastName || ''}
            />
          </div>

          </div> {/* End content positioned within background */}
        </div> {/* End background */}
      </div> {/* End areas div */}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isVisible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
        category="contact"
        onDelete={handleDeleteContact}
      />
    </div>
  );
};

/**
 * ContactDetail Page Component
 */
const ContactDetail: React.FC = () => {
  return (
    <AuthGuard>
      <ContactDetailContent />
    </AuthGuard>
  );
};

export default ContactDetail;
