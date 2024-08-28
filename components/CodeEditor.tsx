import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
  useActiveCode,
} from "@codesandbox/sandpack-react";
import { dracula as draculaTheme } from "@codesandbox/sandpack-themes";
import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { AnimatePresence } from "framer-motion";

interface CodeEditorProps {
  files: Record<
    string,
    { code: string; active: boolean; hidden: boolean; readOnly: boolean }
  >;
  children?: React.ReactNode;
}

function SandpackContent({ children }: { children: React.ReactNode }) {
  const { sandpack, listen } = useSandpack();
  const { activeFile, updateFile } = sandpack;
  const { code } = useActiveCode();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    updateFile("/App.tsx", code);
    const files: Record<
      string,
      { code: string; active: boolean; hidden: boolean; readOnly: boolean }
    > = JSON.parse(localStorage.getItem("codeFiles") || "{}");
    // Set active status to false for all files
    Object.keys(files).forEach(key => {
      files[key].active = false;
    });

    // Update the current file
    files[activeFile] = {
      code: code,
      active: true,
      hidden: false,
      readOnly: false,
    };

    files["/App.tsx"] = {
      code: code,
      active: false,
      hidden: true,
      readOnly: true,
    };
    
    localStorage.setItem("codeFiles", JSON.stringify(files));
    localStorage.setItem("generatedCode", code);
  }, [code, activeFile]);

  useEffect(() => {
    const stopListening = listen((msg) => {
      if (msg.type === "status") {
        if (msg.status === "transpiling") {
          setStatusMessage("🚀 Assembling your code... Almost there!");
        } else if (msg.status === "evaluating") {
          setStatusMessage("🚀 Analyzing... Your app is almost ready!");
        } else if (msg.status === "idle") {
          setStatusMessage("");
        }
      }
    });
    return () => {
      stopListening();
    };
  }, [listen, statusMessage]);

  useEffect(() => {
    localStorage.setItem('activeFile', activeFile);
  }, [activeFile]);

  return (
    <>
      <div className="flex items-center gap-4 py-2">{children}</div>
      <SandpackLayout>
        <SandpackCodeEditor
          style={{ height: "calc(80vh - 40px)" }}
          showRunButton={true}
          showInlineErrors={true}
          wrapContent={true}
          showLineNumbers={true}
          showTabs={true}
          showReadOnly={true}
        />
        <div className="relative" style={{ height: "calc(80vh - 40px)", width: "50%" }}>
          <SandpackPreview style={{ height: "100%" }} />
          {statusMessage && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
              <CircularProgress size={60} thickness={4} color="primary" />
              <p className="mt-2 text-lg font-semibold text-white">
                {statusMessage}
              </p>
            </div>
          )}
        </div>
      </SandpackLayout>
    </>
  );
}

export default function CodeEditor({
  files,
  children,
}: CodeEditorProps) {
  return (
    <div className="relative w-full overflow-hidden">
      <AnimatePresence>
        <SandpackProvider
          template="react-ts"
          options={{
            externalResources: [
              "https://unpkg.com/@tailwindcss/ui/dist/tailwind-ui.min.css",
            ],
          }}
          theme={draculaTheme}
          customSetup={{
            dependencies: {
              "lucide-react": "latest",
              recharts: "2.9.0",
              axios: "latest",
              "react-dom": "latest",
              "react-router-dom": "latest",
              "react-ui": "latest",
              "@mui/material": "latest",
              "@emotion/react": "latest",
              "@emotion/styled": "latest",
              "@mui/icons-material": "latest",
            },
          }}
          files={files}
        >
          <div className="relative">
            <SandpackContent>{children}</SandpackContent>
          </div>
        </SandpackProvider>
      </AnimatePresence>
    </div>
  );
}
