import React, { useEffect, useRef, useState, useCallback } from "react";
import { Colors } from "../styles";
import { ISnackbar } from "../util/types";

// Hook to detect mobile screen size
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  return isMobile;
};

interface SnackbarProps {
  snackbar: ISnackbar;
  onClose: (id: string) => void;
}

interface IVariantMap {
  [key: string]: {
    borderColor: string;
    backgroundColor: string;
    iconComponent: JSX.Element;
  }
}

const Snackbar: React.FC<SnackbarProps> = ({ snackbar, onClose }) => {
  const [opacity, setOpacity] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();

  const variantMap: IVariantMap = {
    success: {
      borderColor: '#17B97F',
      backgroundColor: '#E8F8F2',
      iconComponent: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#17B97F"/>
        </svg>
      )
    },
    error: {
      borderColor: '#CD328F',
      backgroundColor: '#FFF6FC',
      iconComponent: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#CD328F"/>
        </svg>
      )
    },
    warning: {
      borderColor: '#EBB323',
      backgroundColor: '#FFF6E0',
      iconComponent: (
        <span style={{ fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          🚧
        </span>
      )
    },
    syncing: {
      borderColor: '#CCCFDC',
      backgroundColor: '#FFF',
      iconComponent: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4V1L8 5L12 9V6C15.31 6 18 8.69 18 12C18 13.01 17.75 13.97 17.3 14.8L18.76 16.26C19.54 15.03 20 13.57 20 12C20 7.58 16.42 4 12 4ZM12 18C8.69 18 6 15.31 6 12C6 10.99 6.25 10.03 6.7 9.2L5.24 7.74C4.46 8.97 4 10.43 4 12C4 16.42 7.58 20 12 20V23L16 19L12 15V18Z" fill="#666"/>
        </svg>
      )
    },
    info: {
      borderColor: '#2A46BE',
      backgroundColor: '#F0F3FF',
      iconComponent: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="#2A46BE"/>
        </svg>
      )
    }
  };

  const handleClose = useCallback(() => {
    // Fade out animation
    setOpacity(0);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Small delay to allow fade out animation
    setTimeout(() => {
      onClose(snackbar.id);
    }, 300);
  }, [snackbar.id, onClose]);

  useEffect(() => {
    // Fade in animation
    setOpacity(1);
    
    // Set timeout for auto-dismissal
    timeoutRef.current = setTimeout(() => {
      handleClose();
    }, snackbar.duration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [snackbar.duration, handleClose]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "400px",
        minHeight: "64px",
        borderRadius: "8px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: variantMap[snackbar.type].borderColor,
        backgroundColor: variantMap[snackbar.type].backgroundColor,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        gap: "12px",
        opacity: opacity,
        transition: "opacity 300ms ease-in-out",
        marginBottom: "10px",
        boxSizing: "border-box",
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "24px",
        height: "24px",
        flexShrink: 0,
      }}>
        {variantMap[snackbar.type].iconComponent}
      </div>
      
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        flex: 1,
        fontSize: "14px",
        lineHeight: "1.4",
        wordBreak: "break-word",
        overflowWrap: "break-word",
      }}>
        {snackbar.message}
      </div>
      
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "24px",
        height: "24px",
        flexShrink: 0,
      }}>
        <button 
          onClick={handleClose}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "24px",
            height: "24px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill={Colors.MIDNIGHT}/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Snackbar;
