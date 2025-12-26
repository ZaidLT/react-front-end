import React from "react";

interface OnboardingWrapperProps {
  mainContent: React.ReactNode;
  footerContent?: React.ReactNode;
  hideFooter?: boolean;
  pb?: string | number;
  imgSource?: string;
}

/**
 * OnboardingWrapper - A component for wrapping onboarding screens
 * 
 * This component provides a consistent layout for onboarding screens with a
 * background image, main content area, and optional footer.
 * 
 * @param mainContent - The main content to display
 * @param footerContent - Optional footer content
 * @param hideFooter - Whether to hide the footer
 * @param pb - Optional padding bottom
 * @param imgSource - Optional custom background image source
 */
const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({
  mainContent,
  footerContent,
  hideFooter,
  pb,
  imgSource,
}) => {
  return (
    <div style={styles.container} onClick={() => document.activeElement instanceof HTMLElement && document.activeElement.blur()}>
      <div style={styles.scrollContainer}>
        <div
          style={{
            ...styles.backgroundContent,
            paddingBottom: pb !== undefined ? pb : '12vh',
            backgroundImage: `url(${imgSource || '/assets/gradient-bg.png'})`,
          }}
        >
          {mainContent}
        </div>
      </div>
      {!hideFooter && <div style={styles.textContent}>{footerContent}</div>}
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100vh",
  },
  scrollContainer: {
    width: "100%",
    flex: 1,
    overflowY: "auto",
  },
  backgroundContent: {
    flex: 1,
    width: "100%",
    minHeight: "calc(100vh - 100px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  textContent: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    height: "100px",
  },
};

export default OnboardingWrapper;
