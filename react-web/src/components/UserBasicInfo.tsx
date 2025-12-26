import React from "react";
import { Colors, Typography } from "../styles";
import { IUserBasicInfo } from "../util/types";
import { getInitials } from "../util/helpers";
import CustomText from "./CustomText";
import HexagonWithImage from "./HexagonWithImage";

const UserBasicInfo: React.FC<IUserBasicInfo> = ({
  name,
  message = null,
  listing,
  avatar,
  lastName,
  editAvatar,
  onEditAvatarPress,
  squiggles,
  circularProfilePhoto,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: listing ? "row" : "column",
        alignItems: "center",
        justifyContent: listing ? "flex-start" : "center",
        alignSelf: "center",
        width: "100%",
      }}
    >
      {listing && (
        avatar ? (
          <img 
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "100px",
              objectFit: "cover",
            }} 
            src={avatar} 
            alt={`${name} ${lastName}`} 
          />
        ) : (
          <div style={{
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: Colors.BLUE_GREY,
            borderRadius: "100px",
            fontSize: Typography.FONT_SIZE_10,
          }}>
            <CustomText style={{
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              fontWeight: Typography.FONT_WEIGHT_600,
              color: Colors.BLACK,
            }}>
              {getInitials({
                FirstName: name || "",
                LastName: lastName || "",
              })}
            </CustomText>
          </div>
        )
      )}

      {!listing && !circularProfilePhoto && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          width: "104px",
          height: "120px",
        }}>
          <HexagonWithImage
            size={100}
            imageUrl={avatar}
            backgroundColor={Colors.GRAY}
            text={avatar ? undefined : getInitials({
              FirstName: name || "",
              LastName: lastName || "",
            })}
          />

          {editAvatar && (
            <div
              onClick={onEditAvatarPress}
              style={{
                position: "absolute",
                right: "-10px",
                bottom: "15px",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                backgroundColor: Colors.LIGHT_GREY,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill={Colors.MIDNIGHT}/>
              </svg>
            </div>
          )}
        </div>
      )}

      {circularProfilePhoto && (
        <div style={{ position: "relative" }}>
          <img
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "100px",
              objectFit: "cover",
            }}
            src={circularProfilePhoto}
            alt={`${name} ${lastName}`}
          />
          
          {editAvatar && (
            <div 
              onClick={onEditAvatarPress}
              style={{ 
                position: "absolute", 
                right: "-10px", 
                bottom: "15px",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                backgroundColor: Colors.WHITE,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${Colors.LIGHT_GREY}`,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15.2C13.7673 15.2 15.2 13.7673 15.2 12C15.2 10.2327 13.7673 8.8 12 8.8C10.2327 8.8 8.8 10.2327 8.8 12C8.8 13.7673 10.2327 15.2 12 15.2Z" fill="black"/>
                <path d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z" fill="black"/>
              </svg>
            </div>
          )}
        </div>
      )}

      <div
        style={{
          marginLeft: listing ? "10px" : "0",
          alignItems: listing ? "flex-start" : "center",
          display: "flex",
          flexDirection: "column",
          textAlign: listing ? "left" : "center",
        }}
      >
        <CustomText
          style={{
            marginTop: listing ? "0" : "8px",
            fontSize: listing ? Typography.FONT_SIZE_16 : Typography.FONT_SIZE_18,
            fontFamily: listing ? Typography.FONT_FAMILY_POPPINS_MEDIUM : Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
            color: Colors.MIDNIGHT,
          }}
        >
          {name}
        </CustomText>

        {message && (
          <CustomText
            style={{
              fontSize: listing ? Typography.FONT_SIZE_12 : Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              color: Colors.MIDNIGHT,
              textAlign: listing ? "left" : "center",
            }}
          >
            {message}
          </CustomText>
        )}
        
        {squiggles && (
          <div style={{ marginTop: "-10px" }}>
            {squiggles}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBasicInfo;
