import React from "react";
import CodeEditor from "./CodeEditor";
import { Project } from "../types/Project";
import { Artifact } from "../types/Artifact";
import { SandpackError } from "@codesandbox/sandpack-client";

interface PreviewProps {
  project: Project;
  selectedArtifact: Artifact;
  onAutoFix?: (error: SandpackError, callback: () => void) => void;
  onSandpackError?: (error: SandpackError) => void;
  onSuccess?: () => void;
  initialMode: 'preview' | 'editor';
}

const Preview: React.FC<PreviewProps> = ({ project, selectedArtifact, onAutoFix, onSandpackError, onSuccess }) => {
  return (
    <div className="w-full h-full">
      <CodeEditor 
        project={project}
        selectedArtifact={selectedArtifact}
        onAutoFix={onAutoFix}
        onSandpackError={onSandpackError}
        onSuccess={onSuccess}
      />
    </div>
  );
};

export default Preview;