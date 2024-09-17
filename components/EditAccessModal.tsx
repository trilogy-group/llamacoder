import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { styled } from '@mui/material/styles';

interface EditAccessModalProps {
  user: {
    email: string;
    accessLevel: string;
  };
  onClose: () => void;
  onUpdateAccess: (email: string, newAccessLevel: string) => Promise<void>;
  userAccessLevel?: string;
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

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.light,
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
    },
  },
}));

const EditAccessModal: React.FC<EditAccessModalProps> = ({ user, onClose, onUpdateAccess, userAccessLevel }) => {
  const [newAccessLevel, setNewAccessLevel] = useState(user.accessLevel);
  const [isUpdating, setIsUpdating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await onUpdateAccess(user.email, newAccessLevel);
      setResult('Access updated successfully');
    } catch (error) {
      setResult(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Edit Access</h2>
            <p className="text-sm italic text-blue-600 mt-1">{user.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>
        {result ? (
          <div className="mb-6 text-center">
            <p className={`text-lg ${result.includes('error') ? 'text-red-600' : 'text-green-600'}`}>
              {result}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth variant="outlined" className="mb-6">
              <InputLabel id="access-level-label">Access Level</InputLabel>
              <StyledSelect
                labelId="access-level-label"
                value={newAccessLevel}
                onChange={(e) => setNewAccessLevel(e.target.value as string)}
                label="Access Level"
              >
                <StyledMenuItem value="viewer">Viewer</StyledMenuItem>
                {userAccessLevel !== 'viewer' && (
                  <StyledMenuItem value="editor">Editor</StyledMenuItem>
                )}
                {userAccessLevel === 'owner' && (
                  <StyledMenuItem value="revoke" style={{ color: 'red' }}>
                    Revoke Access
                  </StyledMenuItem>
                )}
              </StyledSelect>
            </FormControl>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-300 ease-in-out"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className={`px-6 py-2 text-sm font-medium text-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out flex items-center justify-center relative ${
                  isUpdating ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isUpdating ? (
                  <>
                    <span className="opacity-0">Update Access</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </>
                ) : (
                  'Update Access'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditAccessModal;