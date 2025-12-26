'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguageContext } from '../../../../context/LanguageContext';
import { useContactStore } from '../../../../context/store';
import { IContact } from '../../../../services/types';
import { Colors } from '../../../../styles/index';
import { FONT_SIZE_14, FONT_SIZE_16, FONT_FAMILY_POPPINS_REGULAR } from '../../../../styles/typography';
import CustomText from '../../../../components/CustomText';
import Icon from '../../../../components/Icon';
import NavHeader from '../../../../components/NavHeader';
import Button from '../../../../components/Button';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import Modal from '../../../../components/Modal';
import ImageUploadModal from '../../../../components/ImageUploadModal';
import moment from 'moment';
import { formatBirthdayForInput, convertBirthdayForStorage } from '../../../../util/dateUtils';

// Import styles
import './edit-contact.css';

interface IFormData {
  displayName: string;
  firstName: string;
  lastName: string;
  cellPhoneNumber: string;
  homePhoneNumber: string;
  tertiaryPhoneNumber: string;
  primaryEmail: string;
  secondaryEmail: string;
  tertiaryEmail: string;
  primaryAddress: string;
  secondaryAddress: string;
  tertiaryAddress: string;
  birthday: string;
}

interface IContactType {
  [key: string]: {
    relationships: string[];
  };
}

interface IFormErrors {
  firstName?: string;
  phoneNumber?: string;
  email?: string;
}

/**
 * AuthGuard - A component that ensures authentication is complete before rendering children
 */
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
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

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

/**
 * EditContactContent - The main content of the edit contact page
 */
