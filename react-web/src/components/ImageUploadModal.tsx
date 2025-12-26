/**
 * ImageUploadModal Component
 * 
 * Web-compatible image upload modal for provider images
 */

import React, { useRef } from 'react';
import CustomText from './CustomText';
import Icon from './Icon';
import { Colors, Typography } from '../styles';
import './ImageUploadModal.css';
import { useLanguageContext } from '../context/LanguageContext';

interface ImageUploadModalProps {
  isVisible: boolean;
  onRequestClose: () => void;
  onImageSelected: (file: File) => void;
  title?: string;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isVisible,
  onRequestClose,
  onImageSelected,
  title
}) => {
  const { i18n } = useLanguageContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type.startsWith('image/')) {
        onImageSelected(file);
        onRequestClose();
      } else {
        alert(i18n.t('PleaseSelectAValidImageFile'));
      }
    }
  };

  const handleCameraCapture = () => {
    // For web, we'll use the file input with camera capture
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="image-upload-modal-overlay" onClick={onRequestClose}>
      <div className="image-upload-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="image-upload-modal-header">
          <CustomText className="image-upload-modal-title">
            {title || i18n.t('SelectImage')}
          </CustomText>
          <button
            onClick={onRequestClose}
            className="image-upload-modal-close"
          >
            <Icon name="close" width={24} height={24} color={Colors.GREY_COLOR} />
          </button>
        </div>

        {/* Options */}
        <div className="image-upload-modal-options">
          <button
            onClick={handleCameraCapture}
            className="image-upload-option"
          >
            <div className="image-upload-option-icon">
              <Icon name="camera" width={32} height={32} color={Colors.BLUE} />
            </div>
            <CustomText className="image-upload-option-text">
              {i18n.t('TakeAPhoto')}
            </CustomText>
          </button>

          <button
            onClick={handleFileSelect}
            className="image-upload-option"
          >
            <div className="image-upload-option-icon">
              <Icon name="photo" width={32} height={32} color={Colors.BLUE} />
            </div>
            <CustomText className="image-upload-option-text">
              {i18n.t('ChooseFromGallery')}
            </CustomText>
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default ImageUploadModal;
