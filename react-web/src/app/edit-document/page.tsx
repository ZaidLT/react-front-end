'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomText from '../../components/CustomText';
import NavHeader from '../../components/NavHeader';
import Button from '../../components/Button';
import HorizontalLine from '../../components/HorizontalLine';
import HiveSelectionModal from '../../components/HiveSelectionModal';
import { Colors, Typography } from '../../styles';
import { getFileById, updateFile } from '../../services/documentService';
import { IFile, IDocumentViewerParams } from '../../services/types';
import { useUserStore, useTileStore } from '../../context/store';
import FileTypeIcon from '../../components/FileTypeIcon';

import './edit-document.css';

const EditDocumentContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [document, setDocument] = useState<IFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showHiveModal, setShowHiveModal] = useState(false);
  
  // Form state
  const [filename, setFilename] = useState('');
  const [selectedHive, setSelectedHive] = useState<any>(null);
  const [priority, setPriority] = useState<number>(0);
  
  const user = useUserStore((state) => state.user);
  const tiles = useTileStore((state) => state.tiles);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const fwdDoc = searchParams.get('fwdDoc');
        if (fwdDoc && user) {
          const docParams: IDocumentViewerParams = JSON.parse(decodeURIComponent(fwdDoc));
          
          // Fetch the document details
          const fileData = await getFileById(docParams.UniqueIdForFile, user.Account_uniqueId);
          setDocument(fileData);
          setFilename(fileData.filename || fileData.Filename || '');
          
          // Find associated hive if any
          if (fileData.HomeMember_uniqueId || fileData.Tile_uniqueId) {
            const hiveId = fileData.HomeMember_uniqueId || fileData.Tile_uniqueId;
            const associatedHive = tiles.find(tile => tile.UniqueId === hiveId);
            if (associatedHive) {
              setSelectedHive(associatedHive);
            }
          }
        }
      } catch (error) {
        console.error('Error loading document:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [searchParams, user, tiles]);

  const handleSave = async () => {
    if (!document || !user || !filename.trim()) return;

    setIsSaving(true);
    try {
      const updates: Partial<IFile> = {
        filename: filename.trim(),
        accountId: user.Account_uniqueId,
        userId: user.UniqueId,
      };

      // Add hive association if selected
      if (selectedHive) {
        updates.HomeMember_uniqueId = selectedHive.UniqueId;
        updates.Tile_uniqueId = selectedHive.UniqueId;
      }

      await updateFile(document.id, updates);
      
      // Navigate back to document viewer
      router.back();
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleHiveSelection = (hive: any) => {
    setSelectedHive(hive);
    setShowHiveModal(false);
  };

  const handleRemoveHive = () => {
    setSelectedHive(null);
  };

  if (isLoading) {
    return (
      <div className="edit-document-container">
        <NavHeader
          headerText="Edit Document"
          left={{
            text: "Back",
            goBack: true,
            onPress: () => router.back()
          }}
        />
        <div className="edit-document-loading">
          <CustomText>Loading document...</CustomText>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="edit-document-container">
        <NavHeader
          headerText="Edit Document"
          left={{
            text: "Back",
            goBack: true,
            onPress: () => router.back()
          }}
        />
        <div className="edit-document-error">
          <CustomText>Document not found</CustomText>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: Colors.WHITE,
      maxWidth: '600px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          padding: '20px',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
          }}
        >
          <img
            src="/icons/icon-menu-back.svg"
            width={24}
            height={24}
            alt="Back"
            style={{ cursor: 'pointer' }}
          />
        </button>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '4px',
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
            }}
          >
            Edit Document
          </CustomText>
        </div>

        <div
          style={{
            position: 'absolute',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <button
            onClick={handleSave}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
            }}
          >
            <CustomText style={{
              color: Colors.BLUE,
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM
            }}>
              {isSaving ? "Saving..." : "Save"}
            </CustomText>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: '24px',
        marginRight: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
          {/* Document Preview */}
          <div style={styles.documentPreview}>
            <FileTypeIcon 
              filename={filename}
              width={48}
              height={48}
            />
            <CustomText style={styles.documentType}>
              {document.filename || document.Filename || 'Document'}
            </CustomText>
          </div>

          <HorizontalLine color={Colors.GREY_COLOR} />

          {/* Filename Field */}
          <div style={styles.fieldContainer}>
            <CustomText style={styles.fieldLabel}>
              Document Name
            </CustomText>
            <input
              style={styles.textInput}
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter document name"
            />
          </div>

          <HorizontalLine color={Colors.GREY_COLOR} />

          {/* Hive Association */}
          <div style={styles.fieldContainer}>
            <CustomText style={styles.fieldLabel}>
              Hive Association
            </CustomText>
            
            {selectedHive ? (
              <div style={styles.selectedHiveContainer}>
                <div style={styles.selectedHive}>
                  <CustomText style={styles.selectedHiveText}>
                    {selectedHive.Title}
                  </CustomText>
                  <button
                    style={styles.removeButton}
                    onClick={handleRemoveHive}
                  >
                    <CustomText style={styles.removeButtonText}>×</CustomText>
                  </button>
                </div>
              </div>
            ) : (
              <button
                style={styles.selectButton}
                onClick={() => setShowHiveModal(true)}
              >
                <CustomText style={styles.selectButtonText}>
                  Select Hive
                </CustomText>
              </button>
            )}
          </div>

          <HorizontalLine color={Colors.GREY_COLOR} />

          {/* Priority Section */}
          <div style={styles.fieldContainer}>
            <CustomText style={styles.fieldLabel}>
              Priority
            </CustomText>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              alignSelf: 'stretch',
            }}>
              {/* None Priority */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  opacity: priority === 0 ? 1 : 0.5,
                }}
                onClick={() => setPriority(0)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M13.3333 10H6.66663" stroke="#666E96" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.99996 18.3337C14.6023 18.3337 18.3333 14.6027 18.3333 10.0003C18.3333 5.39795 14.6023 1.66699 9.99996 1.66699C5.39759 1.66699 1.66663 5.39795 1.66663 10.0003C1.66663 14.6027 5.39759 18.3337 9.99996 18.3337Z" stroke="#666E96" strokeWidth="1.25" strokeLinejoin="round"/>
                </svg>
                <CustomText style={{
                  color: 'var(--primary-dark-blue-60, #666E96)',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '19px',
                  letterSpacing: '-0.084px',
                }}>
                  None
                </CustomText>
              </div>

              {/* Low Priority */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  opacity: priority === 1 ? 1 : 0.5,
                }}
                onClick={() => setPriority(1)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3.33337 11.667V17.5003" stroke="#6CC47C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.79804 3.1991C7.04367 1.77488 4.4142 2.83108 3.33337 3.68353V12.3545C4.14146 11.426 6.5657 9.98675 9.79804 11.6581C12.6867 13.1518 15.5037 12.3313 16.6667 11.686V3.34011C14.4247 4.35967 12.0145 4.34516 9.79804 3.1991Z" stroke="#6CC47C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <CustomText style={{
                  color: 'var(--Accent-Color-Green-1, #6CC47C)',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '19px',
                  letterSpacing: '-0.084px',
                }}>
                  Low
                </CustomText>
              </div>

              {/* Medium Priority */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  opacity: priority === 2 ? 1 : 0.5,
                }}
                onClick={() => setPriority(2)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3.33337 11.667V17.5003" stroke="#FFA020" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.79804 3.1991C7.04367 1.77488 4.4142 2.83108 3.33337 3.68353V12.3545C4.14146 11.426 6.5657 9.98675 9.79804 11.6581C12.6867 13.1518 15.5037 12.3313 16.6667 11.686V3.34011C14.4247 4.35967 12.0145 4.34516 9.79804 3.1991Z" stroke="#FFA020" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <CustomText style={{
                  color: 'var(--Accent-Color-Orange-1, #FFA020)',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '19px',
                  letterSpacing: '-0.084px',
                }}>
                  Medium
                </CustomText>
              </div>

              {/* High Priority */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  opacity: priority === 3 ? 1 : 0.5,
                }}
                onClick={() => setPriority(3)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3.33337 11.667V17.5003" stroke="#FF6961" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.79804 3.1991C7.04367 1.77488 4.4142 2.83108 3.33337 3.68353V12.3545C4.14146 11.426 6.5657 9.98675 9.79804 11.6581C12.6867 13.1518 15.5037 12.3313 16.6667 11.686V3.34011C14.4247 4.35967 12.0145 4.34516 9.79804 3.1991Z" stroke="#FF6961" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <CustomText style={{
                  color: 'var(--Accent-Color-Red-1, #FF6961)',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '19px',
                  letterSpacing: '-0.084px',
                }}>
                  High
                </CustomText>
              </div>
            </div>
          </div>

          <HorizontalLine color={Colors.GREY_COLOR} />

          {/* Document Info */}
          <div style={styles.infoContainer}>
            <CustomText style={styles.infoLabel}>Created:</CustomText>
            <CustomText style={styles.infoValue}>
              {document.creationTimestamp ? new Date(document.creationTimestamp).toLocaleDateString() : 'Unknown'}
            </CustomText>
          </div>

          <div style={styles.infoContainer}>
            <CustomText style={styles.infoLabel}>File URL:</CustomText>
            <CustomText style={styles.infoValue}>
              {document.fileUrl || document.FileURL || 'Not available'}
            </CustomText>
          </div>
        </div>

        {/* Save Button */}
        <div style={styles.saveButtonContainer}>
          <Button
            width="100%"
            textProps={{
              text: isSaving ? "Saving..." : "Save Changes",
              fontSize: Typography.FONT_SIZE_16,
              color: Colors.WHITE,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            }}
            onButtonClick={handleSave}
            backgroundColor={Colors.BLUE}
            borderProps={{
              width: 1,
              color: Colors.BLUE,
              radius: 8,
            }}
            disabled={isSaving || !filename.trim()}
          />
        </div>

      {/* Hive Selection Modal */}
      <HiveSelectionModal
        isVisible={showHiveModal}
        onClose={() => setShowHiveModal(false)}
        onHiveSelect={(selectedHives, selectedHive) => {
          if (selectedHive) {
            handleHiveSelection(selectedHive);
          }
        }}
        multiSelect={false}
        initialSelectedHive={selectedHive}
      />
    </div>
  );
};

