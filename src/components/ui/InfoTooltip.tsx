import { createPortal } from "react-dom";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Info } from "lucide-react";

interface TooltipPortalProps {
  children: React.ReactNode;
  position: {
    top: number;
    left: number;
  };
}

const TooltipPortal: React.FC<TooltipPortalProps> = ({ children, position }) => {
  const [tooltipElement, setTooltipElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = document.createElement("div");
    element.style.position = "absolute";
    element.style.top = `${position.top}px`;
    element.style.left = `${position.left}px`;
    element.style.pointerEvents = "none";
    document.body.appendChild(element);
    setTooltipElement(element);

    return () => {
      if (tooltipElement) {
        document.body.removeChild(tooltipElement);
      }
    };
  }, [position]);

  if (!tooltipElement) return null;
  return createPortal(children, tooltipElement);
};

export interface InfoTooltipProps {
  content: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const iconRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const showTooltip = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top - 8, // Position above the icon
        left: rect.left + rect.width / 2, // Horizontally centered
      });
    }
    setIsVisible(true);
  };

  const hideTooltip = () => setIsVisible(false);

  return (
    <div
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      className="relative flex flex-col items-center"
      aria-describedby="tooltip"
    >
      <div ref={iconRef}>
        <Info
          size={16}
          className="text-gray-400 cursor-help transition-colors duration-200 hover:text-gray-200"
          aria-label="Information"
        />
      </div>

      <AnimatePresence>
        {isVisible && (
          <TooltipPortal position={tooltipPosition}>
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50"
              style={{ transform: "translateX(-50%) translateY(50%)" }}
            >
              <motion.div
                className="relative text-center p-2 text-md leading-none text-white bg-black bg-opacity-90 shadow-lg rounded-md min-w-[200px] max-w-xs backdrop-blur-sm"
                role="tooltip"
                id="tooltip"
              >
                {content}
              </motion.div>
            </motion.div>
          </TooltipPortal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InfoTooltip;
