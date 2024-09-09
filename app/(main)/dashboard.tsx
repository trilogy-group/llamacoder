"use client";

import CreateProjectButton from "@/components/CreateProjectButton";
import EmptyProjectMessage from "@/components/EmptyProjectMessage";
import HeaderV2 from "@/components/HeaderV2";
import ProjectList from "@/components/ProjectList";
import ProjectOverviewInputForm from "@/components/ProjectOverviewInputForm";
import { useAppContext } from "@/contexts/AppContext";
import { Project } from "@/types/Project";
import { useUser } from "@auth0/nextjs-auth0/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Toaster, toast } from "sonner";
import { projectApi } from "@/utils/apiClients/Project";
import { CircularProgress } from "@mui/material";

const Dashboard: React.FC = () => {
  const { user, error: userError, isLoading: userLoading } = useUser();
  const { projects, dispatchProjectsUpdate, projectsLoading } = useAppContext();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
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
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project. Please try again.");
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleOpenProject = (projectId: string) => {
    router.push(`/workspaces/${projectId}`);
  };

  const handleProjectDeleted = async (deletedProjectId: string) => {
    try {
      await projectApi.deleteProject(deletedProjectId);
      dispatchProjectsUpdate(projects.filter(project => project.id !== deletedProjectId));
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project. Please try again.");
    }
  };

  if (userLoading || projectsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <CircularProgress size={60} />
      </div>
    );
  }

  if (userError) return <div>{userError.message}</div>;

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderV2 user={user} />
      <main className="mt-16 w-full flex-1">
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
                onCreateProject={() => setShowCreateForm(true)}
                onOpenProject={handleOpenProject}
                onProjectDeleted={handleProjectDeleted}
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
            <div className="flex flex-col items-center rounded-lg bg-white p-6">
              <div className="mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
              <p className="text-gray-600">Creating your project...</p>
            </div>
          ) : (
            <ProjectOverviewInputForm
              onCancel={() => setShowCreateForm(false)}
              onNext={handleCreateProject}
            />
          )}
        </div>
      )}
      <Toaster position="bottom-right" />
    </div>
  );
};

export default Dashboard;
