'use client';

import React, { FC, useEffect, useState } from "react";
import { Colors } from "../styles";
import Flag from "../assets/flags/flags";
import ICON_MAPPING from "../assets/iconMapping";
import { ICONS_MAP } from "./IconsMapped";
import iconsXML from "../assets/eeva-icons";

// Import SVG files for common icons
import HouseIcon from "../assets/hive-icons/house.svg";
import TaskIcon from "../assets/hive-icons/task.svg";
import FlagCircleIcon from "../assets/hive-icons/flag_circle.svg";
import CalendarIcon from "../assets/hive-icons/calendar.svg";
import DateCalendarIcon from "../assets/hive-icons/date-calendar.svg";
import UserIcon from "../assets/hive-icons/user.svg";
import SearchIcon from "../assets/hive-icons/search.svg";
import SettingsIcon from "../assets/hive-icons/settings.svg";

// Map of directly imported SVG components
const IMPORTED_ICONS: Record<string, any> = {
  // Support both naming conventions for backward compatibility
  'house-icon': HouseIcon,
  'house': HouseIcon,
  'task': TaskIcon,
  'flag': FlagCircleIcon,
  'flag_circle': FlagCircleIcon,
  'calendar': CalendarIcon,
  'calendar-date': DateCalendarIcon,
  'user': UserIcon,
  'search': SearchIcon,
  'settings': SettingsIcon,
  // clock-alarm, alarm, family, family-icon, and eeva-logo are handled separately with inline SVG
};

// Cache for failed icon requests to prevent repeated 404 errors
const failedIconRequests = new Set<string>();

// Helper function to resolve SVG paths
const resolveSvgPath = (path: string): string | null => {
  // If we've already tried and failed to load this path, return null
  if (failedIconRequests.has(path)) {
    return null;
  }

  // We have several possible path formats, but we'll use specific ones based on the path type

  // Return the path that's most likely to work
  // For hive-icons, try both paths (with and without assets prefix)
  if (path.startsWith('hive-icons/')) {
    // First try without the assets prefix
    return `/${path}`;
  }

  // For category-icons, try both paths (with and without assets prefix)
  if (path.startsWith('category-icons/')) {
    // First try without the assets prefix
    return `/${path}`;
  }

  // For other paths, try both with and without the assets directory
  // First try without the assets prefix
  return `/${path}`;
};

interface IconProps {
  name: string;
  width?: number;
  height?: number;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}

interface IconsMap {
  [name: string]: string;
}

