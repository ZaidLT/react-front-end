import React from 'react';
import { HexBackgroundType } from '../types';
import styles from './HexBackground.module.css';

interface HexBackgroundProps {
  /** Background variant type */
  variant?: HexBackgroundType;
}

/**
 * HexBackground - Internal component that renders the hexagon background SVG
 * This component is used internally by behavior components and is not exported publicly
 */
const HexBackground: React.FC<HexBackgroundProps> = ({ variant = HexBackgroundType.Light }) => {
  const backgroundSrc = variant === HexBackgroundType.Gradient
    ? '/backgrounds/hex-gradient-bg.svg'
    : '/backgrounds/hex-bg.svg';

  return (
    <img
      src={backgroundSrc}
      alt=""
      className={styles.background}
    />
  );
};

export default HexBackground;
