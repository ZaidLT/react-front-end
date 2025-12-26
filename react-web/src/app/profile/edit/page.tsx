'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CustomText from '../../../components/CustomText';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import NavHeader from '../../../components/NavHeader';
import ProfileItem from '../../../components/ProfileItem';
import { Colors, Typography } from '../../../styles';
import { useLanguageContext } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import Icon from '../../../components/Icon';
import { getInitials, emitSnackbar } from '../../../util/helpers';
import {
  FONT_FAMILY_POPPINS_REGULAR,
  FONT_SIZE_16,
} from '../../../styles/typography';
import {
  formatBirthdayForInput,
  convertBirthdayForStorage,
  formatBirthdayForDisplay,
} from '../../../util/dateUtils';
import '../profile.css';

interface FullUserProfile {
  id: string;
  accountId: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  cellPhoneNumber?: string;
  homePhoneNumber?: string;
  birthday?: string;
  avatarImagePath?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

const EditProfilePage: React.FC = () => {
  const router = useRouter();
  const { i18n } = useLanguageContext();
  const { user, isAuthenticated, isLoading, updateUser, refreshUserData } =
    useAuth();

  // Full user profile state
  const [, setFullUserProfile] = useState<FullUserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [cellPhone, setCellPhone] = useState('');
  const [homePhone, setHomePhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [originalBirthday, setOriginalBirthday] = useState('');
  const [avatarImagePath, setAvatarImagePath] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch full user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id || !user?.accountId) return;

      setIsLoadingProfile(true);
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('No auth token found');
        }

