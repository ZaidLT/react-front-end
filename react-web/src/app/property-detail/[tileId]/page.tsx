'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from '../../../hooks/useRouterWithPersistentParams';
import { useSearchParams, useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguageContext } from '../../../context/LanguageContext';
import { translateTileLabel } from '../../../util/translationUtils';

import { Colors, Typography } from '../../../styles';
import CustomText from '../../../components/CustomText';

import Icon from '../../../components/Icon';
import HiveHexTile from '../../../components/HiveHexTile';
import PillDetail from '../../../components/PillDetail';
import { Provider, ETileType } from '../../../util/types';
import { TILE_DATA_MAP } from '../../../util/constants';
import { useProviderStore } from '../../../context/store';
import providerService from '../../../services/providerService';
import './property-detail.css';

interface PropertyDetailPageProps {
  params: Promise<{
    tileId: string;
  }>;
}

interface PropertyItemProps {
  heading: string;
  value: string;
}

const PropertyItem: React.FC<PropertyItemProps> = ({ heading, value }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: `1px solid ${Colors.LIGHT_GREY}`,
  }}>
    <CustomText style={{
      fontSize: Typography.FONT_SIZE_14,
      fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
      color: Colors.DARK_GREY,
    }}>
      {heading}
    </CustomText>
    <CustomText style={{
      fontSize: Typography.FONT_SIZE_14,
      fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
      color: Colors.BLACK,
    }}>
      {value}
    </CustomText>
  </div>
);

