import React, { useState } from 'react';
import { FiX, FiCopy } from 'react-icons/fi';
import { toast } from 'sonner';
import EditAccessModal from './EditAccessModal';
import { Project, Contributor, AccessLevel } from '@/types/Project';
import { CircularProgress } from '@mui/material'; // Add this import

interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateAccessLevel: (email: string, newAccessLevel: AccessLevel | 'revoke') => Promise<void>;
  onAddContributor: (email: string, accessLevel: AccessLevel) => Promise<void>;
}

const ShareProjectModal: React.FC<ShareProjectModalProps> = ({ isOpen, onClose, project, onUpdateAccessLevel, onAddContributor }) => {
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState('viewer');
  const [editingUser, setEditingUser] = useState<Contributor | null>(null);
  const [isShareInProgress, setIsShareInProgress] = useState(false);
  const [isAccessUpdateInProgress, setIsAccessUpdateInProgress] = useState(false);
  const [updatingContributorEmail, setUpdatingContributorEmail] = useState<string | null>(null);

  const handleEditAccess = (user: Contributor) => {
    setEditingUser(user);
  };

  const handleAccessUpdate = async (email: string, newAccessLevel: AccessLevel | 'revoke') => {
    try {
      setIsAccessUpdateInProgress(true);
      setUpdatingContributorEmail(email);
      await onUpdateAccessLevel(email, newAccessLevel);
    } catch (error) {
      console.error('Error updating access level:', error);
      toast.error(`Failed to update access level for ${email}`, {
        duration: 3000,
        position: 'top-center',
      });
    } finally {
      setEditingUser(null);
      setIsAccessUpdateInProgress(false);
      setUpdatingContributorEmail(null);
    }
  };

  const handleShare = async () => {
    setIsShareInProgress(true);
    try {
      await onAddContributor(email, accessLevel as AccessLevel);
    } catch (error) {
      console.error('Error sharing project:', error);
      toast.error('Failed to share project', {
        duration: 3000,
        position: 'top-center',
      });
    } finally {
      setIsShareInProgress(false);
    }
  };

  const copyLinkToClipboard = () => {
    const link = `${window.location.origin}/workspaces/${project.id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Share <i className="text-blue-500 text-md">{project.title}</i></h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>
        <input
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded border p-2"
        />
        <select
          value={accessLevel}
          onChange={(e) => setAccessLevel(e.target.value)}
          className="mb-4 w-full rounded border p-2"
        >
          <option value="viewer">Can view</option>
          {project.accessLevel !== 'viewer' && <option value="editor">Can edit</option>}
        </select>
        <button
          onClick={handleShare}
          disabled={isShareInProgress || !email}
          className="mb-4 w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:bg-gray-300 relative"
        >
          {isShareInProgress ? (
            <CircularProgress size={24} color="inherit" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          ) : (
            'Share'
          )}
        </button>
        <div className="mb-4 flex items-center justify-between rounded border p-2">
          <span className="text-sm text-gray-600">Shareable Link</span>
          <button
            onClick={copyLinkToClipboard}
            className="flex items-center text-blue-500 hover:text-blue-600"
          >
            <FiCopy size={18} className="mr-1" />
            Copy
          </button>
        </div>
        <div className="mt-4">
          <h3 className="mb-2 font-semibold">Users with access:</h3>
          <ul className="max-h-40 overflow-y-auto">
            {project.contributors?.map((contributor, index) => (
              <li key={index} className="mb-1 flex items-center justify-between">
                <span>{contributor.email}</span>
                <button
                  onClick={() => handleEditAccess(contributor)}
                  disabled={isAccessUpdateInProgress && updatingContributorEmail === contributor.email}
                  className="ml-2 rounded bg-blue-500 px-2 py-1 text-sm text-white hover:bg-blue-600 disabled:bg-gray-300 relative"
                >
                  {isAccessUpdateInProgress && updatingContributorEmail === contributor.email ? (
                    <CircularProgress size={16} color="inherit" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                  ) : (
                    'Edit Access'
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {editingUser && (
        <EditAccessModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdateAccess={(email, newAccessLevel) => handleAccessUpdate(email, newAccessLevel as AccessLevel | 'revoke')}
          userAccessLevel={project.accessLevel}
          isAccessUpdateInProgress={isAccessUpdateInProgress}
        />
      )}
    </div>
  );
};

export default ShareProjectModal;