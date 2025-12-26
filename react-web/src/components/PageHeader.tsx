'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "../hooks/useRouterWithPersistentParams";
import { Routes } from "../util/types";
import { Colors, Typography } from "../styles";
import CustomText from "./CustomText";
import Icon from "./Icon";
import { useLanguageContext } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

interface PageHeaderProps {
  // Add any props if needed
}

const PageHeader: React.FC<PageHeaderProps> = () => {
  const router = useRouter();
  const { i18n } = useLanguageContext();
  const { user: authUser, isAuthenticated, isLoading } = useAuth();

  // Local state to track if we have valid user data
  const [hasValidUser, setHasValidUser] = useState(false);
  // Local state to track if we're in a loading state
  const [showLoadingState, setShowLoadingState] = useState(true);

  // Update local state when auth state changes
  useEffect(() => {
    // Check if we have a valid user with an ID
    const validUser = !!authUser && !!authUser.id;
    setHasValidUser(validUser);

    // Determine if we should show loading state
    // Show loading if:
    // 1. Auth context is loading, OR
    // 2. We're authenticated but don't have valid user data yet
    const shouldShowLoading = isLoading || (isAuthenticated && !validUser);
    setShowLoadingState(shouldShowLoading);

    if (process.env.NODE_ENV === 'development') {
      if (validUser) {
        console.log('PageHeader - Valid user data available');
      } else if (isAuthenticated) {
        console.log('PageHeader - Authenticated but no valid user data yet');
      }
    }
  }, [authUser, isAuthenticated, isLoading]);

  // Get user initials for avatar placeholder
  const getInitials = () => {
    if (!authUser || !authUser.id) return "UU";
    return `${authUser.firstName?.charAt(0) || "U"}${authUser.lastName?.charAt(0) || "U"}`;
  };

  // Debug user avatar data
  useEffect(() => {
    if (authUser && process.env.NODE_ENV === 'development') {
      console.log('🖼️ PageHeader - User avatar data:', {
        userId: authUser.id,
        firstName: authUser.firstName,
        lastName: authUser.lastName,
        avatarImagePath: authUser.avatarImagePath,
        hasAvatarImage: !!authUser.avatarImagePath,
        avatarImageType: typeof authUser.avatarImagePath,
        avatarImageLength: authUser.avatarImagePath?.length || 0
      });
    }
  }, [authUser]);

  // Generate a key based on the user data to force re-render when it changes
  const componentKey = authUser && authUser.id
    ? `user-${authUser.id}-${authUser.avatarImagePath || 'no-avatar'}`
    : `no-user-${Date.now()}`;

  return (
    <div key={componentKey} style={styles.mainContainer}>
      <div style={styles.innerContainer}>
        <div style={styles.profileContainer} onClick={() => router.push('/profile')}>
          <div style={styles.avatarContainer}>
            {showLoadingState ? (
              // Show loading placeholder
              <div style={styles.avatarPlaceholder}>
                <CustomText style={styles.avatarText}>...</CustomText>
              </div>
            ) : authUser?.avatarImagePath ? (
              // Show user avatar image
              <img
                src={authUser.avatarImagePath}
                alt="User Avatar"
                key={authUser.avatarImagePath}
                style={styles.avatarImage}
                onError={(e) => {
                  // Hide the image and show initials fallback
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            {/* Initials fallback - always present but hidden when image loads successfully */}
            <div
              style={{
                ...styles.avatarPlaceholder,
                display: (showLoadingState || !authUser?.avatarImagePath) ? 'flex' : 'none'
              }}
            >
              <CustomText style={styles.avatarText}>{getInitials()}</CustomText>
            </div>
          </div>
          <div style={styles.nameContainer}>
            {showLoadingState ? (
              // Show loading state for name
              <CustomText style={styles.welcomeText}>
                {i18n.t('LoadingEllipsis')}
              </CustomText>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CustomText style={styles.welcomeText}>
                  {i18n.t('Welcome')}
                </CustomText>
                <CustomText style={styles.nameText}>
                  {(() => {
                    if (!hasValidUser) return `${i18n.t('Unknown')}!`;
                    const firstName = authUser?.firstName || i18n.t('Unknown');
                    return `${firstName}!`;
                  })()}
                </CustomText>
              </div>
            )}
          </div>
        </div>

        <div style={styles.iconContainer}>
          <img
            src="/icons/icon-search.svg"
            width={24}
            height={24}
            alt={i18n.t('Search')}
            style={{ cursor: 'pointer' }}
            onClick={() => router.push(Routes.Search)}
          />
        </div>
      </div>
    </div>
  );
};

// Convert React Native StyleSheet to React Web inline styles
const styles = {
  mainContainer: {
    display: "flex",
    width: "100%",
    height: "45px",
    padding: "0 0.002px 1px 0",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  innerContainer: {
    display: "flex",
    width: "100%",
    padding: "4px 0",
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 0,
  },
  profileContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  avatarContainer: {
    display: "flex",
    width: "36px",
    height: "36px",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "36px",
    height: "36px",
    flexShrink: 0,
    borderRadius: "50%",
    objectFit: "cover" as const,
    strokeWidth: "0.72px",
    stroke: "#FFF",
  },
  avatarPlaceholder: {
    width: "36px",
    height: "36px",
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    backgroundColor: Colors.BLUE_GREY,
    borderRadius: "50%",
    fontSize: Typography.FONT_SIZE_10,
    strokeWidth: "0.72px",
    stroke: "#FFF",
  },
  avatarText: {
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_600,
    color: Colors.BLACK,
  },
  nameContainer: {
    display: "flex",
    height: "32px",
    paddingTop: "8px",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  welcomeText: {
    color: "#000E50",
    fontFamily: "Poppins",
    fontSize: "18px",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "120%",
  },
  nameText: {
    color: "#000E50",
    fontFamily: "Poppins",
    fontSize: "18px",
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "120%",
  },
  squiggleContainer: {
    width: "109px",
    height: "12px",
    flexShrink: 0,
  },
  iconContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
} as const;

export default PageHeader;
