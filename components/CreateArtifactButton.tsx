import React from "react";

interface CreateArtifactButtonProps {
  onClick: () => void;
}

const CreateArtifactButton: React.FC<CreateArtifactButtonProps> = ({ onClick }) => {
  return (
    <div className="flex items-center space-x-4">
      <button
        className="flex items-center space-x-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-700"
        onClick={onClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        <span>Create New Artifact</span>
      </button>
    </div>
  );
};

export default CreateArtifactButton;