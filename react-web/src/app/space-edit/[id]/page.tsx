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
import { getSpaceIcon } from '../../../util/spaceUtils';
import { Colors } from '../../../styles';
import { FONT_SIZE_16, FONT_SIZE_18, FONT_FAMILY_POPPINS_MEDIUM, FONT_FAMILY_POPPINS_SEMIBOLD } from '../../../styles/typography';
import './space-edit.css';

interface SpaceData {
  UniqueId: string;
  Name: string;
  Type: number;
  ElectronicDevice_BrandModel?: string;
  Active: boolean;
  Deleted: boolean;
}

interface FormData {
  measurements: string;
  paintColor: string;
  typesOfLightBulb: string;
}

const SpaceEditPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { i18n } = useLanguageContext();

  const spaceId = params.id as string;

  // Get type from query param for translation (new format)
  const spaceTypeParam = searchParams.get('type');
  const spaceType = spaceTypeParam ? parseInt(spaceTypeParam, 10) : null;

  // Declare state before using in memo/dependencies to avoid TDZ errors
  const [space, setSpace] = useState<SpaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    measurements: '',
    paintColor: '',
    typesOfLightBulb: ''
  });

  // Compute space name with backward compatibility
  const spaceName = React.useMemo(() => {
    // Prefer type-based translation (new format)
    if (spaceType !== null) {
      return translateTileLabel({ type: spaceType }, i18n) || 'Space';
    }
    // Fallback to name param (old bookmarks)
    const nameParam = searchParams.get('name');
    if (nameParam) {
      return nameParam;
    }
    // Fallback to loaded space data
    if (space) {
      return translateTileLabel(
        { type: parseInt(space.Type.toString(), 10), name: space.Name },
        i18n
      );
    }
    return 'Space';
  }, [spaceType, searchParams, space, i18n]);

  const isMobileApp = searchParams.get('mobile') === 'true';

  // Load space data
  useEffect(() => {
    const loadSpace = async () => {
      if (!user?.id || !user?.accountId || !spaceId) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/tiles/defaultSpaceTiles/${user.id}?accountId=${user.accountId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        if (response.ok) {
          const spaces = await response.json();
          const foundSpace = spaces.find((s: SpaceData) => s.UniqueId === spaceId);
          
          if (foundSpace) {
            setSpace(foundSpace);
            
            // Parse form data from ElectronicDevice_BrandModel
            if (foundSpace.ElectronicDevice_BrandModel) {
              try {
                const parsedData = JSON.parse(foundSpace.ElectronicDevice_BrandModel);
                setFormData({
                  measurements: parsedData.measurements || '',
                  paintColor: parsedData.paintColor || '',
                  typesOfLightBulb: parsedData.typesOfLightBulb || ''
                });
              } catch (e) {
                console.error('Error parsing space data:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading space:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSpace();
  }, [user?.id, user?.accountId, spaceId]);

  // Set page title and body class
  useEffect(() => {
    document.title = `${i18n.t('Edit')} ${spaceName || i18n.t('Space')} - Eeva`;
    document.body.classList.add('house-page-active');

    return () => {
      document.body.classList.remove('house-page-active');
    };
  }, [spaceName, i18n]);

  const handleBack = () => {
    router.push(`/space-detail/${spaceId}?name=${encodeURIComponent(space?.Name || '')}`);
  };

  const handleFormChange = (key: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    if (!space) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');
      
      const updatedSpace = {
        ...space,
        ElectronicDevice_BrandModel: JSON.stringify(formData)
      };

      const response = await fetch(`/api/tiles/${space.UniqueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updatedSpace)
      });

      if (response.ok) {
        // Navigate back to space detail
        router.push(`/space-detail/${spaceId}?name=${encodeURIComponent(space.Name)}`);
      } else {
        console.error('Failed to save space');
      }
    } catch (error) {
      console.error('Error saving space:', error);
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
    titleText: {
      fontSize: FONT_SIZE_18,
      fontFamily: FONT_FAMILY_POPPINS_SEMIBOLD,
      color: Colors.BLACK,
      marginBottom: '30px',
    },
    fieldContainer: {
      marginBottom: '20px',
    },
    label: {
      fontSize: FONT_SIZE_16,
      fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
      color: Colors.BLACK,
      marginBottom: '8px',
      display: 'block',
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: `1px solid ${Colors.LIGHT_GREY}`,
      fontSize: FONT_SIZE_16,
      fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
      backgroundColor: Colors.WHITE,
      boxSizing: 'border-box' as const,
    },
    textarea: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: `1px solid ${Colors.LIGHT_GREY}`,
      fontSize: FONT_SIZE_16,
      fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
      backgroundColor: Colors.WHITE,
      minHeight: '80px',
      resize: 'vertical' as const,
      boxSizing: 'border-box' as const,
    },

  };

  if (loading) {
    return (
      <div className="space-edit-container">
        <div className="space-edit-header" style={{ position: 'relative' }}>
          <button onClick={handleBack} className="space-edit-back-button">
            <img src="/icons/icon-menu-back.svg" width={24} height={24} alt="Back" style={{ cursor: 'pointer' }} />
          </button>
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CustomText style={{ color: '#000E50', fontFamily: 'Poppins', fontSize: '20px', fontStyle: 'normal', fontWeight: 600, lineHeight: 'normal', letterSpacing: '-0.408px', textAlign: 'center' }}>
              {i18n.t('Loading')}...
            </CustomText>
          </div>
          <div style={{ width: 24 }} />
        </div>
        <div className="space-edit-background" />
        <div className="space-edit-content">
          <div style={{ height: '200px' }} />
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="space-edit-container">
        <div className="space-edit-header" style={{ position: 'relative' }}>
          <button onClick={handleBack} className="space-edit-back-button">
            <img src="/icons/icon-menu-back.svg" width={24} height={24} alt="Back" style={{ cursor: 'pointer' }} />
          </button>
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CustomText style={{ color: '#000E50', fontFamily: 'Poppins', fontSize: '20px', fontStyle: 'normal', fontWeight: 600, lineHeight: 'normal', letterSpacing: '-0.408px', textAlign: 'center' }}>
              {i18n.t('SpaceNotFound')}
            </CustomText>
          </div>
          <div style={{ width: 24 }} />
        </div>
        <div className="space-edit-background" />
        <div className="space-edit-content">
          <div style={{ height: '200px' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-edit-container">
      {/* Header */}
      <div className="space-edit-header" style={{ position: 'relative' }}>
        <button onClick={handleBack} className="space-edit-back-button">
          <img src="/icons/icon-menu-back.svg" width={24} height={24} alt="Back" style={{ cursor: 'pointer' }} />
        </button>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CustomText style={{ color: '#000E50', fontFamily: 'Poppins', fontSize: '20px', fontStyle: 'normal', fontWeight: 600, lineHeight: 'normal', letterSpacing: '-0.408px', textAlign: 'center' }}>
            {spaceName}
          </CustomText>
        </div>
        <div style={{ width: 24 }} />
      </div>

      {/* Background positioned after header */}
      <div className="space-edit-background" />

      {/* Content wrapper after header */}
      <div className="space-edit-content">
        {/* Header Hex Tile */}
        <div style={styles.headerHiveTileContainer}>
          <HiveHexTile
            coloredTile
            content={{ icon: getSpaceIcon(space.Type) }}
            width={120}
            height={120}
            centerIcon={true}
            iconSize={36}
          />
        </div>

        {/* Form Card */}
        <div style={styles.formCard}>
          <CustomText style={styles.titleText}>{i18n.t('RoomInfo')}</CustomText>

          <div style={styles.fieldContainer}>
            <label style={styles.label}>{i18n.t('Measurements')}</label>
            <input
              style={styles.input}
              type="text"
              value={formData.measurements}
              onChange={(e) => handleFormChange('measurements', e.target.value)}
              placeholder={i18n.t("EnterRoomMeasurements")}
            />
          </div>

          <div style={styles.fieldContainer}>
            <label style={styles.label}>{i18n.t('PaintColor')}</label>
            <input
              style={styles.input}
              type="text"
              value={formData.paintColor}
              onChange={(e) => handleFormChange('paintColor', e.target.value)}
              placeholder={i18n.t("EnterPaintColor")}
            />
          </div>

          <div style={styles.fieldContainer}>
            <label style={styles.label}>{i18n.t('LightBulbs')}</label>
            <input
              style={styles.input}
              type="text"
              value={formData.typesOfLightBulb}
              onChange={(e) => handleFormChange('typesOfLightBulb', e.target.value)}
              placeholder={i18n.t("EnterLightBulbTypes")}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="space-edit-save-section">
          <Button
            width="100%"
            textProps={{
              text: saving ? `${i18n.t('Saving')}...` : i18n.t('SaveChanges'),
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

export default SpaceEditPage;