const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({ params }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { i18n } = useLanguageContext();

  // Get parameters from URL
  const tileIdFromUrl = searchParams.get('tileId');
  const propertyTypeParam = searchParams.get('type');
  const propertyType = propertyTypeParam;
  const isMobileApp = searchParams.get('mobile') === 'true';

  // Compute property name with backward compatibility
  const propertyName = useMemo(() => {
    // Prefer type-based translation (new format)
    if (propertyType) {
      const typeEnum = parseInt(propertyType, 10);
      const translated = translateTileLabel({ type: typeEnum }, i18n);
      if (translated) return translated;
    }
    // Fallback to name param (old bookmarks)
    const nameParam = searchParams.get('name');
    if (nameParam) {
      return nameParam;
    }
    // Final fallback
    return 'Property';
  }, [propertyType, searchParams, i18n]);

  // Get user's property situation (rent/own status) - default to "Own" if not set
  const propertySituation = user?.propertySituation || user?.PropertySituation || 'Own';

  // Provider store
  const { setProviders } = useProviderStore();

  // State
  const [provider, setProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{
    tileId: string;
  } | null>(null);

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParamsValue = await params;
      setResolvedParams(resolvedParamsValue);
    };
    resolveParams();
  }, [params]);

  // Get tile data from TILE_DATA_MAP
  const tileData = useMemo(() => {
    if (!propertyType) return null;
    return TILE_DATA_MAP[propertyType as ETileType];
  }, [propertyType]);

  // Generate the correct property tile ID (same logic as property-info page)
  const actualPropertyTileId = useMemo(() => {
    console.log('🔍 Property detail tile ID generation - User:', user?.id, 'PropertyType:', propertyType, 'User object:', user, 'Force recompile v2');
    if (!user?.id || !propertyType) {
      console.log('❌ Missing data for property tile ID generation:', { userId: user?.id, propertyType });
      return null;
    }
    // Generate a deterministic UUID based on user ID and tile type for consistency
    const deterministicId = `${user.id}-${propertyType}`;
    console.log('✅ Generated property tile ID:', deterministicId, 'for type:', propertyType);
    return deterministicId;
  }, [user?.id, propertyType]);

  const pageName = propertyName || tileData?.title || 'Property';

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Load provider data
  useEffect(() => {
    const loadProvider = async () => {
      if (!user?.id || !user?.accountId || !resolvedParams?.tileId) return;

      try {
        setError(null);

        // Load providers
        const providersData = await providerService.getProvidersByUser(user.id, user.accountId);
        setProviders(providersData);

        // Find matching provider by utilityTypes field
        const matchingProvider = providersData.find(p =>
          p.utilityTypes?.toLowerCase() === propertyType?.toLowerCase() ||
          p.utilityTypes?.toLowerCase() === pageName.toLowerCase()
        );

        setProvider(matchingProvider || null);
      } catch (error) {
        console.error('Error loading provider:', error);
        setError('Failed to load property data');
      }
    };

    loadProvider();
  }, [user?.id, user?.accountId, resolvedParams?.tileId, propertyType, pageName, setProviders]);

  const handleBack = () => {
    router.push('/property-info');
  };

  const handleEdit = () => {
    if (resolvedParams?.tileId) {
      router.push(`/edit-property-detail/${resolvedParams.tileId}?name=${encodeURIComponent(pageName)}&type=${propertyType}`);
    }
  };

  if (!resolvedParams) {
    return null;
  }

  return (
    <div className="property-detail-container">
      {/* Header */}
      <div className="property-detail-header" style={{ position: 'relative', padding: isMobileApp ? '16px' : '20px' }}>
        <button onClick={handleBack} className="property-detail-back-button">
          <img src="/icons/icon-menu-back.svg" width={24} height={24} alt="Back" style={{ cursor: 'pointer' }} />
        </button>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CustomText style={{ color: '#000E50', fontFamily: 'Poppins', fontSize: '20px', fontStyle: 'normal', fontWeight: 600, lineHeight: 'normal', letterSpacing: '-0.408px', textAlign: 'center' }}>
            {pageName}
          </CustomText>
        </div>
        <button onClick={handleEdit} className="property-detail-back-button">
          <Icon name="edit-pen-paper" width={24} height={24} color={Colors.BLUE} />
        </button>
      </div>

      {/* Background positioned after header */}
      <div className="property-detail-background" />

      {/* Content wrapper after header */}
      <div className="property-detail-content">

        {/* Main Content with Hex Layout */}
        <div className="property-detail-hex-container">
          {/* Header Hex Tile */}
          <div className="property-detail-header-hex">
            <HiveHexTile
              content={{
                icon: tileData?.icon || 'house',
              }}
              coloredTile={true}
              width={isMobileApp ? 100 : 120}
              height={isMobileApp ? 100 : 120}
              isMobile={isMobileApp}
              centerIcon={true}
              iconSize={36}
            />
          </div>

          {/* Property Details Card */}
          <div className="property-detail-card">
            {/* Property Info Section */}
            <div className="property-details-section">
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                  color: Colors.BLACK,
                }}>
                  {i18n.t('PropertyInfo')}
                </CustomText>
              </div>

              {/* Property Deeds (type 33) specific fields */}
              {propertyType === '33' && (
                <>
                  <PropertyItem
                    heading={i18n.t('OwnerName')}
                    value={provider?.name || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('Address')}
                    value={provider?.representative || '-'}
                  />
                </>
              )}

              {/* Mortgage (type 35) specific fields */}
              {propertyType === '35' && (
                <>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    marginTop: '24px',
                  }}>
                    <CustomText style={{
                      fontSize: Typography.FONT_SIZE_16,
                      fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                      color: Colors.BLACK,
                    }}>
                      {i18n.t('AccountInformation')}
                    </CustomText>
                  </div>
                  <PropertyItem
                    heading={i18n.t('LenderName')}
                    value={provider?.name || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('AccountNumber')}
                    value={provider?.accountNumber || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('Website')}
                    value={provider?.website || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('PhoneNumber')}
                    value={provider?.phoneNumber || '-'}
                  />

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    marginTop: '24px',
                  }}>
                    <CustomText style={{
                      fontSize: Typography.FONT_SIZE_16,
                      fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                      color: Colors.BLACK,
                    }}>
                      {i18n.t('MortgageDetails')}
                    </CustomText>
                  </div>
                  <PropertyItem
                    heading={i18n.t('LoanType')}
                    value={provider?.type || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('StartDate')}
                    value={provider?.billingDueDate ? new Date(provider.billingDueDate).toLocaleDateString() : '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('EndDate')}
                    value={provider?.renewalDate ? new Date(provider.renewalDate).toLocaleDateString() : '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('PaymentFrequency')}
                    value={provider?.methodOfPayment || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('EmergencyMaintenanceContact')}
                    value={provider?.representative || '-'}
                  />
                </>
              )}

              {/* Taxes (type 36) specific fields */}
              {propertyType === '36' && (
                <>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    marginTop: '24px',
                  }}>
                    <CustomText style={{
                      fontSize: Typography.FONT_SIZE_16,
                      fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                      color: Colors.BLACK,
                    }}>
                      {i18n.t('AccountInformation')}
                    </CustomText>
                  </div>
                  <PropertyItem
                    heading={i18n.t('TaxAuthority')}
                    value={provider?.name || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('AccountNumber')}
                    value={provider?.accountNumber || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('Website')}
                    value={provider?.website || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('PhoneNumber')}
                    value={provider?.phoneNumber || '-'}
                  />

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    marginTop: '24px',
                  }}>
                    <CustomText style={{
                      fontSize: Typography.FONT_SIZE_16,
                      fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                      color: Colors.BLACK,
                    }}>
                      {i18n.t('TaxDetails')}
                    </CustomText>
                  </div>
                  <PropertyItem
                    heading={i18n.t('TaxYear')}
                    value={provider?.type || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('PaymentFrequency')}
                    value={provider?.methodOfPayment || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('TaxDueDate')}
                    value={provider?.billingDueDate ? new Date(provider.billingDueDate).toLocaleDateString() : '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('EmergencyTaxContact')}
                    value={provider?.representative || '-'}
                  />
                </>
              )}

              {/* Insurance (type 38) specific fields - conditional based on rent/own */}
              {propertyType === '38' && (
                <>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    marginTop: '24px',
                  }}>
                    <CustomText style={{
                      fontSize: Typography.FONT_SIZE_16,
                      fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                      color: Colors.BLACK,
                    }}>
                      {i18n.t('AccountInformation')}
                    </CustomText>
                  </div>
                  <PropertyItem
                    heading={i18n.t('InsuranceProvider')}
                    value={provider?.name || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('PolicyNumber')}
                    value={provider?.accountNumber || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('Website')}
                    value={provider?.website || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('PhoneNumber')}
                    value={provider?.phoneNumber || '-'}
                  />

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    marginTop: '24px',
                  }}>
                    <CustomText style={{
                      fontSize: Typography.FONT_SIZE_16,
                      fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                      color: Colors.BLACK,
                    }}>
                      {i18n.t('InsuranceDetails')}
                    </CustomText>
                  </div>
                  <PropertyItem
                    heading={i18n.t('PolicyStartDate')}
                    value={provider?.billingDueDate ? new Date(provider.billingDueDate).toLocaleDateString() : '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('PolicyEndDate')}
                    value={provider?.renewalDate ? new Date(provider.renewalDate).toLocaleDateString() : '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('CoverageType')}
                    value={provider?.type || '-'}
                  />
                  <PropertyItem
                    heading={propertySituation === 'Rent' ? i18n.t('EmergencyContact') : i18n.t('EmergencyInsuranceContact')}
                    value={provider?.representative || '-'}
                  />
                </>
              )}

              {/* Rent (type 123) specific fields */}
              {propertyType === '123' && (
                <>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    marginTop: '24px',
                  }}>
                    <CustomText style={{
                      fontSize: Typography.FONT_SIZE_16,
                      fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                      color: Colors.BLACK,
                    }}>
                      {i18n.t('AccountInformation')}
                    </CustomText>
                  </div>
                  <PropertyItem
                    heading={i18n.t('PropertyManager')}
                    value={provider?.name || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('AccountNumber')}
                    value={provider?.accountNumber || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('Website')}
                    value={provider?.website || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('PhoneNumber')}
                    value={provider?.phoneNumber || '-'}
                  />

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    marginTop: '24px',
                  }}>
                    <CustomText style={{
                      fontSize: Typography.FONT_SIZE_16,
                      fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                      color: Colors.BLACK,
                    }}>
                      {i18n.t('LeaseAgreement')}
                    </CustomText>
                  </div>
                  <PropertyItem
                    heading={i18n.t('LeaseStart')}
                    value={provider?.billingDueDate ? new Date(provider.billingDueDate).toLocaleDateString() : '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('LeaseEnd')}
                    value={provider?.renewalDate ? new Date(provider.renewalDate).toLocaleDateString() : '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('RenewalDate')}
                    value={provider?.renewalDate ? new Date(provider.renewalDate).toLocaleDateString() : '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('RentAmount')}
                    value={provider?.type || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('EmergencyContact')}
                    value={provider?.representative || '-'}
                  />
                </>
              )}

              {/* Lease (type 124) specific fields */}
              {propertyType === '124' && (
                <>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    marginTop: '24px',
                  }}>
                    <CustomText style={{
                      fontSize: Typography.FONT_SIZE_16,
                      fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                      color: Colors.BLACK,
                    }}>
                      {i18n.t('AccountInformation')}
                    </CustomText>
                  </div>
                  <PropertyItem
                    heading={i18n.t('PropertyManager')}
                    value={provider?.name || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('AccountNumber')}
                    value={provider?.accountNumber || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('Website')}
                    value={provider?.website || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('PhoneNumber')}
                    value={provider?.phoneNumber || '-'}
                  />

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    marginTop: '24px',
                  }}>
                    <CustomText style={{
                      fontSize: Typography.FONT_SIZE_16,
                      fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                      color: Colors.BLACK,
                    }}>
                      {i18n.t('LeaseAgreement')}
                    </CustomText>
                  </div>
                  <PropertyItem
                    heading={i18n.t('LeaseStart')}
                    value={provider?.billingDueDate ? new Date(provider.billingDueDate).toLocaleDateString() : '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('LeaseEnd')}
                    value={provider?.renewalDate ? new Date(provider.renewalDate).toLocaleDateString() : '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('RenewalDate')}
                    value={provider?.renewalDate ? new Date(provider.renewalDate).toLocaleDateString() : '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('RentAmount')}
                    value={provider?.type || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('EmergencyContact')}
                    value={provider?.representative || '-'}
                  />
                </>
              )}

              {/* Default fields for other property types */}
              {propertyType !== '33' && propertyType !== '35' && propertyType !== '36' && propertyType !== '38' && propertyType !== '123' && propertyType !== '124' && (
                <>
                  <PropertyItem
                    heading={i18n.t('CompanyName')}
                    value={provider?.name || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('AccountNumber')}
                    value={provider?.accountNumber || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('DueDate')}
                    value={provider?.billingDueDate ? new Date(provider.billingDueDate).toLocaleDateString() : '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('PhoneNumber')}
                    value={provider?.phoneNumber || '-'}
                  />
                  <PropertyItem
                    heading={i18n.t('Website')}
                    value={provider?.website || '-'}
                  />
                </>
              )}
            </div>
          </div>

          {/* Horizontal Line */}
          <div className="property-divider" />

          {/* Pills Detail Section (Tasks, Notes, Documents, Events) */}
          <div className="property-detail-files-section">
            <PillDetail homeMemberId={tileIdFromUrl || resolvedParams?.tileId || ''} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
