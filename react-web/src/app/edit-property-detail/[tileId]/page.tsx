'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '../../../hooks/useRouterWithPersistentParams';
import { useSearchParams, useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguageContext } from '../../../context/LanguageContext';
import { translateTileLabel } from '../../../util/translationUtils';

import CustomText from '../../../components/CustomText';
import Button from '../../../components/Button';
import Icon from '../../../components/Icon';
import { Colors, Typography } from '../../../styles';
import { ETileType } from '../../../util/types';
import providerService from '../../../services/providerService';
import './edit-property-detail.css';
import { TILE_DATA_MAP } from '../../../util/constants';

import { trackEvent, AmplitudeEvents } from '../../../services/analytics';

interface EditPropertyDetailPageProps {
  params: Promise<{
    tileId: string;
  }>;
}

const EditPropertyDetailPage: React.FC<EditPropertyDetailPageProps> = ({ params }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { i18n } = useLanguageContext();

  // Get parameters from URL
  const propertyTypeParam = searchParams.get('type');
  const propertyType = propertyTypeParam;

  // Compute property name with backward compatibility
  const propertyName = React.useMemo(() => {
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

  // State
  const [resolvedParams, setResolvedParams] = useState<{
    tileId: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    accountNumber: '',
    dueDate: '',
    phoneNumber: '',
    website: '',
    // Property Deeds (type 33) fields
    ownerName: '',
    address: '',
    // Mortgage (type 35) fields
    lenderName: '',
    loanType: '',
    startDate: '',
    endDate: '',
    paymentFrequency: '',
    emergencyMaintenanceContact: '',
    // Taxes (type 36) fields
    taxAuthority: '',
    taxYear: '',
    taxDueDate: '',
    emergencyTaxContact: '',
    // Insurance (type 38) fields
    insuranceProvider: '',
    policyNumber: '',
    policyStartDate: '',
    policyEndDate: '',
    coverageType: '',
    emergencyInsuranceContact: '',
    // Rent/Lease (type 123/124) fields
    propertyManager: '',
    leaseStart: '',
    leaseEnd: '',
    renewalDate: '',
    rentAmount: '',
    emergencyContact: '',
  });

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParamsValue = await params;
      setResolvedParams(resolvedParamsValue);
    };
    resolveParams();
  }, [params]);

  // Load existing provider data
  useEffect(() => {
    const loadProviderData = async () => {
      if (!user?.id || !user?.accountId || !resolvedParams?.tileId) return;

      try {
        // Load providers
        const providersData = await providerService.getProvidersByUser(user.id, user.accountId);

        // Find matching provider by utilityTypes field
        const matchingProvider = providersData.find(p =>
          p.utilityTypes?.toLowerCase() === propertyType?.toLowerCase() ||
          p.utilityTypes?.toLowerCase() === propertyName.toLowerCase()
        );

        if (matchingProvider) {
          // Map provider data to form fields based on property type
          if (propertyType === '33') {
            // Property Deeds
            setFormData({
              name: matchingProvider.name || '',
              accountNumber: matchingProvider.accountNumber || '',
              dueDate: matchingProvider.billingDueDate ? new Date(matchingProvider.billingDueDate).toISOString().split('T')[0] : '',
              phoneNumber: matchingProvider.phoneNumber || '',
              website: matchingProvider.website || '',
              ownerName: matchingProvider.name || '',
              address: matchingProvider.representative || '',
              lenderName: '',
              loanType: '',
              startDate: '',
              endDate: '',
              paymentFrequency: '',
              emergencyMaintenanceContact: '',
              taxAuthority: '',
              taxYear: '',
              taxDueDate: '',
              emergencyTaxContact: '',
              insuranceProvider: '',
              policyNumber: '',
              policyStartDate: '',
              policyEndDate: '',
              coverageType: '',
              emergencyInsuranceContact: '',
            });
          } else if (propertyType === '35') {
            // Mortgage
            setFormData({
              name: matchingProvider.name || '',
              accountNumber: matchingProvider.accountNumber || '',
              dueDate: matchingProvider.billingDueDate ? new Date(matchingProvider.billingDueDate).toISOString().split('T')[0] : '',
              phoneNumber: matchingProvider.phoneNumber || '',
              website: matchingProvider.website || '',
              ownerName: '',
              address: '',
              lenderName: matchingProvider.name || '',
              loanType: matchingProvider.type || '',
              startDate: matchingProvider.billingDueDate ? new Date(matchingProvider.billingDueDate).toISOString().split('T')[0] : '',
              endDate: matchingProvider.renewalDate ? new Date(matchingProvider.renewalDate).toISOString().split('T')[0] : '',
              paymentFrequency: matchingProvider.methodOfPayment || '',
              emergencyMaintenanceContact: matchingProvider.representative || '',
              taxAuthority: '',
              taxYear: '',
              taxDueDate: '',
              emergencyTaxContact: '',
              insuranceProvider: '',
              policyNumber: '',
              policyStartDate: '',
              policyEndDate: '',
              coverageType: '',
              emergencyInsuranceContact: '',
            });
          } else if (propertyType === '36') {
            // Taxes
            setFormData({
              name: matchingProvider.name || '',
              accountNumber: matchingProvider.accountNumber || '',
              dueDate: matchingProvider.billingDueDate ? new Date(matchingProvider.billingDueDate).toISOString().split('T')[0] : '',
              phoneNumber: matchingProvider.phoneNumber || '',
              website: matchingProvider.website || '',
              ownerName: '',
              address: '',
              lenderName: '',
              loanType: '',
              startDate: '',
              endDate: '',
              paymentFrequency: '',
              emergencyMaintenanceContact: '',
              taxAuthority: matchingProvider.name || '',
              taxYear: matchingProvider.type || '',
              taxDueDate: matchingProvider.billingDueDate ? new Date(matchingProvider.billingDueDate).toISOString().split('T')[0] : '',
              emergencyTaxContact: matchingProvider.representative || '',
              insuranceProvider: '',
              policyNumber: '',
              policyStartDate: '',
              policyEndDate: '',
              coverageType: '',
              emergencyInsuranceContact: '',
            });
          } else if (propertyType === '38') {
            // Insurance
            setFormData({
              name: matchingProvider.name || '',
              accountNumber: matchingProvider.accountNumber || '',
              dueDate: matchingProvider.billingDueDate ? new Date(matchingProvider.billingDueDate).toISOString().split('T')[0] : '',
              phoneNumber: matchingProvider.phoneNumber || '',
              website: matchingProvider.website || '',
              ownerName: '',
              address: '',
              lenderName: '',
              loanType: '',
              startDate: '',
              endDate: '',
              paymentFrequency: '',
              emergencyMaintenanceContact: '',
              taxAuthority: '',
              taxYear: '',
              taxDueDate: '',
              emergencyTaxContact: '',
              insuranceProvider: matchingProvider.name || '',
              policyNumber: matchingProvider.accountNumber || '',
              policyStartDate: matchingProvider.billingDueDate ? new Date(matchingProvider.billingDueDate).toISOString().split('T')[0] : '',
              policyEndDate: matchingProvider.renewalDate ? new Date(matchingProvider.renewalDate).toISOString().split('T')[0] : '',
              coverageType: matchingProvider.type || '',
              emergencyInsuranceContact: matchingProvider.representative || '',
              propertyManager: '',
              leaseStart: '',
              leaseEnd: '',
              renewalDate: '',
              rentAmount: '',
              emergencyContact: '',
            });
          } else if (propertyType === '123' || propertyType === '124') {
            // Rent or Lease
            setFormData({
              name: matchingProvider.name || '',
              accountNumber: matchingProvider.accountNumber || '',
              dueDate: matchingProvider.billingDueDate ? new Date(matchingProvider.billingDueDate).toISOString().split('T')[0] : '',
              phoneNumber: matchingProvider.phoneNumber || '',
              website: matchingProvider.website || '',
              ownerName: '',
              address: '',
              lenderName: '',
              loanType: '',
              startDate: '',
              endDate: '',
              paymentFrequency: '',
              emergencyMaintenanceContact: '',
              taxAuthority: '',
              taxYear: '',
              taxDueDate: '',
              emergencyTaxContact: '',
              insuranceProvider: '',
              policyNumber: '',
              policyStartDate: '',
              policyEndDate: '',
              coverageType: '',
              emergencyInsuranceContact: '',
              propertyManager: matchingProvider.name || '',
              leaseStart: matchingProvider.billingDueDate ? new Date(matchingProvider.billingDueDate).toISOString().split('T')[0] : '',
              leaseEnd: matchingProvider.renewalDate ? new Date(matchingProvider.renewalDate).toISOString().split('T')[0] : '',
              renewalDate: matchingProvider.renewalDate ? new Date(matchingProvider.renewalDate).toISOString().split('T')[0] : '',
              rentAmount: matchingProvider.type || '',
              emergencyContact: matchingProvider.representative || '',
            });
          } else {
            // Default fields
            setFormData({
              name: matchingProvider.name || '',
              accountNumber: matchingProvider.accountNumber || '',
              dueDate: matchingProvider.billingDueDate ? new Date(matchingProvider.billingDueDate).toISOString().split('T')[0] : '',
              phoneNumber: matchingProvider.phoneNumber || '',
              website: matchingProvider.website || '',
              ownerName: '',
              address: '',
              lenderName: '',
              loanType: '',
              startDate: '',
              endDate: '',
              paymentFrequency: '',
              emergencyMaintenanceContact: '',
              taxAuthority: '',
              taxYear: '',
              taxDueDate: '',
              emergencyTaxContact: '',
              insuranceProvider: '',
              policyNumber: '',
              policyStartDate: '',
              policyEndDate: '',
              coverageType: '',
              emergencyInsuranceContact: '',
              propertyManager: '',
              leaseStart: '',
              leaseEnd: '',
              renewalDate: '',
              rentAmount: '',
              emergencyContact: '',
            });
          }
        }
      } catch (error) {
        console.error('Error loading provider data:', error);
      }
    };

    loadProviderData();
  }, [user?.id, user?.accountId, resolvedParams?.tileId, propertyType, propertyName]);

  // Get tile data from TILE_DATA_MAP
  const tileData = React.useMemo(() => {
    if (!propertyType) return null;
    return TILE_DATA_MAP[propertyType as ETileType];
  }, [propertyType]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleBack = () => {
    if (resolvedParams?.tileId) {
      router.push(`/property-detail/${resolvedParams.tileId}?tileId=${resolvedParams.tileId}&name=${encodeURIComponent(propertyName)}&type=${propertyType}`);
    } else {
      router.push('/property-info');
    }
  };

  const handleSave = async () => {
    if (!user?.id || !user?.accountId || !resolvedParams?.tileId) return;

    setSaving(true);
    setSaveError(null);

    try {
      // Prepare provider data based on property type
      let providerData;

      if (propertyType === '33') {
        // Property Deeds
        providerData = {
          accountId: user.accountId,
          userId: user.id,
          name: formData.ownerName,
          representative: formData.address,
          utilityTypes: propertyType,
          tileName: propertyName,
          homeMemberId: resolvedParams.tileId,
        };
      } else if (propertyType === '35') {
        // Mortgage
        providerData = {
          accountId: user.accountId,
          userId: user.id,
          name: formData.lenderName,
          accountNumber: formData.accountNumber,
          website: formData.website,
          phoneNumber: formData.phoneNumber,
          type: formData.loanType,
          billingDueDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
          renewalDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
          methodOfPayment: formData.paymentFrequency,
          representative: formData.emergencyMaintenanceContact,
          utilityTypes: propertyType,
          tileName: propertyName,
          homeMemberId: resolvedParams.tileId,
        };
      } else if (propertyType === '36') {
        // Taxes
        providerData = {
          accountId: user.accountId,
          userId: user.id,
          name: formData.taxAuthority,
          accountNumber: formData.accountNumber,
          website: formData.website,
          phoneNumber: formData.phoneNumber,
          type: formData.taxYear,
          billingDueDate: formData.taxDueDate ? new Date(formData.taxDueDate).toISOString() : undefined,
          methodOfPayment: formData.paymentFrequency,
          representative: formData.emergencyTaxContact,
          utilityTypes: propertyType,
          tileName: propertyName,
          homeMemberId: resolvedParams.tileId,
        };
      } else if (propertyType === '38') {
        // Insurance
        providerData = {
          accountId: user.accountId,
          userId: user.id,
          name: formData.insuranceProvider,
          accountNumber: formData.policyNumber,
          website: formData.website,
          phoneNumber: formData.phoneNumber,
          type: formData.coverageType,
          billingDueDate: formData.policyStartDate ? new Date(formData.policyStartDate).toISOString() : undefined,
          renewalDate: formData.policyEndDate ? new Date(formData.policyEndDate).toISOString() : undefined,
          representative: formData.emergencyInsuranceContact,
          utilityTypes: propertyType,
          tileName: propertyName,
          homeMemberId: resolvedParams.tileId,
        };
      } else if (propertyType === '123' || propertyType === '124') {
        // Rent or Lease
        providerData = {
          accountId: user.accountId,
          userId: user.id,
          name: formData.propertyManager,
          accountNumber: formData.accountNumber,
          website: formData.website,
          phoneNumber: formData.phoneNumber,
          type: formData.rentAmount,
          billingDueDate: formData.leaseStart ? new Date(formData.leaseStart).toISOString() : undefined,
          renewalDate: formData.leaseEnd ? new Date(formData.leaseEnd).toISOString() : undefined,
          representative: formData.emergencyContact,
          utilityTypes: propertyType,
          tileName: propertyName,
          homeMemberId: resolvedParams.tileId,
        };
      } else {
        // Default fields
        providerData = {
          accountId: user.accountId,
          userId: user.id,
          name: formData.name,
          accountNumber: formData.accountNumber,
          phoneNumber: formData.phoneNumber,
          website: formData.website,
          billingDueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
          utilityTypes: propertyType,
          tileName: propertyName,
          homeMemberId: resolvedParams.tileId,
        };
      }

      // Check if provider already exists
      const existingProviders = await providerService.getProvidersByUser(user.id, user.accountId);
      const existingProvider = existingProviders.find(p =>
        p.utilityTypes?.toLowerCase() === propertyType?.toLowerCase() ||
        p.utilityTypes?.toLowerCase() === propertyName.toLowerCase()
      );

      if (existingProvider) {
        // Update existing provider
        await providerService.updateProvider({
          ...providerData,
          id: existingProvider.UniqueId,
        });
      } else {
        // Create new provider
        await providerService.createProvider(providerData);
        try { trackEvent(AmplitudeEvents.housePropertyInfoAdded, { type: propertyType, name: propertyName }); } catch {}
      }

      console.log('Property data saved successfully');

      // Navigate back to detail page
      handleBack();
    } catch (error) {
      console.error('Error saving property data:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save property data');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading || !resolvedParams) {
    return (
      <div className="edit-property-detail-container">
        <div className="edit-property-detail-content">
          <div className="edit-property-detail-loading">
            <CustomText style={{ color: Colors.BLUE }}>{i18n.t('Loading')}</CustomText>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-property-detail-container">
      <div className="edit-property-detail-content">
        {/* Header */}
        <div className="edit-property-detail-header">
          <button
            onClick={handleBack}
            className="edit-property-detail-back-button"
          >
            <img src="/icons/icon-menu-back.svg" width={24} height={24} alt={i18n.t('Back')} style={{ cursor: 'pointer' }} />
          </button>
          <CustomText style={{
            fontSize: Typography.FONT_SIZE_18,
            fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
            color: Colors.BLUE,
            textAlign: 'center',
            flex: 1,
          }}>
            {i18n.t('Edit')} {propertyName}
          </CustomText>
          <div style={{ width: 24 }} /> {/* Spacer for centering */}
        </div>

        {/* Form Fields */}
        <div className="edit-property-detail-form">
          {/* Property Deeds (type 33) specific fields */}
          {propertyType === '33' && (
            <>
              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('OwnerName')}</CustomText>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  placeholder={i18n.t('EnterOwnerName')}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('Address')}</CustomText>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={i18n.t('EnterAddress')}
                  className="edit-property-detail-input"
                />
              </div>
            </>
          )}

          {/* Mortgage (type 35) specific fields */}
          {propertyType === '35' && (
            <>
              <div style={{
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid #eeeeee',
              }}>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                  color: Colors.BLACK,
                  marginBottom: '16px',
                }}>
                  {i18n.t('AccountInformation')}
                </CustomText>
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('LenderName')}</CustomText>
                <input
                  type="text"
                  value={formData.lenderName}
                  onChange={(e) => handleInputChange('lenderName', e.target.value)}
                  placeholder={i18n.t('EnterLenderName')}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('AccountNumber')}</CustomText>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  placeholder={i18n.t('EnterAccountNumber')}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('Website')}</CustomText>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder={i18n.t('EnterWebsiteURL')}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('PhoneNumber')}</CustomText>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder={i18n.t('EnterPhoneNumber')}
                  className="edit-property-detail-input"
                />
              </div>

              <div style={{
                marginBottom: '24px',
                marginTop: '32px',
                paddingBottom: '16px',
                borderBottom: '1px solid #eeeeee',
              }}>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                  color: Colors.BLACK,
                  marginBottom: '16px',
                }}>
                  {i18n.t('MortgageDetails')}
                </CustomText>
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('LoanType')}</CustomText>
                <select
                  value={formData.loanType}
                  onChange={(e) => handleInputChange('loanType', e.target.value)}
                  className="edit-property-detail-input"
                >
                  <option value="">{i18n.t('SelectLoanType')}</option>
                  <option value="Fixed">{i18n.t('Fixed')}</option>
                  <option value="Variable">{i18n.t('Variable')}</option>
                </select>
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('StartDate')}</CustomText>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('EndDate')}</CustomText>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('PaymentFrequency')}</CustomText>
                <select
                  value={formData.paymentFrequency}
                  onChange={(e) => handleInputChange('paymentFrequency', e.target.value)}
                  className="edit-property-detail-input"
                >
                  <option value="">{i18n.t('SelectPaymentFrequency')}</option>
                  <option value="Monthly">{i18n.t('Monthly')}</option>
                  <option value="Bi-weekly">{i18n.t('Biweekly')}</option>
                  <option value="Weekly">{i18n.t('Weekly')}</option>
                  <option value="Quarterly">{i18n.t('Quarterly')}</option>
                  <option value="Semi-annually">{i18n.t('SemiAnnually')}</option>
                  <option value="Annually">{i18n.t('Annually')}</option>
                </select>
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('EmergencyMaintenanceContact')}</CustomText>
                <input
                  type="text"
                  value={formData.emergencyMaintenanceContact}
                  onChange={(e) => handleInputChange('emergencyMaintenanceContact', e.target.value)}
                  placeholder={i18n.t('EnterContactName')}
                  className="edit-property-detail-input"
                />
              </div>
            </>
          )}

          {/* Taxes (type 36) specific fields */}
          {propertyType === '36' && (
            <>
              <div style={{
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid #eeeeee',
              }}>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                  color: Colors.BLACK,
                  marginBottom: '16px',
                }}>
                  {i18n.t('AccountInformation')}
                </CustomText>
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('TaxAuthority')}</CustomText>
                <input
                  type="text"
                  value={formData.taxAuthority}
                  onChange={(e) => handleInputChange('taxAuthority', e.target.value)}
                  placeholder={i18n.t('EnterTaxAuthorityName')}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('AccountNumber')}</CustomText>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  placeholder={i18n.t('EnterAccountNumber')}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('Website')}</CustomText>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder={i18n.t('EnterWebsiteURL')}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('PhoneNumber')}</CustomText>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder={i18n.t('EnterPhoneNumber')}
                  className="edit-property-detail-input"
                />
              </div>

              <div style={{
                marginBottom: '24px',
                marginTop: '32px',
                paddingBottom: '16px',
                borderBottom: '1px solid #eeeeee',
              }}>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                  color: Colors.BLACK,
                  marginBottom: '16px',
                }}>
                  {i18n.t('TaxDetails')}
                </CustomText>
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('TaxYear')}</CustomText>
                <input
                  type="text"
                  value={formData.taxYear}
                  onChange={(e) => handleInputChange('taxYear', e.target.value)}
                  placeholder={i18n.t('EnterTaxYear')}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('PaymentFrequency')}</CustomText>
                <select
                  value={formData.paymentFrequency}
                  onChange={(e) => handleInputChange('paymentFrequency', e.target.value)}
                  className="edit-property-detail-input"
                >
                  <option value="">{i18n.t('SelectPaymentFrequency')}</option>
                  <option value="Monthly">{i18n.t('Monthly')}</option>
                  <option value="Quarterly">{i18n.t('Quarterly')}</option>
                  <option value="Semi-annually">{i18n.t('SemiAnnually')}</option>
                  <option value="Annually">{i18n.t('Annually')}</option>
                </select>
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('TaxDueDate')}</CustomText>
                <input
                  type="date"
                  value={formData.taxDueDate}
                  onChange={(e) => handleInputChange('taxDueDate', e.target.value)}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('EmergencyTaxContact')}</CustomText>
                <input
                  type="text"
                  value={formData.emergencyTaxContact}
                  onChange={(e) => handleInputChange('emergencyTaxContact', e.target.value)}
                  placeholder={i18n.t('EnterContactName')}
                  className="edit-property-detail-input"
                />
              </div>
            </>
          )}

          {/* Insurance (type 38) specific fields */}
          {propertyType === '38' && (
            <>
              <div style={{
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid #eeeeee',
              }}>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                  color: Colors.BLACK,
                  marginBottom: '16px',
                }}>
                  {i18n.t('AccountInformation')}
                </CustomText>
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('InsuranceProvider')}</CustomText>
                <input
                  type="text"
                  value={formData.insuranceProvider}
                  onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                  placeholder={i18n.t('EnterInsuranceProviderName')}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('PolicyNumber')}</CustomText>
                <input
                  type="text"
                  value={formData.policyNumber}
                  onChange={(e) => handleInputChange('policyNumber', e.target.value)}
                  placeholder={i18n.t('EnterPolicyNumber')}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('Website')}</CustomText>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder={i18n.t('EnterWebsiteURL')}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('PhoneNumber')}</CustomText>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder={i18n.t('EnterPhoneNumber')}
                  className="edit-property-detail-input"
                />
              </div>

              <div style={{
                marginBottom: '24px',
                marginTop: '32px',
                paddingBottom: '16px',
                borderBottom: '1px solid #eeeeee',
              }}>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                  color: Colors.BLACK,
                  marginBottom: '16px',
                }}>
                  {i18n.t('InsuranceDetails')}
                </CustomText>
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('PolicyStartDate')}</CustomText>
                <input
                  type="date"
                  value={formData.policyStartDate}
                  onChange={(e) => handleInputChange('policyStartDate', e.target.value)}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('PolicyEndDate')}</CustomText>
                <input
                  type="date"
                  value={formData.policyEndDate}
                  onChange={(e) => handleInputChange('policyEndDate', e.target.value)}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('CoverageType')}</CustomText>
                <select
                  value={formData.coverageType}
                  onChange={(e) => handleInputChange('coverageType', e.target.value)}
                  className="edit-property-detail-input"
                >
                  <option value="">{i18n.t('SelectCoverageType')}</option>
                  {propertySituation === 'Rent' ? (
                    // Rental insurance types
                    <>
                      <option value="Renters">{i18n.t('Renters')}</option>
                      <option value="Personal Property">{i18n.t('PersonalProperty')}</option>
                      <option value="Liability">{i18n.t('Liability')}</option>
                      <option value="Additional Living Expenses">{i18n.t('AdditionalLivingExpenses')}</option>
                      <option value="Umbrella">{i18n.t('Umbrella')}</option>
                    </>
                  ) : (
                    // Homeowner insurance types
                    <>
                      <option value="Home">{i18n.t('Home')}</option>
                      <option value="Condo">{i18n.t('Condo')}</option>
                      <option value="Landlord">{i18n.t('Landlord')}</option>
                      <option value="Umbrella">{i18n.t('Umbrella')}</option>
                      <option value="Flood">{i18n.t('Flood')}</option>
                      <option value="Earthquake">{i18n.t('Earthquake')}</option>
                    </>
                  )}
                </select>
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('EmergencyInsuranceContact')}</CustomText>
                <input
                  type="text"
                  value={formData.emergencyInsuranceContact}
                  onChange={(e) => handleInputChange('emergencyInsuranceContact', e.target.value)}
                  placeholder={i18n.t('EnterContactName')}
                  className="edit-property-detail-input"
                />
              </div>
            </>
          )}

          {/* Rent/Lease (type 123/124) specific fields */}
          {(propertyType === '123' || propertyType === '124') && (
            <>
              <div style={{
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid #eeeeee',
              }}>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                  color: Colors.BLACK,
                  marginBottom: '16px',
                }}>
                  {i18n.t('AccountInformation')}
                </CustomText>
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('PropertyManager')}</CustomText>
                <input
                  type="text"
                  value={formData.propertyManager}
                  onChange={(e) => handleInputChange('propertyManager', e.target.value)}
                  placeholder={i18n.t('EnterPropertyManagerName')}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('AccountNumber')}</CustomText>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  placeholder={i18n.t('EnterAccountNumber')}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('Website')}</CustomText>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder={i18n.t('EnterWebsiteURL')}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('PhoneNumber')}</CustomText>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder={i18n.t('EnterPhoneNumber')}
                  className="edit-property-detail-input"
                />
              </div>

              <div style={{
                marginBottom: '24px',
                marginTop: '32px',
                paddingBottom: '16px',
                borderBottom: '1px solid #eeeeee',
              }}>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                  color: Colors.BLACK,
                  marginBottom: '16px',
                }}>
                  {i18n.t('LeaseAgreement')}
                </CustomText>
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('LeaseStart')}</CustomText>
                <input
                  type="date"
                  value={formData.leaseStart}
                  onChange={(e) => handleInputChange('leaseStart', e.target.value)}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('LeaseEnd')}</CustomText>
                <input
                  type="date"
                  value={formData.leaseEnd}
                  onChange={(e) => handleInputChange('leaseEnd', e.target.value)}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('RenewalDate')}</CustomText>
                <input
                  type="date"
                  value={formData.renewalDate}
                  onChange={(e) => handleInputChange('renewalDate', e.target.value)}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('RentAmount')}</CustomText>
                <input
                  type="text"
                  value={formData.rentAmount}
                  onChange={(e) => handleInputChange('rentAmount', e.target.value)}
                  placeholder={i18n.t('EnterRentAmount')}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('EmergencyContact')}</CustomText>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder={i18n.t('EnterEmergencyContactName')}
                  className="edit-property-detail-input"
                />
              </div>
            </>
          )}

          {/* Default fields for other property types */}
          {propertyType !== '33' && propertyType !== '35' && propertyType !== '36' && propertyType !== '38' && propertyType !== '123' && propertyType !== '124' && (
            <>
              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('CompanyName')}</CustomText>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={i18n.t('EnterCompanyName')}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('AccountNumber')}</CustomText>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  placeholder={i18n.t('EnterAccountNumber')}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('DueDate')}</CustomText>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('PhoneNumber')}</CustomText>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder={i18n.t('EnterPhoneNumber')}
                  className="edit-property-detail-input"
                />
              </div>

              <div className="edit-property-detail-field">
                <CustomText className="edit-property-detail-label">{i18n.t('Website')}</CustomText>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder={i18n.t('EnterWebsiteURL')}
                  className="edit-property-detail-input"
                />
              </div>
            </>
          )}
        </div>

        {/* Error Message */}
        {saveError && (
          <div style={{
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
            borderRadius: '4px',
            padding: '12px',
            margin: '16px 0',
          }}>
            <CustomText style={{
              color: '#f44336',
              fontSize: Typography.FONT_SIZE_14,
            }}>
              {saveError}
            </CustomText>
          </div>
        )}

        {/* Save Button */}
        <div className="edit-property-detail-save-section">
          <Button
            textProps={{
              text: i18n.t('Save'),
              color: Colors.WHITE,
              fontSize: Typography.FONT_SIZE_16
            }}
            onButtonClick={handleSave}
            backgroundColor={Colors.BLUE}
            disabled={saving}
            loading={saving}
          />
        </div>
      </div>
    </div>
  );
};

export default EditPropertyDetailPage;
