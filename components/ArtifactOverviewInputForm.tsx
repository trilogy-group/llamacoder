import React, { useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';

interface ArtifactOverviewInputFormProps {
  onCancel: () => void;
  onNext: (description: string, callback: () => void) => void;
}

const ArtifactOverviewInputForm: React.FC<ArtifactOverviewInputFormProps> = ({ onCancel, onNext }) => {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onNextCallback = () => {
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    onNext(description, onNextCallback);
  };

  return (
    <div className="bg-gray-100 rounded-2xl shadow-lg p-6 w-full max-w-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Artifact</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full h-32 p-4 mb-6 text-gray-700 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Tell us a little bit about your artifact..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-300 ease-in-out"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!description.trim() || isLoading}
            className={`px-6 py-2 text-sm font-medium text-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out flex items-center ${
              description.trim() && !isLoading
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-blue-300 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                Next
                <FiArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArtifactOverviewInputForm;
