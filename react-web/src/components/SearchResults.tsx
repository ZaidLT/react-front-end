import React from 'react';
import { Colors, Typography } from '../styles';
import CustomText from './CustomText';

export interface SearchResultItem {
  id: string;
  title: string;
  description?: string;
  type: 'task' | 'event' | 'note' | 'person';
  date?: string;
}

interface SearchResultsProps {
  results: SearchResultItem[];
  onResultPress?: (item: SearchResultItem) => void;
  isLoading?: boolean;
  style?: React.CSSProperties;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onResultPress,
  isLoading = false,
  style,
}) => {
  if (isLoading) {
    return (
      <div style={{ padding: '20px 0', textAlign: 'center', ...style }}>
        <CustomText>Loading results...</CustomText>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div style={{ padding: '20px 0', textAlign: 'center', ...style }}>
        <CustomText>No results found</CustomText>
      </div>
    );
  }

  const getIconForType = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'task':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={Colors.GREY_COLOR} strokeWidth="2">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        );
      case 'event':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={Colors.GREY_COLOR} strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case 'note':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={Colors.GREY_COLOR} strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        );
      case 'person':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={Colors.GREY_COLOR} strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ ...style }}>
      {results.map((item) => (
        <div
          key={item.id}
          onClick={() => onResultPress && onResultPress(item)}
          style={{
            display: 'flex',
            padding: '12px 16px',
            borderBottom: `1px solid ${Colors.COSMIC}`,
            cursor: onResultPress ? 'pointer' : 'default',
            transition: 'background-color 0.2s',
          }}
          className="search-result-item"
        >
          <div style={{ marginRight: 12, display: 'flex', alignItems: 'center' }}>
            {getIconForType(item.type)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              fontSize: 14,
              color: Colors.MIDNIGHT,
              marginBottom: 4
            }}>
              {item.title}
            </div>
            {item.description && (
              <div style={{ 
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                fontSize: 12,
                color: Colors.GREY_COLOR,
                marginBottom: item.date ? 4 : 0
              }}>
                {item.description}
              </div>
            )}
            {item.date && (
              <div style={{ 
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                fontSize: 11,
                color: Colors.GREY_COLOR
              }}>
                {item.date}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