const styles = {
  formContainer: {
    flex: 1,
    padding: '20px',
    backgroundColor: Colors.WHITE,
  },
  documentPreview: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
  },
  documentType: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
    color: Colors.GREY_COLOR,
  },
  fieldContainer: {
    margin: '16px 0',
  },
  fieldLabel: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
    color: Colors.MIDNIGHT,
    marginBottom: '8px',
  },
  textInput: {
    width: '100%',
    padding: '12px',
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    border: `1px solid ${Colors.GREY_COLOR}`,
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: Colors.WHITE,
  },
  selectedHiveContainer: {
    marginTop: '8px',
  },
  selectedHive: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: Colors.WHITE_LILAC,
    borderRadius: '8px',
    border: `1px solid ${Colors.BLUE}`,
  },
  selectedHiveText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.MIDNIGHT,
  },
  removeButton: {
    width: '24px',
    height: '24px',
    borderRadius: '12px',
    backgroundColor: Colors.RED,
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  removeButtonText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
    color: Colors.WHITE,
    lineHeight: '1',
  },
  selectButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: Colors.WHITE,
    border: `1px solid ${Colors.BLUE}`,
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  selectButtonText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.BLUE,
    textAlign: 'center' as const,
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '8px 0',
  },
  infoLabel: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
    color: Colors.GREY_COLOR,
  },
  infoValue: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.MIDNIGHT,
    maxWidth: '60%',
    textAlign: 'right' as const,
  },
  saveButtonContainer: {
    padding: '20px',
    backgroundColor: Colors.WHITE,
    borderTop: `1px solid ${Colors.GREY_COLOR}`,
  },
};

const EditDocumentPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditDocumentContent />
    </Suspense>
  );
};

export default EditDocumentPage;
