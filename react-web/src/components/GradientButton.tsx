'use client';

import React from 'react';
import './GradientButton.css';

interface GradientButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  text,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  style = {}
}) => {
  return (
    <button
      className={`gradient-button ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
    >
      {loading ? 'Loading...' : text}
    </button>
  );
};

export default GradientButton;
