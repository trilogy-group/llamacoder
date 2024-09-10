import React from "react";
import CodeEditor from "./CodeEditor";
import { Project } from "../types/Project";
import { Artifact } from "../types/Artifact";

interface PreviewProps {
  project: Project;
  selectedArtifact: Artifact;
  initialMode: 'preview' | 'editor';
}

const Preview: React.FC<PreviewProps> = ({ project, selectedArtifact, initialMode }) => {
  return (
    <div className="w-full h-full">
      <CodeEditor 
        project={project}
        selectedArtifact={selectedArtifact}
      />
    </div>
  );
};

export default Preview;