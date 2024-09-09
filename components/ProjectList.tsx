import React from "react";
import ProjectOverview from "./ProjectOverview";
import { Project } from "@/types/Project";

interface ProjectListProps {
  projects: Project[];
  onCreateProject: () => void;
  onOpenProject: (projectId: string) => void;
  onProjectDeleted: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onCreateProject, onOpenProject, onProjectDeleted }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectOverview
          key={project.id}
          project={project}
          onProjectDeleted={onProjectDeleted}
        />
      ))}
    </div>
  );
};

export default ProjectList;