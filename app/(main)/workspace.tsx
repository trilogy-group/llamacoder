'use client';

import React, { useState, useEffect } from "react";
import HeaderV2 from "@/components/HeaderV2";
import ProjectHeader from "@/components/ProjectHeader";
import ArtifactList from "@/components/ArtifactLIst";
import Preview from "@/components/Preview";
import UpdateArtifact from "@/components/UpdateArtifact";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Artifact } from "@/types/Artifact";
import { Project } from "@/types/Project";
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

interface WorkspaceProps {
  params: { id: string };
}


const Workspace: React.FC<WorkspaceProps> = ({ params }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [isArtifactListCollapsed, setIsArtifactListCollapsed] = useState(false);
  const [isUpdateArtifactCollapsed, setIsUpdateArtifactCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProjectData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/projects?id=${params.id}`);
        setProject(response.data);
        if (response.data.artifacts && response.data.artifacts.length > 0) {
          setSelectedArtifact(response.data.artifacts[0]);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        if (axios.isAxiosError(error) && error.response) {
          if (error.response.status === 401) {
            setAuthError("You are not authorized to view this project. Please log in.");
          } else if (error.response.status === 403) {
            setAuthError("You don't have permission to view this project.");
          } else {
            toast.error("Failed to load project. Please try again.");
          }
        } else {
          toast.error("An unexpected error occurred. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [params.id]);

  const handleSelectArtifact = (artifact: Artifact) => {
    setSelectedArtifact(artifact);
  };

  const handleMyProjectsClick = () => {
    router.push('/dashboard');
  };

  const handleShare = () => {
    console.log("Share clicked");
    // Implement share functionality
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/projects?id=${params.id}`);
      toast.success('Project deleted successfully', {
        duration: 3000,
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project', {
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
  };

  if (authError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-semibold text-red-600 mb-2">{authError}</h2>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Preparing Your Workspace</h2>
        <p className="text-gray-500">Loading project details and artifacts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-500 mb-4">{error}</p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <svg className="w-16 h-16 text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Project Not Found</h2>
        <p className="text-gray-500 mb-4">The project you're looking for doesn't exist or has been deleted.</p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <HeaderV2 />
      <div className="flex-1 flex flex-col" style={{ marginTop: '64px' }}>
        <ProjectHeader
          projectTitle={project.title}
          projectDescription={project.description}
          onMyProjectsClick={handleMyProjectsClick}
          onShareClick={handleShare}
          onDeleteClick={handleDelete}
        />
        <div className="flex-1 p-5">
          <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <PanelGroup direction="horizontal" className="h-full">
              <Panel
                defaultSize={20}
                minSize={0}
                maxSize={100}
                collapsible={true}
              >
                <ArtifactList
                  artifacts={project.artifacts}
                  onSelectArtifact={handleSelectArtifact}
                  selectedArtifact={selectedArtifact}
                  isCollapsed={isArtifactListCollapsed}
                  setIsCollapsed={setIsArtifactListCollapsed}
                />
              </Panel>
              {!isArtifactListCollapsed && (
                <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors" />
              )}
              <Panel defaultSize={60} minSize={40} maxSize={100}>
                <Preview artifact={selectedArtifact} />
              </Panel>
              {!isUpdateArtifactCollapsed && (
                <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors" />
              )}
              <Panel
                defaultSize={20}
                minSize={0}
                maxSize={100}
                collapsible={true}
              >
                <UpdateArtifact
                  artifact={selectedArtifact}
                  isCollapsed={isUpdateArtifactCollapsed}
                  setIsCollapsed={setIsUpdateArtifactCollapsed}
                />
              </Panel>
            </PanelGroup>
          </div>
        </div>
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
    </div>
  );
};

export default Workspace;