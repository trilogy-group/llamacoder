import React from "react";
import CodeEditor from "./CodeEditor";
import { Artifact } from "../types/Artifact";

interface PreviewProps {
  artifact: Artifact | null;
}

const Preview: React.FC<PreviewProps> = ({ artifact }) => {
  return (
    <div className="w-full h-full">
      <CodeEditor 
        artifact={artifact}
      />
    </div>
  );
};

export default Preview;