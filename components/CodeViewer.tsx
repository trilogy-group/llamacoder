import React, { useMemo } from 'react';
import {
  SandpackProvider,
  SandpackCodeEditor,
} from "@codesandbox/sandpack-react";
import { dracula as draculaTheme } from "@codesandbox/sandpack-themes";

interface CodeViewerProps {
  code: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ code }) => {
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
    </div>
  );
};

export default CodeViewer;