const EditContactContent: React.FC = () => {
  const { user } = useAuth();
  const { i18n } = useLanguageContext();
  const router = useRouter();
  const params = useParams();
  const contactId = params.id as string;
  const updateContact = useContactStore((state) => state.updateContact);

  const [contact, setContact] = useState<IContact | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [contactType, setContactType] = useState<string>('');
  const [relation, setRelation] = useState<string>('');
  const [contactTypeModalVisible, setContactTypeModalVisible] = useState(false);
  const [relationToUserModalVisible, setRelationToUserModalVisible] = useState(false);
  const [contactTypes, setContactTypes] = useState<IContactType>({});
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);


  // Load contact types on component mount
  useEffect(() => {
    // Contact types matching React Native exactly: Community, Family, Lifestyle, Medical, Provider
    const staticContactTypes: IContactType = {
      "Community": { relationships: ["Neighbor", "Friend", "Acquaintance"] },
      "Family": { relationships: ["Parent", "Child", "Sibling", "Spouse", "Relative"] },
      "Lifestyle": { relationships: ["Trainer", "Coach", "Instructor", "Mentor"] },
      "Medical": { relationships: ["Doctor", "Nurse", "Therapist", "Specialist"] },
      "Provider": { relationships: ["Service Provider", "Contractor", "Vendor", "Professional"] }
    };
    setContactTypes(staticContactTypes);
  }, []);

  const [formData, setFormData] = useState<IFormData>({
    displayName: '',
    firstName: '',
    lastName: '',
    cellPhoneNumber: '',
    homePhoneNumber: '',
    tertiaryPhoneNumber: '',
    primaryEmail: '',
    secondaryEmail: '',
    tertiaryEmail: '',
    primaryAddress: '',
    secondaryAddress: '',
    tertiaryAddress: '',
    birthday: '',
  });

  const [formErrors, setFormErrors] = useState<IFormErrors>({});

  // Dynamic field counts (matching React Native)
  const [phoneNumberCount, setPhoneNumberCount] = useState<number>(1);
  const [emailCount, setEmailCount] = useState<number>(1);
  const [addressCount, setAddressCount] = useState<number>(1);

  // Load contact data
  const loadContact = useCallback(async () => {
    if (!user?.id || !contactId) return;

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

        // The API returns the contact data in a nested structure
        const rawContact = contactData.contact || contactData;

        // Transform camelCase fields to match IContact interface (same as view page)
        const contact = {
          ...rawContact,
          AvatarImagePath: rawContact.avatarImagePath,
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
          Type: rawContact.type,
          Relationship: rawContact.relationship,
        };

        setContact(contact);

        // Pre-populate form with existing contact data (matching React Native structure)
        setFormData({
          displayName: contact.displayName || contact.DisplayName || '',
          firstName: contact.firstName || contact.FirstName || '',
          lastName: contact.lastName || contact.LastName || '',
          cellPhoneNumber: contact.cellPhoneNumber || contact.Cell_Phone_Number || '',
          homePhoneNumber: contact.homePhoneNumber || contact.Home_Phone_Number || '',
          tertiaryPhoneNumber: contact.tertiaryPhoneNumber || contact.TertiaryPhoneNumber || '',
          primaryEmail: contact.emailAddress || contact.EmailAddress || '',
          secondaryEmail: contact.secondaryEmailAddress || contact.SecondaryEmailAddress || '',
          tertiaryEmail: contact.tertiaryEmailAddress || contact.TertiaryEmailAddress || '',
          primaryAddress: contact.address || contact.Address || '',
          secondaryAddress: contact.secondaryAddress || contact.SecondaryAddress || '',
          tertiaryAddress: contact.tertiaryAddress || contact.TertiaryAddress || '',
          birthday: formatBirthdayForInput(contact.birthday),
        });

        setContactType(contact.type || contact.Type || '');
        setRelation(contact.relationship || contact.Relationship || '');

        // Set dynamic field counts based on existing data (matching React Native logic)
        setPhoneNumberCount(
          contact.cellPhoneNumber || contact.Cell_Phone_Number
            ? (contact.homePhoneNumber || contact.Home_Phone_Number)
              ? (contact.tertiaryPhoneNumber || contact.TertiaryPhoneNumber)
                ? 3
                : 2
              : 1
            : 1
        );

        setEmailCount(
          contact.emailAddress || contact.EmailAddress
            ? (contact.secondaryEmailAddress || contact.SecondaryEmailAddress)
              ? (contact.tertiaryEmailAddress || contact.TertiaryEmailAddress)
                ? 3
                : 2
              : 1
            : 1
        );

        setAddressCount(
          contact.address || contact.Address
            ? (contact.secondaryAddress || contact.SecondaryAddress)
              ? (contact.tertiaryAddress || contact.TertiaryAddress)
                ? 3
                : 2
              : 1
            : 1
        );

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

  const handleFormChange = (field: keyof IFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (formErrors[field as keyof IFormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFormValidate = (field: string, value: string) => {
    if (field === 'email' && value) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setFormErrors(prev => ({ ...prev, email: 'Invalid email' }));
      } else {
        setFormErrors(prev => {
          const { email, ...rest } = prev; // eslint-disable-line @typescript-eslint/no-unused-vars
          return rest;
        });
      }
    }
  };

  const handlePickImage = () => {
    setShowImagePickerModal(true);
  };

  const handleImageSelected = (file: File) => {
    setSelectedImageFile(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreviewImageUrl(previewUrl);

    setShowImagePickerModal(false);
  };

  const validateForm = (): boolean => {
    const errors: IFormErrors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (formData.primaryEmail && !/\S+@\S+\.\S+/.test(formData.primaryEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.cellPhoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(formData.cellPhoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !contact) {
      return;
    }

    setIsSaving(true);
    try {
      let response;

      if (selectedImageFile) {
        // Create FormData for multipart upload
        const uploadFormData = new FormData();
        uploadFormData.append('id', contactId);
        uploadFormData.append('accountId', user?.accountId || '');
        uploadFormData.append('userId', user?.id || '');
        uploadFormData.append('firstName', formData.firstName);
        uploadFormData.append('lastName', formData.lastName);
        uploadFormData.append('displayName', formData.displayName);
        uploadFormData.append('emailAddress', formData.primaryEmail);
        uploadFormData.append('secondaryEmailAddress', formData.secondaryEmail);
        uploadFormData.append('tertiaryEmailAddress', formData.tertiaryEmail);
        uploadFormData.append('address', formData.primaryAddress);
        uploadFormData.append('secondaryAddress', formData.secondaryAddress);
        uploadFormData.append('tertiaryAddress', formData.tertiaryAddress);
        uploadFormData.append('cellPhoneNumber', formData.cellPhoneNumber);
        uploadFormData.append('homePhoneNumber', formData.homePhoneNumber);
        uploadFormData.append('tertiaryPhoneNumber', formData.tertiaryPhoneNumber);
        uploadFormData.append('birthday', convertBirthdayForStorage(formData.birthday) || '');
        uploadFormData.append('type', contactType);
        uploadFormData.append('relationship', relation);
        uploadFormData.append('avatarImages', selectedImageFile, selectedImageFile.name);

        response = await fetch(`/api/contacts/${contactId}/update`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            // Don't set Content-Type for FormData - let the browser set it with boundary
          },
          body: uploadFormData,
        });
      } else {
        // Prepare the payload using the correct lowercase field names that match the backend schema
        const payload = {
          id: contactId, // Required for updates
          accountId: user?.accountId,
          userId: user?.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          displayName: formData.displayName,
          emailAddress: formData.primaryEmail,
          secondaryEmailAddress: formData.secondaryEmail,
          tertiaryEmailAddress: formData.tertiaryEmail,
          address: formData.primaryAddress,
          secondaryAddress: formData.secondaryAddress,
          tertiaryAddress: formData.tertiaryAddress,
          cellPhoneNumber: formData.cellPhoneNumber,
          homePhoneNumber: formData.homePhoneNumber,
          tertiaryPhoneNumber: formData.tertiaryPhoneNumber,
          birthday: convertBirthdayForStorage(formData.birthday) || null,
          type: contactType,
          relationship: relation,
        };

        // Update contact API call
        response = await fetch(`/api/contacts/${contactId}/update`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        const updatedContact = await response.json();

        // Update the contact in the store
        updateContact(updatedContact);

        // Navigate back to contact detail page
        router.push(`/people/${contactId}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update contact:', response.status, errorData);
        alert('Failed to update contact. Please try again.');
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('An error occurred while updating the contact. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadContact();
  }, [loadContact]);

  if (isLoading) {
    return (
      <div className="edit-contact-container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px'
        }}>
          <CustomText>Loading contact...</CustomText>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="edit-contact-container">
        <NavHeader
          headerText="Contact Not Found"
          left={{
            text: "Back",
            goBack: true,
            onPress: () => router.push('/people')
          }}
        />
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
    <div className="edit-contact-container">
      {/* Page Header - Matching contact detail page */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          padding: '20px',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <button
          onClick={() => router.back()}
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
            {i18n.t("EditContact")}
          </CustomText>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            background: 'none',
            border: 'none',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            zIndex: 2,
            opacity: isSaving ? 0.5 : 1,
          }}
        >
          <CustomText
            style={{
              color: '#000E50',
              fontFamily: 'Poppins',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: 'normal',
              letterSpacing: '-0.408px',
            }}
          >
            {i18n.t('Save')}
          </CustomText>
        </button>
      </div>

      {/* Main Content Container */}
      <div className="main-content-container">
        <div className="content-with-padding">

          {/* Contact Avatar Section - Matching contact detail page */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '40px',
            marginTop: '20px',
          }}>
            <div style={{
              position: 'relative',
              width: '96px',
              height: '106px',
              flexShrink: 0,
            }}>
              {previewImageUrl || contact?.AvatarImagePath ? (
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
                    zIndex: 1,
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
                    zIndex: 2,
                    backgroundColor: Colors.GRAY,
                  }}>
                    <img
                      src={previewImageUrl || contact?.AvatarImagePath}
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
                    zIndex: 3,
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
                      {(() => {
                        // Prioritize display name for initials if available
                        if (formData.displayName && formData.displayName.trim()) {
                          const names = formData.displayName.trim().split(' ');
                          if (names.length >= 2) {
                            return `${names[0][0]}${names[1][0]}`.toUpperCase();
                          } else if (names.length === 1) {
                            return names[0].substring(0, 2).toUpperCase();
                          }
                        }

                        // Fall back to first/last name
                        if (formData.firstName && formData.lastName) {
                          return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
                        } else if (formData.firstName) {
                          return formData.firstName.substring(0, 2).toUpperCase();
                        }

                        return 'UC';
                      })()}
                    </CustomText>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* User Info Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '12px', // 12px + 20px parent gap = 32px total
            marginTop: '0px',
            paddingTop: '0px',
          }}>
            <CustomText style={{
              color: '#000E50',
              fontFamily: 'Poppins',
              fontSize: '20px',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: '100%', /* 20px */
            }}>
              {i18n.t('UserInfo')}
            </CustomText>
          </div>

          {/* Add/Edit Profile Picture Row */}
          <button
            onClick={handlePickImage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              alignSelf: 'stretch',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              marginBottom: '12px', // 12px + 20px parent gap = 32px total
            }}
          >
            <img
              src="/icons/icon-contact-image-upload.svg"
              width={24}
              height={24}
              alt="Profile Picture"
            />
            <CustomText style={{
              color: '#000E50',
              fontFamily: 'Poppins',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: 'normal',
              flex: 1,
              textAlign: 'left',
            }}>
              {(previewImageUrl || contact?.AvatarImagePath || contact?.avatarImagePath)
                ? i18n.t('EditProfilePicture')
                : i18n.t('AddProfilePicture')}
            </CustomText>
            <img
              src="/icons/icon-menu-back.svg"
              width={24}
              height={24}
              alt="Arrow"
              style={{
                transform: 'rotate(180deg)',
              }}
            />
          </button>

          {/* Form Content */}
          <div className="form-container">
            <div className="form-section">

              {/* Name Section */}
              <div className="section">
                <div className="section-header">
                  <CustomText style={{
                    color: '#000E50',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '15px', /* 125% */
                  }}>
                    {i18n.t('Name')}
                  </CustomText>
                </div>
                <div className="contact-details-item">
                  <div className="contact-details-row">
                    <Icon name="user" width={24} height={24} color="#000E50" />
                    <input
                      className="contact-input"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleFormChange('firstName', e.target.value)}
                      placeholder={i18n.t('FirstName')}
                    />
                  </div>
                </div>
                <div className="contact-details-item">
                  <div className="contact-details-row">
                    <Icon name="user" width={24} height={24} color="#000E50" />
                    <input
                      className="contact-input"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleFormChange('lastName', e.target.value)}
                      placeholder={i18n.t('LastName')}
                    />
                  </div>
                </div>
                <div className="contact-details-item">
                  <div className="contact-details-row">
                    <Icon name="user" width={24} height={24} color="#000E50" />
                    <input
                      className="contact-input"
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => handleFormChange('displayName', e.target.value)}
                      placeholder={`${i18n.t('DisplayName')} (${i18n.t('Optional')})`}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Type and Relationship */}
              <div className="section">
                <div className="section-header">
                  <CustomText style={{
                    color: '#000E50',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '15px', /* 125% */
                  }}>
                    {i18n.t("ContactType")}
                  </CustomText>
                </div>
                <div className="contact-details-item">
                  <div className="contact-details-row" onClick={() => setContactTypeModalVisible(true)}>
                    <Icon name="tag" width={24} height={24} color="#000E50" />
                    <span className={`contact-input-display ${!contactType ? 'placeholder' : ''}`}>
                      {contactType || i18n.t("SelectContactType")}
                    </span>
                    <Icon name="arrowRight" width={16} height={16} color="#000E50" />
                  </div>
                </div>
                {contactType && (
                  <div className="contact-details-item">
                    <div className="contact-details-row" onClick={() => setRelationToUserModalVisible(true)}>
                      <Icon name="tag" width={24} height={24} color="#000E50" />
                      <span className={`contact-input-display ${!relation ? 'placeholder' : ''}`}>
                        {relation || i18n.t("RelationshipToUser")}
                      </span>
                      <Icon name="arrowRight" width={16} height={16} color="#000E50" />
                    </div>
                  </div>
                )}
              </div>

              {/* Phone Numbers Section */}
              <div className="section">
                <div className="section-header">
                  <CustomText style={{
                    color: '#000E50',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '15px', /* 125% */
                  }}>
                    {i18n.t("PhoneNumber")}
                  </CustomText>
                  {phoneNumberCount < 3 && (
                    <button
                      className="add-more-button"
                      onClick={() => setPhoneNumberCount(phoneNumberCount + 1)}
                    >
                      <CustomText style={{ color: '#000E50', fontSize: FONT_SIZE_14 }}>
                        + {i18n.t('AddMore')}
                      </CustomText>
                    </button>
                  )}
                </div>

                {phoneNumberCount >= 1 && (
                  <div className="contact-details-item">
                    <div className="contact-details-row">
                      <Icon name="phone" width={24} height={24} color="#000E50" />
                      <input
                        className={`contact-input ${formErrors.phoneNumber ? 'error' : ''}`}
                        type="tel"
                        value={formData.cellPhoneNumber}
                        onChange={(e) => handleFormChange('cellPhoneNumber', e.target.value)}
                        onBlur={(e) => handleFormValidate('phoneNumber', e.target.value)}
                        placeholder={i18n.t("PhoneNumber")}
                      />
                    </div>
                    {formErrors.phoneNumber && (
                      <CustomText style={{ color: Colors.RED, fontSize: FONT_SIZE_14, paddingLeft: '34px' }}>
                        {formErrors.phoneNumber}
                      </CustomText>
                    )}
                  </div>
                )}

                {phoneNumberCount >= 2 && (
                  <div className="contact-details-item">
                    <div className="contact-details-row">
                      <Icon name="phone" width={24} height={24} color="#000E50" />
                      <input
                        className="contact-input"
                        type="tel"
                        value={formData.homePhoneNumber}
                        onChange={(e) => handleFormChange('homePhoneNumber', e.target.value)}
                        placeholder={i18n.t("PhoneNumber")}
                      />
                    </div>
                  </div>
                )}

                {phoneNumberCount >= 3 && (
                  <div className="contact-details-item">
                    <div className="contact-details-row">
                      <Icon name="phone" width={24} height={24} color="#000E50" />
                      <input
                        className="contact-input"
                        type="tel"
                        value={formData.tertiaryPhoneNumber}
                        onChange={(e) => handleFormChange('tertiaryPhoneNumber', e.target.value)}
                        placeholder={i18n.t("PhoneNumber")}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Email Addresses Section */}
              <div className="section">
                <div className="section-header">
                  <CustomText style={{
                    color: '#000E50',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '15px', /* 125% */
                  }}>
                    {i18n.t("Email")}
                  </CustomText>
                  {emailCount < 3 && (
                    <button
                      className="add-more-button"
                      onClick={() => setEmailCount(emailCount + 1)}
                    >
                      <CustomText style={{ color: '#000E50', fontSize: FONT_SIZE_14 }}>
                        + {i18n.t('AddMore')}
                      </CustomText>
                    </button>
                  )}
                </div>

                {emailCount >= 1 && (
                  <div className="contact-details-item">
                    <div className="contact-details-row">
                      <Icon name="email" width={24} height={24} color="#000E50" />
                      <input
                        className={`contact-input ${formErrors.email ? 'error' : ''}`}
                        type="email"
                        value={formData.primaryEmail}
                        onChange={(e) => handleFormChange('primaryEmail', e.target.value)}
                        onBlur={(e) => handleFormValidate('email', e.target.value)}
                        placeholder={i18n.t("Email")}
                      />
                    </div>
                    {formErrors.email && (
                      <CustomText style={{ color: Colors.RED, fontSize: FONT_SIZE_14, paddingLeft: '34px' }}>
                        {formErrors.email}
                      </CustomText>
                    )}
                  </div>
                )}

                {emailCount >= 2 && (
                  <div className="contact-details-item">
                    <div className="contact-details-row">
                      <Icon name="email" width={24} height={24} color="#000E50" />
                      <input
                        className="contact-input"
                        type="email"
                        value={formData.secondaryEmail}
                        onChange={(e) => handleFormChange('secondaryEmail', e.target.value)}
                        placeholder={i18n.t("Email")}
                      />
                    </div>
                  </div>
                )}

                {emailCount >= 3 && (
                  <div className="contact-details-item">
                    <div className="contact-details-row">
                      <Icon name="email" width={24} height={24} color="#000E50" />
                      <input
                        className="contact-input"
                        type="email"
                        value={formData.tertiaryEmail}
                        onChange={(e) => handleFormChange('tertiaryEmail', e.target.value)}
                        placeholder={i18n.t("Email")}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Addresses Section */}
              <div className="section">
                <div className="section-header">
                  <CustomText style={{
                    color: '#000E50',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '15px', /* 125% */
                  }}>
                    {i18n.t("Address")}
                  </CustomText>
                  {addressCount < 3 && (
                    <button
                      className="add-more-button"
                      onClick={() => setAddressCount(addressCount + 1)}
                    >
                      <CustomText style={{ color: '#000E50', fontSize: FONT_SIZE_14 }}>
                        + {i18n.t('AddMore')}
                      </CustomText>
                    </button>
                  )}
                </div>

                {addressCount >= 1 && (
                  <div className="contact-details-item">
                    <div className="contact-details-row">
                      <Icon name="house" width={24} height={24} color="#000E50" />
                      <input
                        className="contact-input"
                        type="text"
                        value={formData.primaryAddress}
                        onChange={(e) => handleFormChange('primaryAddress', e.target.value)}
                        placeholder={i18n.t("Address")}
                      />
                    </div>
                  </div>
                )}

                {addressCount >= 2 && (
                  <div className="contact-details-item">
                    <div className="contact-details-row">
                      <Icon name="house" width={24} height={24} color="#000E50" />
                      <input
                        className="contact-input"
                        type="text"
                        value={formData.secondaryAddress}
                        onChange={(e) => handleFormChange('secondaryAddress', e.target.value)}
                        placeholder={i18n.t("Address")}
                      />
                    </div>
                  </div>
                )}

                {addressCount >= 3 && (
                  <div className="contact-details-item">
                    <div className="contact-details-row">
                      <Icon name="house" width={24} height={24} color="#000E50" />
                      <input
                        className="contact-input"
                        type="text"
                        value={formData.tertiaryAddress}
                        onChange={(e) => handleFormChange('tertiaryAddress', e.target.value)}
                        placeholder={i18n.t("Address")}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Birthday Section */}
              <div className="section">
                <div className="section-header">
                  <CustomText style={{
                    color: '#000E50',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '15px', /* 125% */
                  }}>
                    {i18n.t("Birthday")}
                  </CustomText>
                </div>
                <div className="contact-details-item">
                  <div className="contact-details-row">
                    <Icon name="calendar" width={24} height={24} color="#000E50" />
                    <input
                      className="contact-input"
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => handleFormChange('birthday', e.target.value)}
                      placeholder={i18n.t("Birthday")}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="save-button-container">
                <Button
                  textProps={{
                    text: i18n.t("Save"),
                    color: Colors.WHITE,
                  }}
                  onButtonClick={handleSave}
                  disabled={isSaving || !formData.firstName || Object.keys(formErrors).length > 0}
                  backgroundColor={Colors.BLUE}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '8px',
                    opacity: (isSaving || !formData.firstName || Object.keys(formErrors).length > 0) ? 0.6 : 1,
                  }}
                />
              </div>

              {/* Bottom spacer to ensure 75px space below last item */}
              <div style={{ height: '75px' }} />


            </div>
          </div>

        </div>
      </div>

      {/* Contact Type Selection Modal */}
      {contactTypeModalVisible && (
        <div className="modal-overlay" onClick={() => setContactTypeModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <CustomText style={{ fontSize: 18, fontWeight: '600', color: Colors.BLACK }}>
                Select Contact Type
              </CustomText>
              <button className="modal-close" onClick={() => setContactTypeModalVisible(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {Object.keys(contactTypes).sort().map((type) => (
                <div
                  key={type}
                  className="modal-item"
                  onClick={() => {
                    setContactType(type);
                    setRelation(''); // Reset relation when contact type changes
                    setContactTypeModalVisible(false);
                  }}
                >
                  <CustomText style={{ fontSize: 16, color: Colors.BLACK }}>
                    {type}
                  </CustomText>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Relationship Selection Modal */}
      {relationToUserModalVisible && contactType && (
        <div className="modal-overlay" onClick={() => setRelationToUserModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <CustomText style={{ fontSize: 18, fontWeight: '600', color: Colors.BLACK }}>
                Select Relationship
              </CustomText>
              <button className="modal-close" onClick={() => setRelationToUserModalVisible(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {(contactTypes[contactType]?.relationships || []).sort().map((relationship) => (
                <div
                  key={relationship}
                  className="modal-item"
                  onClick={() => {
                    setRelation(relationship);
                    setRelationToUserModalVisible(false);
                  }}
                >
                  <CustomText style={{ fontSize: 16, color: Colors.BLACK }}>
                    {relationship}
                  </CustomText>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      <ImageUploadModal
        isVisible={showImagePickerModal}
        onRequestClose={() => setShowImagePickerModal(false)}
        onImageSelected={handleImageSelected}
        title={i18n.t('SelectImage')}
      />

      {/* Loading Modal */}
      <Modal
        isVisible={isSaving}
        title="Saving..."
        onClose={() => {}}
        showCloseButton={false}
        closeOnBackdropPress={false}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
        }}>
          <LoadingSpinner />
        </div>
      </Modal>
    </div>
  );
};

/**
 * EditContact Page Component
 */
const EditContact: React.FC = () => {
  return (
    <AuthGuard>
      <EditContactContent />
    </AuthGuard>
  );
};

export default EditContact;
