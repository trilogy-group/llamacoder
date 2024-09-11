import { Artifact } from "@/types/Artifact";
import React, { useEffect, useRef, useState } from "react";
import {
  FiAlertCircle,
  FiBox,
  FiChevronLeft,
  FiChevronRight,
  FiCopy,
  FiEdit,
  FiMoreHorizontal,
  FiPackage,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";

interface ArtifactListProps {
  artifacts: Artifact[];
  onSelectArtifact: (artifact: Artifact) => void;
  selectedArtifact: Artifact | null;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onCreateArtifact: () => void;
  onDeleteArtifact: (artifact: Artifact) => void;
  onArtifactHover: (artifact: Artifact | null, event: React.MouseEvent) => void;
  onRenameArtifact: (artifact: Artifact) => void;
  onDuplicateArtifact: (artifact: Artifact) => void;
}

const ArtifactList: React.FC<ArtifactListProps> = ({
  artifacts,
  onSelectArtifact,
  selectedArtifact,
  isCollapsed,
  setIsCollapsed,
  onCreateArtifact,
  onDeleteArtifact,
  onArtifactHover,
  onRenameArtifact,
  onDuplicateArtifact,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredArtifacts = artifacts.filter((artifact) =>
    artifact.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const lastIdleArtifactIndex = filteredArtifacts.reduce(
    (acc, artifact, index) => {
      if (acc === -1 && artifact.status !== "idle") {
        return index;
      }
      return acc;
    },
    -1,
  );

  if (isCollapsed) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-l-xl bg-white/60 shadow-sm backdrop-blur-md">
        <button
          onClick={() => setIsCollapsed(false)}
          className="rounded-full p-2 transition-colors duration-200 hover:bg-gray-200"
        >
          <FiChevronRight className="h-6 w-6 text-gray-600" />
        </button>
      </div>
    );
  }

  const handleDeleteArtifact = (artifact: Artifact) => {
    onDeleteArtifact(artifact);
  };

  const handleRenameArtifact = (artifact: Artifact) => {
    onRenameArtifact(artifact);
  };

  const handleDuplicateArtifact = (artifact: Artifact) => {
    onDuplicateArtifact(artifact);
  };

  return (
    <div className="flex h-full flex-col rounded-xl bg-white/60 bg-gradient-to-br from-blue-50/80 to-white/70 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center text-2xl font-bold text-gray-800">
          <FiPackage className="mr-2 text-blue-500" />
          Artifacts
        </h2>
        <button
          onClick={() => setIsCollapsed(true)}
          className="rounded p-1 transition-colors duration-200 hover:bg-gray-200"
        >
          <FiChevronLeft className="h-5 w-5 text-gray-600" />
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
          className={`w-full rounded-full bg-gray-100 py-2 pl-10 pr-4 text-gray-600 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-blue-300 ${
            isSearchFocused || searchTerm ? "bg-white shadow-md" : ""
          }`}
        />
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden border-b border-t border-gray-200 bg-gray-50">
        <div className="flex-1 overflow-y-auto p-1">
          <ul className="space-y-1">
            {filteredArtifacts.map((artifact) => (
              <ArtifactItem
                key={artifact.id}
                artifact={artifact}
                isSelected={artifact.id === selectedArtifact?.id}
                onClick={() => onSelectArtifact(artifact)}
                onDelete={handleDeleteArtifact}
                onPreview={(artifact) => {}}
                onEdit={(artifact) => {}}
                onHover={onArtifactHover}
                onRename={handleRenameArtifact}
                onDuplicate={handleDuplicateArtifact}
              />
            ))}
          </ul>
        </div>
      </div>
      <button
        className="mt-4 flex items-center justify-center space-x-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-700"
        onClick={() => {
          onCreateArtifact();
        }}
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
  onHover: (artifact: Artifact | null, event: React.MouseEvent) => void;
  onRename: (artifact: Artifact) => void;
  onDuplicate: (artifact: Artifact) => void;
}

const ArtifactItem: React.FC<ArtifactItemProps> = ({
  artifact,
  isSelected,
  onClick,
  onDelete,
  onHover,
  onRename,
  onDuplicate,
}) => {
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

  const getStatusIcon = () => {
    if (artifact.status !== "idle") {
      return (
        <div className="relative mr-3 h-5 w-5">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      );
    } else {
      return (
        <FiBox
          className={`mr-3 h-5 w-5 ${isSelected ? "text-blue-500" : "text-blue-400"}`}
        />
      );
    }
  };

  return (
    <li
      className={`relative flex cursor-pointer items-center rounded-md p-3 transition-all duration-300 ${
        isSelected
          ? "bg-blue-100 text-blue-700"
          : "bg-white/60 text-gray-700 hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      <div className="flex flex-grow items-center overflow-hidden">
        <div
          onMouseEnter={(e) => onHover(artifact, e)}
          onMouseLeave={(e) => onHover(null, e)}
        >
          {getStatusIcon()}
        </div>
        <span className="max-w-[70%] truncate font-medium">
          {artifact.name}
        </span>
      </div>
      <div className="relative" ref={menuRef}>
        <button
          className="rounded-full p-1 transition-colors duration-200 hover:bg-gray-200"
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
        >
          <FiMoreHorizontal className="h-4 w-4 text-gray-600" />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 z-10 mt-2 w-48 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <button
              className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                onRename(artifact);
                setIsMenuOpen(false);
              }}
            >
              <FiEdit className="mr-2 h-4 w-4 text-blue-500" />
              Rename
            </button>
            <button
              className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(artifact);
                setIsMenuOpen(false);
              }}
            >
              <FiCopy className="mr-2 h-4 w-4 text-green-500" />
              Duplicate
            </button>
            <button
              className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(artifact);
                setIsMenuOpen(false);
              }}
            >
              <FiTrash2 className="mr-2 h-4 w-4 text-red-500" />
              Delete
            </button>
            <button
              className="flex w-full cursor-not-allowed items-center px-4 py-2 text-left text-sm text-gray-400"
              disabled
            >
              <FiAlertCircle className="mr-2 h-4 w-4 text-gray-400" />
              Deprecate
            </button>
          </div>
        )}
      </div>
    </li>
  );
};

export default ArtifactList;
