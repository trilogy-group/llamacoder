"use client";

import React, { useState, useEffect } from "react";
import HeaderV2 from "@/components/HeaderV2";
import ProjectHeader from "@/components/ProjectHeader";
import ArtifactList from "@/components/ArtifactLIst";
import Preview from "@/components/Preview";
import UpdateArtifact from "@/components/UpdateArtifact";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useAppContext } from "@/contexts/AppContext";
import { Artifact } from "@/types/Artifact";
import { Project } from "@/types/Project";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const Workspace: React.FC = () => {
  const {
    currentProject,
    setCurrentProject,
    currentArtifact,
    setCurrentArtifact,
    projects,
  } = useAppContext();

  const [project, setProject] = useState<Project | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(
    null,
  );
  const [isArtifactListCollapsed, setIsArtifactListCollapsed] = useState(false);
  const [isUpdateArtifactCollapsed, setIsUpdateArtifactCollapsed] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  console.log("CurrnetProject", currentProject);
  console.log("CurrnetArtifact", currentArtifact);
  console.log("Projects", projects);

  useEffect(() => {
    // Set the first project as current if not already set
    if (!currentProject && projects.length > 0) {
      setCurrentProject(projects[0]);
    }
  }, [currentProject, projects, setCurrentProject]);

  useEffect(() => {
    // Set the first artifact as current if not already set
    if (
      currentProject &&
      !currentArtifact &&
      currentProject.artifacts.length > 0
    ) {
      setCurrentArtifact(currentProject.artifacts[0]);
    }
  }, [currentProject, currentArtifact, setCurrentArtifact]);

  const handleSelectArtifact = (artifact: Artifact) => {
    setCurrentArtifact(artifact);
  };

  const handleMyProjectsClick = () => {
    router.push("/dashboard");
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
      // await axios.delete(`/api/projects?id=${params.id}`);
      toast.success("Project deleted successfully", {
        duration: 3000,
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project", {
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

  // if (!currentProject || !currentArtifact) {
  //   return <div>Loading workspace...</div>; // Or a more sophisticated loading component
  // }

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
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
        <div className="mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        <h2 className="mb-2 text-2xl font-semibold text-gray-700">
          Preparing Your Workspace
        </h2>
        <p className="text-gray-500">
          Loading project details and artifacts...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
        <svg
          className="mb-4 h-16 w-16 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="mb-2 text-2xl font-semibold text-gray-700">
          Oops! Something went wrong
        </h2>
        <p className="mb-4 text-gray-500">{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-full bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
        <svg
          className="mb-4 h-16 w-16 text-yellow-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 className="mb-2 text-2xl font-semibold text-gray-700">
          Project Not Found
        </h2>
        <p className="mb-4 text-gray-500">
          The project you're looking for doesn't exist or has been deleted.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-full bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <HeaderV2 />
      <div className="flex flex-1 flex-col" style={{ marginTop: "64px" }}>
        <ProjectHeader
          projectTitle={currentProject.title}
          projectDescription={currentProject.description}
          onMyProjectsClick={handleMyProjectsClick}
          onShareClick={handleShare}
          onDeleteClick={handleDelete}
        />
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={20} minSize={0} maxSize={100} collapsible={true}>
            <ArtifactList
              artifacts={currentProject.artifacts}
              onSelectArtifact={handleSelectArtifact}
              selectedArtifact={currentArtifact}
              isCollapsed={isArtifactListCollapsed}
              setIsCollapsed={setIsArtifactListCollapsed}
            />
          </Panel>
          {!isArtifactListCollapsed && (
            <PanelResizeHandle className="w-1 bg-gray-200 transition-colors hover:bg-gray-300" />
          )}
          <Panel defaultSize={60} minSize={40} maxSize={100}>
            <div className="h-full">
              {currentArtifact && <Preview artifact={currentArtifact} />}
            </div>
          </Panel>
          {!isUpdateArtifactCollapsed && (
            <PanelResizeHandle className="w-1 bg-gray-200 transition-colors hover:bg-gray-300" />
          )}
          <Panel defaultSize={20} minSize={0} maxSize={100} collapsible={true}>
            {currentArtifact && (
              <UpdateArtifact
                artifact={currentArtifact}
                isCollapsed={isUpdateArtifactCollapsed}
                setIsCollapsed={setIsUpdateArtifactCollapsed}
              />
            )}
          </Panel>
        </PanelGroup>
      </div>
      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
            <h3 className="mb-4 text-xl font-semibold">Confirm Deletion</h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this project? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDeleteCancel}
                className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="rounded-md bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace;
