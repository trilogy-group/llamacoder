import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface EditAccessModalProps {
  user: {
    email: string;
    accessLevel: string;
  };
  onClose: () => void;
  onUpdateAccess: (email: string, newAccessLevel: string) => void;
  userAccessLevel?: string;
}

const EditAccessModal: React.FC<EditAccessModalProps> = ({ user, onClose, onUpdateAccess, userAccessLevel }) => {
  const [newAccessLevel, setNewAccessLevel] = useState(user.accessLevel);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAccess(user.email, newAccessLevel);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit Access for {user.email}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block font-semibold">Access Level</label>
            <select
              value={newAccessLevel}
              onChange={(e) => setNewAccessLevel(e.target.value)}
              className="w-full rounded border p-2"
            >
              <option value="viewer">Viewer</option>
              {userAccessLevel !== 'viewer' && <option value="editor">Editor</option>}
              {userAccessLevel === 'owner' && <option value="revoke">Revoke Access</option>}
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Update Access
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAccessModal;