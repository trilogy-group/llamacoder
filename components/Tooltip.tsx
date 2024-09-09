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
          className="absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-md shadow-sm dark:bg-gray-700"
          style={{
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '0.5rem',
            whiteSpace: 'nowrap',
          }}
        >
          {content}
          <div
            className="absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45"
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