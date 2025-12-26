'use client';

import React from 'react';

interface HexTileSvgProps {
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  type?: 'filled' | 'colored' | 'empty' | 'passive';
}

/**
 * HexTileSvg - A component that renders a hexagonal tile SVG
 *
 * This component replaces the imported SVG files to avoid filter ID conflicts
 * and ensure consistent rendering across the application.
 *
 * @param width - The width of the SVG
 * @param height - The height of the SVG
 * @param style - Additional styles to apply to the SVG
 * @param type - The type of hex tile to render (filled, colored, or empty)
 */
const HexTileSvg: React.FC<HexTileSvgProps> = ({
  width = 80,
  height = 94,
  style = {},
  type = 'filled',
}) => {
  // Calculate the viewBox based on the type
  const getViewBox = () => {
    switch (type) {
      case 'colored':
        return "0 0 137 153";
      case 'filled':
      case 'passive':
        return "0 0 92 105";
      case 'empty':
      default:
        return "0 0 92 105";
    }
  };

  // Render the appropriate SVG based on the type
  const renderSvgContent = () => {
    switch (type) {
      case 'colored':
        // Colored hex tile with no border
        return (
          <>
            <path
              d="M126.853 103.495C126.853 107.121 124.906 110.467 121.754 112.258L73.3775 139.744C70.2901 141.498 66.5074 141.498 63.42 139.744L15.0439 112.258C11.8917 110.467 9.94435 107.121 9.94435 103.495L9.94436 48.8185C9.94436 45.193 11.8917 41.8469 15.0439 40.0559L63.42 12.5695C66.5074 10.8153 70.2902 10.8153 73.3776 12.5695L121.754 40.0559C124.906 41.8469 126.853 45.1931 126.853 48.8186L126.853 103.495Z"
              fill={`url(#gradient-${width}-${height})`}
              stroke="#000E50"
              strokeWidth="1.34378"
            />
            <defs>
              <linearGradient id={`gradient-${width}-${height}`} x1="9.27249" y1="33.6388" x2="117.933" y2="148.01" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6FF9D8"/>
                <stop offset="1" stopColor="#C3B7FF"/>
              </linearGradient>
            </defs>
          </>
        );
      case 'filled':
        // Filled hex tile with shadow
        return (
          <>
            <path
              d="M84.9928 23.4051L47.9928 2.14507C46.7589 1.43605 45.2411 1.43605 44.0072 2.14507L7.00717 23.4051C5.76553 24.1186 5 25.4414 5 26.8734V70.322C5 71.754 5.76553 73.0768 7.00717 73.7903L44.0072 95.0503C45.2411 95.7594 46.7589 95.7594 47.9928 95.0503L84.9928 73.7903C86.2345 73.0768 87 71.754 87 70.322V26.8734C87 25.4414 86.2345 24.1186 84.9928 23.4051Z"
              fill="white"
              filter={`url(#shadow-${width}-${height})`}
            />
            <path
              d="M84.9928 23.4051L47.9928 2.14507C46.7589 1.43605 45.2411 1.43605 44.0072 2.14507L7.00717 23.4051C5.76553 24.1186 5 25.4414 5 26.8734V70.322C5 71.754 5.76553 73.0768 7.00717 73.7903L44.0072 95.0503C45.2411 95.7594 46.7589 95.7594 47.9928 95.0503L84.9928 73.7903C86.2345 73.0768 87 71.754 87 70.322V26.8734C87 25.4414 86.2345 24.1186 84.9928 23.4051Z"
              stroke="#DEF7F6"
              strokeWidth="2"
            />
            <defs>
              <filter id={`shadow-${width}-${height}`} x="0" y="0.613312" width="92" height="103.969" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.766979 0 0 0 0 0.925 0 0 0 0 0.918679 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
              </filter>
            </defs>
          </>
        );
      case 'passive':
        // Passive member hex tile with lighter gray fill
        return (
          <>
            <path
              d="M84.9928 23.4051L47.9928 2.14507C46.7589 1.43605 45.2411 1.43605 44.0072 2.14507L7.00717 23.4051C5.76553 24.1186 5 25.4414 5 26.8734V70.322C5 71.754 5.76553 73.0768 7.00717 73.7903L44.0072 95.0503C45.2411 95.7594 46.7589 95.7594 47.9928 95.0503L84.9928 73.7903C86.2345 73.0768 87 71.754 87 70.322V26.8734C87 25.4414 86.2345 24.1186 84.9928 23.4051Z"
              fill="#f5f5f5"
              filter={`url(#shadow-passive-${width}-${height})`}
            />
            <path
              d="M84.9928 23.4051L47.9928 2.14507C46.7589 1.43605 45.2411 1.43605 44.0072 2.14507L7.00717 23.4051C5.76553 24.1186 5 25.4414 5 26.8734V70.322C5 71.754 5.76553 73.0768 7.00717 73.7903L44.0072 95.0503C45.2411 95.7594 46.7589 95.7594 47.9928 95.0503L84.9928 73.7903C86.2345 73.0768 87 71.754 87 70.322V26.8734C87 25.4414 86.2345 24.1186 84.9928 23.4051Z"
              stroke="#d0d0d0"
              strokeWidth="2"
            />
            <defs>
              <filter id={`shadow-passive-${width}-${height}`} x="0" y="0.613312" width="92" height="103.969" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.8 0 0 0 0 0.8 0 0 0 0 0.8 0 0 0 0.15 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
              </filter>
            </defs>
          </>
        );
      case 'empty':
      default:
        // Empty hex tile with dashed border and transparent background
        // Use the exact same geometry and shadow as the filled tile so it occupies the same size
        return (
          <>
            <defs>
              {/* Drop shadow identical to filled tile */}
              <filter id={`shadow-empty-${width}-${height}`} x="0" y="0.613312" width="92" height="103.969" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.766979 0 0 0 0 0.925 0 0 0 0 0.918679 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
              </filter>
              <linearGradient id={`paint0_linear_empty_${width}_${height}`} x1="9.27249" y1="33.6388" x2="117.933" y2="148.01" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6FF9D8"/>
                <stop offset="1" stopColor="#C3B7FF"/>
              </linearGradient>
            </defs>
            {/* Filled area with drop shadow (same geometry as filled) */}
            <path
              d="M84.9928 23.4051L47.9928 2.14507C46.7589 1.43605 45.2411 1.43605 44.0072 2.14507L7.00717 23.4051C5.76553 24.1186 5 25.4414 5 26.8734V70.322C5 71.754 5.76553 73.0768 7.00717 73.7903L44.0072 95.0503C45.2411 95.7594 46.7589 95.7594 47.9928 95.0503L84.9928 73.7903C86.2345 73.0768 87 71.754 87 70.322V26.8734C87 25.4414 86.2345 24.1186 84.9928 23.4051Z"
              fill="white"
              fillOpacity="0.4"
              filter={`url(#shadow-empty-${width}-${height})`}
            />
            {/* Dashed border overlay */}
            <path
              d="M84.9928 23.4051L47.9928 2.14507C46.7589 1.43605 45.2411 1.43605 44.0072 2.14507L7.00717 23.4051C5.76553 24.1186 5 25.4414 5 26.8734V70.322C5 71.754 5.76553 73.0768 7.00717 73.7903L44.0072 95.0503C45.2411 95.7594 46.7589 95.7594 47.9928 95.0503L84.9928 73.7903C86.2345 73.0768 87 71.754 87 70.322V26.8734C87 25.4414 86.2345 24.1186 84.9928 23.4051Z"
              stroke={`url(#paint0_linear_empty_${width}_${height})`}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="5 5"
            />
          </>
        );
    }
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={getViewBox()}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      {renderSvgContent()}
    </svg>
  );
};

export default HexTileSvg;
