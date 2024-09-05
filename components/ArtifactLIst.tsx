import React, { useState } from "react";
import { FiBox, FiSearch, FiPackage } from "react-icons/fi";

interface Artifact {
  id: string;
  name: string;
}

interface ArtifactListProps {
  artifacts: Artifact[];
  onSelectArtifact: (id: string) => void;
  selectedArtifactId: string | null;
}

const ArtifactList: React.FC<ArtifactListProps> = ({ artifacts, onSelectArtifact, selectedArtifactId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredArtifacts = artifacts.filter((artifact) =>
    artifact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedArtifact = artifacts.find(artifact => artifact.id === selectedArtifactId);
  const otherArtifacts = filteredArtifacts.filter(artifact => artifact.id !== selectedArtifactId);

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-sm p-6 h-full flex flex-col transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] bg-gradient-to-br from-blue-50/80 to-white/70">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
        <FiPackage className="mr-2 text-blue-500" />
        Artifacts
      </h2>
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
      <div className="flex-1 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex flex-col">
        {selectedArtifact && (
          <div className="p-1">
            <ArtifactItem
              artifact={selectedArtifact}
              isSelected={true}
              onClick={() => onSelectArtifact(selectedArtifact.id)}
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
                onClick={() => onSelectArtifact(artifact.id)}
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
}

const ArtifactItem: React.FC<ArtifactItemProps> = ({ artifact, isSelected, onClick }) => (
  <li
    className={`p-3 rounded-md cursor-pointer transition-all duration-300 flex items-center ${
      isSelected
        ? "bg-blue-100 text-blue-700"
        : "bg-white/60 text-gray-700 hover:bg-gray-100"
    }`}
    onClick={onClick}
  >
    <FiBox className={`w-5 h-5 mr-3 ${isSelected ? "text-blue-500" : "text-blue-400"}`} />
    <span className="font-medium flex-grow">{artifact.name}</span>
    {isSelected && (
      <div className="w-2 h-2 rounded-full bg-blue-500 ml-2"></div>
    )}
  </li>
);

export default ArtifactList;