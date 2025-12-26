import React from 'react';

interface ThreeArrowsBendedProps {
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  position?: 'absolute' | 'relative' | 'fixed' | 'static';
  top?: string | number;
  bottom?: string | number;
  left?: string | number;
  right?: string | number;
}

const ThreeArrowsBended: React.FC<ThreeArrowsBendedProps> = ({
  color = '#333e73',
  width = 41,
  height = 48,
  className = '',
  style = {},
  position,
  top,
  bottom,
  left,
  right
}) => {
  const positionStyle: React.CSSProperties = {
    ...style,
    ...(position && { position }),
    ...(top !== undefined && { top }),
    ...(bottom !== undefined && { bottom }),
    ...(left !== undefined && { left }),
    ...(right !== undefined && { right })
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 41 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={positionStyle}
    >
      <g clipPath="url(#clip0_842_8847)">
        <path
          d="M17.3075 21.6086H19.0968C19.0624 21.0925 19.028 20.3699 19.028 19.4409C19.028 17.5828 19.1656 15.5871 19.4064 13.4538C21.3677 17.7892 23.157 21.5742 24.843 24.7398C26.529 27.9054 28.1806 30.5548 29.8322 32.6538C33.3763 37.2989 36.714 40.1892 39.8107 41.3591L40.3957 39.6731C37.7462 38.7097 34.6839 36.0258 31.1742 31.5871C28.3871 27.9398 24.9806 21.5742 20.9892 12.4559L25.9441 15.8968L26.9763 14.3828L19.7161 9.35914L18.2021 10.0473C17.4452 13.9011 17.1699 17.7548 17.3075 21.6086ZM17.5828 28.628C13.0064 22.1935 9.6344 15.2086 7.50107 7.70753C7.01935 6.12473 6.64085 4.64516 6.36558 3.26882C7.70752 4.4043 9.70322 6.19355 12.2839 8.60215L13.4882 7.32903C11.0796 4.92043 8.32687 2.47742 5.16128 -0.0344086L3.50967 0.275269L1.54838 11.5269L3.33763 11.8366L4.71397 4.12903C5.12687 5.91828 5.47096 7.29462 5.78064 8.18925C7.91397 15.8968 11.3548 23.0538 16.1032 29.6946C20.8172 36.3355 26.4602 41.9785 32.9978 46.5548L34.0645 45.1441C27.6301 40.6021 22.1247 35.0968 17.5828 28.628ZM4.33548 25.8753C5.98709 27.286 7.43225 28.5935 8.67096 29.8323L9.94408 28.5591C7.87956 26.4946 5.643 24.5333 3.19999 22.6409L1.47956 23.3978L-0.0344162 32.0344L1.68601 32.3441L2.64946 26.7355C4.54193 30.8301 6.88171 34.6839 9.66881 38.3312C12.4559 41.9785 15.6215 45.1441 19.0968 48L20.2323 46.5892C13.2129 40.8086 7.94838 33.9269 4.33548 25.8753Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_842_8847">
          <rect
            width="40.3957"
            height="48"
            fill="white"
            transform="matrix(-1 0 0 1 40.3957 0)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ThreeArrowsBended;
