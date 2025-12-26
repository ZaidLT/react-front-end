'use client';

import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface PinchZoomProps {
  children: React.ReactNode;
}

/**
 * PinchZoom - Reusable pinch-to-zoom wrapper for any content
 *
 * Features:
 * - Pinch-to-zoom on mobile (touch gestures)
 * - Pinch-to-zoom on desktop trackpads
 * - Mouse wheel zoom on desktop (20% per scroll)
 * - Zoom range: 1x (fit) to 5x (zoomed)
 * - Pan enabled when zoomed in
 * - Double-tap to toggle zoom (zoom in when at 1x, zoom out to reset when zoomed)
 *
 * Usage:
 * ```tsx
 * <PinchZoom>
 *   <img src="..." alt="..." />
 * </PinchZoom>
 * ```
 *
 * Implementation:
 * - Wraps react-zoom-pan-pinch library
 * - Provides sensible defaults for mobile and desktop
 * - Zero configuration required
 *
 * @param children - Content to be zoomable (typically an image or div)
 */
const PinchZoom: React.FC<PinchZoomProps> = ({ children }) => {
  return (
    <TransformWrapper
      initialScale={1}
      minScale={1}
      maxScale={5}
      centerOnInit={true}
      wheel={{
        disabled: false,
        step: 0.2,
      }}
      panning={{ disabled: false }}
      doubleClick={{
        disabled: false,
        mode: 'toggle',
        step: 0.5,
      }}
      pinch={{ disabled: false }}
    >
      <TransformComponent
        wrapperStyle={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
        contentStyle={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        {children}
      </TransformComponent>
    </TransformWrapper>
  );
};

export default PinchZoom;
