'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import HiveHexTile from '../../../components/HiveHexTile';
import CustomText from '../../../components/CustomText';
import DeleteModal from '../../../components/DeleteModal';
import { TrashIcon } from '../../../components/SVGIcons';
import { useAuth } from '../../../context/AuthContext';
import { useLanguageContext } from '../../../context/LanguageContext';
import { translateTileLabel } from '../../../util/translationUtils';
import { getUtilityIcon } from '../../../util/utilityUtils';
import { Colors } from '../../../styles';
import {
  FONT_SIZE_16,
  FONT_SIZE_18,
  FONT_FAMILY_POPPINS_MEDIUM,
  FONT_FAMILY_POPPINS_SEMIBOLD,
} from '../../../styles/typography';
import PillDetail from '../../../components/PillDetail';
import tileService from '../../../services/tileService';
import './utility-detail.css';

interface UtilityData {
  UniqueId: string;
  Name: string;
  Account_Number?: string;
  Phone_Number?: string;
  Website?: string;
  BillingDueDate?: string;
  RenewalDate?: string;
  MethodOfPayment?: string;
  CardLastFour?: string;
  PayementFreq?: number;
  UtilityTypes?: string;
  Active: boolean;
  Deleted: boolean;
}

const UtilityDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { i18n } = useLanguageContext();

  const utilityType = params.type as string;
  const tileIdFromUrl = searchParams.get('tileId'); // Tile ID from URL

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

  const [utility, setUtility] = useState<UtilityData | null>(null);
  const [utilityTileId, setUtilityTileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isMobileApp = searchParams.get('mobile') === 'true';

  // Load utility data - use cached data for instant loading
  useEffect(() => {
    const loadUtility = async () => {
      if (!user?.id || !user?.accountId) return;

      try {
        setLoading(true);

        // First, try to get cached provider data for instant loading
        const cachedProvider = sessionStorage.getItem(
          'current_utility_provider'
        );
        if (cachedProvider) {
          try {
            const providerData = JSON.parse(cachedProvider);
            // Map backend field names to frontend field names
            const mappedUtility = {
              UniqueId: providerData.id,
              Name: providerData.name || utilityType,
              Account_Number: providerData.accountNumber || '',
              Phone_Number: providerData.phoneNumber || '',
              Website: providerData.website || '',
              BillingDueDate: providerData.billingDueDate || '',
              RenewalDate: providerData.renewalDate || '',
              MethodOfPayment: providerData.methodOfPayment || '',
              CardLastFour: providerData.cardLastFour || '',
              PayementFreq: providerData.paymentFreq || 0,
              UtilityTypes: providerData.utilityTypes || utilityType,
              Active: providerData.active !== false,
              Deleted: providerData.deleted === true,
            };

            setUtility(mappedUtility);
            setLoading(false);

            // Clear the cached data after use
            sessionStorage.removeItem('current_utility_provider');
            return;
          } catch (e) {
            console.error('Error parsing cached provider data:', e);
          }
        }

        // Fallback: Load from API if no cached data
        const token = localStorage.getItem('auth_token');
        const response = await fetch(
          `/api/providers?userId=${user.id}&accountId=${user.accountId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const providers = Array.isArray(data) ? data : data.providers || [];

          if (!Array.isArray(providers)) {
            console.error('Providers response is not an array:', providers);
            return;
          }

          // Find utility by type or name
          const foundUtility = providers.find(
            (p: any) =>
              p.utilityTypes?.toLowerCase() === utilityType.toLowerCase() ||
              p.name?.toLowerCase() === utilityName.toLowerCase()
          );

          if (foundUtility) {
            // Map backend field names to frontend field names
            const mappedUtility = {
              UniqueId: foundUtility.id,
              Name: foundUtility.name || utilityType,
              Account_Number: foundUtility.accountNumber || '',
              Phone_Number: foundUtility.phoneNumber || '',
              Website: foundUtility.website || '',
              BillingDueDate: foundUtility.billingDueDate || '',
              RenewalDate: foundUtility.renewalDate || '',
              MethodOfPayment: foundUtility.methodOfPayment || '',
              CardLastFour: foundUtility.cardLastFour || '',
              PayementFreq: foundUtility.paymentFreq || 0,
              UtilityTypes: foundUtility.utilityTypes || utilityType,
              Active: foundUtility.active !== false,
              Deleted: foundUtility.deleted === true,
            };

            setUtility(mappedUtility);
          }
        }
      } catch (error) {
        console.error('Error loading utility:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUtility();
  }, [user?.id, user?.accountId, utilityType, utilityName]);

  // Load utility tile ID for PillDetail
  useEffect(() => {
    const loadUtilityTileId = async () => {
      if (!user?.id || !user?.accountId) return;

      // If we have a tile ID from the URL, use it directly
      if (tileIdFromUrl) {
        setUtilityTileId(tileIdFromUrl);
        return;
      }

      try {
        // Otherwise, look up the tile ID using the same approach as hive selection
        const utilityTiles = await tileService.getTilesByParentType(
          user.id,
          user.accountId,
          37
        ); // Type 37 = Utilities

        console.log(
          '🔍 Found utility tiles:',
          utilityTiles.map((t) => ({ Name: t.Name, UniqueId: t.UniqueId }))
        );

        // Find the utility tile that matches this utility type/name
        const matchingTile = utilityTiles.find(
          (tile: any) =>
            tile.Name?.toLowerCase() === utilityType.toLowerCase() ||
            tile.Name?.toLowerCase() === utilityName.toLowerCase()
        );

        if (matchingTile) {
          console.log(
            '✅ Found matching utility tile:',
            matchingTile.Name,
            matchingTile.UniqueId
          );
          setUtilityTileId(matchingTile.UniqueId);
        } else {
          console.warn(
            '❌ No matching utility tile found for:',
            utilityType,
            utilityName
          );
          setUtilityTileId(null);
        }
      } catch (error) {
        console.error('Error loading utility tile ID:', error);
        setUtilityTileId(null);
      }
    };

    loadUtilityTileId();
  }, [user?.id, user?.accountId, utilityType, utilityName, tileIdFromUrl]);

  // Set page title and body class
  useEffect(() => {
    document.title = `${utilityName} - Eeva`;
    document.body.classList.add('house-page-active');

    return () => {
      document.body.classList.remove('house-page-active');
    };
  }, [utilityName]);

  const handleBack = () => {
    router.push('/utilities');
  };

  const handleEdit = () => {
    if (utility) {
      router.push(
        `/utility-edit/${utilityType}?utilityId=${utility.UniqueId}&name=${encodeURIComponent(utility.Name || utilityName)}`
      );
    } else {
      // Create new utility: pass the human-friendly name from the query param, not the type (which might be a UUID)
      router.push(
        `/utility-edit/${utilityType}?name=${encodeURIComponent(utilityName)}`
      );
    }
  };

  const handleDelete = async () => {
    if (!utility || !user?.id || !user?.accountId) return;

    try {
      const token = localStorage.getItem('auth_token');

      // DELETE endpoint expects a request body, not URL parameter
      const deletePayload = {
        id: utility.UniqueId,
        accountId: user.accountId,
        userId: user.id,
      };

      const response = await fetch('/api/providers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(deletePayload),
      });

      if (response.ok) {
        setShowDeleteModal(false);
        router.push('/utilities');
      } else {
        const errorData = await response.text();
        console.error('Failed to delete utility:', response.status, errorData);
        alert(`Failed to delete utility: ${response.status} ${errorData}`);
      }
    } catch (error) {
      console.error('Error deleting utility:', error);
      alert(`Error deleting utility: ${error}`);
    }
  };

  const handleWebsiteClick = () => {
    if (utility?.Website) {
      let url = utility.Website;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
      }
      window.open(url, '_blank');
    }
  };

  const formatPaymentFrequency = (freq?: number): string => {
    switch (freq) {
      case 0:
        return 'Monthly';
      case 1:
        return 'Quarterly';
      case 2:
        return 'Semi-Annual';
      case 3:
        return 'Annual';
      default:
        return '-';
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '-';
    }
  };

  const styles = {
    headerHiveTileContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '30px',
    },
    cardDetails: {
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderRadius: '20px',
      padding: '32px 24px',
      marginBottom: '20px',
      boxShadow:
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      width: '100%',
      maxWidth: '500px',
      marginTop: '10px',
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    titleText: {
      fontSize: FONT_SIZE_18,
      fontFamily: FONT_FAMILY_POPPINS_SEMIBOLD,
      color: Colors.BLACK,
      marginBottom: '4px',
      display: 'block',
    },
    subtitleText: {
      fontSize: FONT_SIZE_16,
      fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
      color: '#666',
      marginBottom: '10px',
      display: 'block',
    },
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: '12px',
      borderBottom: `1px solid ${Colors.LIGHT_GREY}`,
    },
    nameText: {
      fontSize: FONT_SIZE_16,
      fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
      color: Colors.BLACK,
    },
    valueText: {
      fontSize: FONT_SIZE_16,
      fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
      color: '#666',
    },
    linkText: {
      fontSize: FONT_SIZE_16,
      fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
      color: Colors.BLUE,
      cursor: 'pointer',
      textDecoration: 'underline',
    },
    editButton: {
      padding: '8px',
      borderRadius: '8px',
      backgroundColor: Colors.WHITE_LILAC,
    },
  } as const;

  if (loading) {
    return (
      <div className='utility-detail-container'>
        <div className='utility-detail-header' style={{ position: 'relative' }}>
          <button onClick={handleBack} className='utility-detail-back-button'>
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
              Loading...
            </CustomText>
          </div>
          <div style={{ width: 24 }} />
        </div>
        <div className='utility-detail-background' />
        <div className='utility-detail-content'>
          <div style={{ height: '200px' }} />
        </div>
      </div>
    );
  }

  return (
    <div className='utility-detail-container'>
      {/* Header */}
      <div className='utility-detail-header' style={{ position: 'relative' }}>
        <button onClick={handleBack} className='utility-detail-back-button'>
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
            {utility?.Name || capitalizeText(utilityName)}
          </CustomText>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className='utility-detail-back-button'
          aria-label='Delete'
        >
          <TrashIcon width={24} height={24} color={Colors.BLUE} />
        </button>
      </div>

      {/* Background positioned after header */}
      <div className='utility-detail-background' />

      {/* Content wrapper after header */}
      <div className='utility-detail-content'>
        {/* Header Hex Tile */}
        <div className='utility-detail-header-hex'>
          <HiveHexTile
            coloredTile
            content={{ icon: getUtilityIcon(utilityType) }}
            width={120}
            height={120}
            centerIcon={true}
            iconSize={36}
          />
        </div>

        {/* Utility Account Card */}
        <div style={styles.cardDetails} className='utility-detail-card'>
          <div style={styles.sectionHeader}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <CustomText style={styles.titleText}>
                {capitalizeText(utilityName)}
              </CustomText>
            </div>
            <button style={styles.editButton} onClick={handleEdit}>
              <img
                src='/hive-icons/editPencil.svg'
                alt='Edit'
                width={24}
                height={24}
              />
            </button>
          </div>

          {utility ? (
            <>
              <div style={styles.row}>
                <CustomText style={styles.nameText}>{i18n.t('AccountNumber')}</CustomText>
                <CustomText style={styles.valueText}>
                  {utility.Account_Number || '-'}
                </CustomText>
              </div>

              <div style={styles.row}>
                <CustomText style={styles.nameText}>{i18n.t('Provider')}</CustomText>
                <CustomText style={styles.valueText}>
                  {utility.Name || '-'}
                </CustomText>
              </div>

              <div style={styles.row}>
                <CustomText style={styles.nameText}>{i18n.t('PhoneNumber')}</CustomText>
                <CustomText style={styles.valueText}>
                  {utility.Phone_Number || '-'}
                </CustomText>
              </div>

              <div style={styles.row}>
                <CustomText style={styles.nameText}>{i18n.t('Website')}</CustomText>
                {utility.Website ? (
                  <CustomText
                    style={styles.linkText}
                    onClick={handleWebsiteClick}
                  >
                    {utility.Website}
                  </CustomText>
                ) : (
                  <CustomText style={styles.valueText}>-</CustomText>
                )}
              </div>

              <div style={styles.row}>
                <CustomText style={styles.nameText}>
                  {i18n.t('BillingDueDate')}
                </CustomText>
                <CustomText style={styles.valueText}>
                  {formatDate(utility.BillingDueDate)}
                </CustomText>
              </div>

              <div style={styles.row}>
                <CustomText style={styles.nameText}>{i18n.t('RenewalDate')}</CustomText>
                <CustomText style={styles.valueText}>
                  {formatDate(utility.RenewalDate)}
                </CustomText>
              </div>

              <div style={styles.row}>
                <CustomText style={styles.nameText}>{i18n.t('PaymentMethod')}</CustomText>
                <CustomText style={styles.valueText}>
                  {utility.MethodOfPayment
                    ? `${utility.MethodOfPayment} ****${
                        utility.CardLastFour || ''
                      }`
                    : '-'}
                </CustomText>
              </div>

              <div style={{ ...styles.row, borderBottom: 'none' }}>
                <CustomText style={styles.nameText}>
                  {i18n.t('PaymentFrequency')}
                </CustomText>
                <CustomText style={styles.valueText}>
                  {formatPaymentFrequency(utility.PayementFreq)}
                </CustomText>
              </div>
            </>
          ) : (
            <>
              {/* Zero state - show empty fields */}
              <div style={styles.row}>
                <CustomText style={styles.nameText}>{i18n.t('AccountNumber')}</CustomText>
                <CustomText style={styles.valueText}>-</CustomText>
              </div>

              <div style={styles.row}>
                <CustomText style={styles.nameText}>{i18n.t('Provider')}</CustomText>
                <CustomText style={styles.valueText}>-</CustomText>
              </div>

              <div style={styles.row}>
                <CustomText style={styles.nameText}>{i18n.t('PhoneNumber')}</CustomText>
                <CustomText style={styles.valueText}>-</CustomText>
              </div>

              <div style={styles.row}>
                <CustomText style={styles.nameText}>{i18n.t('Website')}</CustomText>
                <CustomText style={styles.valueText}>-</CustomText>
              </div>

              <div style={styles.row}>
                <CustomText style={styles.nameText}>
                  {i18n.t('BillingDueDate')}
                </CustomText>
                <CustomText style={styles.valueText}>-</CustomText>
              </div>

              <div style={styles.row}>
                <CustomText style={styles.nameText}>
                  {i18n.t('PaymentFrequency')}
                </CustomText>
                <CustomText style={styles.valueText}>-</CustomText>
              </div>

              {/* Helpful message */}
              <div
                style={{
                  marginTop: '15px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                }}
              >
                <CustomText
                  style={{
                    ...styles.subtitleText,
                    fontSize: '14px',
                    textAlign: 'center',
                  }}
                >
                  {i18n.t('ClickEditToAddAccountInformation')}
                </CustomText>
              </div>
            </>
          )}
        </div>

        {/* Pills Detail Section (Tasks, Notes, Documents, Events) */}
        {(utility?.UniqueId || utilityTileId) && (
          <div style={{ marginTop: '20px', maxWidth: '800px', width: '100%' }}>
            <PillDetail
              homeMemberId={utilityTileId || (utility?.UniqueId as string)}
              entityType='tile'
            />
          </div>
        )}

        {/* Info when no tile ID found */}
        {!utility?.UniqueId && !utilityTileId && (
          <div
            style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
            }}
          >
            <p
              style={{
                margin: '0 0 10px 0',
                color: '#495057',
                fontWeight: '600',
              }}
            >
              📋 Tasks, Notes, Documents & Events
            </p>
            <p
              style={{
                margin: 0,
                color: '#6c757d',
                fontSize: '14px',
                lineHeight: '1.4',
              }}
            >
              To create tasks, notes, documents, and events for this utility,
              utility tiles need to be set up in your account first. Contact
              your administrator or check the utilities management section.
            </p>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isVisible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        category='utility'
        customTitle={`Delete Utility`}
        customMessage={`Are you sure you want to delete "${
          utility?.Name || capitalizeText(utilityName)
        }"? This action cannot be undone.`}
      />
    </div>
  );
};

export default UtilityDetailPage;
