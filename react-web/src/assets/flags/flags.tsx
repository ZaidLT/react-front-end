import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { FLAGS_MAPPED } from "./flagsMapped";
import flagsXML from "./flags-images";

// Define types that were previously imported from @util/types
interface IconsProps {
  style?: React.CSSProperties;
}

interface IconsMap {
  [key: string]: string;
}

interface FlagProps extends IconsProps {
  name: keyof typeof FLAGS_MAPPED;
  width?: number;
  height?: number;
  color?: string;
}

const Flag: FC<FlagProps> = ({
  name,
  width = 24,
  height = 24,
  color = "",
  style,
}) => {
  const [icons, setIcons] = useState<IconsMap>({});

  const fetchIcons = useCallback(() => {
    if (flagsXML) {
      // Extract all <symbol> tags using regex and store them in a map
      const regex = /<symbol id="([^"]+)"[^>]*>(.*?)<\/symbol>/gs;
      let match;
      const iconsMap: IconsMap = {};

      while ((match = regex.exec(flagsXML.toString())) !== null) {
        const id = match[1];
        iconsMap[id] = match[0];
      }

      setIcons(iconsMap);
    }
  }, []);

  useEffect(() => {
    fetchIcons();
  }, [fetchIcons]);

  // Get the icon's SVG content from the icons map
  const svgContent = useMemo(() => icons[FLAGS_MAPPED[name]], [icons, name]);

  // If the icon isn't found, return null
  if (!svgContent) return null;

  // Replace "currentColor" with the specified color
  const coloredIcon = color ? svgContent.replace(/currentColor/g, color) : svgContent;

  // For React Web, we'll use dangerouslySetInnerHTML to render the SVG
  return (
    <div 
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
      data-flag-name={name}
    >
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 24 24" 
        dangerouslySetInnerHTML={{ __html: coloredIcon }}
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
};

export default Flag;