'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguageContext } from '../../../context/LanguageContext';
import { translateApplianceLabel } from '../../../util/translationUtils';

import { Colors, Typography } from '../../../styles';
import CustomText from '../../../components/CustomText';
import Icon from '../../../components/Icon';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Button from '../../../components/Button';
import { EditPropertyDetailPageSkeleton } from '../../../components/SkeletonLoader';
import { scanProductLabel, LabelScanResult } from '../../../util/labelScanning';
import { compressImage, needsCompression, formatFileSize } from '../../../util/imageCompression';
import './edit-appliance-detail.css';

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

const EditApplianceDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const { i18n } = useLanguageContext();

  // State
  const [appliance, setAppliance] = useState<ApplianceData | null>(null);
  const [isLoadingAppliance, setIsLoadingAppliance] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<File | null>(null); // For UI state only, not file attachment
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<LabelScanResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const applianceId = params.id as string;

  // Get type from query param for translation (new format)
  const applianceTypeParam = searchParams.get('type');
  const applianceType = applianceTypeParam ? parseInt(applianceTypeParam, 10) : null;

  // Compute appliance name with backward compatibility
  const applianceName = React.useMemo(() => {
    // Prefer type-based translation (new format)
    if (applianceType !== null) {
      return translateApplianceLabel({ type: applianceType }, i18n) || 'Appliance';
    }
    // Fallback to name param (old bookmarks)
    const nameParam = searchParams.get('name');
    if (nameParam) {
      return nameParam;
    }
    // Final fallback
    return 'Appliance';
  }, [applianceType, searchParams, i18n]);

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:image/jpeg;base64, prefix to get just the base64 string
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Form state - initialize with current date for date fields
  const getCurrentDate = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    brandModel: '',
    purchaseDate: getCurrentDate(),
    endOfWarranty: getCurrentDate(),
  });

  // Fetch appliance data
  useEffect(() => {
    const fetchAppliance = async () => {
      if (!user?.id || !user?.accountId || !applianceId) return;

      try {
        setIsLoadingAppliance(true);
        setError(null);

        const response = await fetch(
          `/api/tiles/${applianceId}?accountId=${user.accountId}&userId=${user.id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAppliance(data);
          
          // Get current date in YYYY-MM-DD format
          const currentDate = new Date().toISOString().split('T')[0];

          // Helper function to check if date is the specific placeholder: "2000-01-01T00:00:00.000Z"
          const isPlaceholderDate = (dateString?: string) => {
            return !dateString || dateString === "2000-01-01T00:00:00.000Z";
          };

          // Populate form with existing data
          setFormData({
            name: data.Name || '',
            serialNumber: data.ElectronicDevice_SerialNumber || '',
            brandModel: data.ElectronicDevice_BrandModel || '',
            purchaseDate: isPlaceholderDate(data.ElectronicDevice_PurchaseDate) ?
              currentDate : data.ElectronicDevice_PurchaseDate.split('T')[0], // Use current date for placeholder, otherwise use actual date
            endOfWarranty: isPlaceholderDate(data.ElectronicDevice_EndOfWarranty) ?
              currentDate : data.ElectronicDevice_EndOfWarranty.split('T')[0], // Use current date for placeholder, otherwise use actual date
          });
        } else {
          console.error('Failed to load appliance:', response.statusText);
          setError('Failed to load appliance information');
        }
      } catch (error) {
        console.error('Error fetching appliance:', error);
        setError('Failed to load appliance information');
      } finally {
        setIsLoadingAppliance(false);
      }
    };

    fetchAppliance();
  }, [user, applianceId]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle photo upload with compression
  const handlePhotoUpload = async (file: File) => {
    try {
      if (needsCompression(file)) {
        setIsCompressing(true);

        const compressedFile = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.8,
          maxSizeKB: 2048, // 2MB max
        });

        setSelectedPhoto(compressedFile);
        setIsCompressing(false);
      } else {
        setSelectedPhoto(file);
      }
    } catch (error) {
      console.error('Error compressing image:', error);
      setIsCompressing(false);
      // Use original file if compression fails
      setSelectedPhoto(file);
    }
  };

  // Handle label scanning with OpenAI (data extraction only, file not stored)
  const handleLabelScan = async (file: File) => {
    try {
      setIsScanning(true);
      setSelectedLabel(file); // Used for UI state only, not for file attachment
      console.log('Starting label scan for data extraction:', file.name);

      const result = await scanProductLabel(file);

      if (result.success && result.data) {
        setScanResult(result.data);

        // Auto-populate form fields with extracted data
        const updates: any = {};

        if (result.data.productName) {
          updates.name = result.data.productName;
        }

        if (result.data.serialNumber) {
          updates.serialNumber = result.data.serialNumber;
        }

        // Combine brand and model number for brandModel field
        if (result.data.brand || result.data.modelNumber) {
          const brandPart = result.data.brand || '';
          const modelPart = result.data.modelNumber || '';
          updates.brandModel = [brandPart, modelPart].filter(Boolean).join(' ').trim();
        }

        // Update form data with extracted information
        if (Object.keys(updates).length > 0) {
          setFormData(prev => ({
            ...prev,
            ...updates
          }));

          console.log('Form updated with extracted data:', updates);
        } else {
          console.log('Label scanned, but no product information could be extracted.');
        }
      } else {
        console.error('Label scan failed:', result.error);
      }
    } catch (error) {
      console.error('Error during label scan:', error);
    } finally {
      setIsScanning(false);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!appliance || !user || !applianceId) return;

    // Prevent saving while compression is in progress
    if (isCompressing) {
      console.log('Cannot save while image compression is in progress');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);



      const updatedApplianceData = {
        ...appliance,
        Name: formData.name,
        ElectronicDevice_SerialNumber: formData.serialNumber,
        ElectronicDevice_BrandModel: formData.brandModel,
        ElectronicDevice_PurchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).toISOString() : undefined,
        ElectronicDevice_EndOfWarranty: formData.endOfWarranty ? new Date(formData.endOfWarranty).toISOString() : undefined,
      };

      // Check if we have any files to upload (only photos, not label scans)
      const hasFiles = selectedPhoto;

      if (hasFiles) {
        // Use FormData for multipart upload when files are present
        const formDataToSend = new FormData();

        // Add all the appliance data as form fields
        formDataToSend.append('id', applianceId);
        formDataToSend.append('accountId', user.accountId);
        formDataToSend.append('userId', user.id);
        formDataToSend.append('name', formData.name);
        formDataToSend.append('type', appliance.Type?.toString() || '');
        formDataToSend.append('active', 'true');
        formDataToSend.append('deleted', 'false');
        formDataToSend.append('electronicDeviceBrandModel', formData.brandModel);
        formDataToSend.append('electronicDeviceSerialNumber', formData.serialNumber);
        formDataToSend.append('electronicDevicePurchaseDate', formData.purchaseDate ? new Date(formData.purchaseDate).toISOString() : '');
        formDataToSend.append('electronicDeviceEndOfWarranty', formData.endOfWarranty ? new Date(formData.endOfWarranty).toISOString() : '');

        // Add optional fields if they exist
        if (appliance.AvatarImagePath) {
          formDataToSend.append('avatarImagePath', appliance.AvatarImagePath);
        }
        if (appliance.ParentUniqueId) {
          formDataToSend.append('parentId', appliance.ParentUniqueId);
        }

        // Add files - only attach photos, not label scans
        if (selectedPhoto) {
          formDataToSend.append('files', selectedPhoto);
        }
        // Note: selectedLabel is NOT attached - it's only used for data extraction

        const response = await fetch('/api/tiles', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            // Don't set Content-Type for FormData - let browser set it with boundary
          },
          body: formDataToSend,
        });

        if (response.ok) {
          const savedAppliance = await response.json();
          console.log('Appliance updated successfully with files:', savedAppliance);

          // Navigate back to appliance detail page
          router.push(`/appliance-detail/${applianceId}?name=${encodeURIComponent(formData.name)}`);
        } else {
          const errorData = await response.json();
          console.error('Failed to update appliance with files:', errorData);
          setError(errorData.message || 'Failed to update appliance');
        }
      } else {
        // Use JSON for regular update when no files
        console.log('Updated appliance data being sent:', JSON.stringify(updatedApplianceData, null, 2));

        const response = await fetch(`/api/tiles/${applianceId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accountId: user.accountId,
            userId: user.id,
            ...updatedApplianceData,
          }),
        });

        if (response.ok) {
          const savedAppliance = await response.json();
          console.log('Appliance updated successfully:', savedAppliance);

          // Navigate back to appliance detail page
          router.push(`/appliance-detail/${applianceId}?name=${encodeURIComponent(formData.name)}`);
        } else {
          const errorData = await response.json();
          console.error('Failed to update appliance:', errorData);
          setError(errorData.message || 'Failed to update appliance');
        }
      }
    } catch (error) {
      console.error('Error updating appliance:', error);
      setError('An error occurred while updating the appliance');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push(`/appliance-detail/${applianceId}?name=${encodeURIComponent(applianceName)}`);
  };

  // Show loading if auth or data is still loading
  if (isLoading || isLoadingAppliance) {
    return <EditPropertyDetailPageSkeleton />;
  }

  return (
    <div className="edit-appliance-detail-container">
      <div className="edit-appliance-detail-content">
        {/* Header */}
        <div className="edit-appliance-detail-header">
          <button
            onClick={handleCancel}
            className="edit-appliance-detail-back-button"
          >
            <Icon name="back-arrow" width={24} height={24} color={Colors.BLUE} />
          </button>
          <CustomText style={{
            fontSize: Typography.FONT_SIZE_18,
            fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
            color: Colors.BLUE,
            textAlign: 'center',
            flex: 1,
          }}>
            {i18n.t('Edit')} {applianceName}
          </CustomText>
          <div style={{ width: 24 }} /> {/* Spacer for centering */}
        </div>

        {/* Error Message */}
        {error && (
          <div className="edit-appliance-detail-error">
            <CustomText className="error-text">{error}</CustomText>
          </div>
        )}

        {/* Form */}
        <div className="edit-appliance-detail-form">
          {/* Camera Section - Moved to top */}
          <div className="form-group">
            <label className="form-label">{i18n.t('CaptureInformation')}</label>
            <div style={{
              display: 'flex',
              gap: '12px',
              flexDirection: 'row',
            }}>
              {/* Take Photo Option */}
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                border: `2px dashed ${Colors.LIGHT_GREY}`,
                borderRadius: '12px',
                backgroundColor: '#fafafa',
                cursor: isCompressing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                opacity: isCompressing ? 0.6 : 1,
              }}
              onClick={() => {
                if (!isCompressing) {
                  const fileInput = document.getElementById('camera-input-photo') as HTMLInputElement;
                  fileInput?.click();
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = Colors.BLUE;
                e.currentTarget.style.backgroundColor = '#f0f8ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = Colors.LIGHT_GREY;
                e.currentTarget.style.backgroundColor = '#fafafa';
              }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  {/* Camera Icon */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: Colors.BLUE,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0, 14, 80, 0.2)',
                  }}>
                    {isCompressing ? (
                      <LoadingSpinner size={20} color="white" />
                    ) : (
                      <Icon name="camera" width={20} height={20} color={Colors.WHITE} />
                    )}
                  </div>
                  <CustomText style={{
                    fontSize: Typography.FONT_SIZE_12,
                    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                    color: Colors.BLUE,
                    textAlign: 'center',
                  }}>
                    {isCompressing ? `${i18n.t('Compressing')}...` : selectedPhoto ? `✓ ${i18n.t('Photo')}` : i18n.t('TakePhoto')}
                  </CustomText>
                </div>

                {/* Hidden file input for photo */}
                <input
                  id="camera-input-photo"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handlePhotoUpload(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Scan Label Option */}
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                border: `2px dashed ${Colors.LIGHT_GREY}`,
                borderRadius: '12px',
                backgroundColor: '#fafafa',
                cursor: isScanning ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                opacity: isScanning ? 0.6 : 1,
              }}
              onClick={() => {
                if (!isScanning) {
                  const fileInput = document.getElementById('camera-input-label') as HTMLInputElement;
                  fileInput?.click();
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = Colors.BLUE;
                e.currentTarget.style.backgroundColor = '#f0f8ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = Colors.LIGHT_GREY;
                e.currentTarget.style.backgroundColor = '#fafafa';
              }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  {/* Scanner Icon - Using scanLabel icon */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: Colors.BLUE,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0, 14, 80, 0.2)',
                  }}>
                    {isScanning ? (
                      <LoadingSpinner size={20} color="white" />
                    ) : (
                      <img
                        src="/hive-icons/scanLabel.svg"
                        alt="scan label"
                        width={20}
                        height={20}
                        style={{ filter: 'brightness(0) invert(1)' }} // Makes it white
                      />
                    )}
                  </div>
                  <CustomText style={{
                    fontSize: Typography.FONT_SIZE_12,
                    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                    color: Colors.BLUE,
                    textAlign: 'center',
                  }}>
                    {isScanning ? `${i18n.t('Scanning')}...` : selectedLabel ? `✓ ${i18n.t('Label')}` : i18n.t('ScanLabel')}
                  </CustomText>
                </div>

                {/* Hidden file input for label scanning */}
                <input
                  id="camera-input-label"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleLabelScan(e.target.files[0]);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Appliance Name */}
          <div className="form-group">
            <label className="form-label">{i18n.t('ApplianceName')}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="form-input"
              placeholder={i18n.t("EnterApplianceName")}
            />
          </div>

          {/* Serial Number */}
          <div className="form-group">
            <label className="form-label">{i18n.t('SerialNumber')}</label>
            <input
              type="text"
              value={formData.serialNumber}
              onChange={(e) => handleInputChange('serialNumber', e.target.value)}
              className="form-input"
              placeholder={i18n.t("EnterSerialNumber")}
            />
          </div>

          {/* Brand/Model */}
          <div className="form-group">
            <label className="form-label">{i18n.t('BrandModel')}</label>
            <input
              type="text"
              value={formData.brandModel}
              onChange={(e) => handleInputChange('brandModel', e.target.value)}
              className="form-input"
              placeholder={i18n.t("EnterBrandAndModel")}
            />
          </div>

          {/* Purchase Date */}
          <div className="form-group">
            <label className="form-label">{i18n.t('PurchaseDate')}</label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
              className="form-input"
            />
          </div>

          {/* End of Warranty */}
          <div className="form-group">
            <label className="form-label">{i18n.t('EndOfWarranty')}</label>
            <input
              type="date"
              value={formData.endOfWarranty}
              onChange={(e) => handleInputChange('endOfWarranty', e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="edit-appliance-detail-save-section">
          <Button
            textProps={{
              text: 'Save',
              color: Colors.WHITE,
              fontSize: Typography.FONT_SIZE_16,
            }}
            onButtonClick={handleSave}
            backgroundColor={Colors.BLUE}
            disabled={isSaving || isCompressing}
            loading={isSaving || isCompressing}
          />
        </div>
      </div>
    </div>
  );
};

export default EditApplianceDetailPage;
