import React, { useState, ReactNode } from 'react';

interface ConfirmationDialogProps {
  message: ReactNode;
  onConfirm: () => Promise<string | void>;
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
      setResult(typeof resultMessage === 'string' ? resultMessage : 'Action completed successfully');
    } catch (error) {
      setResult(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="bg-gray-100 rounded-2xl shadow-lg p-6 w-full max-w-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Confirm Action</h2>
      <div className="mb-6 text-gray-600">{message}</div>
      {result ? (
        <div className="mb-6 text-center">
          <p className={`text-lg ${result.includes('error') ? 'text-red-600' : 'text-green-600'}`}>
            {result}
          </p>
        </div>
      ) : (
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-300 ease-in-out"
            disabled={isConfirming}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`px-6 py-2 text-sm font-medium text-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 ease-in-out flex items-center justify-center relative ${
              isConfirming ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
            }`}
            disabled={isConfirming}
          >
            {isConfirming ? (
              <>
                <span className="opacity-0">Confirm</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ConfirmationDialog;