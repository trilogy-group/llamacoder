import React, { useMemo } from 'react';
import {
  SandpackProvider,
  SandpackCodeEditor,
} from "@codesandbox/sandpack-react";
import { dracula as draculaTheme } from "@codesandbox/sandpack-themes";
import CircularProgress from "@mui/material/CircularProgress";

interface CodeViewerProps {
  code: string;
  status: 'creating' | 'updating' | 'idle';
}

const CodeViewer: React.FC<CodeViewerProps> = ({ code, status }) => {
    const message = useMemo(() => {
        return `🚀 Artifact ${status === 'creating' ? 'generation' : 'update'} in progress...`
    }, [status])

  const sandpackFiles = useMemo(() => ({
    "/App.tsx": {
      code: code || "",
      active: true,
      hidden: false,
      readOnly: false,
    },
  }), [code]);

  return (
    <div className="relative w-full h-full">
      {code ? (
        <SandpackProvider
          template="react-ts"
          theme={draculaTheme}
          files={sandpackFiles}
        >
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-grow overflow-hidden flex relative">
              <SandpackCodeEditor
                className="w-full h-full"
                showTabs={false}
                showLineNumbers={true}
                showInlineErrors={true}
                wrapContent={true}
                readOnly={true}
              />
            </div>
          </div>
        </SandpackProvider>
      ) : (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-100">
          <div className="text-center">
            <CircularProgress size={60} thickness={4} color="primary" />
            <p className="mt-2 text-lg font-semibold text-white">
              {message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeViewer;