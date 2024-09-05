import React, { useState } from "react";
import Header from "@/components/Header";
import ProjectList from "@/components/ProjectList";
import CreateProjectButton from "@/components/CreateProjectButton";
import ProjectOverviewInputForm from "@/components/ProjectOverviewInputForm";
import { Project } from "@/types/Project";
import EmptyProjectMessage from "@/components/EmptyProjectMessage";
import { dummyProjects } from "./dummy-projects";
import HeaderV2 from "@/components/HeaderV2";
import WorkspaceHeader from "@/components/WorkspaceHeader";

// const dummyProjects: Project[] = [];

const Dashboard: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateProject = () => setShowCreateForm(true);
  const handleCancelCreate = () => setShowCreateForm(false);

  const handleNextCreate = (description: string) => {
    console.log("New project description:", description);
    setShowCreateForm(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderV2 />
      {/* <WorkspaceHeader project={dummyProjects[1]} /> */}
      <main className="flex-1 w-full mt-16">
      </main>
    </div>
  );
};

export default Dashboard;
