'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import FloatingPlusMenu from './FloatingPlusMenu';

/**
 * FloatingActionButton - Plus button that opens the creation menu
 * Only displays when isMobile query param is not 'true'
 */
const FloatingActionButton: React.FC<{ className?: string }> = ({ className }) => {
  const searchParams = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if mobile flag is provided in query parameters
  const isMobileApp = searchParams.get('mobile') === 'true';

  // Don't show FAB only if mobile flag is explicitly set to true
  if (isMobileApp) {
    return null;
  }

  const handleOpenMenu = () => {
    setIsMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Plus/Minus Button - Always visible */}
      <button
        onClick={isMenuOpen ? handleCloseMenu : handleOpenMenu}
        className={`floating-action-button ${className || ''}`}
        aria-label={isMenuOpen ? "Close menu" : "Create new item"}
      >
        {/* Background button */}
        <img
          src="/icons/tab-bar/icon-tab-bar-plus-button.svg"
          alt="Button background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '54.857px',
            height: '64px',
          }}
        />
        {/* Plus or Minus icon overlay */}
        <img
          src={isMenuOpen ? "/icons/tab-bar/icon-tab-bar-minus-icon.svg" : "/icons/tab-bar/icon-tab-bar-plus-icon.svg"}
          alt={isMenuOpen ? "Minus icon" : "Plus icon"}
          style={{
            position: 'relative',
            zIndex: 1,
            width: '28px',
            height: '28px',
          }}
        />
      </button>

      {/* Plus Menu */}
      {isMenuOpen && (
        <FloatingPlusMenu onClose={handleCloseMenu} />
      )}

      <style jsx>{`
        .floating-action-button {
          position: fixed;
          bottom: 60px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 130;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: transform 0.2s ease;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
          display: flex;
          align-items: center;
          justify-content: center;
          width: 54.857px;
          height: 64px;
          flex-shrink: 0;
        }

        .floating-action-button:hover {
          transform: translateX(-50%) scale(1.05);
        }

        .floating-action-button:active {
          transform: translateX(-50%) scale(0.95);
        }

        .plus-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 125;
          backdrop-filter: blur(2px);
        }
      `}</style>
    </>
  );
};

export default FloatingActionButton;
