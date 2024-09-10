import React, { useState, useEffect } from 'react';
import { FiX, FiCopy } from 'react-icons/fi';
import { toast } from 'sonner';
import axios from 'axios';

interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
}

interface ProjectUser {
  userId: string;
  email: string;
  accessLevel: string;
}

const ShareProjectModal: React.FC<ShareProjectModalProps> = ({ isOpen, onClose, projectId, projectTitle }) => {
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState('viewer');
  const [isSharing, setIsSharing] = useState(false);
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchProjectUsers();
    }
  }, [isOpen, projectId]);

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

      console.log('allUsers', allUsers);
  
      setProjectUsers(allUsers);
    } catch (error) {
      console.error('Error fetching project users:', error);
      toast.error('Failed to fetch project users');
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

      if (response.status === 200) {
        toast.success('Project shared successfully');
        fetchProjectUsers();
        setEmail('');
      } else {
        throw new Error('Failed to share project');
      }
    } catch (error) {
      console.error('Error sharing project:', error);
      toast.error('Failed to share project');
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
          <option value="editor">Can edit</option>
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
            {projectUsers.map((user) => (
              <li key={user.userId} className="mb-1 flex items-center justify-between">
                <span>{user.email}</span>
                <span className="text-sm text-gray-500">{user.accessLevel}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShareProjectModal;