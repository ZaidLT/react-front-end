'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  
  // Update local state when auth state changes
  useEffect(() => {
    setHasValidUser(!!authUser && !!authUser.id);
  }, [authUser]);

  // Get user initials for avatar placeholder
  const getInitials = () => {
    if (!authUser || !authUser.id) return "UU";
    return `${authUser.firstName?.charAt(0) || "U"}${authUser.lastName?.charAt(0) || "U"}`;
  };

  // Generate a key based on the user data to force re-render when it changes
  const componentKey = authUser && authUser.id
    ? `user-${authUser.id}-${authUser.firstName}-${authUser.lastName}`
    : `no-user-${Date.now()}`;
    
  // Determine if we should show loading state
  const showLoading = isLoading || (!hasValidUser && isAuthenticated);

  return (
    <div key={componentKey} style={styles.container}>
      <div
        style={styles.profileContainer}
        onClick={() => router.push('/profile')}
      >
        <div style={styles.avatarContainer}>
          {showLoading ? (
            // Show loading placeholder
            <div style={styles.avatarPlaceholder}>
              <CustomText style={styles.avatarText}>...</CustomText>
            </div>
          ) : (
            <div style={styles.avatarPlaceholder}>
              <CustomText style={styles.avatarText}>{getInitials()}</CustomText>
            </div>
          )}
        </div>
        <div style={styles.profileTextContainer}>
          {showLoading ? (
            // Show loading state for name
            <CustomText
              style={{
                fontSize: 18,
                color: "#000728",
                fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
                lineHeight: "22px",
              }}
            >
              Loading...
            </CustomText>
          ) : (
            <>
              <CustomText
                style={{
                  fontSize: 18,
                  color: "#000728",
                  fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
                  lineHeight: "22px",
                }}
              >
                {(() => {
                  if (!authUser || !authUser.id) return "Unknown User";
                  const firstName = authUser.firstName || "Unknown";
                  const lastName = authUser.lastName || "User";
                  return `${firstName} ${lastName}`;
                })()}
              </CustomText>
              <CustomText
                style={{
                  fontSize: 16,
                  color: "#000728",
                  fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                  lineHeight: "22px",
                }}
              >
                {`${i18n.t("WelcomeBack")} 👋`}
              </CustomText>
            </>
          )}
        </div>
      </div>
      <div style={styles.searchAndNotificationContainer}>
        <div onClick={() => router.push(Routes.Search)} style={{ cursor: 'pointer' }}>
          <img 
              src="/icons/icon-search.svg" 
              width={24} 
              height={24} 
              alt={i18n.t('Search')} 
              style={{ cursor: 'pointer' }}
            />
        </div>
        {/* Notification bell can be added here if needed */}
      </div>
    </div>
  );
};

// Convert React Native StyleSheet to React Web inline styles
const styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: "80px",
  },
  profileContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: "10px",
    cursor: "pointer",
  },
  profileTextContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  avatarContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "50px",
    height: "50px",
  },
  avatarPlaceholder: {
    width: "52px",
    height: "52px",
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    backgroundColor: Colors.BLUE_GREY,
    borderRadius: "50%",
    fontSize: Typography.FONT_SIZE_10,
  },
  avatarText: {
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_600,
    color: Colors.BLACK,
  },
  searchAndNotificationContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
} as const;

export default PageHeader;
