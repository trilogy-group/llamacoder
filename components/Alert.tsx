import React, { useState, useEffect } from 'react';

interface AlertProps {
  type: 'error' | 'info' | 'warning' | 'success';
  message: string;
  duration?: number;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getAlertStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'info':
        return 'bg-blue-100 border-blue-500 text-blue-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'success':
        return 'bg-green-100 border-green-500 text-green-700';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`rounded-lg shadow-lg p-3 max-w-sm border-l-4 ${getAlertStyles()}`}>
        <div className="flex items-center">
          <span className="text-xl mr-2">{getIcon()}</span>
          <p className="text-xs font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Alert;
