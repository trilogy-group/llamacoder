import React, { useState, useEffect, useRef } from 'react';
import { FiMoreVertical, FiShare2, FiTrash2, FiFolder } from 'react-icons/fi';
import Tooltip from './Tooltip';

interface ProjectHeaderProps {
  projectTitle: string;
  projectDescription: string;
  onMyProjectsClick: () => void;
  onShareClick: () => void;
  onDeleteClick: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  projectTitle,
  projectDescription,
  onMyProjectsClick,
  onShareClick,
  onDeleteClick
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md px-6 py-4 flex items-center justify-between">
      <button
        onClick={onMyProjectsClick}
        className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-md shadow-sm hover:bg-gray-100 transition-colors"
      >
        ← My Projects
      </button>
      <div className="flex-1 flex justify-center items-center space-x-3">
        <FiFolder className="text-white w-8 h-8" />
        <Tooltip content={projectDescription}>
          <h1 className="text-3xl font-bold text-white cursor-help">{projectTitle}</h1>
        </Tooltip>
      </div>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
        >
          <FiMoreVertical className="w-6 h-6" />
        </button>
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
            <button
              onClick={() => {
                onShareClick();
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-indigo-50 flex items-center"
            >
              <FiShare2 className="mr-2" /> Share
            </button>
            <button
              onClick={() => {
                onDeleteClick();
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center text-red-600"
            >
              <FiTrash2 className="mr-2" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectHeader;