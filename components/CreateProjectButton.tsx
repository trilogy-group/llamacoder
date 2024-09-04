import React from "react";

interface CreateProjectButtonProps {
  onClick: () => void;
  showSearch: boolean;
}

const CreateProjectButton: React.FC<CreateProjectButtonProps> = ({ onClick, showSearch }) => {
  return (
    <div className="flex items-center space-x-4">
      {showSearch && (
        <div className="relative">
          <input
            type="text"
            placeholder="Search projects..."
            className="w-80 rounded-full bg-gray-25 py-3 pl-10 pr-4 font-normal text-gray-600 placeholder-gray-400 transition duration-300 ease-in-out focus:outline-none focus:ring-1 focus:ring-blue-300"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
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
        <span>Create New Project</span>
      </button>
    </div>
  );
};

export default CreateProjectButton;