const Icon: FC<IconProps> = ({
  name,
  width = 24,
  height = 24,
  color = Colors.BLUE,
  style = {},
  className = "",
}) => {
  const [icons, setIcons] = useState<IconsMap>({});

  useEffect(() => {
    const fetchIcons = () => {
      if (iconsXML) {
        // Extract all <symbol> tags using regex and store them in a map
        const regex = /<symbol id="([^"]+)"[^>]*>(.*?)<\/symbol>/gs;
        let match;
        const iconsMap: IconsMap = {};

        while ((match = regex.exec(iconsXML.toString())) !== null) {
          const id = match[1];
          iconsMap[id] = match[0];
        }

        setIcons(iconsMap);
      }
    };

    fetchIcons();
  }, []);

  // Common wrapper for all icon types
  const IconWrapper = (children: React.ReactNode) => (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
      data-icon-name={name}
      className={className}
    >
      {children}
    </div>
  );

  // Render a placeholder with the icon name
  const renderPlaceholder = () => {
    // Log a warning for missing icons in development
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Icon not found: ${name}`);
    }

    return IconWrapper(
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={width} height={height} fill="transparent" />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill={color}
          fontSize="8px"
        >
          {name}
        </text>
      </svg>
    );
  };

  // First, check if this is a flag icon (country code)
  if (name.length === 2 && name === name.toUpperCase()) {
    return (
      <Flag
        name={name as any}
        width={width}
        height={height}
        color={color}
        style={style}
      />
    );
  }

  // Handle specific icon cases
  if (name === 'location') {
    return IconWrapper(
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 22C12 22 20 16 20 9C20 5.13401 16.4183 2 12 2C7.58172 2 4 5.13401 4 9C4 16 12 22 12 22Z"
          stroke={color}
          strokeWidth="1.5"
        />
        <circle
          cx="12"
          cy="9"
          r="3"
          stroke={color}
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (name === 'search-alt') {
    return IconWrapper(
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 15L17 17"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M17 9.5C17 5.35786 13.6421 2 9.5 2C5.35786 2 2 5.35786 2 9.5C2 13.6421 5.35786 17 9.5 17C13.6421 17 17 13.6421 17 9.5Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M17.361 19.1043C16.8797 18.6229 16.8797 17.8424 17.361 17.361C17.8424 16.8797 18.6229 16.8797 19.1043 17.361L21.639 19.8957C22.1203 20.3771 22.1203 21.1576 21.639 21.639C21.1576 22.1203 20.3771 22.1203 19.8957 21.639L17.361 19.1043Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (name === 'chevron-left') {
    return IconWrapper(
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline
          points="15 18 9 12 15 6"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === 'chevron-right') {
    return IconWrapper(
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline
          points="9 18 15 12 9 6"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Special case for clock-alarm icon
  if (name === 'clock-alarm' || name === 'alarm') {
    return IconWrapper(
      <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
        <path d="M12 7V12L15 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // Special case for eeva-logo icon
  if (name === 'eeva-logo') {
    return IconWrapper(
      <svg width={width} height={height} viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.7228 7.71701L44.0424 24.0747C45.9736 25.1902 48.3501 25.1902 50.2769 24.0747L58.5615 19.2909C60.4795 18.1842 60.4795 15.4153 58.5615 14.3086L35.8194 1.17392C33.1078 -0.391307 29.7658 -0.391307 27.0542 1.17392L15.7184 7.71701H15.7228Z" fill="#000E50"/>
        <path d="M0 21.8568C0 20.2915 0.418864 18.7836 1.17282 17.4741L27.085 32.4562C29.003 33.5629 29.003 36.3318 27.085 37.4385L1.17282 52.4206C0.418864 51.1111 0 49.6032 0 48.0379V21.8568Z" fill="#000E50"/>
        <path d="M4.3826 14.2643C3.0246 15.0491 1.93115 16.1646 1.17279 17.4741L15.7096 25.8822L31.4412 16.7995L15.7184 7.72119L4.3782 14.2687L4.3826 14.2643Z" fill="#17FCDB"/>
        <path d="M15.7228 62.1738L44.0424 45.8161C45.9736 44.7006 48.3501 44.7006 50.2769 45.8161L58.5615 50.6044C60.4795 51.7111 60.4795 54.48 58.5615 55.5867L35.8194 68.7169C33.1078 70.2822 29.7658 70.2822 27.0542 68.7169L15.7184 62.1738H15.7228Z" fill="#000E50"/>
        <path d="M4.3826 55.6263C3.0246 54.8414 1.93115 53.7303 1.17279 52.4164L15.7096 44.0083L31.4412 53.091L15.7184 62.1693L4.3782 55.6218L4.3826 55.6263Z" fill="#CCBFFF"/>
      </svg>
    );
  }

  // Special case for family icon
  if (name === 'family' || name === 'family-icon') {
    return IconWrapper(
      <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.3333 7.49998C21.7111 7.49998 22.0278 7.3722 22.2833 7.11665C22.5389 6.86109 22.6667 6.54442 22.6667 6.16665C22.6667 5.78887 22.5389 5.4722 22.2833 5.21665C22.0278 4.96109 21.7111 4.83331 21.3333 4.83331C20.9556 4.83331 20.6389 4.96109 20.3833 5.21665C20.1278 5.4722 20 5.78887 20 6.16665C20 6.54442 20.1278 6.86109 20.3833 7.11665C20.6389 7.3722 20.9556 7.49998 21.3333 7.49998ZM21.3315 8.83331C20.5755 8.83331 19.9423 8.57833 19.432 8.06838C18.9218 7.55842 18.6667 6.92652 18.6667 6.17268C18.6667 5.43361 18.9216 4.80339 19.4316 4.28201C19.9416 3.76066 20.5735 3.49998 21.3273 3.49998C22.0664 3.49998 22.6966 3.75941 23.218 4.27828C23.7393 4.79715 24 5.4272 24 6.16845C24 6.92451 23.7406 7.55767 23.2217 8.06791C22.7028 8.57818 22.0728 8.83331 21.3315 8.83331ZM12 6.16665C12.5556 6.16665 13.0278 5.97776 13.4167 5.59998C13.8056 5.2222 14 4.74442 14 4.16665C14 3.61109 13.8056 3.13887 13.4167 2.74998C13.0278 2.36109 12.5556 2.16665 12 2.16665C11.4222 2.16665 10.9444 2.36109 10.5667 2.74998C10.1889 3.13887 10 3.61109 10 4.16665C10 4.74442 10.1889 5.2222 10.5667 5.59998C10.9444 5.97776 11.4222 6.16665 12 6.16665ZM12.0015 7.49998C11.0655 7.49998 10.2756 7.17935 9.63203 6.53808C8.98846 5.89684 8.66667 5.10911 8.66667 4.17491C8.66667 3.25658 8.98729 2.47006 9.62853 1.81535C10.2698 1.16066 11.0575 0.833313 11.9917 0.833313C12.9101 0.833313 13.6966 1.15856 14.3513 1.80905C15.006 2.45953 15.3333 3.24488 15.3333 4.16508C15.3333 5.10117 15.0081 5.891 14.3576 6.53458C13.7071 7.17818 12.9218 7.49998 12.0015 7.49998ZM5.94873 13.3333C5.94873 14.1367 6.32138 15.0171 7.06667 15.9743C7.81198 16.9316 9.29403 18.4196 11.5128 20.4384L12 20.8743L12.5385 20.3615C14.6274 18.4726 16.0684 17.0288 16.8615 16.03C17.6547 15.0312 18.0513 14.1323 18.0513 13.3333C18.0513 12.622 17.8156 12.019 17.3442 11.5242C16.8728 11.0294 16.2914 10.782 15.6 10.782C15.1846 10.782 14.7914 10.8743 14.4205 11.0589C14.0496 11.2436 13.7325 11.4923 13.4692 11.8051L12.1 13.4487H11.8923L10.4974 11.8051C10.2342 11.4923 9.92094 11.2436 9.5577 11.0589C9.19446 10.8743 8.80856 10.782 8.4 10.782C7.67718 10.782 7.08793 11.0294 6.63227 11.5242C6.17658 12.019 5.94873 12.622 5.94873 13.3333ZM4.61537 13.3333C4.61537 12.3265 4.98546 11.4273 5.72563 10.6359C6.46581 9.84441 7.35727 9.44868 8.4 9.44868C9.05471 9.44868 9.66455 9.60423 10.2295 9.91535C10.7945 10.2265 11.2735 10.6316 11.6667 11.1307L12 11.5153L12.3333 11.1051C12.7436 10.623 13.2256 10.2265 13.7795 9.91535C14.3333 9.60423 14.9402 9.44868 15.6 9.44868C16.6256 9.44868 17.5128 9.84674 18.2615 10.6428C19.0103 11.439 19.3846 12.3358 19.3846 13.3333C19.3846 14.3743 18.9782 15.4372 18.1654 16.5218C17.3526 17.6064 15.7692 19.2231 13.4154 21.3718L12 22.6795L10.6359 21.4487C8.20341 19.2094 6.59187 17.5615 5.80127 16.5051C5.01067 15.4487 4.61537 14.3914 4.61537 13.3333ZM2.66667 7.49998C3.04444 7.49998 3.36111 7.3722 3.61667 7.11665C3.87222 6.86109 4 6.54442 4 6.16665C4 5.78887 3.87222 5.4722 3.61667 5.21665C3.36111 4.96109 3.04444 4.83331 2.66667 4.83331C2.28889 4.83331 1.97222 4.96109 1.71667 5.21665C1.46111 5.4722 1.33333 5.78887 1.33333 6.16665C1.33333 6.54442 1.46111 6.86109 1.71667 7.11665C1.97222 7.3722 2.28889 7.49998 2.66667 7.49998ZM12.1 23.5V22.1666H22.6667V13.6538C22.6667 13.4316 22.5855 13.2393 22.4231 13.0769C22.2607 12.9145 22.0684 12.8333 21.8462 12.8333H18.8359V11.5H21.8462C22.4385 11.5 22.9455 11.7109 23.3673 12.1327C23.7891 12.5545 24 13.0615 24 13.6538V22.4214C24 22.7319 23.8968 22.9893 23.6904 23.1936C23.484 23.3978 23.2282 23.5 22.9231 23.5H12.1ZM1.33333 22.1666H12.1V23.5H1.0769C0.771789 23.5 0.516022 23.3968 0.3096 23.1904C0.1032 22.984 0 22.7282 0 22.4231V13.6624C0 13.0601 0.206411 12.5491 0.619233 12.1294C1.03206 11.7098 1.54359 11.5 2.15383 11.5H5.1641V12.8333H2.15383C1.91452 12.8333 1.71794 12.9145 1.5641 13.0769C1.41026 13.2393 1.33333 13.4316 1.33333 13.6538V22.1666ZM2.66487 8.83331C1.9088 8.83331 1.27563 8.57833 0.765367 8.06838C0.255122 7.55842 0 6.92652 0 6.17268C0 5.43361 0.254978 4.80339 0.764933 4.28201C1.27489 3.76066 1.90679 3.49998 2.66063 3.49998C3.3997 3.49998 4.02992 3.75941 4.5513 4.27828C5.07266 4.79715 5.33333 5.4272 5.33333 6.16845C5.33333 6.92451 5.0739 7.55767 4.55503 8.06791C4.03617 8.57818 3.40611 8.83331 2.66487 8.83331Z" fill={color}/>
      </svg>
    );
  }

  // Check if we have a directly imported SVG component
  if (IMPORTED_ICONS[name]) {
    const IconComponent = IMPORTED_ICONS[name];
    return IconWrapper(
      <IconComponent
        width={width}
        height={height}
        style={{
          color: color,
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      />
    );
  }

  // Check if we have a mapping for this icon in our iconMapping.ts
  const iconMapping = ICON_MAPPING[name];
  if (iconMapping) {
    try {
      // Dynamically import the SVG file
      const svgPath = iconMapping.path;

      // Resolve the SVG path
      const fullPath = resolveSvgPath(svgPath);

      // If the path is null (already failed before), skip trying to load it
      if (fullPath === null) {
        return renderPlaceholder();
      }

      // Return an img element with the SVG file
      return IconWrapper(
        <img
          src={fullPath}
          alt={name}
          width={width}
          height={height}
          style={{
            maxWidth: '100%',
            maxHeight: '100%'
          }}
          onError={() => {
            // Add to failed requests cache
            failedIconRequests.add(svgPath);

            // Log the failure once in development
            if (process.env.NODE_ENV !== 'production') {
              console.warn(`Failed to load icon: ${name} from path: ${svgPath}`);
            }
          }}
        />
      );
    } catch (error) {
      console.error(`Error loading icon from mapping: ${name}`, error);
    }
  }

  // Check if the icon is in our ICONS_MAP from IconsMapped.tsx
  const iconId = ICONS_MAP[name as keyof typeof ICONS_MAP];
  if (iconId && icons[iconId] && typeof window !== 'undefined') {
    try {
      // Create an SVG element from the icon content
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 24 24">${icons[iconId]}</svg>`,
        'image/svg+xml'
      );
      const svgElement = svgDoc.documentElement;

      // Replace currentColor with the specified color
      const paths = svgElement.querySelectorAll('path');
      paths.forEach(path => {
        if (path.getAttribute('stroke') === 'currentColor') {
          path.setAttribute('stroke', color);
        }
        if (path.getAttribute('fill') === 'currentColor') {
          path.setAttribute('fill', color);
        }
      });

      // Convert the SVG element to a string
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);

      // Create a data URL from the SVG string
      const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;

      return IconWrapper(
        <img
          src={svgDataUrl}
          alt={name}
          width={width}
          height={height}
          style={{
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        />
      );
    } catch (error) {
      console.error(`Error loading icon: ${name}`, error);
    }
  }

  // Try to load the icon directly from the hive-icons directory as a last resort
  const directPath = `/hive-icons/${name}.svg`;

  // Also try with assets prefix as a fallback
  const assetsPrefixPath = `/assets/hive-icons/${name}.svg`;

  // Check if we've already tried and failed to load this icon
  if (failedIconRequests.has(`hive-icons/${name}.svg`)) {
    // If we're in the icon demo page, show a placeholder with the name
    if (typeof window !== 'undefined' && window.location.pathname.includes('icon-demo')) {
      return renderPlaceholder();
    }

    // For other pages, try to use a fallback icon
    if (IMPORTED_ICONS['task']) {
      const IconComponent = IMPORTED_ICONS['task'];
      return IconWrapper(
        <IconComponent
          width={width}
          height={height}
          style={{
            color: color,
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        />
      );
    }

    return renderPlaceholder();
  }

  // If the direct path has failed, try the assets path
  if (failedIconRequests.has(`hive-icons/${name}.svg`) && !failedIconRequests.has(`assets/hive-icons/${name}.svg`)) {
    try {
      return IconWrapper(
        <img
          src={assetsPrefixPath}
          alt={name}
          width={width}
          height={height}
          style={{
            maxWidth: '100%',
            maxHeight: '100%'
          }}
          onError={() => {
            // Add to failed requests cache
            failedIconRequests.add(`assets/hive-icons/${name}.svg`);

            // Log the failure once in development
            if (process.env.NODE_ENV !== 'production') {
              console.warn(`Failed to load icon: ${name} from assets path`);
            }
          }}
        />
      );
    } catch {
      return renderPlaceholder();
    }
  }

  // Try the direct path first
  try {
    return IconWrapper(
      <img
        src={directPath}
        alt={name}
        width={width}
        height={height}
        style={{
          maxWidth: '100%',
          maxHeight: '100%'
        }}
        onError={() => {
          // Add to failed requests cache
          failedIconRequests.add(`hive-icons/${name}.svg`);

          // Log the failure once in development
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`Failed to load icon: ${name} from direct path: ${directPath}`);
          }
        }}
      />
    );
  } catch {
    // Default fallback
    return renderPlaceholder();
  }
};

export default Icon;
