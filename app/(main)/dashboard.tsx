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
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      console.log("Projects:", response.data);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleCreateProject = async (description: string) => {
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
              />
            </>
          ) : (
            <EmptyProjectMessage onCreateProject={() => setShowCreateForm(true)} />
          )}
        </div>
      </main>

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4 backdrop-blur-[2px]">
          <ProjectOverviewInputForm
            onCancel={() => setShowCreateForm(false)}
            onNext={handleCreateProject}
          />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
