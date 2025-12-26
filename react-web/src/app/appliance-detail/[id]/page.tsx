'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguageContext } from '../../../context/LanguageContext';
import { translateApplianceLabel } from '../../../util/translationUtils';
import HiveHexTile from '../../../components/HiveHexTile';
import PillDetail from '../../../components/PillDetail';
import CustomText from '../../../components/CustomText';
import Icon from '../../../components/Icon';
import Modal from '../../../components/Modal';
import DeleteModal from '../../../components/DeleteModal';
import { TrashIcon } from '../../../components/SVGIcons';
import { Colors, Typography } from '../../../styles';
import SkeletonLoader from '../../../components/SkeletonLoader';
import './appliance-detail.css';

interface ApplianceData {
  UniqueId: string;
  Name: string;
  Type: string;
  ElectronicDevice_SerialNumber?: string;
  ElectronicDevice_BrandModel?: string;
  ElectronicDevice_PurchaseDate?: string;
  ElectronicDevice_EndOfWarranty?: string;
  AvatarImagePath?: string;
  ParentUniqueId?: string;
}

interface WarrantyItemProps {
  heading: string;
  value: string;
}

const WarrantyItem: React.FC<WarrantyItemProps> = ({ heading, value }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: `1px solid ${Colors.LIGHT_GREY}`,
    }}
  >
    <CustomText
      style={{
        fontSize: Typography.FONT_SIZE_14,
        fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
        color: Colors.DARK_GREY,
      }}
    >
      {heading}
    </CustomText>
    <CustomText
      style={{
        fontSize: Typography.FONT_SIZE_14,
        fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
        color: Colors.BLACK,
      }}
    >
      {value}
    </CustomText>
  </div>
);

