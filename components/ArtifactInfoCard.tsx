import React from 'react';
import { Artifact } from '@/types/Artifact';
import { FiX, FiCpu, FiPackage, FiCalendar } from 'react-icons/fi';
import Image from 'next/image';
import logo from './../public/logo.png';

interface ArtifactInfoCardProps {
  artifact: Artifact;
  position: { x: number; y: number };
  onClose: () => void;
}

const ArtifactInfoCard: React.FC<ArtifactInfoCardProps> = ({ artifact, position, onClose }) => {
  const formatDate = (dateString?: string) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
  };

  return (
    <div
      className="fixed z-50 w-80 bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-4 transition-all duration-300 hover:shadow-xl"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 bg-blue-100 rounded-lg overflow-hidden mr-3">
          <Image src={logo} alt="Artifact logo" width={48} height={48} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{artifact.name || 'Unnamed Artifact'}</h3>
          <p className="text-xs text-gray-500">ID: {artifact.id.slice(0, 8)}</p>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{artifact.description || "No description available"}</p>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          artifact.status === 'idle' ? 'bg-green-100 text-green-800' :
          artifact.status === 'creating' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {artifact.status}
        </span>
        {artifact.dependencies && artifact.dependencies.length > 0 && (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
            {artifact.dependencies.length} {artifact.dependencies.length === 1 ? 'dependency' : 'dependencies'}
          </span>
        )}
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center">
          <FiCpu className="w-4 h-4 mr-2" />
          <span>Project: {artifact.projectId}</span>
        </div>
        {artifact.dependencies && artifact.dependencies.length > 0 && (
          <div className="flex items-center">
            <FiPackage className="w-4 h-4 mr-2" />
            <span>Main dependency: {artifact.dependencies[0].name} ({artifact.dependencies[0].version})</span>
          </div>
        )}
        <div className="flex items-center">
          <FiCalendar className="w-4 h-4 mr-2" />
          <span>Created: {formatDate(artifact.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default ArtifactInfoCard;