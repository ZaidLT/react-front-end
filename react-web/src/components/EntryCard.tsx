import React from "react";
import { INote } from "../util/types";
import { Colors, Typography } from "../styles";
import CustomText from "./CustomText";

interface EntryCardProps extends Partial<INote> {
  onClick: () => void;
}

const EntryCard: React.FC<EntryCardProps> = ({
  title,
  description,
  isPinned,
  isSecure,
  members,
  pictures,
  onClick
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        width: "100%",
        minHeight: "60px",
        padding: "8px 20px",
        borderRadius: "6px",
        gap: "10px",
        backgroundColor: Colors.WHITE,
        boxShadow: "0px 6px 5px rgba(150, 137, 180, 0.2)",
        marginBottom: "5px"
      }}
    >
      <div
        onClick={onClick}
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          flexDirection: "row",
          height: "100%",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            justifyContent: "center",
            alignSelf: "center",
            flex: 1,
          }}
        >
          <CustomText
            style={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
              color: Colors.BLUE,
            }}
          >
            {title}
          </CustomText>
          <CustomText
            style={{
              fontSize: Typography.FONT_SIZE_12,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              color: Colors.GREY_COLOR,
            }}
          >
            {description}
          </CustomText>
        </div>

        <div
          style={{
            justifyContent: "center",
            alignSelf: "center",
            display: "flex",
            flexDirection: "row",
            gap: "5px",
          }}
        >
          {isSecure && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.6667 6.33333H2.33333C1.59695 6.33333 1 6.93028 1 7.66666V11.6667C1 12.403 1.59695 13 2.33333 13H11.6667C12.403 13 13 12.403 13 11.6667V7.66666C13 6.93028 12.403 6.33333 11.6667 6.33333Z" stroke={Colors.BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.66667 6.33333V3.66667C3.66667 2.95942 3.94762 2.28115 4.44772 1.78105C4.94781 1.28095 5.62609 1 6.33333 1C7.04058 1 7.71885 1.28095 8.21895 1.78105C8.71905 2.28115 9 2.95942 9 3.66667V6.33333" stroke={Colors.BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          
          {members && members.length > 0 && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.91667 12.25V11.0833C9.91667 10.4645 9.67076 9.871 9.23318 9.43342C8.7956 8.99584 8.20207 8.74992 7.58333 8.74992H3.08333C2.4646 8.74992 1.87107 8.99584 1.43349 9.43342C0.995909 9.871 0.75 10.4645 0.75 11.0833V12.25" stroke={Colors.BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5.33333 6.41667C6.62417 6.41667 7.66667 5.37417 7.66667 4.08333C7.66667 2.7925 6.62417 1.75 5.33333 1.75C4.0425 1.75 3 2.7925 3 4.08333C3 5.37417 4.0425 6.41667 5.33333 6.41667Z" stroke={Colors.BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.25 12.25V11.0833C13.2496 10.5659 13.0692 10.0632 12.7368 9.65507C12.4044 9.24696 11.9401 8.95639 11.4292 8.83325" stroke={Colors.BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9.08333 1.83325C9.59517 1.95591 10.0605 2.24647 10.3937 2.65497C10.727 3.06348 10.9077 3.56686 10.9077 4.08492C10.9077 4.60297 10.727 5.10635 10.3937 5.51486C10.0605 5.92336 9.59517 6.21392 9.08333 6.33659" stroke={Colors.BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          
          {isPinned && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill={Colors.BLUE} xmlns="http://www.w3.org/2000/svg">
              <path d="M9.91683 5.25008L8.75016 1.75008M8.75016 1.75008L5.25016 2.91675M8.75016 1.75008L12.2502 5.25008M4.0835 9.91675L5.25016 13.4167M5.25016 13.4167L8.75016 12.2501M5.25016 13.4167L1.75016 9.91675M1.75016 1.75008L12.2502 12.2501" stroke={Colors.BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          
          {pictures && pictures.length > 0 && (
            <img 
              src={pictures[0]} 
              alt="Note thumbnail" 
              style={{ 
                width: "40px", 
                height: "40px", 
                borderRadius: "10px",
                objectFit: "cover" 
              }} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EntryCard;
