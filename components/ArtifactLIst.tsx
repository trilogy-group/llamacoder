import React, { useState, useRef, useEffect } from "react";
import { FiBox, FiSearch, FiPackage, FiChevronLeft, FiChevronRight, FiTrash2, FiEye, FiEdit, FiMoreHorizontal } from "react-icons/fi";
import { Artifact } from "@/types/Artifact";

interface ArtifactListProps {
  artifacts: Artifact[];
  onSelectArtifact: (artifact: Artifact) => void;
  selectedArtifact: Artifact | null;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

const ArtifactList: React.FC<ArtifactListProps> = ({ 
  artifacts, 
  onSelectArtifact, 
  selectedArtifact, 
  isCollapsed,
  setIsCollapsed 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredArtifacts = artifacts.filter((artifact) =>
    artifact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const otherArtifacts = filteredArtifacts.filter(artifact => artifact.id !== selectedArtifact?.id);

  if (isCollapsed) {
    return (
      <div className="h-full bg-white/60 backdrop-blur-md rounded-l-xl shadow-sm flex flex-col items-center justify-center">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
        >
          <FiChevronRight className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-sm p-6 h-full flex flex-col transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] bg-gradient-to-br from-blue-50/80 to-white/70">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiPackage className="mr-2 text-blue-500" />
          Artifacts
        </h2>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
        >
          <FiChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search artifacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className={`w-full rounded-full bg-gray-100 py-2 pl-10 pr-4 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-300 transition-all duration-300 ${
            isSearchFocused || searchTerm ? 'bg-white shadow-md' : ''
          }`}
        />
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      <div className="flex-1 overflow-hidden border-t border-b border-gray-200 bg-gray-50 flex flex-col">
        {selectedArtifact && (
          <div className="p-1">
            <ArtifactItem
              artifact={selectedArtifact}
              isSelected={true}
              onClick={() => onSelectArtifact(selectedArtifact)}
              onDelete={(artifact) => {/* Add delete logic */}}
              onPreview={(artifact) => {/* Add preview logic */}}
              onEdit={(artifact) => {/* Add edit logic */}}
            />
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-1">
          <ul className="space-y-1">
            {otherArtifacts.map((artifact) => (
              <ArtifactItem
                key={artifact.id}
                artifact={artifact}
                isSelected={false}
                onClick={() => onSelectArtifact(artifact)}
                onDelete={(artifact) => {/* Add delete logic */}}
                onPreview={(artifact) => {/* Add preview logic */}}
                onEdit={(artifact) => {/* Add edit logic */}}
              />
            ))}
          </ul>
        </div>
      </div>
      <button
        className="mt-4 flex items-center justify-center space-x-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-700"
        onClick={() => {/* Add new artifact logic here */}}
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

interface ArtifactItemProps {
  artifact: Artifact;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (artifact: Artifact) => void;
  onPreview: (artifact: Artifact) => void;
  onEdit: (artifact: Artifact) => void;
}

const ArtifactItem: React.FC<ArtifactItemProps> = ({ artifact, isSelected, onClick, onDelete, onPreview, onEdit }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <li
      className={`p-3 rounded-md cursor-pointer transition-all duration-300 flex items-center ${
        isSelected
          ? "bg-blue-100 text-blue-700"
          : "bg-white/60 text-gray-700 hover:bg-gray-100"
      }`}
    >
      <div className="flex-grow flex items-center" onClick={onClick}>
        <FiBox className={`w-5 h-5 mr-3 ${isSelected ? "text-blue-500" : "text-blue-400"}`} />
        <span className="font-medium">{artifact.name}</span>
      </div>
      <div className="relative" ref={menuRef}>
        <button
          className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
        >
          <FiMoreHorizontal className="w-4 h-4 text-gray-600" />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              <button
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(artifact);
                  setIsMenuOpen(false);
                }}
              >
                <FiTrash2 className="mr-3 h-5 w-5 text-gray-400" />
                Delete
              </button>
              <button
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(artifact);
                  setIsMenuOpen(false);
                }}
              >
                <FiEye className="mr-3 h-5 w-5 text-gray-400" />
                Preview
              </button>
              <button
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(artifact);
                  setIsMenuOpen(false);
                }}
              >
                <FiEdit className="mr-3 h-5 w-5 text-gray-400" />
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </li>
  );
};

export default ArtifactList;