import React, { useState } from 'react';

interface ConfirmationDialogProps {
  message: string;
  onConfirm: () => Promise<string>;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  message,
  onConfirm,
  onCancel,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const resultMessage = await onConfirm();
      setResult(resultMessage);
    } catch (error) {
      setResult(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-xl p-8 max-w-md w-full transition-all duration-300 bg-gradient-to-br from-blue-50/80 to-white/70">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Confirm Action</h3>
        <p className="mb-6 text-gray-600">{message}</p>
        {result ? (
          <div className="mb-6 text-center">
            <p className={`text-lg ${result.includes('error') ? 'text-red-600' : 'text-green-600'}`}>
              {result}
            </p>
          </div>
        ) : (
          <div className="flex justify-center space-x-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isConfirming}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors relative"
              disabled={isConfirming}
            >
              {isConfirming ? (
                <>
                  <span className="opacity-0">Confirm</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                  </div>
                </>
              ) : (
                'Confirm'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmationDialog;