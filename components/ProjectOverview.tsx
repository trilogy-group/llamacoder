import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Project } from '../types/Project';
import { FiExternalLink, FiShare2, FiTrash2, FiImage, FiEdit3 } from 'react-icons/fi';
import Tooltip from './Tooltip';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import logo from './../public/logo.png';


interface ProjectOverviewProps {
  project: Project;
  onProjectDeleted: (projectId: string) => void;
  onShareClick: (projectId: string) => void;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project, onProjectDeleted, onShareClick }) => {  
  const router = useRouter();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mock tags - replace with actual project tags when available
  const mockTags = ['React', 'TypeScript', 'AI', 'Mobile'];
  const projectTags = mockTags.slice(0, Math.floor(Math.random() * 3) + 1);
  const [contributors, setContributors] = useState<string[]>([]);
  const [showContributorsModal, setShowContributorsModal] = useState(false);

  // Function to generate a color based on the createdBy string
  const getColorFromString = (str: string | null | undefined) => {
    const colors = ['red', 'green', "yellow"];
    if (!str) return colors[1];
    const hash = str.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };

  const projectColor = getColorFromString(project.createdBy);

  const fetchContributors = async () => {
    try {
      const editorResponse = await axios.post('/api/fga', {
        action: 'listUsers',
        data: {
          object: { type: 'project', id: project.id },
          relation: 'editor'
        }
      });
      const editors = editorResponse.data.users.map((user: any) => user.object.id);
      const allContributors = Array.from(new Set([project.createdBy, ...editors]));
      setContributors(allContributors);
    } catch (error) {
      console.error('Error fetching contributors:', error);
    }
  };

  useEffect(() => {
    fetchContributors();
  }, [project.id]);

  const handleContributorsClick = () => {
    setShowContributorsModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleOpenProject = () => {
    router.push(`/workspaces/${project.id}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/projects?id=${project.id}`);
      toast.success('Project deleted successfully', {
        duration: 3000,
      });
      onProjectDeleted(project.id);
    } catch (error) {
      console.error('Error deleting project:', error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          toast.error('You are not authorized to delete projects. Please log in.', {
            duration: 3000,
          });
        } else if (error.response.status === 403) {
          toast.error('You don\'t have permission to delete this project.', {
            duration: 3000,
          });
        } else {
          toast.error('Failed to delete project. Please try again.', {
            duration: 3000,
          });
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.', {
          duration: 3000,
        });
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-sm p-4 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] bg-gradient-to-br from-blue-50/80 to-white/70">
      <div className="relative aspect-video mb-4 bg-gray-100 rounded-lg overflow-hidden">
        {project.thumbnail ? (
          <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full relative">
            <Image
              src={logo}
              alt="Default project image"
              layout="fill"
              objectFit="contain"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center flex-grow">
          <div className={`w-8 h-8 bg-${projectColor}-500 rounded-full flex items-center justify-center text-white font-medium text-sm mr-3`}>
            {project.createdBy ? project.createdBy[0].toUpperCase() : ''}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{project.title}</h3>
            <p className="text-xs text-gray-500">
              {project.updatedBy} · {formatDate(project.updatedAt)} · 
              <span 
                className="ml-1 font-medium cursor-pointer hover:underline"
                onClick={handleContributorsClick}
              >
                {contributors.length} contributor{contributors.length !== 1 ? 's' : ''}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <Tooltip content={`Status: ${project.status}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              project.status === 'Active' ? 'bg-green-500' :
              project.status === 'Inactive' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
          </Tooltip>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">{project.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {projectTags.map((tag, index) => (
          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-2">
          <Tooltip content="Share project">
            <button
              onClick={() => onShareClick(project.id)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition duration-300 ease-in-out"
            >
              <FiShare2 className="w-5 h-5" />
            </button>
          </Tooltip>
          {project.status === 'Active' && (
            <Tooltip content="View Live">
              <a
                href={project.publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:bg-green-100 p-2 rounded-full transition duration-300 ease-in-out inline-flex items-center"
              >
                <FiExternalLink className="w-5 h-5" />
              </a>
            </Tooltip>
          )}
          <Tooltip content="Delete">
            <button 
              onClick={handleDeleteClick}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition duration-300 ease-in-out"
              disabled={isDeleting}
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>
        
        <Tooltip content="Open for development">
          <button 
            onClick={handleOpenProject}
            className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-full transition duration-300 ease-in-out flex items-center space-x-2"
          >
            <FiEdit3 className="w-5 h-5" />
            <span className="text-sm font-medium">Open</span>
          </button>
        </Tooltip>
      </div>

      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6 text-gray-600">Are you sure you want to delete this project? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showContributorsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Contributors</h3>
            <ul className="max-h-60 overflow-y-auto">
              {contributors.map((email, index) => (
                <li key={index} className="mb-2 text-gray-700">{email}</li>
              ))}
            </ul>
            <button
              onClick={() => setShowContributorsModal(false)}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectOverview;

