'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import CustomText from '../../../components/CustomText';
import Button from '../../../components/Button';
import Icon from '../../../components/Icon';
import { useLanguageContext } from '../../../context/LanguageContext';

import { Colors } from '../../../styles/index';
import { convertBirthdayForStorage } from '../../../util/dateUtils';
import {
  FONT_FAMILY_POPPINS_REGULAR,
  FONT_SIZE_16,
  FONT_SIZE_14,
} from '../../../styles/typography';
import { useContactStore } from '../../../context/store';
import Modal from '../../../components/Modal';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ImageUploadModal from '../../../components/ImageUploadModal';

// Import styles
import '../[id]/edit/edit-contact.css';

// AuthGuard component to protect the route
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { i18n } = useLanguageContext();
  const router = useRouter();

  React.useEffect(() => {
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
        minHeight: '100vh',
        backgroundColor: Colors.WHITE
      }}>
        <div>{i18n.t('Loading')}</div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.id) {
    return null;
  }

  return <>{children}</>;
};

interface IFormData {
  firstName: string;
  lastName: string;
  displayName: string;
  phoneNumber: string;
  email: string;
  address: string;
  birthday: string;
  contactType: string;
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
 * NewContactContent - The main content of the new contact page
 */
const NewContactContent: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const addContact = useContactStore((state) => state.addContact);
  const { i18n } = useLanguageContext();

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
    firstName: '',
    lastName: '',
    displayName: '',
    phoneNumber: '',
    email: '',
    address: '',
    birthday: '',
    contactType: '',
  });

  const [formErrors, setFormErrors] = useState<IFormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contactType, setContactType] = useState<string>('');
  const [relation, setRelation] = useState<string>('');
  const [contactTypeModalVisible, setContactTypeModalVisible] = useState(false);
  const [relationToUserModalVisible, setRelationToUserModalVisible] = useState(false);
  const [contactTypes, setContactTypes] = useState<IContactType>({});
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);



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
        setFormErrors(prev => ({ ...prev, email: i18n.t('InvalidEmail') }));
      } else {
        setFormErrors(prev => {
          const { email, ...rest } = prev; // eslint-disable-line @typescript-eslint/no-unused-vars
          return rest;
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: IFormErrors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = i18n.t('FirstNameRequired');
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = i18n.t('PleaseEnterValidEmailAddress');
    }

    if (formData.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
      errors.phoneNumber = i18n.t('PleaseEnterValidPhoneNumber');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      let response;

      if (selectedImageFile) {
        // Create FormData for multipart upload
        const uploadFormData = new FormData();
        uploadFormData.append('accountId', user?.accountId || '');
        uploadFormData.append('userId', user?.id || '');
        uploadFormData.append('firstName', formData.firstName);
        uploadFormData.append('lastName', formData.lastName);
        uploadFormData.append('displayName', formData.displayName);
        uploadFormData.append('cellPhoneNumber', formData.phoneNumber);
        uploadFormData.append('emailAddress', formData.email);
        uploadFormData.append('address', formData.address);
        uploadFormData.append('birthday', convertBirthdayForStorage(formData.birthday) || '');
        uploadFormData.append('type', contactType);
        uploadFormData.append('relationship', relation);
        uploadFormData.append('avatarImages', selectedImageFile, selectedImageFile.name);

        response = await fetch('/api/contacts/create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            // Don't set Content-Type for FormData - let the browser set it with boundary
          },
          body: uploadFormData,
        });
      } else {
        // Use JSON for requests without file upload
        response = await fetch('/api/contacts/create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accountId: user?.accountId,
            userId: user?.id,
            firstName: formData.firstName,
            lastName: formData.lastName,
            displayName: formData.displayName,
            cellPhoneNumber: formData.phoneNumber,
            emailAddress: formData.email,
            address: formData.address,
            birthday: convertBirthdayForStorage(formData.birthday) || null,
            type: contactType,
            relationship: relation,
          }),
        });
      }

      if (response.ok) {
        const newContact = await response.json();

        // Add the contact to the store
        const contactToAdd = newContact.contact || newContact;
        if (contactToAdd) {
          addContact(contactToAdd);
        }

        // Navigate back to people list page
        router.push('/people');
      } else {
        console.error('Failed to create contact:', response.status);
        alert(i18n.t('FailedToCreateContact'));
      }
    } catch (error) {
      console.error('Failed to create contact:', error);
      alert(i18n.t('FailedToCreateContact'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-contact-container">
      {/* Page Header - Matching edit contact page */}
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
            alt={i18n.t('Back')}
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
            {i18n.t('NewContact')}
          </CustomText>
        </div>

        <button
          onClick={handleSave}
          disabled={isLoading}
          style={{
            background: 'none',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            zIndex: 2,
            opacity: isLoading ? 0.5 : 1,
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
            Save
          </CustomText>
        </button>
      </div>

      {/* Main Content Container */}
      <div className="main-content-container">
        <div className="content-with-padding">

          {/* Contact Avatar Section - Matching edit contact page */}
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
              {previewImageUrl ? (
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
                      src={previewImageUrl}
                      alt={i18n.t('ContactAvatar')}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                </>
              ) : (
                // Show initials in hexagon with white border
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

                  {/* Main hexagon with initials */}
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

                        return i18n.t('UnknownContact').substring(0, 2).toUpperCase();
                      })()}
                    </CustomText>
                  </div>
                </>
              )}
            </div>
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
              alt={i18n.t('ProfilePicture')}
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
              {previewImageUrl ? i18n.t('EditProfilePicture') : i18n.t('AddProfilePicture')}
            </CustomText>
            <img
              src="/icons/icon-menu-back.svg"
              width={24}
              height={24}
              alt={i18n.t('Arrow')}
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
                      placeholder={i18n.t('DisplayNameOptional')}
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
                    {i18n.t('ContactType')}
                  </CustomText>
                </div>
                <div className="contact-details-item">
                  <div className="contact-details-row" onClick={() => setContactTypeModalVisible(true)}>
                    <Icon name="tag" width={24} height={24} color="#000E50" />
                    <span className={`contact-input-display ${!contactType ? 'placeholder' : ''}`}>
                      {contactType ? i18n.t(`ContactType${contactType}`) : i18n.t('SelectContactType')}
                    </span>
                    <Icon name="arrowRight" width={16} height={16} color="#000E50" />
                  </div>
                </div>
                {contactType && (
                  <div className="contact-details-item">
                    <div className="contact-details-row" onClick={() => setRelationToUserModalVisible(true)}>
                      <Icon name="tag" width={24} height={24} color="#000E50" />
                      <span className={`contact-input-display ${!relation ? 'placeholder' : ''}`}>
                        {relation ? i18n.t(`Relationship${relation.replace(/\s+/g, '')}`) : i18n.t('RelationshipToUser')}
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
                    {i18n.t('PhoneNumber')}
                  </CustomText>
                </div>

                <div className="contact-details-item">
                  <div className="contact-details-row">
                    <Icon name="phone" width={24} height={24} color="#000E50" />
                    <input
                      className={`contact-input ${formErrors.phoneNumber ? 'error' : ''}`}
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                      placeholder={i18n.t('PhoneNumber')}
                    />
                  </div>
                  {formErrors.phoneNumber && (
                    <CustomText style={{ color: Colors.RED, fontSize: FONT_SIZE_14, paddingLeft: '34px' }}>
                      {formErrors.phoneNumber}
                    </CustomText>
                  )}
                </div>
              </div>

              {/* Email Section */}
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
                    {i18n.t('Email')}
                  </CustomText>
                </div>

                <div className="contact-details-item">
                  <div className="contact-details-row">
                    <Icon name="alternate_email" width={24} height={24} color="#000E50" />
                    <input
                      className={`contact-input ${formErrors.email ? 'error' : ''}`}
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      placeholder={i18n.t('Email')}
                      onBlur={() => handleFormValidate('email', formData.email)}
                    />
                  </div>
                  {formErrors.email && (
                    <CustomText style={{ color: Colors.RED, fontSize: FONT_SIZE_14, paddingLeft: '34px' }}>
                      {formErrors.email}
                    </CustomText>
                  )}
                </div>
              </div>

              {/* Address Section */}
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
                    {i18n.t('Address')}
                  </CustomText>
                </div>

                <div className="contact-details-item">
                  <div className="contact-details-row">
                    <Icon name="locationAutomation" width={24} height={24} color="#000E50" />
                    <input
                      className="contact-input"
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleFormChange('address', e.target.value)}
                      placeholder={i18n.t('Address')}
                    />
                  </div>
                </div>
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
                    {i18n.t('Birthday')}
                  </CustomText>
                </div>

                <div className="contact-details-item">
                  <div className="contact-details-row">
                    <Icon name="cake" width={24} height={24} color="#000E50" />
                    <input
                      className={`contact-input ${formData.birthday ? 'has-value' : 'empty-date'}`}
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => handleFormChange('birthday', e.target.value)}
                      placeholder={i18n.t('Birthday')}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Save Button Container */}
          <div className="save-button-container">
            <Button
              textProps={{
                text: isLoading ? i18n.t('Saving') : i18n.t('Save'),
                color: Colors.WHITE,
              }}
              onButtonClick={handleSave}
              disabled={isLoading || !formData.firstName || Object.keys(formErrors).length > 0}
              backgroundColor={Colors.BLUE}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '8px',
                opacity: (isLoading || !formData.firstName || Object.keys(formErrors).length > 0) ? 0.6 : 1,
              }}
            />
          </div>
        </div>
      </div>



      {/* Contact Type Selection Modal */}
      {contactTypeModalVisible && (
        <div className="modal-overlay" onClick={() => setContactTypeModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <CustomText style={{ fontSize: 18, fontWeight: '600', color: Colors.BLACK }}>
                {i18n.t('SelectContactType')}
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
                    {i18n.t(`ContactType${type}`)}
                  </CustomText>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Relationship Selection Modal */}
      {relationToUserModalVisible && (
        <div className="modal-overlay" onClick={() => setRelationToUserModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <CustomText style={{ fontSize: 18, fontWeight: '600', color: Colors.BLACK }}>
                {i18n.t('SelectRelationshipToUser')}
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
                    {i18n.t(`Relationship${relationship.replace(/\s+/g, '')}`)}
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
        title={i18n.t('SelectContactAvatar')}
      />

      {/* Loading Modal */}
      <Modal
        isVisible={isLoading}
        onClose={() => {}} // Prevent closing during loading
        showCloseButton={false}
        closeOnBackdropPress={false}
        contentStyle={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <LoadingSpinner size={50} color={Colors.BLUE} />
        <CustomText style={{
          marginTop: '20px',
          fontSize: FONT_SIZE_16,
          color: Colors.BLACK,
          fontFamily: FONT_FAMILY_POPPINS_REGULAR
        }}>
          {i18n.t('SavingContact')}
        </CustomText>
      </Modal>
    </div>
  );
};

/**
 * NewContact Page Component
 */
const NewContact: React.FC = () => {
  return (
    <AuthGuard>
      <NewContactContent />
    </AuthGuard>
  );
};

export default NewContact;