        const response = await fetch(
          `/api/users/${user.id}?accountId=${user.accountId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const profileData = await response.json();
        setFullUserProfile(profileData);

        // Initialize form with full profile data
        setFirstName(profileData.firstName || '');
        setLastName(profileData.lastName || '');
        setEmail(profileData.emailAddress || '');
        setCellPhone(profileData.cellPhoneNumber || '');
        setHomePhone(profileData.homePhoneNumber || '');
        setAvatarImagePath(profileData.avatarImagePath || '');

        // Initialize birthday values
        const formattedBirthday = formatBirthdayForInput(profileData.birthday);
        setOriginalBirthday(profileData.birthday || '');
        setBirthday(formattedBirthday);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load profile data. Please try again.');

        // Fallback to basic user data from auth context
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setEmail(user.email || '');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (isAuthenticated && user) {
      fetchUserProfile();
    }
  }, [isAuthenticated, user]);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  }, [previewImageUrl]);

  // Show loading if auth is still loading or profile is loading
  if (isLoading || isLoadingProfile) {
    return (
      <div className='profile-container'>
        <NavHeader
          headerText={i18n.t('Profile')}
          left={{
            text: 'Back',
            goBack: true,
            onPress: () => router.back(),
          }}
        />
        <div className='profile-content' style={styles.content}>
          <div style={styles.loadingContainer}>
            <CustomText style={styles.loadingText}>
              {i18n.t('LoadingProfile')}...
            </CustomText>
          </div>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Helper function to get user initials
  const getUserInitials = () => {
    return getInitials({
      FirstName: firstName || user?.firstName || '',
      LastName: lastName || user?.lastName || '',
    });
  };

  // Handle image file selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB.');
        return;
      }

      setSelectedImageFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImageUrl(previewUrl);

      setShowImagePicker(false);
      setError(null);
    }
  };

  // Handle save
  const handleSave = async () => {
    console.log('🔄 handleSave called');

    if (!user?.id || !user?.accountId) {
      console.log('❌ No user ID or account ID found');
      setError(
        'User information not found. Please try logging out and back in.'
      );
      return;
    }

    console.log('✅ User ID found:', user.id);
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('❌ No auth token found');
        throw new Error('No auth token found');
      }

      console.log('✅ Auth token found');

      // Prepare FormData for the request (required for file uploads)
      const formData = new FormData();
      formData.append('id', user.id);
      formData.append('accountId', user.accountId);
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('emailAddress', email);

      if (cellPhone) formData.append('cellPhoneNumber', cellPhone);
      if (homePhone) formData.append('homePhoneNumber', homePhone);
      if (birthday)
        formData.append('birthday', convertBirthdayForStorage(birthday));

      console.log('📝 FormData prepared with basic fields');

      // Handle avatar image upload if a new image was selected
      if (selectedImageFile) {
        console.log('🖼️ Adding avatar image to FormData...');
        formData.append('files', selectedImageFile, selectedImageFile.name);
      }

      console.log('🚀 Making PUT request to:', `/api/users/${user.id}`);

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData - let the browser set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        console.log('❌ Response not OK');
        const errorData = await response.json();
        console.log('❌ Error data:', errorData);
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const result = await response.json();
      console.log('✅ Response data:', result);

      if (result.success) {
        console.log('🎉 Profile updated successfully!');

        // First refresh the full user data from the server to get the latest avatar path
        const refreshSuccess = await refreshUserData();

        if (!refreshSuccess) {
          // If refresh failed, at least update the basic fields we know changed
          const updatedUserData = {
            firstName,
            lastName,
            email,
          };
          updateUser(updatedUserData);
        }

        // Show success toast
        emitSnackbar({
          message: 'Profile updated successfully!',
          type: 'success',
          duration: 3000,
        });

        // Navigate back to profile page
        router.push('/profile');
      } else {
        console.log('❌ Result success is false:', result);
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Save profile error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to update profile. Please try again.'
      );
    } finally {
      console.log('🏁 Setting isSaving to false');
      setIsSaving(false);
    }
  };

  // Handle date selection
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setBirthday(newDate);
    // Also update the original birthday for display purposes
    // Convert to the same format as the backend (YYYY-MM-DD HH:mm:ss)
    setOriginalBirthday(newDate ? `${newDate} 00:00:00` : '');
  };

  // Handle date picker done button
  const handleDatePickerDone = () => {
    setShowDatePicker(false);
  };

  return (
    <div className='profile-container'>
      {/* Page Header */}
      <NavHeader
        headerText={i18n.t('Profile')}
        left={{
          text: 'Back',
          goBack: true,
          onPress: () => router.back(),
        }}
      />

      {/* Avatar Section */}
      <div className='profile-avatar-section'>
        <div className='profile-avatar-container'>
          {previewImageUrl || avatarImagePath ? (
            // Show circular avatar when image exists
            <div className='profile-circular-avatar-container'>
              <img
                src={previewImageUrl || avatarImagePath}
                alt='Profile Avatar'
                className='profile-circular-avatar'
              />
              <button
                className='profile-edit-avatar-button'
                aria-label='Edit profile photo'
                title='Edit profile photo'
                onClick={() => setShowImagePicker(true)}
              >
                <Icon name='edit-pencil' width={18} height={18} />
              </button>
            </div>
          ) : (
            // Show hexagon with initials when no image
            <div className='profile-hexagon-avatar-container'>
              <div className='profile-hexagon-avatar'>
                <div
                  className='profile-avatar-placeholder'
                  style={{ backgroundColor: Colors.GRAY }}
                >
                  <CustomText
                    style={{
                      fontSize: 24,
                      fontWeight: '600',
                      color: Colors.BLACK,
                      fontFamily: FONT_FAMILY_POPPINS_REGULAR,
                    }}
                  >
                    {getUserInitials()}
                  </CustomText>
                </div>
              </div>
              <button
                className='profile-edit-avatar-button'
                onClick={() => setShowImagePicker(true)}
              >
                <Icon name='edit-pencil' width={18} height={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Name Display */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '40px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <CustomText
          style={{
            fontSize: FONT_SIZE_16 + 2,
            fontFamily: FONT_FAMILY_POPPINS_REGULAR,
            fontWeight: '600',
            color: Colors.MIDNIGHT,
            marginBottom: '4px',
          }}
        >
          {firstName} {lastName}
        </CustomText>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div style={styles.errorBanner}>
          <CustomText style={styles.errorBannerText}>{error}</CustomText>
        </div>
      )}

      {successMessage && (
        <div style={styles.successBanner}>
          <CustomText style={styles.successBannerText}>
            {successMessage}
          </CustomText>
        </div>
      )}

      {/* Form Fields */}
      <div style={styles.formContainer}>
        <ProfileItem
          content={{
            icon: () => (
              <Icon
                name='user'
                width={16}
                height={16}
                color={Colors.PRIMARY_DARK_BLUE}
              />
            ),
            value: firstName,
            onChange: setFirstName,
          }}
          editingEnabled={true}
          placeholder={i18n.t('FirstName')}
        />

        <ProfileItem
          content={{
            icon: () => (
              <Icon
                name='user'
                width={16}
                height={16}
                color={Colors.PRIMARY_DARK_BLUE}
              />
            ),
            value: lastName,
            onChange: setLastName,
          }}
          editingEnabled={true}
          placeholder={i18n.t('LastName')}
        />

        <ProfileItem
          content={{
            icon: () => (
              <Icon
                name='email'
                width={16}
                height={16}
                color={Colors.PRIMARY_DARK_BLUE}
              />
            ),
            value: email,
            onChange: setEmail,
          }}
          editingEnabled={false} // Email should not be editable
          placeholder={i18n.t('Email')}
        />

        <ProfileItem
          content={{
            icon: () => (
              <Icon
                name='cake'
                width={16}
                height={16}
                color={Colors.PRIMARY_DARK_BLUE}
              />
            ),
            value: birthday,
            onChange: setBirthday,
          }}
          editingEnabled={true}
          placeholder={i18n.t('Birthday')}
          type='date'
        />

        <ProfileItem
          content={{
            icon: () => (
              <Icon
                name='phone'
                width={16}
                height={16}
                color={Colors.PRIMARY_DARK_BLUE}
              />
            ),
            value: cellPhone,
            onChange: setCellPhone,
          }}
          editingEnabled={true}
          placeholder={i18n.t('CellPhoneNumber')}
          type='tel'
        />

        <ProfileItem
          content={{
            icon: () => (
              <Icon
                name='phone'
                width={16}
                height={16}
                color={Colors.PRIMARY_DARK_BLUE}
              />
            ),
            value: homePhone,
            onChange: setHomePhone,
          }}
          editingEnabled={true}
          placeholder={i18n.t('HomePhoneNumber')}
          type='tel'
        />
      </div>

      {/* Save Button */}
      <div style={styles.saveButtonContainer}>
        <Button
          textProps={{
            text: isSaving ? `${i18n.t('Saving')}...` : i18n.t('Save'),
            color: Colors.WHITE,
            fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            fontSize: Typography.FONT_SIZE_16,
          }}
          backgroundColor={Colors.BLUE}
          onButtonClick={handleSave}
          loading={isSaving}
          width='90%'
          height={50}
        />
      </div>

      {/* Image Picker Modal */}
      <Modal
        isVisible={showImagePicker}
        title={i18n.t('ChangeProfilePicture')}
        onClose={() => setShowImagePicker(false)}
        footerContent={
          <div style={styles.modalFooter}>
            <Button
              textProps={{
                text: i18n.t('Cancel'),
                color: Colors.MIDNIGHT,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                fontSize: Typography.FONT_SIZE_14,
              }}
              backgroundColor={Colors.LIGHT_GREY}
              onButtonClick={() => setShowImagePicker(false)}
              width='100%'
            />
          </div>
        }
      >
        <div style={styles.imagePickerContainer}>
          <CustomText style={styles.modalText}>
            {i18n.t('SelectNewProfilePicture')}
          </CustomText>
          <div style={styles.fileInputContainer}>
            <input
              type='file'
              accept='image/*'
              onChange={handleImageSelect}
              style={styles.fileInput}
              id='avatar-upload'
            />
            <label htmlFor='avatar-upload' style={styles.fileInputLabel}>
              <Icon name='upload' width={20} height={20} color={Colors.WHITE} />
              <CustomText style={styles.fileInputLabelText}>
                {i18n.t('ChooseImage')}
              </CustomText>
            </label>
          </div>
          <CustomText style={styles.fileHelpText}>
            {i18n.t('ImageUploadHelpText')}
          </CustomText>
        </div>
      </Modal>
    </div>
  );
};

const styles = {
  content: {
    flex: 1,
    maxWidth: '600px',
    margin: '0 auto',
    width: '100%',
    padding: '24px 20px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
  },
  loadingText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.DARK_GREY,
  },
  formContainer: {
    marginLeft: '5%',
    marginRight: '5%',
    padding: '20px',
    backgroundColor: Colors.WHITE,
    borderRadius: '20px',
    marginBottom: '20px',
    position: 'relative' as const,
    zIndex: 1,
  },
  saveButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '40px',
    paddingHorizontal: '5%',
  },
  errorBanner: {
    backgroundColor: Colors.RED_LIGHT || '#ffebee',
    border: `1px solid ${Colors.RED}`,
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    marginLeft: '5%',
    marginRight: '5%',
  },
  errorBannerText: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.RED,
    textAlign: 'center' as const,
    lineHeight: '20px',
  },
  successBanner: {
    backgroundColor: Colors.GREEN_LIGHT || '#e8f5e8',
    border: `1px solid ${Colors.GREEN || '#4caf50'}`,
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    marginLeft: '5%',
    marginRight: '5%',
  },
  successBannerText: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREEN || '#4caf50',
    textAlign: 'center' as const,
    lineHeight: '20px',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    width: '100%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.MIDNIGHT,
    textAlign: 'center' as const,
    lineHeight: '24px',
  },
  datePickerContainer: {
    padding: '20px 0',
  },
  dateInput: {
    width: '100%',
    padding: '12px 16px',
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    border: `1px solid ${Colors.LIGHT_GREY}`,
    borderRadius: '8px',
    outline: 'none',
  },
  imagePickerContainer: {
    padding: '20px 0',
    textAlign: 'center' as const,
  },
  fileInputContainer: {
    margin: '20px 0',
  },
  fileInput: {
    display: 'none',
  },
  fileInputLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: Colors.BLUE,
    color: Colors.WHITE,
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
    border: 'none',
    transition: 'background-color 0.2s',
  },
  fileInputLabelText: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
    color: Colors.WHITE,
  },
  fileHelpText: {
    fontSize: Typography.FONT_SIZE_12,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.DARK_GREY,
    marginTop: '12px',
    lineHeight: '16px',
  },
};

export default EditProfilePage;
