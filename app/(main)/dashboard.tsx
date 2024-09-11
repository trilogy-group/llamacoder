"use client";

import CreateProjectButton from "@/components/CreateProjectButton";
import EmptyProjectMessage from "@/components/EmptyProjectMessage";
import HeaderV2 from "@/components/HeaderV2";
import ProjectList from "@/components/ProjectList";
import ProjectOverviewInputForm from "@/components/ProjectOverviewInputForm";
import ProjectShareModal from "@/components/ProjectShareModal";
import { useAppContext } from "@/contexts/AppContext";
import { Project } from "@/types/Project";
import { useUser } from "@auth0/nextjs-auth0/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Alert from "@/components/Alert";
import { CircularProgress } from "@mui/material";
import { projectApi } from "@/utils/apiClients/Project";

const Dashboard: React.FC = () => {
  const { user, error: userError, isLoading: userLoading } = useUser();
  const { projects, dispatchProjectsUpdate, projectsLoading } = useAppContext();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'error' | 'info' | 'warning' | 'success'; message: string } | null>(null);

  const router = useRouter();

  const handleCreateProject = async (description: string) => {
    setIsCreatingProject(true);
    try {
      const titleResponse = await axios.post("/api/generateProjectTitle", {
        description,
      });
      const generatedTitle = titleResponse.data.title;

      const newProject: Partial<Project> = {
        title: generatedTitle,
        description: description,
        thumbnail: "",
        context: [],
        status: "Inactive"
      };

      const createdProject = await projectApi.createProject(newProject);
      dispatchProjectsUpdate([...projects, createdProject]);
      setShowCreateForm(false);
      router.push(`/workspaces/${createdProject.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      setAlert({ type: 'error', message: "Failed to create project. Please try again." });
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleShareClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setShowShareModal(true);
  };

  const handleProjectDeleted = async (deletedProjectId: string) => {
    try {
      await projectApi.deleteProject(deletedProjectId);
      setAlert({ type: 'success', message: "Project deleted successfully." });
      dispatchProjectsUpdate(projects.filter(project => project.id !== deletedProjectId));
    } catch (error) {
      console.error("Error deleting project:", error);
      setAlert({ type: 'error', message: "Failed to delete project. Please try again." });
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <CircularProgress size={60} />
      </div>
    );
  }

  if (projectsLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
        <CircularProgress size={64} />
        <h2 className="mb-2 mt-4 text-2xl font-semibold text-gray-700">
          Loading your projects...
        </h2>
      </div>
    );
  }
  
  if (userError) {
    router.push("/api/auth/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderV2 user={user} />
      <main className="mt-24 w-full flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {projects.length > 0 ? (
            <>
              <div className="mb-8 mt-8 flex items-center justify-between">
                <h2 className="text-4xl font-bold text-gray-800">
                  Your Projects
                </h2>
                <CreateProjectButton
                  onClick={() => setShowCreateForm(true)}
                  showSearch={projects.length > 0}
                />
              </div>
              <ProjectList
                projects={projects}
                onProjectDeleted={handleProjectDeleted}
                onShareClick={handleShareClick}
              />
            </>
          ) : (
            <EmptyProjectMessage
              onCreateProject={() => setShowCreateForm(true)}
            />
          )}
        </div>
      </main>

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4 backdrop-blur-[2px]">
          {isCreatingProject ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-20 shadow-lg">
              <CircularProgress size={80} thickness={4} className="mb-6" />
              <p className="text-xl text-gray-800 font-medium">Creating your project...</p>
            </div>
          ) : (
            <ProjectOverviewInputForm
              onCancel={() => setShowCreateForm(false)}
              onNext={handleCreateProject}
            />
          )}
        </div>
      )}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      {showShareModal && selectedProjectId && (
      <ProjectShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        projectId={selectedProjectId}
        projectTitle={projects.find(p => p.id === selectedProjectId)?.title || ''}
      />
)}
    </div>
  );
};

export default Dashboard;
