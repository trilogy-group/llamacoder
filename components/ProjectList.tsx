import React from "react";
import ProjectOverview from "./ProjectOverview";
import { Project } from "@/types/Project";

interface ProjectListProps {
  projects: Project[];
  onCreateProject: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onCreateProject }) => {
  return (
    <div className="h-[calc(100vh-200px)] overflow-y-auto pr-4">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectOverview key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;