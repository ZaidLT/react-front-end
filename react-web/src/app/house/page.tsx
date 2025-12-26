'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CustomText from '../../components/CustomText';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import NavHeader from '../../components/NavHeader';
import ProfileItem from '../../components/ProfileItem';
import { Colors, Typography } from '../../styles';

import { useAuth } from '../../context/AuthContext';
import { useLanguageContext } from '../../context/LanguageContext';
import Icon from '../../components/Icon';
import {
  FONT_FAMILY_POPPINS_REGULAR,
  FONT_SIZE_16,
} from '../../styles/typography';
import '../profile/profile.css';
import HorizontalLine from '../../components/HorizontalLine';
import ProfileSelect from '../../components/ProfileSelect';
import {
  COUNTRIES,
  getStateLabel,
  getZipLabel,
  getZipPattern,
} from '../../constants/countries';

interface HouseDetails {
  id: string;
  userId: string;
  houseDetailsImage?: string;
  houseDetailsData?: string;
  // Parsed house details
  name?: string;
  address?: string;
  city?: string;
  country?: string;
  state?: string;
  unit?: string;
  area?: string;
  bedrooms?: string;
  baths?: string;
  zipcode?: string;
  yearBuilt?: string;
}

const HousePage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { i18n } = useLanguageContext();

  // House details state
  const [, setHouseDetails] = useState<HouseDetails | null>(null);
  const [isLoadingHouse, setIsLoadingHouse] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [unit, setUnit] = useState('');
  const [area, setArea] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [baths, setBaths] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');

  // UI state
  const [editingEnabled, setEditingEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch house details
  useEffect(() => {
    const fetchHouseDetails = async () => {
      if (!user?.accountId) return;

      setIsLoadingHouse(true);
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('No auth token found');
        }

        const response = await fetch(
          `/api/accounts?accountId=${user.accountId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch house details');
        }

        const accountData = await response.json();

        // Extract the account object from the response
        const account = accountData.account || accountData;
        setHouseDetails(account);

        // Parse house details data if it exists
        let parsedData: any = {};
        if (account.houseDetailsData) {
          try {
            parsedData = JSON.parse(account.houseDetailsData);
          } catch (e) {
            console.warn('Failed to parse house details data:', e);
          }
        }

        // Initialize form with house details
        setName(parsedData.name || '');
        setAddress(parsedData.address || '');
        setCity(parsedData.city || '');
        setCountry(parsedData.country || '');
        setState(parsedData.state || '');
        setUnit(parsedData.unit || '');
        setArea(parsedData.area || '');
        setBedrooms(parsedData.bedrooms || '');
        setBaths(parsedData.baths || '');
        setZipcode(parsedData.zipcode || '');
        setYearBuilt(parsedData.yearBuilt || '');
      } catch (error) {
        console.error('Error fetching house details:', error);
        setError('Failed to load house details. Please try again.');
      } finally {
        setIsLoadingHouse(false);
      }
    };

    if (isAuthenticated && user) {
      fetchHouseDetails();
    }
  }, [isAuthenticated, user]);

  // Show loading if auth is still loading or house details are loading
  if (isLoading || isLoadingHouse) {
    return (
      <div className='profile-container'>
        <NavHeader
          headerText='🏡 House Details 🏡'
          left={{
            text: 'Back',
            goBack: true,
            onPress: () => router.back(),
          }}
        />
        <div className='profile-content' style={styles.content}>
          <div style={styles.loadingContainer}>
            <CustomText style={styles.loadingText}>
              Loading house details...
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

  // Handle save
  const handleSave = async () => {
    if (!user?.accountId) {
      setError('Account ID not found. Please try logging out and back in.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No auth token found');
      }

      // Prepare house details data
      const houseDetailsData = {
        name,
        address,
        city,
        country,
        state,
        unit,
        area,
        bedrooms,
        baths,
        zipcode,
        yearBuilt,
      };

      // Prepare update data
      const updateData = {
        id: user.accountId,
        userId: user.id,
        houseDetailsData: JSON.stringify(houseDetailsData),
      };

      const response = await fetch('/api/accounts', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update house details');
      }

      const result = await response.json();

      if (result.success !== false) {
        setSuccessMessage('House details updated successfully!');
        setEditingEnabled(false);

        // Navigate to house page after a short delay
        setTimeout(() => {
          router.push('/house');
        }, 1500);
      } else {
        throw new Error(result.error || 'Failed to update house details');
      }
    } catch (error) {
      console.error('Save house details error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to update house details. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit button
  const handleEditButtonState = () => {
    if (editingEnabled) {
      handleSave();
    } else {
      setEditingEnabled(true);
    }
  };

  return (
    <div className='profile-container'>
      {/* Page Header */}
      <NavHeader
        headerText='🏡 House Details 🏡'
        left={{
          text: 'Back',
          goBack: true,
          onPress: () => router.back(),
        }}
        right={[
          {
            key: 'edit-save',
            icon: (
              <CustomText
                style={{
                  color: isSaving
                    ? Colors.GREY_COLOR
                    : Colors.PRIMARY_DARK_BLUE,
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                }}
              >
                {editingEnabled ? (isSaving ? 'Saving...' : 'Save') : 'Edit'}
              </CustomText>
            ),
            onPress: handleEditButtonState,
          },
        ]}
      />

      {/* House Image Section */}
      <div className='profile-avatar-section'>
        <div className='profile-hexagon-avatar-container'>
          <div className='profile-hexagon-avatar'>
            <div
              className='profile-avatar-placeholder'
              style={{ backgroundColor: Colors.GRAY }}
            >
              <Icon
                name='home'
                width={32}
                height={32}
                color={Colors.PRIMARY_DARK_BLUE}
              />
            </div>
          </div>
          {editingEnabled && (
            <button
              className='profile-edit-avatar-button'
              onClick={() => setShowImagePicker(true)}
            >
              <Icon
                name='editImage'
                width={28}
                height={28}
                color={Colors.WHITE}
              />
            </button>
          )}
        </div>
      </div>

      {/* House Name Display */}
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
          {name || 'My House'}
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
                name='home'
                width={16}
                height={16}
                color={Colors.PRIMARY_DARK_BLUE}
              />
            ),
            value: name,
            onChange: setName,
          }}
          editingEnabled={editingEnabled}
          placeholder={i18n.t("PropertyName")}
        />

        <ProfileItem
          content={{
            icon: () => (
              <Icon
                name='location'
                width={16}
                height={16}
                color={Colors.PRIMARY_DARK_BLUE}
              />
            ),
            value: address,
            onChange: setAddress,
          }}
          editingEnabled={editingEnabled}
          placeholder={i18n.t("Address")}
        />

        <ProfileItem
          content={{
            icon: () => (
              <Icon
                name='location'
                width={16}
                height={16}
                color={Colors.PRIMARY_DARK_BLUE}
              />
            ),
            value: city,
            onChange: setCity,
          }}
          editingEnabled={editingEnabled}
          placeholder={i18n.t("City")}
        />

        <ProfileItem
          content={{
            icon: () => (
              <Icon
                name='location'
                width={16}
                height={16}
                color={Colors.PRIMARY_DARK_BLUE}
              />
            ),
            value: state,
            onChange: setState,
          }}
          editingEnabled={editingEnabled}
          placeholder={getStateLabel(country)}
        />

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ flex: 1 }}>
            <ProfileItem
              content={{
                icon: () => (
                  <Icon
                    name='location'
                    width={16}
                    height={16}
                    color={Colors.PRIMARY_DARK_BLUE}
                  />
                ),
                value: unit,
                onChange: setUnit,
              }}
              editingEnabled={editingEnabled}
              placeholder={i18n.t("UnitNumber")}
            />
          </div>
          <div style={{ flex: 1 }}>
            <ProfileItem
              content={{
                icon: () => (
                  <Icon
                    name='location'
                    width={16}
                    height={16}
                    color={Colors.PRIMARY_DARK_BLUE}
                  />
                ),
                value: zipcode,
                onChange: setZipcode,
              }}
              editingEnabled={editingEnabled}
              placeholder={getZipLabel(country)}
              pattern={getZipPattern(country)}
            />
          </div>
        </div>

        <ProfileSelect
          icon={() => (
            <Icon
              name='location'
              width={16}
              height={16}
              color={Colors.PRIMARY_DARK_BLUE}
            />
          )}
          label='Country'
          value={country}
          onChange={setCountry}
          options={COUNTRIES.map((countryOption) => ({
            value: countryOption.code,
            label: countryOption.name,
          }))}
          editingEnabled={editingEnabled}
          placeholder={i18n.t("SelectACountry")}
        />

        <ProfileItem
          content={{
            icon: () => (
              <Icon
                name='hashtag'
                width={16}
                height={16}
                color={Colors.PRIMARY_DARK_BLUE}
              />
            ),
            value: area,
            onChange: setArea,
          }}
          editingEnabled={editingEnabled}
          placeholder={i18n.t("AreaSqFt")}
        />

        <ProfileItem
          content={{
            icon: () => (
              <Icon
                name='bedroom'
                width={16}
                height={16}
                color={Colors.PRIMARY_DARK_BLUE}
              />
            ),
            value: bedrooms,
            onChange: setBedrooms,
          }}
          editingEnabled={editingEnabled}
          placeholder={i18n.t("NumberOfBedrooms")}
          type='number'
        />

        <ProfileItem
          content={{
            icon: () => (
              <Icon
                name='bathroom'
                width={16}
                height={16}
                color={Colors.PRIMARY_DARK_BLUE}
              />
            ),
            value: baths,
            onChange: setBaths,
          }}
          editingEnabled={editingEnabled}
          placeholder={i18n.t("NumberOfBathrooms")}
          type='number'
        />

        <ProfileItem
          content={{
            icon: () => (
              <Icon
                name='calendar-today'
                width={16}
                height={16}
                color={Colors.PRIMARY_DARK_BLUE}
              />
            ),
            value: yearBuilt,
            onChange: setYearBuilt,
          }}
          editingEnabled={editingEnabled}
          placeholder={i18n.t("YearBuilt")}
          type='number'
        />
      </div>

      {/* Image Picker Modal */}
      <Modal
        isVisible={showImagePicker}
        title='Change House Picture'
        onClose={() => setShowImagePicker(false)}
        footerContent={
          <div style={styles.modalFooter}>
            <Button
              textProps={{
                text: 'Cancel',
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
            House picture editing will be implemented in a future update.
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
    justifyContent: 'center',
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
  imagePickerContainer: {
    padding: '20px 0',
  },
};

export default HousePage;
