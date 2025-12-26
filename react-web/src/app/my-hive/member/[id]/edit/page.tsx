'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../context/AuthContext';
import { useLanguageContext } from '../../../../../context/LanguageContext';
import { User } from '../../../../../services/types';
import { getUsersByAccount } from '../../../../../services/services';
import userService from '../../../../../services/userService';
import { Colors, Typography } from '../../../../../styles';
import CustomText from '../../../../../components/CustomText';
import Icon from '../../../../../components/Icon';
import NavHeader from '../../../../../components/NavHeader';
import Button from '../../../../../components/Button';
import LoadingSpinner from '../../../../../components/LoadingSpinner';
import ImageUploadModal from '../../../../../components/ImageUploadModal';
import { getInitials } from '../../../../../util/constants';
import moment from 'moment';
import { formatBirthdayForInput, convertBirthdayForStorage } from '../../../../../util/dateUtils';
import './edit-member.css';

interface IFormData {
  displayName: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  birthday: string;
  isPassiveMember: boolean;
}

interface IFormErrors {
  firstName?: string;
  emailAddress?: string;
  phoneNumber?: string;
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
 * EditMemberContent - The main content of the edit member page
 */
const EditMemberContent: React.FC = () => {
  const { user: authUser } = useAuth();
  const { i18n } = useLanguageContext();
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;

  const [member, setMember] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<IFormData>({
    displayName: '',
    firstName: '',
    lastName: '',
    emailAddress: '',
    phoneNumber: '',
    birthday: '',
    isPassiveMember: false,
  });

  const [formErrors, setFormErrors] = useState<IFormErrors>({});
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);

  // Check if this is the current user
  const isCurrentUser = member?.UniqueId === authUser?.id;

