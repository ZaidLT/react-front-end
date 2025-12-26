'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '../../hooks/useRouterWithPersistentParams';
import CustomText from '../../components/CustomText';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import {
  ProfileUserInfoSkeleton,
  ProfileDetailsSkeleton,
  ProfileActionButtonsSkeleton,
} from '../../components/SkeletonLoader';
import NavHeader from '../../components/NavHeader';
import MenuListItem from '../../components/MenuListItem';
import { Colors, Typography } from '../../styles';
import { useLanguageContext } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/Icon';
import accountService from '../../services/accountService';
import { getInitials } from '../../util/helpers';
import {
  FONT_FAMILY_POPPINS_REGULAR,
  FONT_SIZE_16,
} from '../../styles/typography';
import './profile.css';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { i18n } = useLanguageContext();
  const { user, logout, isAuthenticated, isLoading } = useAuth();

  // Profile data state
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Modal states
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteCodeModal, setShowDeleteCodeModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isSendingDeleteEmail, setIsSendingDeleteEmail] = useState(false);
  const [deletionCode, setDeletionCode] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [tokenCopied, setTokenCopied] = useState(false);

  // Debug mode check
  const isDebugMode = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Function to fetch profile data
  const fetchProfileData = async () => {
    if (!user?.id || !user?.accountId) return;

    setIsLoadingProfile(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `/api/users/${user.id}?accountId=${user.accountId}`,
        {
          method: 'GET',
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
      setProfileData(profileData);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Fetch full profile data when user is available
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfileData();
    }
  }, [isAuthenticated, user]);

  // Refresh profile data when page becomes visible (returning from edit)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && user) {
        fetchProfileData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, user]);

  // Copy Bearer token to clipboard
  const copyBearerToken = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await navigator.clipboard.writeText(`Bearer ${token}`);
        setTokenCopied(true);
        setTimeout(() => setTokenCopied(false), 2000); // Reset after 2 seconds
      }
    } catch (error) {
      console.error('Failed to copy token:', error);
    }
  };

  // Clear errors and messages when modals are closed
  useEffect(() => {
    if (!showDeleteModal && !showDeleteCodeModal) {
      setDeleteError(null);
      setSuccessMessage(null);
    }
  }, [showDeleteModal, showDeleteCodeModal]);

  // Validate user data and show error if incomplete
  useEffect(() => {
    if (isAuthenticated && user && (!user.accountId || !user.email)) {
      setGeneralError(i18n.t('UserAccountInformationIncomplete'));
    } else {
      setGeneralError(null);
    }
  }, [isAuthenticated, user, i18n]);

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    setGeneralError(null);

    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setGeneralError(i18n.t('FailedToLogout'));

      // If logout fails, still clear local state after a delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  // Handle account deletion - send email
  const handleDeleteAccount = async () => {
    if (!user?.accountId || !user?.email) {
      setDeleteError(
        'User information not available. Please try logging out and logging back in.'
      );
      return;
    }

    setIsSendingDeleteEmail(true);
    setDeleteError(null);

    try {
      const response = await accountService.sendDeletionEmail({
        accountId: user.accountId,
        emailAddress: user.email,
      });

      if (response.success) {
        setShowDeleteModal(false);
        setShowDeleteCodeModal(true);
        setRetryCount(0); // Reset retry count on success
        setSuccessMessage(
          'Deletion code sent to your email. Please check your inbox.'
        );
      } else {
        // Handle specific error cases
        if (response.error?.includes('not found')) {
          setDeleteError('Account not found. Please contact support.');
        } else if (response.error?.includes('permission')) {
          setDeleteError('You do not have permission to delete this account.');
        } else {
          setDeleteError(
            response.error || 'Failed to send deletion email. Please try again.'
          );
        }
      }
    } catch (error) {
      console.error('Account deletion email error:', error);

      // Implement retry logic for network errors
      if (retryCount < 2) {
        setDeleteError(`Network error. Retrying... (${retryCount + 1}/3)`);
        setRetryCount((prev) => prev + 1);
        setTimeout(() => {
          handleDeleteAccount();
        }, 1000);
        return;
      }

      setDeleteError(
        'Failed to send deletion email. Please check your internet connection and try again.'
      );
    } finally {
      setIsSendingDeleteEmail(false);
    }
  };

  // Handle account deletion confirmation with code
  const handleConfirmDeleteAccount = async () => {
    if (!user?.accountId || !user?.email) {
      setDeleteError(
        'User information not available. Please try logging out and logging back in.'
      );
      return;
    }

    if (!deletionCode.trim()) {
      setDeleteError('Please enter the 4-digit deletion code');
      return;
    }

    if (
      deletionCode.trim().length !== 4 ||
      !/^\d{4}$/.test(deletionCode.trim())
    ) {
      setDeleteError('Please enter a valid 4-digit deletion code');
      return;
    }

    setIsDeletingAccount(true);
    setDeleteError(null);

    try {
      // First validate the deletion code
      const validationResponse = await accountService.validateDeletionCode({
        accountId: user.accountId,
        emailAddress: user.email,
        deletionCode: deletionCode.trim(),
      });

      if (!validationResponse.success) {
        // Handle specific validation errors
        if (
          validationResponse.error?.includes('Invalid') ||
          validationResponse.error?.includes('code')
        ) {
          setDeleteError(
            'Invalid deletion code. Please check your email and try again.'
          );
        } else if (validationResponse.error?.includes('expired')) {
          setDeleteError(
            'Deletion code has expired. Please request a new one.'
          );
        } else {
          setDeleteError(validationResponse.error || 'Invalid deletion code');
        }
        return;
      }

      // If validation successful, proceed with account purge
      const purgeResponse = await accountService.purgeAccount({
        accountId: user.accountId,
        deletionCode: deletionCode.trim(),
      });

      if (purgeResponse.success) {
        // Account deleted successfully, logout and redirect
        try {
          await logout();
        } catch (logoutError) {
          console.error('Logout error after account deletion:', logoutError);
          // Even if logout fails, still redirect since account is deleted
        }
        router.push('/login');
      } else {
        setDeleteError(
          purgeResponse.error || 'Failed to delete account. Please try again.'
        );
      }
    } catch (error) {
      console.error('Account deletion error:', error);

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setDeleteError(
          'Network error. Please check your internet connection and try again.'
        );
      } else {
        setDeleteError('Failed to delete account. Please try again later.');
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Show loading if auth is still loading
  if (isLoading) {
    return (
      <div className='profile-container'>
        {/* Page Header */}
        <NavHeader
          headerText={i18n.t('MyProfile')}
          left={{
            text: 'Back',
            goBack: true,
            onPress: () => router.push('/home'),
          }}
        />

        {/* Content with skeleton loaders */}
        <div className='profile-content' style={styles.content}>
          <ProfileUserInfoSkeleton />
          <ProfileDetailsSkeleton />
          <ProfileActionButtonsSkeleton />
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
      FirstName: profileData?.firstName || user?.firstName || '',
      LastName: profileData?.lastName || user?.lastName || '',
    });
  };

  return (
    <div className='profile-container'>
      {/* Page Header */}
      <NavHeader
        headerText={i18n.t('MyProfile')}
        left={{
          text: 'Back',
          goBack: true,
          onPress: () => router.push('/home'),
        }}
      />

      {/* Avatar Section */}
      <div className='profile-avatar-section'>
        <div className='profile-avatar-container'>
          {profileData?.avatarImagePath ? (
            // Show circular avatar when image exists
            <div className='profile-circular-avatar-container'>
              <img
                src={profileData.avatarImagePath}
                alt='Profile Avatar'
                className='profile-circular-avatar'
                key={profileData.avatarImagePath} // Force re-render when avatar path changes
              />
              <button
                className='profile-edit-avatar-button'
                onClick={() => {
                  router.push('/profile/edit');
                }}
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
                      color: Colors.PRIMARY_DARK_BLUE,
                      fontFamily: FONT_FAMILY_POPPINS_REGULAR,
                    }}
                  >
                    {getUserInitials()}
                  </CustomText>
                </div>
              </div>
              <button
                className='profile-edit-avatar-button'
                onClick={() => {
                  router.push('/profile/edit');
                }}
              >
                <Icon name='edit-pencil' width={18} height={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Name and Welcome Message */}
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
          {profileData?.firstName || user.firstName}
        </CustomText>
        <br />
        <CustomText
          style={{
            fontSize: FONT_SIZE_16,
            fontFamily: FONT_FAMILY_POPPINS_REGULAR,
            color: Colors.MIDNIGHT,
          }}
        >
          {i18n.t('WelcomeBack')} 👋
        </CustomText>
      </div>

      {/* General Error Display */}
      {generalError && (
        <div style={styles.errorBanner}>
          <CustomText style={styles.errorBannerText}>{generalError}</CustomText>
        </div>
      )}

      {/* Menu Items */}
      <div style={styles.menuContainer}>
        <MenuListItem
          title={i18n.t('Profile')}
          icon={
            <Icon name='user' height={24} width={24} color={Colors.MIDNIGHT} />
          }
          onPress={() => {
            // Navigate to profile edit page
            router.push('/profile/edit');
          }}
        />

        <MenuListItem
          title={i18n.t('HouseDetails')}
          icon={
            <Icon name='house' height={24} width={24} color={Colors.MIDNIGHT} />
          }
          onPress={() => {
            // Navigate to house details page
            router.push('/house');
          }}
        />

        <MenuListItem
          title={i18n.t('Settings')}
          icon={
            <Icon
              name='settings'
              height={24}
              width={24}
              color={Colors.MIDNIGHT}
            />
          }
          onPress={() => {
            // Navigate to settings page
            router.push('/settings');
          }}
        />
      </div>

      {/* Bottom Actions */}
      <div style={styles.bottomActions}>
        <MenuListItem
          title={isLoggingOut ? 'Logging out...' : i18n.t('LogOut')}
          icon={
            <Icon
              name='logout'
              height={24}
              width={24}
              color={Colors.MIDNIGHT}
            />
          }
          onPress={() => setShowLogoutModal(true)}
          containerStyle={styles.bottomActionItem}
        />

        <MenuListItem
          title={
            isSendingDeleteEmail ? 'Sending email...' : i18n.t('DeleteAccount')
          }
          icon={<Icon name='bin' height={24} width={24} color={Colors.RED} />}
          textColor={Colors.RED}
          onPress={() => setShowDeleteModal(true)}
          containerStyle={styles.bottomActionItem}
        />
      </div>

      {/* App Version Info */}
      <div style={styles.versionInfo}>
        <CustomText style={styles.versionText}>
          Env: {process.env.NODE_ENV || 'development'}
          {'\n'}
          App Version: v1.0.0{'\n'}
        </CustomText>
        {isDebugMode && (
          <button
            onClick={copyBearerToken}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              fontSize: '10px',
              backgroundColor: tokenCopied ? Colors.GREEN : Colors.BLUE,
              color: Colors.WHITE,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              transition: 'background-color 0.2s ease',
            }}
          >
            {tokenCopied ? '✓ Copied!' : 'Copy Bearer Token'}
          </button>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isVisible={showLogoutModal}
        title={i18n.t('SeeYouAround')}
        onClose={() => setShowLogoutModal(false)}
        headerStyle={{ borderBottom: 'none' }}
        footerStyle={{ borderTop: 'none' }}
        footerContent={
          <div className='profile-modal-footer' style={styles.modalFooter}>
            <Button
              textProps={{
                text: i18n.t('No'),
                color: Colors.MIDNIGHT,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                fontSize: Typography.FONT_SIZE_16,
              }}
              backgroundColor={Colors.LIGHT_GREY}
              onButtonClick={() => setShowLogoutModal(false)}
              width='48%'
              height={50}
            />
            <Button
              textProps={{
                text: i18n.t('Yes'),
                color: Colors.WHITE,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                fontSize: Typography.FONT_SIZE_16,
              }}
              backgroundColor={Colors.BLUE}
              onButtonClick={handleLogout}
              loading={isLoggingOut}
              width='48%'
              height={50}
            />
          </div>
        }
      >
        <CustomText style={styles.modalText}>
          {i18n.t('AreYouSureYouWantToLogOut')}?
        </CustomText>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isVisible={showDeleteModal}
        title={i18n.t('DeleteAccount')}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteError(null);
        }}
        footerContent={
          <div className='profile-modal-footer' style={styles.modalFooter}>
            <Button
              textProps={{
                text: i18n.t('Cancel'),
                color: Colors.MIDNIGHT,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                fontSize: Typography.FONT_SIZE_14,
              }}
              backgroundColor={Colors.LIGHT_GREY}
              onButtonClick={() => {
                setShowDeleteModal(false);
                setDeleteError(null);
              }}
              width='48%'
            />
            <Button
              textProps={{
                text: 'Send Email',
                color: Colors.WHITE,
                fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                fontSize: Typography.FONT_SIZE_14,
              }}
              backgroundColor={Colors.RED}
              onButtonClick={handleDeleteAccount}
              loading={isSendingDeleteEmail}
              width='48%'
            />
          </div>
        }
      >
        <div>
          <CustomText style={styles.modalText}>
            Are you sure you want to delete your account? This action cannot be
            undone.
          </CustomText>
          <CustomText style={styles.modalSubText}>
            We will send a verification code to your email address to confirm
            the deletion.
          </CustomText>
          {deleteError && (
            <CustomText style={styles.errorText}>{deleteError}</CustomText>
          )}
        </div>
      </Modal>

      {/* Delete Account Code Verification Modal */}
      <Modal
        isVisible={showDeleteCodeModal}
        title='Enter Deletion Code'
        onClose={() => {
          setShowDeleteCodeModal(false);
          setDeletionCode('');
          setDeleteError(null);
        }}
        footerContent={
          <div className='profile-modal-footer' style={styles.modalFooter}>
            <Button
              textProps={{
                text: i18n.t('Cancel'),
                color: Colors.MIDNIGHT,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                fontSize: Typography.FONT_SIZE_14,
              }}
              backgroundColor={Colors.LIGHT_GREY}
              onButtonClick={() => {
                setShowDeleteCodeModal(false);
                setDeletionCode('');
                setDeleteError(null);
              }}
              width='48%'
            />
            <Button
              textProps={{
                text: 'Delete Account',
                color: Colors.WHITE,
                fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                fontSize: Typography.FONT_SIZE_14,
              }}
              backgroundColor={Colors.RED}
              onButtonClick={handleConfirmDeleteAccount}
              loading={isDeletingAccount}
              width='48%'
            />
          </div>
        }
      >
        <div>
          <CustomText style={styles.modalText}>
            Please enter the 4-digit deletion code sent to your email address.
          </CustomText>
          {successMessage && (
            <div style={styles.successBanner}>
              <CustomText style={styles.successBannerText}>
                {successMessage}
              </CustomText>
            </div>
          )}
          <input
            type='text'
            value={deletionCode}
            onChange={(e) => setDeletionCode(e.target.value)}
            placeholder='Enter 4-digit code'
            maxLength={4}
            className='profile-code-input'
            style={styles.codeInput}
          />
          {deleteError && (
            <CustomText style={styles.errorText}>{deleteError}</CustomText>
          )}
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
  menuContainer: {
    marginTop: '20px',
    marginLeft: '5%',
    marginRight: '5%',
    padding: '20px',
    backgroundColor: Colors.WHITE,
    borderRadius: '20px',
    marginBottom: '20px',
    position: 'relative' as const,
    zIndex: 1,
  },
  bottomActions: {
    marginLeft: '5%',
    marginRight: '5%',
    padding: '20px',
    backgroundColor: Colors.WHITE,
    borderRadius: '20px',
    marginBottom: '20px',
    position: 'relative' as const,
    zIndex: 1,
  },
  bottomActionItem: {
    marginBottom: '0px',
  },
  versionInfo: {
    position: 'absolute' as const,
    bottom: '20px',
    right: '20px',
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '8px',
  },
  versionText: {
    fontSize: Typography.FONT_SIZE_10,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.DARK_GREY,
    textAlign: 'right' as const,
    lineHeight: '14px',
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
    marginBottom: '16px',
  },
  modalSubText: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.DARK_GREY,
    textAlign: 'center' as const,
    lineHeight: '20px',
    marginBottom: '16px',
  },
  errorText: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.RED,
    textAlign: 'center' as const,
    lineHeight: '20px',
    marginTop: '12px',
  },
  codeInput: {
    width: '100%',
    padding: '12px 16px',
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    border: `1px solid ${Colors.LIGHT_GREY}`,
    borderRadius: '8px',
    textAlign: 'center' as const,
    letterSpacing: '4px',
    marginBottom: '16px',
    outline: 'none',
  },
  errorBanner: {
    backgroundColor: Colors.RED_LIGHT || '#ffebee',
    border: `1px solid ${Colors.RED}`,
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
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
    marginBottom: '16px',
  },
  successBannerText: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREEN || '#4caf50',
    textAlign: 'center' as const,
    lineHeight: '20px',
  },
};

export default ProfilePage;
