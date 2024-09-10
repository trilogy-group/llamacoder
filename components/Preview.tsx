import React from "react";
import CodeEditor from "./CodeEditor";
import { Artifact } from "../types/Artifact";

interface PreviewProps {
  artifact: Artifact;
  initialMode: 'preview' | 'editor';
}

const Preview: React.FC<PreviewProps> = ({ artifact, initialMode }) => {
  return (
    <div className="w-full h-full">
      <CodeEditor 
        artifact={artifact}
        initialMode={initialMode}
      />
    </div>
  );
};

export default Preview;