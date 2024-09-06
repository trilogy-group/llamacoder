"use client";

import React, { useState } from "react";
import HeaderV2 from "@/components/HeaderV2";
import ProjectList from "@/components/ProjectList";
import CreateProjectButton from "@/components/CreateProjectButton";
import ProjectOverviewInputForm from "@/components/ProjectOverviewInputForm";
import { Project } from "@/types/Project";
import EmptyProjectMessage from "@/components/EmptyProjectMessage";
import { useRouter } from 'next/navigation';
import { dummyProjects } from "./dummy-projects";

// const dummyProjects: Project[] = [];

const Dashboard: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const router = useRouter();

  const handleCreateProject = () => setShowCreateForm(true);
  const handleCancelCreate = () => setShowCreateForm(false);

  const handleNextCreate = (description: string) => {
    console.log("New project description:", description);
    setShowCreateForm(false);
  };

  const handleOpenProject = (projectId: string) => {
    router.push(`/workspaces/${projectId}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderV2 />
      <main className="flex-1 w-full mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {dummyProjects.length > 0 ? (
            <>
              <div className="mb-8 mt-8 flex items-center justify-between">
                <h2 className="text-4xl font-bold text-gray-800">
                  Your Projects
                </h2>
                <CreateProjectButton
                  onClick={handleCreateProject}
                  showSearch={dummyProjects.length > 0}
                />
              </div>
              <ProjectList
                projects={dummyProjects}
                onCreateProject={handleCreateProject}
                onOpenProject={handleOpenProject}
              />
            </>
          ) : (
            <EmptyProjectMessage onCreateProject={handleCreateProject} />
          )}
        </div>
      </main>

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4 backdrop-blur-[2px]">
          <ProjectOverviewInputForm
            onCancel={handleCancelCreate}
            onNext={handleNextCreate}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
