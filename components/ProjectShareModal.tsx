import React, { useState } from 'react';
import { FiX, FiCopy, FiUser, FiEdit2, FiEye } from 'react-icons/fi';
import { toast } from 'sonner';
import EditAccessModal from './EditAccessModal';
import { Project, Contributor, AccessLevel } from '@/types/Project';
import { CircularProgress, Select, MenuItem, styled } from '@mui/material';

interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateAccessLevel: (email: string, newAccessLevel: AccessLevel | 'revoke') => Promise<void>;
  onAddContributor: (email: string, accessLevel: AccessLevel) => Promise<void>;
}

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-notchedOutline': {
    borderRadius: '12px',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
    borderWidth: '2px',
  },
}));

const ProjectShareModal: React.FC<ShareProjectModalProps> = ({ isOpen, onClose, project, onUpdateAccessLevel, onAddContributor }) => {
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

  const getAccessLevelIcon = (accessLevel: AccessLevel) => {
    switch (accessLevel) {
      case 'owner':
        return <FiUser className="w-4 h-4 text-purple-600" />;
      case 'editor':
        return <FiEdit2 className="w-4 h-4 text-orange-600" />;
      case 'viewer':
        return <FiEye className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Share Project</h2>
            <p className="text-sm text-blue-600">{project.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={20} />
          </button>
        </div>
        
        {/* Email input and access level select */}
        <div className="mb-3 space-y-2">
          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <StyledSelect
            value={accessLevel}
            onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
            fullWidth
            variant="outlined"
            size="small"
          >
            <MenuItem value="viewer">Can view</MenuItem>
            {project.accessLevel !== 'viewer' && <MenuItem value="editor">Can edit</MenuItem>}
          </StyledSelect>
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          disabled={isShareInProgress || !email}
          className={`w-full rounded-full p-2 text-sm font-medium text-white transition duration-300 ease-in-out relative ${
            isShareInProgress || !email ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {isShareInProgress ? (
            <>
              <span className="opacity-0">Share</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            </>
          ) : (
            'Share'
          )}
        </button>

        {/* Shareable link */}
        <div className="mt-3 mb-3 rounded-md border border-gray-200 p-2 bg-gray-50">
          <span className="text-xs font-medium text-gray-600 block mb-1">Shareable Link</span>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 truncate mr-2">{`${window.location.origin}/workspaces/${project.id}`}</span>
            <button
              onClick={copyLinkToClipboard}
              className="text-xs text-blue-500 hover:text-blue-600 transition duration-300 ease-in-out"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Users with access */}
        <div className="mt-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Users with access:</h3>
          <ul className="max-h-28 overflow-y-auto space-y-1">
            {project.contributors?.map((contributor, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 rounded-md p-1.5">
                <div className="flex items-center">
                  {getAccessLevelIcon(contributor.accessLevel as AccessLevel)}
                  <span className="text-xs text-gray-600 ml-2">{contributor.email}</span>
                </div>
                <button
                  onClick={() => handleEditAccess(contributor)}
                  disabled={isAccessUpdateInProgress && updatingContributorEmail === contributor.email}
                  className={`ml-2 rounded-full px-4 py-1 text-xs font-medium text-white transition duration-300 ease-in-out relative ${
                    isAccessUpdateInProgress && updatingContributorEmail === contributor.email
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {isAccessUpdateInProgress && updatingContributorEmail === contributor.email ? (
                    <>
                      <span className="opacity-0">Edit Access</span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </>
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
        />
      )}
    </div>
  );
};

export default ProjectShareModal;