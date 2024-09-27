// components/ui/TooltipPortal.tsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface TooltipPortalProps {
  children: React.ReactNode;
  position: {
    top: number;
    left: number;
  };
  isVisible: boolean; // New prop to control visibility
}

const TooltipPortal: React.FC<TooltipPortalProps> = ({ children, position, isVisible }) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const tooltipElement = document.createElement('div');
    tooltipElement.style.position = 'absolute';
    tooltipElement.style.pointerEvents = 'none'; // Allows clicks to pass through
    tooltipElement.style.zIndex = '1000'; // Ensures tooltip is above other elements
    tooltipRef.current = tooltipElement;
    document.body.appendChild(tooltipElement);

    return () => {
      if (tooltipRef.current) {
        document.body.removeChild(tooltipRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (tooltipRef.current) {
      tooltipRef.current.style.top = `${position.top}px`;
      tooltipRef.current.style.left = `${position.left}px`;
      tooltipRef.current.style.display = isVisible ? 'block' : 'none'; // Display or hide the tooltip
    }
  }, [position, isVisible]);

  if (!tooltipRef.current) return null;

  return createPortal(children, tooltipRef.current);
};

export default TooltipPortal;
