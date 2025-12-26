import React from "react";
import { Colors } from "../styles";
import LoadingSpinner from "./LoadingSpinner";

interface OAuthLoginButtonProps {
  name: string;
  Logo: React.ComponentType<{ height?: number; width?: number }>;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * OAuthLoginButton - A button for OAuth login providers
 *
 * This component displays a circular button with the logo of an OAuth provider.
 *
 * @param name - The name of the OAuth provider (e.g., "Google", "Facebook")
 * @param Logo - The logo component of the OAuth provider
 * @param onPress - Callback function when the button is clicked
 */
const OAuthLoginButton: React.FC<OAuthLoginButtonProps> = ({
  name,
  Logo,
  onPress,
  loading = false,
  disabled = false,
}) => {
  const handleClick = () => {
    // Don't do anything if the button is disabled
    if (disabled) return;

    // Track analytics event (commented out as we don't have Amplitude in the web version yet)
    // track("CLICKED: Login with social:" + name);
    console.log(`Clicked login with ${name}`);

    try {
      if (onPress) {
        console.log(`Calling onPress for ${name}`);
        onPress();
        console.log(`onPress for ${name} called successfully`);
      } else {
        console.warn(`No onPress handler for ${name}`);
      }
    } catch (error) {
      console.error(`Error in ${name} login button click handler:`, error);
    }
  };

  return (
    <button
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "56px",
        height: "56px",
        border: `1px solid ${disabled ? Colors.LIGHT_GREY : Colors.BLUE}`,
        borderRadius: "100%",
        backgroundColor: "transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        padding: 0,
        transition: "all 0.2s ease-in-out",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        opacity: disabled ? 0.6 : 1,
      }}
      onClick={handleClick}
      aria-label={`Login with ${name}`}
      disabled={disabled}
      onMouseOver={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
        }
      }}
      onMouseOut={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
        }
      }}
    >
      {loading ? (
        <LoadingSpinner
          size={24}
          borderWidth={2}
          color={disabled ? Colors.LIGHT_GREY : Colors.BLUE}
          trackColor="#E0E0E0"
        />
      ) : (
        <Logo height={24} width={24} />
      )}
    </button>
  );
};

export default OAuthLoginButton;
