import React, { useState, useEffect } from 'react';
import { FiX, FiCopy } from 'react-icons/fi';
import { toast } from 'sonner';
import axios from 'axios';
import EditAccessModal from './EditAccessModal';
import { projectApi } from '@/utils/apiClients/Project';

interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  userAccessLevel?: string;
}

interface ProjectUser {
  userId: string;
  email: string;
  accessLevel: string;
}

const ShareProjectModal: React.FC<ShareProjectModalProps> = ({ isOpen, onClose, projectId, projectTitle, userAccessLevel }) => {
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState('viewer');
  const [currentUserAccessLevel, setCurrentUserAccessLevel] = useState<string | undefined>(userAccessLevel);
  const [isSharing, setIsSharing] = useState(false);
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([]);
  const [editingUser, setEditingUser] = useState<ProjectUser | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProjectUsers();
    }
  }, [isOpen, projectId]);

  useEffect(() => {
    if (!currentUserAccessLevel) {
      fetchUserAccessLevel();
    }
  }, [projectId, userAccessLevel]);

  const fetchUserAccessLevel = async () => {
    const { accessLevel } = await projectApi.getProject(projectId);
    setCurrentUserAccessLevel(accessLevel);
  };

  const fetchProjectUsers = async () => {
    try {
      const editorResponse = await axios.post('/api/fga', {
        action: 'listUsers',
        data: {
          object: { type: 'project', id: projectId },
          relation: 'editor'
        }
      });
      const viewerResponse = await axios.post('/api/fga', {
        action: 'listUsers',
        data: {
          object: { type: 'project', id: projectId },
          relation: 'viewer'
        }
      });

      const editors = editorResponse.data.users;
      const viewers = viewerResponse.data.users;

      const allUsers: ProjectUser[] = [];
      const userSet: { [key: string]: boolean } = {};

      for (let i = 0; i < editors.length; i++) {
        const user = editors[i];
        if (!userSet[user.object.id]) {
          allUsers.push({
            userId: user.object.id,
            email: user.object.id,
            accessLevel: 'editor'
          });
          userSet[user.object.id] = true;
        }
      }

      for (let i = 0; i < viewers.length; i++) {
        const user = viewers[i];
        if (!userSet[user.object.id]) {
          allUsers.push({
            userId: user.object.id,
            email: user.object.id,
            accessLevel: 'viewer'
          });
          userSet[user.object.id] = true;
        }
      }

      console.log(allUsers);

      setProjectUsers(allUsers);

      console.log(projectUsers);
    } catch (error) {
      console.error('Error fetching project users:', error);
      toast.error('Failed to fetch project users');
    }
  };

  const handleEditAccess = (user: ProjectUser) => {
    setEditingUser(user);
  };

  const handleAccessUpdate = async (email: string, newAccessLevel: string) => {
    try {
      const response = await axios.post('/api/projects/share', {
        projectId,
        email,
        accessLevel: newAccessLevel
      });

      if (response.data.success) {
        toast.success(`Access for ${email} updated to ${newAccessLevel === 'revoke' ? 'revoked' : newAccessLevel}`, {
          duration: 3000,
          position: 'top-center',
        });
        await fetchProjectUsers(); // Refresh the user list
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating access level:', error);
      toast.error(`Failed to update access level for ${email}`, {
        duration: 3000,
        position: 'top-center',
      });
    } finally {
      setEditingUser(null);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const response = await axios.post('/api/projects/share', {
        projectId,
        email,
        accessLevel
      });

      console.log(response.data);

      if (response.data.success) {
        toast.success(`Project shared successfully with ${email}`, {
          duration: 3000,
          position: 'top-center',
        });
        await fetchProjectUsers(); // Refresh the user list
        setEmail('');
      } else {
        throw new Error('Failed to share project');
      }
    } catch (error) {
      console.error('Error sharing project:', error);
      toast.error('Failed to share project', {
        duration: 3000,
        position: 'top-center',
      });
    } finally {
      setIsSharing(false);
    }
  };

  const copyLinkToClipboard = () => {
    const link = `${window.location.origin}/workspaces/${projectId}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Share "{projectTitle}"</h2>
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
          {currentUserAccessLevel !== 'viewer' && <option value="editor">Can edit</option>}
        </select>
        <button
          onClick={handleShare}
          disabled={isSharing || !email}
          className="mb-4 w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:bg-gray-300"
        >
          {isSharing ? 'Sharing...' : 'Share'}
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
            {projectUsers.map((user, index) => (
              <li key={index} className="mb-1 flex items-center justify-between">
                <span>{typeof user === 'string' ? user : user.email}</span>
                <button
                  onClick={() => handleEditAccess(user)}
                  className="ml-2 rounded bg-blue-500 px-2 py-1 text-sm text-white hover:bg-blue-600"
                >
                  Edit Access
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
          onUpdateAccess={handleAccessUpdate}
          userAccessLevel={currentUserAccessLevel}
        />
      )}
    </div>
  );
};

export default ShareProjectModal;