const ApplianceDetailPage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { i18n } = useLanguageContext();

  const applianceId = params.id as string;
  const isMobileApp = searchParams.get('mobile') === 'true';

  // Get appliance type from query param for translation
  const applianceTypeParam = searchParams.get('type');
  const applianceType = applianceTypeParam ? parseInt(applianceTypeParam, 10) : null;

  // Initial name from query param (for backward compatibility) or translated from type
  const initialName = searchParams.get('name') ||
    translateApplianceLabel({ type: applianceType }, i18n) ||
    'Appliance';

  const [appliance, setAppliance] = useState<ApplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Computed appliance name: translate based on loaded data, fallback to initialName
  const applianceName = useMemo(() => {
    if (appliance) {
      return translateApplianceLabel(
        { type: parseInt(appliance.Type, 10), name: appliance.Name },
        i18n
      );
    }
    return initialName;
  }, [appliance, i18n, initialName]);

  // Load appliance data
  useEffect(() => {
    const loadAppliance = async () => {
      if (!user?.id || !user?.accountId || !applianceId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/tiles/${applianceId}?accountId=${user.accountId}&userId=${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Appliance data received:', data);
          console.log(
            'Purchase Date from API:',
            data.ElectronicDevice_PurchaseDate
          );
          console.log(
            'End of Warranty from API:',
            data.ElectronicDevice_EndOfWarranty
          );
          setAppliance(data);
        } else {
          console.error('Failed to load appliance:', response.statusText);
          setError('Failed to load appliance details');
        }
      } catch (error) {
        console.error('Error loading appliance:', error);
        setError('Error loading appliance details');
      } finally {
        setLoading(false);
      }
    };

    loadAppliance();
  }, [user?.id, user?.accountId, applianceId]);

  const handleBack = () => {
    router.push('/appliances');
  };

  const handleDelete = async () => {
    if (!appliance) return;

    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('auth_token')
          : null;
      const response = await fetch(
        `/api/tiles/${appliance.UniqueId}?accountId=${user?.accountId}&userId=${user?.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (response.ok) {
        setShowDeleteModal(false);
        router.push('/appliances');
      }
    } catch (e) {
      // Swallow error to avoid noisy logs in production; could surface a toast if available
    }
  };

  const formatDate = (dateString?: string | null) => {
    console.log('formatDate called with:', dateString);

    // Return current date if no date is provided or is null
    if (!dateString || dateString === null) {
      console.log('No date provided, using current date');
      const currentDate = new Date();
      return currentDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
    }

    // Check for specific placeholder date: "2000-01-01T00:00:00.000Z"
    if (dateString === '2000-01-01T00:00:00.000Z') {
      console.log('Placeholder date detected, using current date');
      const currentDate = new Date();
      return currentDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
    }

    try {
      const date = new Date(dateString);
      const year = date.getFullYear();

      // Check if the year is 1999 or 2000 (placeholder years)
      if (year <= 2000) {
        console.log('Placeholder year detected:', year, 'using current date');
        const currentDate = new Date();
        return currentDate.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        });
      }

      console.log(
        'Valid date found:',
        dateString,
        'formatted as:',
        date.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        })
      );

      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
    } catch {
      console.log('Date parsing failed, using current date');
      // Return current date if date parsing fails
      const currentDate = new Date();
      return currentDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
    }
  };

  // Note: Background color is now handled by CSS custom properties via MobileThemeProvider
  // No need to directly set document.body.style.backgroundColor

  if (loading) {
    return (
      <div className='appliance-detail-container'>
        <div className='appliance-detail-header'>
          <button
            type='button'
            onClick={handleBack}
            className='appliance-detail-back-button'
          >
            <img
              src='/icons/icon-menu-back.svg'
              width={24}
              height={24}
              alt='Back'
              style={{ cursor: 'pointer' }}
            />
          </button>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
              }}
            >
              {applianceName}
            </CustomText>
          </div>
          <div style={{ width: 24 }} /> {/* Spacer for centering */}
        </div>
        <div className='appliance-detail-background' />
        <div className='appliance-detail-content'>
          <div className='appliance-detail-loading'>
            <SkeletonLoader width='100%' height='200px' />
          </div>
        </div>
      </div>
    );
  }

  if (error || !appliance) {
    return (
      <div className='appliance-detail-container'>
        <div className='appliance-detail-header'>
          <button
            type='button'
            onClick={handleBack}
            className='appliance-detail-back-button'
          >
            <img
              src='/icons/icon-menu-back.svg'
              width={24}
              height={24}
              alt='Back'
              style={{ cursor: 'pointer' }}
            />
          </button>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
              }}
            >
              {applianceName}
            </CustomText>
          </div>
          <div style={{ width: 24 }} /> {/* Spacer for centering */}
        </div>
        <div className='appliance-detail-background' />
        <div className='appliance-detail-content'>
          <div className='appliance-detail-error'>
            <CustomText
              style={{
                fontSize: Typography.FONT_SIZE_16,
                color: Colors.RED,
                textAlign: 'center',
              }}
            >
              {error || 'Appliance not found'}
            </CustomText>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='appliance-detail-container'>
      {/* Header */}
      <div className='appliance-detail-header'>
        <button
          type='button'
          onClick={handleBack}
          className='appliance-detail-back-button'
        >
          <img
            src='/icons/icon-menu-back.svg'
            width={24}
            height={24}
            alt='Back'
            style={{ cursor: 'pointer' }}
          />
        </button>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
            }}
          >
            {applianceName}
          </CustomText>
        </div>
        <div className='appliance-detail-header-actions'>
          <button
            type='button'
            onClick={() => setShowDeleteModal(true)}
            className='appliance-detail-back-button'
            aria-label='Delete'
          >
            <TrashIcon width={24} height={24} color={Colors.BLUE} />
          </button>
          <button
            type='button'
            onClick={() => {
              router.push(
                `/edit-appliance-detail/${applianceId}?type=${appliance.Type}`
              );
            }}
            className='appliance-detail-back-button'
            aria-label='Edit'
          >
            <Icon
              name='edit-pen-paper'
              width={24}
              height={24}
              color={Colors.BLUE}
            />
          </button>
        </div>
      </div>

      {/* Background positioned after header */}
      <div className='appliance-detail-background' />

      {/* Content wrapper after header */}
      <div className='appliance-detail-content'>
        {/* Main Content with Hex Layout */}
        <div className='appliance-detail-hex-container'>
          {/* Header Hex Tile */}
          <div className='appliance-detail-header-hex'>
            <HiveHexTile
              content={{
                icon: 'appliances',
              }}
              coloredTile={true}
              width={isMobileApp ? 100 : 120}
              height={isMobileApp ? 100 : 120}
              isMobile={isMobileApp}
              centerIcon={true}
              iconSize={36}
            />
          </div>

          {/* Appliance Details Card */}
          <div className='appliance-detail-card'>
            {/* Appliance Info Section */}
            <div className='appliance-details-section'>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <CustomText
                  style={{
                    fontSize: Typography.FONT_SIZE_16,
                    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                    color: Colors.BLACK,
                  }}
                >
                  {i18n.t('ApplianceInfo')}
                </CustomText>

                {/* Display uploaded image if available - right aligned with label values */}
                {appliance.AvatarImagePath && (
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: `1px solid ${Colors.LIGHT_GREY}`,
                      flexShrink: 0,
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                    }}
                    onClick={() => setShowImageViewer(true)}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform =
                        'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform =
                        'scale(1)';
                    }}
                  >
                    <img
                      src={appliance.AvatarImagePath}
                      alt='Appliance'
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                )}
              </div>

              <WarrantyItem
                heading={i18n.t('SerialNumber')}
                value={appliance.ElectronicDevice_SerialNumber || '-'}
              />
              <WarrantyItem
                heading={i18n.t('ModelNumber')}
                value={appliance.ElectronicDevice_BrandModel || '-'}
              />
              <WarrantyItem
                heading={i18n.t('PurchaseDate')}
                value={formatDate(appliance.ElectronicDevice_PurchaseDate)}
              />
              <WarrantyItem
                heading={i18n.t('EndOfWarranty')}
                value={formatDate(appliance.ElectronicDevice_EndOfWarranty)}
              />
            </div>
          </div>

          {/* Horizontal Line */}
          <div className='appliance-divider' />

          {/* Pills Detail Section (Tasks, Notes, Documents, Events) */}
          <div className='appliance-detail-files-section'>
            <PillDetail homeMemberId={applianceId} />
          </div>
        </div>
      </div>

      {/* Image Viewer Modal  */}
      <Modal
        isVisible={!!showImageViewer && !!appliance?.AvatarImagePath}
        onClose={() => setShowImageViewer(false)}
        showCloseButton={true}
        contentStyle={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {appliance?.AvatarImagePath && (
          <img
            src={appliance.AvatarImagePath}
            alt='Appliance Full View'
            style={{
              width: '100%',
              height: 'auto',
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        )}
      </Modal>

      {/* Delete Modal (shared component) */}
      <DeleteModal
        isVisible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        category='appliance'
        customTitle={`Delete Appliance`}
        customMessage={`Are you sure you want to delete "${
          applianceName
        }"? This action cannot be undone.`}
      />
    </div>
  );
};

export default ApplianceDetailPage;
