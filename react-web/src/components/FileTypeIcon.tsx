import React from 'react';
import { DOCS_TYPE } from '../assets/docs-type';
import { getFileType, getFileTypeInfo, FileType } from '../services/documentService';

interface FileTypeIconProps {
  filename: string;
  mimeType?: string;
  storageProviderId?: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * FileTypeIcon - A component that displays the appropriate icon for a file type
 * 
 * This component determines the file type based on filename and/or mime type,
 * then displays the corresponding icon from the docs-type assets.
 * 
 * @param filename - The name of the file (used to determine extension)
 * @param mimeType - Optional MIME type for more accurate type detection
 * @param width - Icon width (default: 24)
 * @param height - Icon height (default: 24)
 * @param className - Additional CSS classes
 */
const FileTypeIcon: React.FC<FileTypeIconProps> = ({
  filename,
  mimeType,
  storageProviderId,
  width = 24,
  height = 24,
  className = '',
}) => {
  const fileType = getFileType(filename, mimeType, storageProviderId);

  // Map our file types to the available DOCS_TYPE icons
  const getIconComponent = (type: FileType): React.FC<React.SVGProps<SVGSVGElement>> => {
    switch (type) {
      case 'pdf':
        return DOCS_TYPE.adobe;
      case 'doc':
      case 'docx':
        return DOCS_TYPE.doc;
      case 'image':
        return DOCS_TYPE.image;
      case 'video':
        return DOCS_TYPE.video;
      case 'audio':
        return DOCS_TYPE.audio;
      case 'other':
      default:
        return DOCS_TYPE.document;
    }
  };

  const IconComponent = getIconComponent(fileType);

  return (
    <div
      style={{
        width: width,
        height: height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className={className}
    >
      <IconComponent
        // Don't pass width/height to the SVG, let it use its natural size
        style={{
          display: 'block',
        }}
      />
    </div>
  );
};

export default FileTypeIcon;
