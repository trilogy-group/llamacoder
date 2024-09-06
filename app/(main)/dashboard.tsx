"use client";

import React, { useState, useEffect } from "react";
import HeaderV2 from "@/components/HeaderV2";
import ProjectList from "@/components/ProjectList";
import CreateProjectButton from "@/components/CreateProjectButton";
import ProjectOverviewInputForm from "@/components/ProjectOverviewInputForm";
import { Project } from "@/types/Project";
import EmptyProjectMessage from "@/components/EmptyProjectMessage";
import { useRouter } from 'next/navigation';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/projects');
      console.log("Projects:", response.data);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (description: string) => {
    setIsCreatingProject(true);
    try {
      const titleResponse = await axios.post('/api/generateProjectTitle', { description });
      const generatedTitle = titleResponse.data.title;

      console.log("Generated title:", generatedTitle);

      const newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        title: generatedTitle,
        description: description,
        thumbnail: "",
        context: [],
        artifacts: [],
        entrypoint: {} as any,
        status: "Inactive",
        createdBy: "user",
        updatedBy: "user",
        publishedUrl: "",
      };

      const response = await axios.post('/api/projects', newProject);
      const createdProject = response.data;
      setProjects([...projects, createdProject]);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleOpenProject = (projectId: string) => {
    router.push(`/workspaces/${projectId}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderV2 />
      <main className="flex-1 w-full mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading your projects...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 mt-8">
              <p>{error}</p>
              <button 
                onClick={fetchProjects} 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : projects.length > 0 ? (
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
              />
            </>
          ) : (
            <EmptyProjectMessage onCreateProject={() => setShowCreateForm(true)} />
          )}
        </div>
      </main>

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4 backdrop-blur-[2px]">
          {isCreatingProject ? (
            <div className="bg-white rounded-lg p-6 flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
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
    </div>
  );
}

export default Dashboard;
