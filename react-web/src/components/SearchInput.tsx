import React, { useState, useRef, useEffect } from 'react';
import { Colors, Typography } from '../styles';

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  autoFocus?: boolean;
  style?: React.CSSProperties;
  clearButtonMode?: 'never' | 'while-editing' | 'unless-editing' | 'always';
  disabled?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search...',
  value,
  onChangeText,
  onSubmit,
  onClear,
  autoFocus = false,
  style,
  clearButtonMode = 'always',
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleClear = () => {
    onChangeText('');
    if (onClear) onClear();
    // Keep focus on input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
    // Handle escape key to clear search
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  // Determine if clear button should be shown
  const shouldShowClearButton = () => {
    switch (clearButtonMode) {
      case 'never':
        return false;
      case 'while-editing':
        return isFocused && value.length > 0;
      case 'unless-editing':
        return !isFocused && value.length > 0;
      case 'always':
      default:
        return value.length > 0;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '40px',
        backgroundColor: Colors.WHITE,
        borderRadius: 4,
        padding: '0 10px',
        border: `1px solid ${isFocused ? Colors.BLUE : '#CFCFE0'}`,
        boxShadow: isFocused ? `0 0 0 1px ${Colors.BLUE}` : 'none',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'text',
        ...style,
      }}
      onClick={() => {
        if (!disabled && inputRef.current) {
          inputRef.current.focus();
        }
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => !disabled && onChangeText(e.target.value)}
        onFocus={() => !disabled && setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          backgroundColor: 'transparent',
          fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
          fontSize: 16, // Prevent iOS mobile zoom
          color: disabled ? Colors.GREY_COLOR : Colors.BLUE,
          cursor: disabled ? 'not-allowed' : 'text',
          height: '100%',
        }}
      />
      {shouldShowClearButton() && !disabled && (
        <button
          onClick={handleClear}
          type="button"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            borderRadius: '50%',
            transition: 'background-color 0.2s ease',
            marginLeft: '4px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = Colors.COSMIC;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Clear search"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={Colors.GREY_COLOR}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchInput;
