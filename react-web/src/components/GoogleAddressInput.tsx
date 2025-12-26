'use client';

import React, { useEffect, useState } from "react";
import { Colors, Typography } from "../styles";
import HouseDetailItem, { IHouseDetailItem } from "./HouseDetailItem";
import Icon from "./Icon";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ICONS_MAP } from "./IconsMapped";
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { useLanguageContext } from "../context/LanguageContext";

// Define a simple interface for form data
interface IFormData {
  state?: string;
  zipcode?: string;
}

// Google Places API Key - In a real app, this should be in an environment variable
const GooglePlaceKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY || '';

const GoogleAddressInput: React.FC<IHouseDetailItem> = ({
  content,
  editingEnabled,
  isButton,
  onPress,
  ...textInputProps
}) => {
  const handleChange = (description: string) => {
    if (content.onChange) {
      content.onChange(description);
    }
  };

  const [addressData, setAddressData] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [stateData, setStateData] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [zipcodeData, setZipcodeData] = useState("");
  const [formData, setFormData] = useState<IFormData>({
    state: "",
    zipcode: "",
  });

  // Get the language context
  const { i18n } = useLanguageContext();

  // Mock function to decode URI - in a real app, this would be imported from helpers
  const uriDecode = (str: string) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return { address: "", state: "" };
    }
  };

  // Mock account data - in a real app, this would come from a context or store
  const account = {
    HouseDetails_Data: null
  };

  useEffect(() => {
    if (account?.HouseDetails_Data) {
      try {
        const parsedData = uriDecode(
          decodeURIComponent(account.HouseDetails_Data)
        );
        setAddressData(parsedData.address);
        setFormData({
          ...formData,
          state: parsedData.state,
        });
      } catch (error) {
        console.error("Failed to parse HouseDetails_Data:", error);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <div>
      {editingEnabled ? (
        <div
          style={{
            borderBottom: "1px solid #E3E3EF",
            borderRadius: "5px",
            padding: "2px",
          }}
        >
          <div style={{ position: "absolute", top: "10px" }}>{content.icon}</div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "10px",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div style={{ marginLeft: "30px", width: "100%" }}>
              {GooglePlaceKey ? (
                <GooglePlacesAutocomplete
                  apiKey={GooglePlaceKey}
                  selectProps={{
                    value: { label: content.value || "", value: content.value || "" },
                    onChange: (data: any) => {
                      // Extract address components
                      const addressComponents = data.value.terms;
                      if (addressComponents && addressComponents.length > 0) {
                        // Get state and zip from address components
                        const state = addressComponents.length > 1 ? addressComponents[addressComponents.length - 2].value : "";
                        const zip = addressComponents.length > 0 ? addressComponents[addressComponents.length - 1].value : "";

                        setStateData(state);
                        setZipcodeData(zip);

                        // Create address without state and zip
                        const addressWithoutStateZip = addressComponents
                          .slice(0, -2)
                          .map((component: any) => component.value)
                          .join(", ");

                        setAddressData(addressWithoutStateZip);
                        handleChange(addressWithoutStateZip);
                      } else {
                        handleChange(data.label);
                      }
                    },
                    placeholder: "Address",
                    styles: {
                      control: (provided: any) => ({
                        ...provided,
                        border: "none",
                        boxShadow: "none",
                        fontSize: Typography.FONT_SIZE_16,
                        fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                        color: Colors.GREY_COLOR,
                      }),
                      input: (provided: any) => ({
                        ...provided,
                        padding: 0,
                        margin: 0,
                      }),
                      option: (provided: any) => ({
                        ...provided,
                        fontSize: Typography.FONT_SIZE_16,
                        fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                      }),
                    },
                  }}
                />
              ) : (
                <input
                  style={{
                    width: "100%",
                    border: "none",
                    outline: "none",
                    fontSize: Typography.FONT_SIZE_16,
                    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                    color: Colors.GREY_COLOR,
                    padding: "10px 0",
                  }}
                  placeholder={i18n.t('AddressGooglePlaces')}
                  value={content.value || ""}
                  onChange={(e) => handleChange(e.target.value)}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <HouseDetailItem
          content={{
            icon: <Icon name="location" width={24} height={24} color={Colors.GREY_COLOR} />,
            value: addressData,
          }}
          editingEnabled={false}
          placeholder={i18n.t("Home")}
        />
      )}
    </div>
  );
};

export default GoogleAddressInput;
