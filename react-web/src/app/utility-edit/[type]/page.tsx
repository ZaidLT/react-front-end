'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Icon from '../../../components/Icon';
import HiveHexTile from '../../../components/HiveHexTile';
import CustomText from '../../../components/CustomText';
import Button from '../../../components/Button';
import { useAuth } from '../../../context/AuthContext';
import { useLanguageContext } from '../../../context/LanguageContext';
import { translateTileLabel } from '../../../util/translationUtils';
import { getUtilityIcon } from '../../../util/utilityUtils';
import { Colors } from '../../../styles';
import { FONT_SIZE_12, FONT_SIZE_16, FONT_SIZE_20, FONT_FAMILY_POPPINS_MEDIUM, FONT_FAMILY_POPPINS_REGULAR, FONT_FAMILY_POPPINS_SEMIBOLD } from '../../../styles/typography';
import './utility-edit.css';
import { trackEvent, AmplitudeEvents } from '../../../services/analytics';


interface UtilityData {
  UniqueId?: string;
  Name: string;
  Account_Number: string;

  Phone_Number: string;
  Website: string;
  BillingDueDate: string;
  RenewalDate: string;
  MethodOfPayment: string;
  CardLastFour: string;
  PayementFreq: number;
  UtilityTypes: string;
  User_uniqueId: string;
  Account_uniqueId: string;
  Active: boolean;
  Deleted: boolean;
}

const paymentMethods = [
  { label: 'Visa', value: 'Visa' },
  { label: 'MasterCard', value: 'MasterCard' },
  { label: 'American Express', value: 'American Express' },
  { label: 'Discover', value: 'Discover' },
];

const UtilityEditPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { i18n } = useLanguageContext();

  const paymentFrequencies = [
    { label: i18n.t('Monthly'), value: 0 },
    { label: i18n.t('Quarterly'), value: 1 },
    { label: i18n.t('SemiAnnual'), value: 2 },
    { label: i18n.t('Annual'), value: 3 },
  ];

  const utilityType = params.type as string;
  const utilityId = searchParams.get('utilityId');

  // Helper function to capitalize text properly
  const capitalizeText = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  // Get type from query param for translation (new format)
  const utilityTypeParam = searchParams.get('type');
  const utilityTypeEnum = utilityTypeParam ? parseInt(utilityTypeParam, 10) : null;

  // Compute utility name with backward compatibility
  const utilityName = React.useMemo(() => {
    // Prefer type-based translation (new format)
    if (utilityTypeEnum !== null) {
      return translateTileLabel({ type: utilityTypeEnum }, i18n) || capitalizeText(utilityType);
    }
    // Fallback to name param (old bookmarks)
    const nameParam = searchParams.get('name');
    if (nameParam) {
      return nameParam;
    }
    // Fallback to route param capitalized
    return capitalizeText(utilityType);
  }, [utilityTypeEnum, searchParams, utilityType, i18n]);

  // Display title should use tileName when available; fallback to query param name or type
  const [displayTileName, setDisplayTileName] = useState<string>(utilityName);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UtilityData>({
    Name: '',
    Account_Number: '',
    Phone_Number: '',
    Website: '',
    BillingDueDate: '',
    RenewalDate: '',
    MethodOfPayment: '',
    CardLastFour: '',
    PayementFreq: 0,
    UtilityTypes: utilityType,
    User_uniqueId: user?.id || '',
    Account_uniqueId: user?.accountId || '',
    Active: true,

    Deleted: false,
  });

  const [wasEmptyBefore, setWasEmptyBefore] = useState(false);

  const isMobileApp = searchParams.get('mobile') === 'true';

  // Load existing utility data if editing
  useEffect(() => {
    const loadUtility = async () => {
      if (!user?.id || !user?.accountId) return;

      try {
        setLoading(true);

        if (utilityId) {
          // Load existing utility using specific provider endpoint
          const token = localStorage.getItem('auth_token');
          const response = await fetch(`/api/providers/${utilityId}?accountId=${user.accountId}`, {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });

          if (response.ok) {
            const responseData = await response.json();

            // Extract provider data from the embedded structure
            const foundUtility = responseData.provider || responseData;

            // Determine if it was effectively empty before (no key props filled)
            try {
              const wasEmpty = !(
                foundUtility?.name ||
                foundUtility?.phoneNumber ||
                foundUtility?.accountNumber ||
                foundUtility?.website ||
                foundUtility?.methodOfPayment ||
                foundUtility?.cardLastFour ||
                foundUtility?.billingDueDate ||
                foundUtility?.renewalDate
              );
              setWasEmptyBefore(!!wasEmpty);
            } catch {}

            // Map backend field names to frontend field names
            setFormData({
              UniqueId: foundUtility.id || utilityId,
              Name: foundUtility.name || '',
              Account_Number: foundUtility.accountNumber || '',
              Phone_Number: foundUtility.phoneNumber || '',
              Website: foundUtility.website || '',
              BillingDueDate: foundUtility.billingDueDate ? new Date(foundUtility.billingDueDate).toISOString().split('T')[0] : '',
              RenewalDate: foundUtility.renewalDate ? new Date(foundUtility.renewalDate).toISOString().split('T')[0] : '',
              MethodOfPayment: foundUtility.methodOfPayment || '',
              CardLastFour: foundUtility.cardLastFour || '',
              PayementFreq: foundUtility.paymentFreq ? parseInt(foundUtility.paymentFreq) || 0 : 0,
              UtilityTypes: foundUtility.utilityTypes || utilityType,
              User_uniqueId: foundUtility.userId || user.id,
              Account_uniqueId: foundUtility.accountId || user.accountId,
              Active: foundUtility.active !== false,
              Deleted: foundUtility.deleted === true,
            });

              // Prefer tileName for header/title display
              setDisplayTileName(foundUtility.tileName || utilityName);

          } else {
            console.error('Failed to load utility:', response.statusText);
          }
        } else {
          // New utility - leave provider name empty; do not show tileId/UUID or utility type in provider field
          setFormData(prev => ({
            ...prev,
            Name: '',
            UtilityTypes: utilityType,
            User_uniqueId: user.id,
            Account_uniqueId: user.accountId,
          }));
        }

        // For new utilities, default header to the utility type
        setDisplayTileName(utilityType);

      } catch (error) {
        console.error('Error loading utility:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUtility();
  }, [user?.id, user?.accountId, utilityId, utilityType]);

  // Set page title and body class
  useEffect(() => {
    document.title = `Edit ${displayTileName} - Eeva`;
    document.body.classList.add('house-page-active');

    return () => {
      document.body.classList.remove('house-page-active');
    };
  }, [displayTileName]);

  const handleBack = () => {
    router.push(`/utility-detail/${utilityType}?name=${encodeURIComponent(displayTileName || utilityName)}`);
  };

  const handleFormChange = (key: keyof UtilityData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');

      // Map frontend field names to backend field names - root level payload
      const dataToSave = {
        // Include ID for updates only
        ...(utilityId ? { id: utilityId } : {}),
        accountId: formData.Account_uniqueId,
        userId: formData.User_uniqueId,
        name: formData.Name || '',
        phoneNumber: formData.Phone_Number || '',
        accountNumber: formData.Account_Number || '',
        avatarImagePath: formData.Website || '', // Use website as avatarImagePath if needed
        website: formData.Website || '',
        type: 'utility', // Set type as utility
        representative: '', // Not used for utilities
        // Remove homeMemberId if empty to avoid UUID validation error
        ...(formData.User_uniqueId ? {} : {}), // Don't include homeMemberId for utilities
        tileName: formData.Name || '', // Use name as tileName
        // Only include dates if they have values, and ensure proper ISO format
        ...(formData.BillingDueDate ? { billingDueDate: new Date(formData.BillingDueDate).toISOString() } : {}),
        ...(formData.RenewalDate ? { renewalDate: new Date(formData.RenewalDate).toISOString() } : {}),
        methodOfPayment: formData.MethodOfPayment || '',
        cardLastFour: formData.CardLastFour || '',
        // paymentFreq should be a number, not string according to backend validation
        paymentFreq: formData.PayementFreq || 0,
        utilityTypes: formData.UtilityTypes || utilityType,
        active: formData.Active !== false,
        deleted: formData.Deleted === true,
      };

      console.log('Saving utility data:', dataToSave);

      const response = await fetch('/api/providers', {
        method: utilityId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(dataToSave)
      });

      if (response.ok) {
        const responseData = await response.json();

        // Handle POST response (has embedded provider) vs PUT response (has providers array)
        let providerData;
        if (responseData.provider) {
          // POST response - extract the provider from the embedded structure
          providerData = responseData.provider;
        } else if (responseData.providers && responseData.providers.length > 0) {
          // PUT response - find the updated provider in the array
          providerData = responseData.providers.find((p: any) =>
            p.utilityTypes?.toLowerCase() === utilityType.toLowerCase()
          );
        }

        // Store the updated provider data for instant loading on detail page
        if (providerData) {
          sessionStorage.setItem('current_utility_provider', JSON.stringify(providerData));
        }

        // Navigate back to utility detail
        // Track added vs edited
        const nowHasDetails = !!(
          formData.Name || formData.Phone_Number || formData.Account_Number || formData.Website ||
          formData.MethodOfPayment || formData.CardLastFour || formData.BillingDueDate || formData.RenewalDate
        );
        try {
          if (!utilityId || (wasEmptyBefore && nowHasDetails)) {
            trackEvent(AmplitudeEvents.houseUtilityAdded, { utilityTypes: formData.UtilityTypes || utilityType });
          }
        } catch {}

        router.push(`/utility-detail/${utilityType}?name=${encodeURIComponent(formData.Name)}`);
      } else {
        const errorData = await response.text();
        console.error('Failed to save utility:', response.status, errorData);
        alert(`Failed to save utility: ${response.status} ${errorData}`);
      }
    } catch (error) {
      console.error('Error saving utility:', error);
      alert(`Error saving utility: ${error}`);
    } finally {
      setSaving(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f0f8ff',
      position: 'relative' as const,
      width: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      overflowX: 'hidden' as const,
    },
    backgroundImage: {
      position: 'absolute' as const,
      top: isMobileApp ? '330px' : '380px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      height: 'auto',
      zIndex: 0,
    },
    navHeaderContainer: {
      position: 'relative' as const,
      zIndex: 10,
      paddingTop: isMobileApp ? '20px' : '40px',
      width: '100%',
      maxWidth: '600px',
    },
    contentContainer: {
      position: 'relative' as const,
      zIndex: 5,
      padding: '20px',
      paddingTop: '40px',
      width: '100%',
      maxWidth: '600px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
    },
    headerHiveTileContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '30px',
    },
    formCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderRadius: '20px',
      padding: '32px 24px',
      marginBottom: '20px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      width: '100%',
      maxWidth: '500px',
      marginTop: '10px',
    },
    sectionTitle: {
      fontSize: FONT_SIZE_20,
      fontFamily: FONT_FAMILY_POPPINS_SEMIBOLD,
      color: Colors.BLUE,
      marginBottom: '20px',
    },
    fieldContainer: {
      marginBottom: '20px',
    },
    label: {
      fontSize: FONT_SIZE_12,
      fontFamily: FONT_FAMILY_POPPINS_REGULAR,
      color: '#4A5568',
      marginBottom: '8px',
      display: 'block',
    },
    inputContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      paddingVertical: '8px',
    },
    input: {
      flex: 1,
      padding: '12px',
      borderRadius: '8px',
      border: `1px solid ${Colors.LIGHT_GREY}`,
      fontSize: FONT_SIZE_16,
      fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
      backgroundColor: Colors.WHITE,
      boxSizing: 'border-box' as const,
    },
    select: {
      flex: 1,
      padding: '12px',
      borderRadius: '8px',
      border: `1px solid ${Colors.LIGHT_GREY}`,
      fontSize: FONT_SIZE_16,
      fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
      backgroundColor: Colors.WHITE,
      boxSizing: 'border-box' as const,
    },
    cardLastFourInput: {
      width: '80px', // Fixed width for 4 digits
      padding: '12px',
      borderRadius: '8px',
      border: `1px solid ${Colors.LIGHT_GREY}`,
      fontSize: FONT_SIZE_16,
      fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
      backgroundColor: Colors.WHITE,
      boxSizing: 'border-box' as const,
      textAlign: 'center' as const,
    },
    rowContainer: {
      display: 'flex',
      gap: '16px',
      width: '100%',
      boxSizing: 'border-box' as const,
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    cardTypeColumn: {
      flex: 1,
      minWidth: 0,
      boxSizing: 'border-box' as const,
    },
    lastFourColumn: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-end', // Right-align all content in this column
      boxSizing: 'border-box' as const,
    },
    lastFourLabel: {
      fontSize: FONT_SIZE_12,
      fontFamily: FONT_FAMILY_POPPINS_REGULAR,
      color: '#4A5568',
      marginBottom: '8px',
      display: 'block',
      textAlign: 'right' as const, // Right-align the label
    },

  };

  if (loading) {
    return (
      <div className="utility-edit-content">
        <div className="utility-edit-header" style={{ position: 'relative' }}>
          <button onClick={handleBack} className="utility-edit-back-button">
            <img src="/icons/icon-menu-back.svg" width={24} height={24} alt="Back" style={{ cursor: 'pointer' }} />
          </button>
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CustomText style={{ color: '#000E50', fontFamily: 'Poppins', fontSize: '20px', fontStyle: 'normal', fontWeight: 600, lineHeight: 'normal', letterSpacing: '-0.408px', textAlign: 'center' }}>
              {i18n.t('Loading')}...
            </CustomText>
          </div>
          <div style={{ width: 24 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Background Image */}
      <img
        src="/pointed-gradient-background.svg"
        alt="Background"
        style={styles.backgroundImage}
      />

      {/* Header */}
      <div className="utility-edit-header" style={{ position: 'relative' }}>
        <button onClick={handleBack} className="utility-edit-back-button">
          <img src="/icons/icon-menu-back.svg" width={24} height={24} alt="Back" style={{ cursor: 'pointer' }} />
        </button>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CustomText style={{ color: '#000E50', fontFamily: 'Poppins', fontSize: '20px', fontStyle: 'normal', fontWeight: 600, lineHeight: 'normal', letterSpacing: '-0.408px', textAlign: 'center' }}>
            {utilityName}
          </CustomText>
        </div>
        <div style={{ width: 24 }} />
      </div>

      {/* Content */}
      <div className="utility-edit-content">
        {/* Header Hex Tile */}
        <div style={styles.headerHiveTileContainer}>
          <HiveHexTile
            coloredTile
            content={{ icon: getUtilityIcon(utilityType) }}
            width={120}
            height={120}
            centerIcon={true}
            iconSize={36}
          />
        </div>

        {/* Form Card */}
        <div style={styles.formCard}>
          <CustomText style={styles.sectionTitle}>{i18n.t('AccountInformation')}</CustomText>

          <div style={styles.fieldContainer}>
            <label style={styles.label}>{i18n.t('AccountNumber')}</label>
            <div style={styles.inputContainer}>
              <img src="/hive-icons/hashtagIcon.svg" alt="Account" width={24} height={24} />
              <input
                style={styles.input}
                type="text"
                value={formData.Account_Number}
                onChange={(e) => handleFormChange('Account_Number', e.target.value)}
                placeholder={i18n.t("EnterYourAccountNumber")}
              />
            </div>
          </div>

          <div style={styles.fieldContainer}>
            <label style={styles.label}>{i18n.t('Provider')}</label>
            <div style={styles.inputContainer}>
              <img src={`/hive-icons/${getUtilityIcon(utilityType)}.svg`} alt="Provider" width={24} height={24} />
              <input
                style={styles.input}
                type="text"
                value={formData.Name}
                onChange={(e) => handleFormChange('Name', e.target.value)}
                placeholder={i18n.t("EnterYourAccountProvider")}
              />
            </div>
          </div>

          <div style={styles.fieldContainer}>
            <label style={styles.label}>{i18n.t('ProviderPhoneNumber')}</label>
            <div style={styles.inputContainer}>
              <img src="/hive-icons/mobile.svg" alt="Phone" width={24} height={24} />
              <input
                style={styles.input}
                type="tel"
                value={formData.Phone_Number}
                onChange={(e) => handleFormChange('Phone_Number', e.target.value)}
                placeholder={i18n.t("EnterYourPhoneNumber")}
              />
            </div>
          </div>

          <div style={styles.fieldContainer}>
            <label style={styles.label}>{i18n.t('Website')}</label>
            <div style={styles.inputContainer}>
              <img src="/hive-icons/browser.svg" alt="Website" width={24} height={24} />
              <input
                style={styles.input}
                type="url"
                value={formData.Website}
                onChange={(e) => handleFormChange('Website', e.target.value)}
                placeholder={i18n.t("EnterWebsiteURL")}
              />
            </div>
          </div>

          <div style={styles.fieldContainer}>
            <label style={styles.label}>{i18n.t('BillingDueDate')}</label>
            <div style={styles.inputContainer}>
              <img src="/hive-icons/calendar.svg" alt="Calendar" width={24} height={24} />
              <input
                style={styles.input}
                type="date"
                value={formData.BillingDueDate}
                onChange={(e) => handleFormChange('BillingDueDate', e.target.value)}
              />
            </div>
          </div>

          <div style={styles.fieldContainer}>
            <label style={styles.label}>{i18n.t('RenewalDate')}</label>
            <div style={styles.inputContainer}>
              <img src="/hive-icons/calendar.svg" alt="Calendar" width={24} height={24} />
              <input
                style={styles.input}
                type="date"
                value={formData.RenewalDate}
                onChange={(e) => handleFormChange('RenewalDate', e.target.value)}
              />
            </div>
          </div>

          <div style={styles.rowContainer}>
            <div style={styles.cardTypeColumn}>
              <div style={styles.fieldContainer}>
                <label style={styles.label}>{i18n.t('CardType')}</label>
                <div style={styles.inputContainer}>
                  <img src="/hive-icons/paymentCard.svg" alt="Card" width={24} height={24} />
                  <select
                    style={styles.select}
                    value={formData.MethodOfPayment}
                    onChange={(e) => handleFormChange('MethodOfPayment', e.target.value)}
                  >
                    <option value="">{i18n.t('CardType')}</option>
                    {paymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={styles.lastFourColumn}>
              <div style={styles.fieldContainer}>
                <label style={styles.lastFourLabel}>{i18n.t('LastFourDigits')}</label>
                <input
                  style={styles.cardLastFourInput}
                  type="text"
                  maxLength={4}
                  value={formData.CardLastFour}
                  onChange={(e) => handleFormChange('CardLastFour', e.target.value.replace(/\D/g, ''))}
                  placeholder={i18n.t("FourDigitsPlaceholder")}
                />
              </div>
            </div>
          </div>

          <div style={styles.fieldContainer}>
            <label style={styles.label}>{i18n.t('PaymentFrequency')}</label>
            <div style={styles.inputContainer}>
              <img src="/hive-icons/newClock.svg" alt="Frequency" width={24} height={24} />
              <select
                style={styles.select}
                value={formData.PayementFreq}
                onChange={(e) => handleFormChange('PayementFreq', parseInt(e.target.value))}
              >
                {paymentFrequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>
          </div>


        </div>
        {/* Save Button (16px below the white form card) */}
        <div className="utility-edit-save-section" style={{ marginTop: 16 }}>
          <Button
            width="100%"
            textProps={{
              text: saving ? i18n.t('Saving') : i18n.t('SaveChanges'),
              fontSize: FONT_SIZE_16,
              fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
              color: Colors.WHITE,
            }}
            onButtonClick={handleSave}
            backgroundColor={Colors.BLUE}
            borderProps={{ radius: 12 }}
            disabled={saving}
            loading={saving}
          />
        </div>
      </div>


      </div>
  );
};

export default UtilityEditPage;
