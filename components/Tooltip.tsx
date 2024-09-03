import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      {React.cloneElement(children, {
        onMouseEnter: () => setIsVisible(true),
        onMouseLeave: () => setIsVisible(false),
      })}
      {isVisible && (
        <div className="absolute z-10 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 whitespace-nowrap">
          {content}
          <div className="absolute w-2 h-2 bg-white transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;