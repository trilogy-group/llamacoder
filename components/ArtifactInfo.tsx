import React from 'react';
import { Artifact } from '../types/Artifact';
import Image from 'next/image';
import logo from '../public/logo.png';
import { FiCalendar } from 'react-icons/fi';

interface ArtifactInfoProps {
  artifact: Artifact;
}

const ArtifactInfo: React.FC<ArtifactInfoProps> = ({ artifact }) => {
  const formatDate = (dateString?: string) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
  };

  return (
    <div className="flex items-start p-3 bg-gray-50 border-b">
      <div className="w-10 h-10 flex-shrink-0 bg-blue-100 rounded-lg overflow-hidden mr-3">
        <Image src={logo} alt="Artifact logo" width={40} height={40} />
      </div>
      <div className="flex-grow min-w-0">
        <h3 className="text-sm font-semibold text-gray-800 truncate">{artifact.name || 'Unnamed Artifact'}</h3>
        <p className="text-xs text-gray-500 line-clamp-2">{artifact.description || "No description"}</p>
        <div className="flex items-center text-xs text-gray-400 mt-1">
          <FiCalendar className="w-3 h-3 mr-1" />
          <span>Created: {formatDate(artifact.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default ArtifactInfo;