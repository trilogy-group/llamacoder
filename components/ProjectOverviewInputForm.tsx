import React, { useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';

interface ProjectOverviewInputFormProps {
  onCancel: () => void;
  onNext: (description: string) => void;
}

const ProjectOverviewInputForm: React.FC<ProjectOverviewInputFormProps> = ({ onCancel, onNext }) => {
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(description);
  };

  return (
    <div className="bg-gray-100 rounded-2xl shadow-lg p-6 w-full max-w-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Project</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full h-32 p-4 mb-6 text-gray-700 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Tell us a little bit about your project..."
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
            disabled={!description.trim()}
            className={`px-6 py-2 text-sm font-medium text-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out flex items-center ${
              description.trim()
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-blue-300 cursor-not-allowed'
            }`}
          >
            Next
            <FiArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectOverviewInputForm;
