import React from "react";
import { User } from "../util/types";
import { Colors, Typography } from "../styles";
import CustomText from "./CustomText";
import Button from "./Button";
import { useLanguageContext } from '../context/LanguageContext';

// Helper function to get initials from user's name
const getInitials = (user: User): string => {
  if (!user) return "";
  const firstInitial = user.FirstName ? user.FirstName.charAt(0) : "";
  const lastInitial = user.LastName ? user.LastName.charAt(0) : "";
  return `${firstInitial}${lastInitial}`;
};

interface IRowWrapperProps {
  isFullRowTouchable?: boolean;
  onPress?: () => void;
  paddingHorizontal?: number;
  children: React.ReactNode;
}

const RowWrapper: React.FC<IRowWrapperProps> = ({
  isFullRowTouchable,
  onPress,
  paddingHorizontal = 10,
  children
}) => {
  if (isFullRowTouchable) {
    return (
      <div
        onClick={() => {
          if (!!onPress) {
            onPress();
          }
        }}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "10px",
          paddingLeft: `${paddingHorizontal}px`,
          paddingRight: `${paddingHorizontal}px`,
          width: "100%",
          gap: "10px",
          cursor: "pointer",
        }}
      >
        {children}
      </div>
    );
  }
  
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "10px",
        paddingLeft: `${paddingHorizontal}px`,
        paddingRight: `${paddingHorizontal}px`,
        width: "100%",
        gap: "10px",
      }}
    >
      {children}
    </div>
  );
};

interface IMemberItemProps {
  user: User;
  isShowPermissionLevel?: boolean;
  isShowPermissionSelector?: boolean;
  isShowInviteButton?: boolean;
  contentOverride?: {
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
    text?: string;
  };
  onPress?: {
    rowPress?: () => void;
    buttonPress?: () => void;
  };
  paddingHorizontal?: number;
}

const MemberItem: React.FC<IMemberItemProps> = ({
  user,
  isShowPermissionLevel,
  isShowPermissionSelector,
  isShowInviteButton,
  contentOverride,
  onPress,
  paddingHorizontal
}) => {
  const { i18n } = useLanguageContext();

  if (!user) {
    return null;
  }

  const IconOverride = contentOverride?.icon;
  
  return (
    <RowWrapper
      isFullRowTouchable={!!onPress?.rowPress}
      onPress={onPress && (onPress?.rowPress || onPress?.buttonPress)}
      paddingHorizontal={paddingHorizontal}
    >
      {/* Avatar or Override */}
      {IconOverride ? (
        <div
          style={{
            width: "32px",
            height: "32px",
            overflow: "hidden",
          }}
        >
          <IconOverride height={32} width={32} />
        </div>
      ) : (
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "100px",
            overflow: "hidden",
          }}
        >
          {user.AvatarImagePath ? (
            <img
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              src={user.AvatarImagePath}
              alt={`${user.FirstName} ${user.LastName}`}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: Colors.BLUE_GREY,
                fontSize: Typography.FONT_SIZE_10,
              }}
            >
              <CustomText
                style={{
                  fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                  fontWeight: Typography.FONT_WEIGHT_600,
                  color: Colors.BLACK,
                }}
              >
                {getInitials(user)}
              </CustomText>
            </div>
          )}
        </div>
      )}

      {/* User Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <CustomText
          style={{
            color: "#000E50",
            fontSize: Typography.FONT_SIZE_16,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
          }}
        >
          {(contentOverride && contentOverride?.text)
            ? contentOverride.text
            : `${user.FirstName} ${user.LastName}`
          }
        </CustomText>
        {isShowPermissionLevel && (
          <CustomText
            style={{
              color: "#000E50",
              fontSize: Typography.FONT_SIZE_12,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            }}
          >
            {i18n.t('Admin')}
          </CustomText>
        )}
      </div>

      {/* Invite or Perm Select */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "center",
          flex: 1,
        }}
      >
        {isShowPermissionSelector ? (
          <svg 
            height={16} 
            width={16} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: "rotate(90deg)" }}
          >
            <path 
              d="M6 9L12 15L18 9" 
              stroke="#000E50" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        ) : isShowInviteButton ? (
          <Button
            textProps={{
              text: "Invite",
              color: "#000E50",
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              fontSize: Typography.FONT_SIZE_12,
            }}
            backgroundColor="transparent"
            borderProps={{
              color: "#000E50",
              radius: 8,
              width: 1,
            }}
            height={36}
            width={81}
            onButtonClick={() => {
              onPress?.buttonPress && onPress.buttonPress();
            }}
          />
        ) : null}
      </div>
    </RowWrapper>
  );
};

export default MemberItem;
