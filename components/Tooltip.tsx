import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const childElement = childRef.current;
    if (childElement) {
      childElement.addEventListener('mouseenter', handleMouseEnter);
      childElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (childElement) {
        childElement.removeEventListener('mouseenter', handleMouseEnter);
        childElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div className="relative inline-block">
      <div ref={childRef}>
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-50 px-4 py-3 text-sm font-medium text-gray-800 bg-white rounded-md shadow-md border border-gray-200"
          style={{
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '0.5rem',
            maxWidth: '200px',
            width: 'max-content',
          }}
        >
          <div className="break-words text-xs">{content}</div>
          <div
            className="absolute w-2 h-2 bg-white transform rotate-45 border-l border-t border-gray-200"
            style={{
              top: '-0.25rem',
              left: '50%',
              marginLeft: '-0.25rem',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;