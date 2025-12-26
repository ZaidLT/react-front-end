'use client';

import React, { useState } from 'react';
import { Colors, Typography } from '../styles';
import CustomText from './CustomText';
import { useLanguageContext } from '../context/LanguageContext';

// Types for filtering
export interface FilterTag {
  uniqueId: string;
  name: string;
  type: string;
  color?: string;
}

export interface SearchFilters {
  types?: string[];
  tags?: FilterTag[];
  dateRange?: {
    start?: string;
    end?: string;
  };
}

// Filter Tag Component (similar to React Native implementation)
interface FilterTagProps {
  tag: FilterTag;
  tags: FilterTag[];
  onRemove: (tagId: string) => void;
}

export const FilterTagComponent: React.FC<FilterTagProps> = ({
  tag,
  tags,
  onRemove,
}) => {
  const handleRemove = () => {
    onRemove(tag.uniqueId);
  };

  return (
    <button
      onClick={handleRemove}
      style={{
        height: '26px',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '4px',
        paddingRight: '4px',
        borderWidth: '2px',
        borderStyle: 'solid',
        gap: '4px',
        borderColor: Colors.PRIMARY_ELECTRIC_BLUE,
        backgroundColor: 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <HiveIcon color={Colors.PRIMARY_ELECTRIC_BLUE} />
      <CustomText style={{
        fontSize: 14,
        color: Colors.PRIMARY_ELECTRIC_BLUE,
        fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
      }}>
        {tag.name}
      </CustomText>
      <CloseIcon color={Colors.PRIMARY_ELECTRIC_BLUE} />
    </button>
  );
};

// Filter Button Component
interface FilterButtonProps {
  onClick: () => void;
  hasActiveFilters?: boolean;
}

export const FilterButton: React.FC<FilterButtonProps> = ({ 
  onClick, 
  hasActiveFilters = false 
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        height: '40px',
        aspectRatio: '1 / 1',
        minWidth: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: hasActiveFilters ? Colors.PRIMARY_ELECTRIC_BLUE : 'none',
        border: hasActiveFilters ? `1px solid ${Colors.PRIMARY_ELECTRIC_BLUE}` : 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <FilterListIcon 
        color={hasActiveFilters ? Colors.WHITE : Colors.BLUE} 
        width={24} 
        height={24} 
      />
    </button>
  );
};

// Type Filter Component
interface TypeFilterProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
}

export const TypeFilter: React.FC<TypeFilterProps> = ({
  selectedTypes,
  onTypesChange,
}) => {
  const availableTypes = [
    { id: 'tasks', label: 'Tasks', icon: '✓' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'files', label: 'Files', icon: '📄' },
  ];

  const handleTypeToggle = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      onTypesChange(selectedTypes.filter(t => t !== typeId));
    } else {
      onTypesChange([...selectedTypes, typeId]);
    }
  };

  return (
    <div style={styles.typeFilterContainer}>
      <CustomText style={styles.filterSectionTitle}>Content Types</CustomText>
      <div style={styles.typeOptionsContainer}>
        {availableTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeToggle(type.id)}
            style={{
              ...styles.typeOption,
              backgroundColor: selectedTypes.includes(type.id) 
                ? Colors.PRIMARY_ELECTRIC_BLUE 
                : Colors.WHITE,
              borderColor: selectedTypes.includes(type.id)
                ? Colors.PRIMARY_ELECTRIC_BLUE
                : Colors.COSMIC,
            }}
          >
            <span style={{ fontSize: '16px' }}>{type.icon}</span>
            <CustomText style={{
              ...styles.typeOptionText,
              color: selectedTypes.includes(type.id) 
                ? Colors.WHITE 
                : Colors.MIDNIGHT,
            }}>
              {type.label}
            </CustomText>
          </button>
        ))}
      </div>
    </div>
  );
};

// Filter Modal Component
interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
}) => {
  const { i18n } = useLanguageContext();
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  if (!isOpen) return null;

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters: SearchFilters = {
      types: ['tasks', 'events', 'notes', 'files'],
      tags: [],
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClose();
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <CustomText style={styles.modalTitle}>Search Filters</CustomText>
          <button onClick={onClose} style={styles.closeButton}>
            <CloseIcon color={Colors.BLUE} />
          </button>
        </div>

        <div style={styles.modalBody}>
          <TypeFilter
            selectedTypes={localFilters.types || []}
            onTypesChange={(types) => 
              setLocalFilters({ ...localFilters, types })
            }
          />

          {/* Tags section - placeholder for future implementation */}
          <div style={styles.filterSection}>
            <CustomText style={styles.filterSectionTitle}>Tags</CustomText>
            <CustomText style={styles.comingSoonText}>
              Tag filtering coming soon...
            </CustomText>
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button onClick={handleClear} style={styles.clearButton}>
            <CustomText style={styles.clearButtonText}>{i18n.t('ClearAll')}</CustomText>
          </button>
          <button onClick={handleApply} style={styles.applyButton}>
            <CustomText style={styles.applyButtonText}>Apply Filters</CustomText>
          </button>
        </div>
      </div>
    </div>
  );
};

// Icon Components
const FilterListIcon: React.FC<{ 
  color?: string; 
  width?: number; 
  height?: number; 
}> = ({ color = Colors.BLUE, width = 24, height = 24 }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const HiveIcon: React.FC<{ color?: string }> = ({ color = Colors.BLUE }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
  >
    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
  </svg>
);

const CloseIcon: React.FC<{ color?: string }> = ({ color = Colors.BLUE }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill={color}
    stroke="none"
  >
    <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" stroke={color} />
    <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" stroke={color} />
  </svg>
);

const styles = {
  typeFilterContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.MIDNIGHT,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
  },
  typeOptionsContainer: {
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  typeOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '20px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  typeOptionText: {
    fontSize: 14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: Colors.WHITE,
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '80vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: `1px solid ${Colors.COSMIC}`,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.MIDNIGHT,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  modalBody: {
    padding: '20px',
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  comingSoonText: {
    fontSize: 14,
    color: Colors.GREY_COLOR,
    fontStyle: 'italic',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px',
    borderTop: `1px solid ${Colors.COSMIC}`,
    gap: '12px',
  },
  clearButton: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${Colors.COSMIC}`,
    backgroundColor: Colors.WHITE,
    cursor: 'pointer',
  },
  clearButtonText: {
    color: Colors.MIDNIGHT,
    fontSize: 14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
  },
  applyButton: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: Colors.PRIMARY_ELECTRIC_BLUE,
    cursor: 'pointer',
  },
  applyButtonText: {
    color: Colors.WHITE,
    fontSize: 14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
  },
};

export default {
  FilterTagComponent,
  FilterButton,
  TypeFilter,
  FilterModal,
};
