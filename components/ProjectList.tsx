import React from "react";
import ProjectOverview from "./ProjectOverview";
import { Project } from "@/types/Project";

interface ProjectListProps {
  projects: Project[];
  onProjectDeleted: (projectId: string) => void;
  onShareClick: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onProjectDeleted, onShareClick }) => {
  return (
    <div className="h-[calc(100vh-200px)] overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {projects.map((project) => (
          <ProjectOverview
            key={project.id}
            project={project}
            onProjectDeleted={onProjectDeleted}
            onShareClick={onShareClick}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;