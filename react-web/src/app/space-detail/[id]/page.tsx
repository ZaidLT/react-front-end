'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Icon from '../../../components/Icon';
import HiveHexTile from '../../../components/HiveHexTile';
import CustomText from '../../../components/CustomText';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import DeleteModal from '../../../components/DeleteModal';
import OptionsListModal from '../../../components/OptionsListModal';
import { useAuth } from '../../../context/AuthContext';
import { useLanguageContext } from '../../../context/LanguageContext';
import { translateTileLabel } from '../../../util/translationUtils';
import { getSpaceIcon } from '../../../util/spaceUtils';
import { Colors } from '../../../styles';
import {
  FONT_SIZE_16,
  FONT_SIZE_18,
  FONT_SIZE_20,
  FONT_FAMILY_POPPINS_MEDIUM,
  FONT_FAMILY_POPPINS_SEMIBOLD,
} from '../../../styles/typography';
import PillDetail from '../../../components/PillDetail';
import './space-detail.css';

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

const SpaceDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { i18n } = useLanguageContext();

  const spaceId = params.id as string;

  // Get type from query param for translation (new format)
  const spaceTypeParam = searchParams.get('type');
  const spaceType = spaceTypeParam ? parseInt(spaceTypeParam, 10) : null;

  // Initial name: prefer type-based translation, fallback to name param (backward compatibility)
  const initialName = useMemo(() => {
    if (spaceType !== null) {
      return translateTileLabel({ type: spaceType }, i18n) || 'Space';
    }
    const nameParam = searchParams.get('name');
    if (nameParam) {
      return nameParam; // Old bookmarks support
    }
    return 'Space';
  }, [spaceType, searchParams, i18n]);

  const [space, setSpace] = useState<SpaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [formData, setFormData] = useState<FormData>({
    measurements: '-',
    paintColor: '-',
    typesOfLightBulb: '-',
  });

  const isMobileApp = searchParams.get('mobile') === 'true';

  // Computed space name: translate based on loaded data, fallback to initialName
  const spaceName = useMemo(() => {
    if (space) {
      return translateTileLabel(
        { type: parseInt(space.Type.toString(), 10), name: space.Name },
        i18n
      );
    }
    return initialName;
  }, [space, i18n, initialName]);

  // Load space data
  useEffect(() => {
    const loadSpace = async () => {
      if (!user?.id || !user?.accountId || !spaceId) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        const response = await fetch(
          `/api/tiles/defaultSpaceTiles/${user.id}?accountId=${user.accountId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (response.ok) {
          const spaces = await response.json();
          const foundSpace = spaces.find(
            (s: SpaceData) => s.UniqueId === spaceId
          );

          if (foundSpace) {
            setSpace(foundSpace);
            setNewName(foundSpace.Name);

            // Parse form data from ElectronicDevice_BrandModel
            if (foundSpace.ElectronicDevice_BrandModel) {
              try {
                const parsedData = JSON.parse(
                  foundSpace.ElectronicDevice_BrandModel
                );
                setFormData({
                  measurements: parsedData.measurements || '-',
                  paintColor: parsedData.paintColor || '-',
                  typesOfLightBulb: parsedData.typesOfLightBulb || '-',
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
    document.title = `${spaceName || 'Space'} - Eeva`;
    document.body.classList.add('house-page-active');

    return () => {
      document.body.classList.remove('house-page-active');
    };
  }, [spaceName]);

  const handleBack = () => {
    router.push('/spaces');
  };

  const handleEdit = () => {
    router.push(
      `/space-edit/${spaceId}?name=${encodeURIComponent(space?.Name || '')}`
    );
  };

  const handleRename = async () => {
    if (!space || !newName.trim()) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/tiles/${space.UniqueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...space,
          Name: newName.trim(),
        }),
      });

      if (response.ok) {
        setSpace({ ...space, Name: newName.trim() });
        setShowRenameModal(false);
        setShowOptionsModal(false);
      }
    } catch (error) {
      console.error('Error renaming space:', error);
    }
  };

  const handleDelete = async () => {
    if (!space) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `/api/tiles/${space.UniqueId}?accountId=${user?.accountId}&userId=${user?.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (response.ok) {
        router.push('/spaces');
      }
    } catch (error) {
      console.error('Error deleting space:', error);
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
    editButton: {
      padding: '8px',
      borderRadius: '8px',
      backgroundColor: Colors.WHITE_LILAC,
    },
    optionsButton: {
      padding: '8px',
      borderRadius: '8px',
      backgroundColor: Colors.WHITE_LILAC,
    },
    modalContent: {
      padding: '20px',
    },
    modalTitle: {
      fontSize: FONT_SIZE_20,
      fontFamily: FONT_FAMILY_POPPINS_SEMIBOLD,
      color: Colors.BLACK,
      marginBottom: '20px',
      textAlign: 'center' as const,
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: `1px solid ${Colors.LIGHT_GREY}`,
      fontSize: FONT_SIZE_16,
      fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
      marginBottom: '20px',
    },
    buttonContainer: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'space-between',
    },
    // Options Modal Styles
    optionsModalContent: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    },
    optionsModalHeaderSimple: {
      padding: '20px 20px 15px 20px',
      borderBottom: `1px solid ${Colors.LIGHT_GREY}`,
    },
    optionsModalTitle: {
      fontSize: FONT_SIZE_18,
      fontFamily: FONT_FAMILY_POPPINS_SEMIBOLD,
      color: Colors.BLACK,
    },

    optionsContainer: {
      padding: '10px 0',
    },
    optionButton: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      padding: '15px 20px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      gap: '12px',
      transition: 'background-color 0.2s ease',
    },
    optionText: {
      fontSize: FONT_SIZE_16,
      fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
      color: Colors.BLACK,
      textAlign: 'left' as const,
    },
    optionDeleteText: {
      fontSize: FONT_SIZE_16,
      fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
      color: '#FF6B6B',
      textAlign: 'left' as const,
    },
    // Delete Modal Styles
    deleteModalContent: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      boxSizing: 'border-box',
    },
    deleteModalHeaderSimple: {
      padding: '20px 20px 15px 20px',
      borderBottom: `1px solid ${Colors.LIGHT_GREY}`,
    },
    deleteModalTitle: {
      fontSize: FONT_SIZE_18,
      fontFamily: FONT_FAMILY_POPPINS_SEMIBOLD,
      color: Colors.BLACK,
    },
    deleteModalBody: {
      padding: '20px',
    },
    deleteModalText: {
      fontSize: FONT_SIZE_16,
      fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
      color: '#666',
      textAlign: 'center' as const,
      lineHeight: '1.5',
    },
    deleteModalButtons: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
      padding: '0 20px 20px 20px',
      alignItems: 'center',
      width: '100%',
      boxSizing: 'border-box',
    },
    // Rename Modal Styles
    renameModalContent: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      boxSizing: 'border-box',
    },
    renameModalHeaderSimple: {
      padding: '20px 20px 15px 20px',
      borderBottom: `1px solid ${Colors.LIGHT_GREY}`,
    },
    renameModalTitle: {
      fontSize: FONT_SIZE_18,
      fontFamily: FONT_FAMILY_POPPINS_SEMIBOLD,
      color: Colors.BLACK,
    },
    renameModalBody: {
      padding: '20px',
    },
    renameInput: {
      width: '100%',
      padding: '12px',
      border: `1px solid ${Colors.LIGHT_GREY}`,
      borderRadius: '8px',
      fontSize: FONT_SIZE_16,
      fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
      outline: 'none',
      boxSizing: 'border-box',
    },
    renameModalButtons: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
      padding: '0 20px 20px 20px',
      alignItems: 'center',
      width: '100%',
      boxSizing: 'border-box',
    },
  };

  if (loading) {
    return (
      <div className='space-detail-container'>
        <div className='space-detail-header' style={{ position: 'relative' }}>
          <button onClick={handleBack} className='space-detail-back-button'>
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
        <div className='space-detail-background' />
        <div className='space-detail-content'>
          <div style={{ height: '200px' }} />
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className='space-detail-container'>
        <div className='space-detail-header' style={{ position: 'relative' }}>
          <button onClick={handleBack} className='space-detail-back-button'>
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
              Space Not Found
            </CustomText>
          </div>
          <div style={{ width: 24 }} />
        </div>
        <div className='space-detail-background' />
        <div className='space-detail-content'>
          <div style={{ height: '200px' }} />
        </div>
      </div>
    );
  }

  return (
    <div className='space-detail-container'>
      {/* Header */}
      <div className='space-detail-header' style={{ position: 'relative' }}>
        <button onClick={handleBack} className='space-detail-back-button'>
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
            {spaceName}
          </CustomText>
        </div>
        <button
          onClick={() => setShowOptionsModal(true)}
          className='space-detail-back-button'
        >
          <img
            src='/hive-icons/threeDots.svg'
            alt='Options'
            width={24}
            height={24}
          />
        </button>
      </div>

      {/* Background positioned after header */}
      <div className='space-detail-background' />

      {/* Content wrapper after header */}
      <div className='space-detail-content'>
        {/* Header Hex Tile */}
        <div className='space-detail-header-hex'>
          <HiveHexTile
            coloredTile
            content={{ icon: getSpaceIcon(space.Type) }}
            width={120}
            height={120}
            centerIcon={true}
            iconSize={36}
          />
        </div>

        {/* Space Details Card */}
        <div style={styles.cardDetails}>
          <div style={styles.sectionHeader}>
            <CustomText style={styles.titleText}>{i18n.t('SpaceDetails')}</CustomText>
            <button style={styles.editButton} onClick={handleEdit}>
              <img
                src='/hive-icons/editPencil.svg'
                alt='Edit'
                width={24}
                height={24}
              />
            </button>
          </div>

          <div style={styles.row}>
            <CustomText style={styles.nameText}>{i18n.t('Measurements')}</CustomText>
            <CustomText style={styles.valueText}>
              {formData.measurements}
            </CustomText>
          </div>

          <div style={styles.row}>
            <CustomText style={styles.nameText}>{i18n.t('PaintColor')}</CustomText>
            <CustomText style={styles.valueText}>
              {formData.paintColor}
            </CustomText>
          </div>

          <div style={{ ...styles.row, borderBottom: 'none' }}>
            <CustomText style={styles.nameText}>{i18n.t('LightBulbs')}</CustomText>
            <CustomText style={styles.valueText}>
              {formData.typesOfLightBulb}
            </CustomText>
          </div>
        </div>

        {/* Pills Detail Section (Tasks, Notes, Documents, Events) */}
        <div style={{ marginTop: '20px', maxWidth: '800px', width: '100%' }}>
          <PillDetail homeMemberId={spaceId} />
        </div>
      </div>

      {/* Options Modal */}
      <OptionsListModal
        isVisible={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        items={[
          {
            label: i18n.t('Rename'),
            iconSrc: '/hive-icons/editPencil.svg',
            onClick: () => {
              setShowOptionsModal(false);
              setShowRenameModal(true);
            },
          },
          {
            label: i18n.t('Delete'),
            iconSrc: '/hive-icons/bin.svg',
            danger: true,
            onClick: () => {
              setShowOptionsModal(false);
              setShowDeleteModal(true);
            },
          },
        ]}
      />

      {/* Rename Modal */}
      <Modal
        isVisible={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        contentStyle={{
          width: '100%',
          maxWidth: '400px',
          padding: '0',
          boxSizing: 'border-box',
        }}
      >
        <div style={styles.renameModalContent}>
          {/* Header */}
          <div style={styles.renameModalHeaderSimple}>
            <CustomText style={styles.renameModalTitle}>
              {i18n.t('RenameSpace')}
            </CustomText>
          </div>

          {/* Content */}
          <div style={styles.renameModalBody}>
            <input
              style={styles.renameInput}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={i18n.t('EnterNewName')}
            />
          </div>

          {/* Buttons */}
          <div style={styles.renameModalButtons}>
            <Button
              width='120px'
              textProps={{
                text: i18n.t('Cancel'),
                fontSize: FONT_SIZE_16,
                fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                color: Colors.BLUE,
              }}
              onButtonClick={() => {
                setShowRenameModal(false);
                setNewName('');
              }}
              backgroundColor={Colors.WHITE}
              borderProps={{ width: 1, color: Colors.BLUE, radius: 8 }}
            />

            <Button
              width='120px'
              textProps={{
                text: i18n.t('Save'),
                fontSize: FONT_SIZE_16,
                fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                color: Colors.WHITE,
              }}
              onButtonClick={handleRename}
              backgroundColor={Colors.BLUE}
              borderProps={{ radius: 8 }}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Modal (shared) */}
      <DeleteModal
        isVisible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        category="space"
        customTitle={i18n.t('DeleteSpace')}
        customMessage={i18n.t('AreYouSureYouWantToDelete', { name: spaceName })}
      />
    </div>
  );
};

export default SpaceDetailPage;
