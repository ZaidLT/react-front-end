'use client';

import React from 'react';
import { Colors, Typography } from '../styles';
import { useRouter } from 'next/navigation';
import CustomText from './CustomText';
import Toggle from './Toggle';
import Icon from './Icon';

interface NavHeaderProps {
  isOverlay?: boolean;
  paddingTop?: number;
  headerText?: string;
  fill?: string;
  left?: {
    text?: string;
    goBack?: boolean;
    onPress?: () => void;
  };
  right?: {
    key: string;
    icon: React.ReactNode;
    onPress: () => void;
    toggle?: {
      isToggled: boolean;
      setIsToggled: React.Dispatch<React.SetStateAction<boolean>>;
    };
  }[];
}

/**
 * NavHeader - A component for navigation headers
 *
 * This component displays a navigation header with optional back button,
 * title, and right-side actions including toggle switches.
 *
 * @param isOverlay - Whether the header is displayed as an overlay
 * @param paddingTop - Optional top padding
 * @param headerText - Optional header text
 * @param fill - Optional fill color for icons
 * @param left - Configuration for the left side of the header
 * @param right - Configuration for the right side of the header
 */
const NavHeader: React.FC<NavHeaderProps> = ({
  isOverlay,
  paddingTop,
  left,
  right,
  headerText,
  fill,
}) => {
  const router = useRouter();

  return (
    <div
      style={{
        ...(isOverlay ? styles.overlayContainer : styles.container),
        ...(paddingTop ? { paddingTop } : { paddingTop: 0 }),
        zIndex: 100,
      }}
    >
      {left ? (
        left.goBack ? (
          <div
            onClick={() => {
              left.onPress ? left.onPress() : left.goBack && router.back();
            }}
            style={{
              width: headerText ? '15%' : '85%',
              height: '50px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '10px',
              minWidth: '50px',
              backgroundColor: 'transparent',
              border: 'none',
              // Temporary debugging - remove after testing
              // backgroundColor: 'rgba(255, 0, 0, 0.1)',
            }}
          >
            <img
              src="/icons/icon-menu-back.svg"
              width={24}
              height={24}
              alt="Back"
              style={{ cursor: 'pointer' }}
            />
          </div>
        ) : (
          <div style={styles.buttonContainer}>
            <CustomText style={styles.backText}>{left.text}</CustomText>
          </div>
        )
      ) : (
        <div style={{ width: '15%' }}></div>
      )}

      {headerText && (
        <div style={styles.titleCenterContainer}>
          <CustomText numberOfLines={1} style={styles.backText}>
            <span suppressHydrationWarning>{headerText}</span>
          </CustomText>
        </div>
      )}

      <div
        style={{
          width: '15%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          height: '50px',
          gap: '10px',
          paddingRight: '20px',
        }}
      >
        {right &&
          right
            .sort((item) => (item?.toggle ? -1 : 1))
            .map((item) => {
              if (item?.toggle) {
                return (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '8px',
                    }}
                  >
                    {item.icon}
                    <div
                      onClick={() =>
                        item.toggle?.setIsToggled(!item.toggle.isToggled)
                      }
                    >
                      <Toggle
                        isActive={item.toggle.isToggled}
                        containerStyle={{
                          width: '40px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderColor: item.toggle.isToggled
                            ? Colors.PRIMARY_ELECTRIC_BLUE
                            : '#AAAAAA',
                          backgroundColor: item.toggle.isToggled
                            ? Colors.PRIMARY_ELECTRIC_BLUE
                            : '#AAAAAA',
                        }}
                        thumbStyle={{
                          width: '15px',
                          height: '15px',
                          backgroundColor: Colors.WHITE,
                          borderRadius: '30px',
                          margin: '0 2px',
                        }}
                      />
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={item.key}
                  onClick={item.onPress}
                  style={{
                    ...styles.buttonContainer,
                    cursor: 'pointer',
                  }}
                >
                  {item.icon}
                </div>
              );
            })}
      </div>
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  overlayContainer: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    top: '5vh',
    left: '5vw',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  backText: {
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
    fontWeight: 700,
    color: Colors.BLUE,
    textAlign: 'center',
  },
  titleCenterContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
};

export default NavHeader;