  // Load member data
  const loadMember = useCallback(async () => {
    if (!authUser?.accountId || !memberId) {
      setError('Missing required information');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
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

      // Pre-populate form with existing member data
      setFormData({
        displayName: foundMember.DisplayName || '',
        firstName: foundMember.FirstName || '',
        lastName: foundMember.LastName || '',
        emailAddress: foundMember.EmailAddress || '',
        phoneNumber: foundMember.Cell_Phone_Number || '',
        birthday: formatBirthdayForInput(foundMember.Birthday),
        isPassiveMember: foundMember.ActiveFamilyMember === false,
      });

    } catch (error) {
      console.error('Error fetching member:', error);
      setError('Failed to load member information');
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.accountId, memberId]);

  const handleFormChange = (field: keyof IFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (formErrors[field as keyof IFormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
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

    // Email is only required for active members (not passive members)
    if (!formData.isPassiveMember) {
      if (!formData.emailAddress.trim()) {
        errors.emailAddress = 'Email address is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.emailAddress)) {
        errors.emailAddress = 'Please enter a valid email address';
      }
    } else if (formData.emailAddress.trim() && !/\S+@\S+\.\S+/.test(formData.emailAddress)) {
      // If passive member provides an email, validate format
      errors.emailAddress = 'Please enter a valid email address';
    }

    if (formData.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !member) {
      return;
    }

    setIsSaving(true);
    try {
      // Build FormData object with ALL required fields (matching backend CURL)
      const formData_api = new FormData();

      // Required fields that must be included (even if empty)
      formData_api.append('id', member.UniqueId);
      formData_api.append('firstName', formData.firstName || '');
      formData_api.append('lastName', formData.lastName || '');
      formData_api.append('displayName', formData.displayName || '');
      formData_api.append('emailAddress', formData.emailAddress || '');
      formData_api.append('cellPhoneNumber', formData.phoneNumber || '');
      // Convert birthday for storage (preserve the date, no timezone conversion)
      const birthdayForStorage = convertBirthdayForStorage(formData.birthday);
      formData_api.append('birthday', birthdayForStorage);

      // Additional required fields from CURL (set to empty or default values)
      formData_api.append('accountId', member.Account_uniqueId || '');
      formData_api.append('homePhoneNumber', '');
      formData_api.append('address', '');
      formData_api.append('streetName', '');
      formData_api.append('city', '');
      formData_api.append('state', '');
      formData_api.append('country', '');
      formData_api.append('zipCode', '');
      formData_api.append('workplace', '');
      formData_api.append('propertySituation', '');
      formData_api.append('language', '');
      formData_api.append('displayMode', '');
      formData_api.append('activeUser', 'true');
      formData_api.append('activeFamily', 'true');
      // Use the form's passive member toggle state
      formData_api.append('activeFamilyMember', String(!formData.isPassiveMember));

      // Handle avatar image upload
      if (selectedImageFile) {
        formData_api.append('files', selectedImageFile, selectedImageFile.name);
      } else {
        formData_api.append('files', '');
      }

      formData_api.append('fileToDelete', '');

      // Make API call to update member using PUT with FormData
      const response = await fetch(`/api/users/${member.UniqueId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          // Don't set Content-Type header - let browser set it for FormData
        },
        body: formData_api,
      });

      if (response.ok) {
        const updatedMember = await response.json();
        // Navigate back to member detail page
        router.push(`/my-hive/member/${member.UniqueId}`);
      } else {
        const errorData = await response.json();
        console.error('Failed to update member:', errorData);
        setError('Failed to update member. Please try again.');
      }
    } catch (error: any) {
      console.error('Error updating member:', error);
      setError('An error occurred while updating the member. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadMember();
  }, [loadMember]);

  if (isLoading) {
    return (
      <div className="contact-detail-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px' 
        }}>
          <LoadingSpinner />
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

  return (
    <div style={{
      backgroundColor: '#e8f4fd', // Light blue background for entire page
      minHeight: '100vh',
    }}>
      {/* Page Header with width restriction */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#e8f4fd', // Same light blue background
        paddingTop: '0',
      }}>
        <div style={{
          maxWidth: '800px',
          width: '100%',
        }}>
          <NavHeader
            headerText={`Edit ${member.FirstName || 'Member'}`}
            left={{
              text: "Back",
              goBack: true,
              onPress: () => router.push(`/my-hive/member/${member.UniqueId}`)
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        backgroundColor: '#e8f4fd', // Light blue background
        minHeight: 'calc(100vh - 105px)',
        paddingTop: '20px',
        paddingBottom: '40px',
        display: 'flex',
        justifyContent: 'center',
      }}>

        {/* Content with padding */}
        <div style={{
          maxWidth: '800px',
          width: '100%',
          margin: '0 auto',
          padding: '0 20px',
        }}>
          {/* Hexagon Avatar */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '20px 0 30px 0',
          }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '104px',
              height: '120px',
            }}>
              {/* White border hexagon */}
              <div style={{
                content: '',
                position: 'absolute',
                width: '88px',
                height: '88px',
                backgroundColor: 'white',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
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
              }}>
                {previewImageUrl || member.AvatarImagePath ? (
                  <img
                    src={previewImageUrl || member.AvatarImagePath}
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

              {/* Edit Avatar Button */}
              <button
                onClick={handlePickImage}
                style={{
                  position: 'absolute',
                  bottom: '0px',
                  right: '0px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: Colors.BLUE,
                  border: `2px solid ${Colors.WHITE}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                }}
              >
                <Icon name="editImage" width={20} height={20} color={Colors.WHITE} />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div style={{
            backgroundColor: Colors.WHITE,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            width: '100%',
            boxSizing: 'border-box',
          }}>
            {error && (
              <div style={{
                backgroundColor: Colors.LIGHT_RED,
                color: Colors.RED,
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: Typography.FONT_SIZE_14,
              }}>
                {error}
              </div>
            )}

            {/* Display Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: Typography.FONT_SIZE_14,
                color: Colors.GREY_COLOR,
                marginBottom: '8px',
              }}>
                {i18n.t('DisplayName')}
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleFormChange('displayName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid #eeeeee`,
                  borderRadius: '8px',
                  fontSize: Typography.FONT_SIZE_14,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                  boxSizing: 'border-box',
                }}
                placeholder={i18n.t("EnterDisplayName")}
              />
            </div>

            {/* First Name and Last Name Row */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: Typography.FONT_SIZE_14,
                  color: Colors.GREY_COLOR,
                  marginBottom: '8px',
                }}>
                  {i18n.t('FirstName')} *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleFormChange('firstName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${formErrors.firstName ? Colors.RED : '#eeeeee'}`,
                    borderRadius: '8px',
                    fontSize: Typography.FONT_SIZE_14,
                    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                    boxSizing: 'border-box',
                  }}
                  placeholder={i18n.t("EnterFirstName")}
                />
                {formErrors.firstName && (
                  <CustomText style={{
                    fontSize: Typography.FONT_SIZE_12,
                    color: Colors.RED,
                    marginTop: '4px',
                  }}>
                    {formErrors.firstName}
                  </CustomText>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: Typography.FONT_SIZE_14,
                  color: Colors.GREY_COLOR,
                  marginBottom: '8px',
                }}>
                  {i18n.t('LastName')}
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleFormChange('lastName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid #eeeeee`,
                    borderRadius: '8px',
                    fontSize: Typography.FONT_SIZE_14,
                    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                    boxSizing: 'border-box',
                  }}
                  placeholder={i18n.t("EnterLastName")}
                />
              </div>
            </div>

            {/* Email Address */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: Typography.FONT_SIZE_14,
                color: Colors.GREY_COLOR,
                marginBottom: '8px',
              }}>
                {i18n.t('EmailAddress')}{!formData.isPassiveMember && ' *'}
              </label>
              <input
                type="email"
                value={formData.emailAddress}
                onChange={(e) => handleFormChange('emailAddress', e.target.value)}
                disabled={formData.isPassiveMember}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${formErrors.emailAddress ? Colors.RED : '#eeeeee'}`,
                  borderRadius: '8px',
                  fontSize: Typography.FONT_SIZE_14,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                  boxSizing: 'border-box',
                  backgroundColor: formData.isPassiveMember ? '#f5f5f5' : 'white',
                  color: formData.isPassiveMember ? '#666' : 'inherit',
                  cursor: formData.isPassiveMember ? 'not-allowed' : 'text',
                }}
                placeholder={i18n.t("EnterEmailAddress")}
              />
              {formErrors.emailAddress && (
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_12,
                  color: Colors.RED,
                  marginTop: '4px',
                }}>
                  {formErrors.emailAddress}
                </CustomText>
              )}
            </div>

            {/* Passive Member Toggle */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
              }}>
                <label style={{
                  fontSize: Typography.FONT_SIZE_14,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                  color: Colors.BLACK,
                  cursor: 'pointer',
                }}>
                  {i18n.t('PassiveMember' as any) || 'Passive Member'}
                </label>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '50px',
                  height: '24px',
                  cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={formData.isPassiveMember}
                    onChange={(e) => {
                      const isPassive = e.target.checked;
                      setFormData(prev => ({
                        ...prev,
                        isPassiveMember: isPassive,
                        // Clear email when switching to passive member
                        emailAddress: isPassive ? '' : prev.emailAddress
                      }));
                    }}
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0,
                      position: 'absolute',
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: formData.isPassiveMember ? '#007AFF' : '#ccc',
                    transition: '0.3s',
                    borderRadius: '24px',
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: formData.isPassiveMember ? '29px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      transition: '0.3s',
                      borderRadius: '50%',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                    }} />
                  </span>
                </label>
              </div>
              <CustomText style={{
                fontSize: Typography.FONT_SIZE_12,
                color: '#666',
                fontStyle: 'italic',
                marginTop: '4px',
              }}>
                {i18n.t('PassiveMembersHaveLimitedAccess' as any) || "Passive members have limited access and won't receive notifications"}
              </CustomText>
            </div>

            {/* Phone Number */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: Typography.FONT_SIZE_14,
                color: Colors.GREY_COLOR,
                marginBottom: '8px',
              }}>
                {i18n.t('PhoneNumber')}
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${formErrors.phoneNumber ? Colors.RED : '#eeeeee'}`,
                  borderRadius: '8px',
                  fontSize: Typography.FONT_SIZE_14,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                  boxSizing: 'border-box',
                }}
                placeholder={i18n.t("EnterPhoneNumber")}
              />
              {formErrors.phoneNumber && (
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_12,
                  color: Colors.RED,
                  marginTop: '4px',
                }}>
                  {formErrors.phoneNumber}
                </CustomText>
              )}
            </div>

            {/* Birthday */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: Typography.FONT_SIZE_14,
                color: Colors.GREY_COLOR,
                marginBottom: '8px',
              }}>
                {i18n.t('Birthday')}
              </label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => handleFormChange('birthday', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid #eeeeee`,
                  borderRadius: '8px',
                  fontSize: Typography.FONT_SIZE_14,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Save Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '24px',
            }}>
              <Button
                textProps={{
                  text: isSaving ? `${i18n.t('Saving')}...` : i18n.t('SaveChanges'),
                  fontSize: Typography.FONT_SIZE_16,
                  color: Colors.WHITE,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                }}
                onButtonClick={handleSave}
                backgroundColor={Colors.BLUE}
                borderProps={{
                  width: 1,
                  color: Colors.BLUE,
                  radius: 8,
                }}
                disabled={isSaving}
                style={{
                  minWidth: '200px',
                  opacity: isSaving ? 0.7 : 1,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isVisible={showImagePickerModal}
        onRequestClose={() => setShowImagePickerModal(false)}
        onImageSelected={handleImageSelected}
        title="Select Member Avatar"
      />
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
