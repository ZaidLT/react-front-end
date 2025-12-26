import React from "react";
import { Colors, Typography } from "../styles";
import { IUserAvatarsGroupProps } from "../util/types";
import CustomText from "./CustomText";
import { getInitials } from "../util/helpers";

const UserAvatarsGroup: React.FC<IUserAvatarsGroupProps> = ({
  users,
  size,
  style,
}) => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      columnGap: "-15px",
      ...style
    }}>
      {users.slice(0, size).map((user, index) => {
        return (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              height: "40px",
              width: "40px",
              alignSelf: "flex-start",
              marginRight: "-15px",
              zIndex: users.length - index, // Higher z-index for earlier avatars
            }}
            key={`${user.UserId || user.FirstName}-${index}`}
          >
            {index + 1 === size && users.length > size ? (
              <div style={{
                backgroundColor: Colors.SECONDARY_PURPLE,
                border: "2px solid white",
                width: "100%",
                borderRadius: "1000px",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <CustomText style={{
                  color: Colors.WHITE,
                  fontSize: Typography.FONT_SIZE_12,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                }}>
                  {`+${users.length - (size - 1)}`}
                </CustomText>
              </div>
            ) : user?.AvatarImagePath ? (
              <img 
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "100px",
                  border: "2px solid white",
                  objectFit: "cover",
                }} 
                src={user.AvatarImagePath} 
                alt={`${user.FirstName} ${user.LastName}`} 
              />
            ) : (
              <div style={{
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: Colors.BLUE_GREY,
                borderRadius: "21px",
                border: "2px solid white",
              }}>
                {user?.FirstName && user?.LastName && (
                  <CustomText style={{
                    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                    fontWeight: Typography.FONT_WEIGHT_600,
                    color: Colors.BLACK,
                    fontSize: Typography.FONT_SIZE_10,
                  }}>
                    {getInitials({
                      FirstName: user.FirstName,
                      LastName: user.LastName,
                      Email: user.Email,
                    })}
                  </CustomText>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UserAvatarsGroup;
