import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  useSandpack,
  useActiveCode,
  useSandpackConsole,
  SandpackCodeEditor,
} from "@codesandbox/sandpack-react";
import { dracula as draculaTheme } from "@codesandbox/sandpack-themes";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CodeIcon from "@mui/icons-material/Code";
import DownloadIcon from "@mui/icons-material/GetApp"; // Changed to a more appropriate icon
import { saveAs } from "file-saver";
import CircularProgress from "@mui/material/CircularProgress";
import { Artifact } from "../types/Artifact";

interface CodeEditorProps {
  artifact: Artifact;
  children?: React.ReactNode;
}

function SandpackContent({ children, onCodeChange }: { children: React.ReactNode, onCodeChange: (code: string) => void }) {
  const [isPreviewOnly, setIsPreviewOnly] = useState(true);

  const handleDownload = () => {
    const blob = new Blob([code], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, "App.tsx");
  };

  const actionButtons = (
    <div className="absolute bottom-2 left-2 z-10 flex gap-2">
      <button
        onClick={() => setIsPreviewOnly(!isPreviewOnly)}
        className="sp-icon-standalone sp-c-bxeRRt sp-c-gMfcns sp-c-dEbKhQ sp-button flex items-center gap-2"
        title={isPreviewOnly ? "Show Editor" : "Show Preview"}
      >
        {isPreviewOnly ? (
          <CodeIcon style={{ width: "16px", height: "16px" }} />
        ) : (
          <VisibilityIcon style={{ width: "16px", height: "16px" }} />
        )}
        <span>{isPreviewOnly ? "Editor" : "Preview"}</span>
      </button>
      <button
        onClick={handleDownload}
        className="sp-icon-standalone sp-c-bxeRRt sp-c-gMfcns sp-c-dEbKhQ sp-button flex items-center gap-2"
        title="Download Code"
      >
        <DownloadIcon style={{ width: "16px", height: "16px" }} />
      </button>
    </div>
  );

  const { listen } = useSandpack();
  const { code } = useActiveCode();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const { logs, reset } = useSandpackConsole({ resetOnPreviewRestart: true });

  useEffect(() => {
    onCodeChange(code);
  }, [code, onCodeChange]);

  useEffect(() => {
    const stopListening = listen((msg) => {
      console.log("msg: ", msg);
      if (msg.type === "dependencies") {
        setStatusMessage("📦 Installing dependencies...");
      } else if (msg.type === "status") {
        if (msg.status === "transpiling") {
          setStatusMessage("⚙️ Assembling your code...");
        } else if (msg.status === "evaluating") {
          setStatusMessage("🚀 Your app is almost ready!");
        } else if (msg.status === "idle") {
          setStatusMessage("");
        }
      } else if (msg.type == "done") {
        console.log("logs: ", logs);
      }
    });
    return () => {
      stopListening();
    };
  }, [listen, statusMessage]);

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex-grow overflow-hidden flex">
        {!isPreviewOnly && (
          <SandpackCodeEditor
            className="flex-1 h-full"
            showRunButton={true}
            showInlineErrors={true}
            wrapContent={true}
            showLineNumbers={true}
            showTabs={true}
            showReadOnly={true}
          />
        )}
        <div
          className={`relative ${isPreviewOnly ? 'w-full' : 'w-1/2'} h-full`}
        >
          <SandpackPreview className="h-full w-full" />
          {statusMessage && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-center">
                <CircularProgress size={60} thickness={4} color="primary" />
                <p className="mt-2 text-lg font-semibold text-white">
                  {statusMessage}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {statusMessage === "" && actionButtons}
    </div>
  );
}

export default function CodeEditor({
  artifact,
  children,
}: CodeEditorProps) {
  const normalizedDependencies = Array.isArray(artifact.dependencies)
    ? artifact.dependencies.reduce(
        (acc, dep) => {
          acc[dep.name] = dep.version || "latest";
          return acc;
        },
        {} as Record<string, string>
      )
    : {};

  const handleCodeChange = (newCode: string) => {
    // Dispatch an event to update the artifact
    const event = new CustomEvent('artifactCodeChange', { detail: { code: newCode } });
    window.dispatchEvent(event);
  };

  return (
    <div className="relative w-full h-full">
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
            dependencies: normalizedDependencies,
          }}
          files={{
            "/App.tsx": {
              code: artifact.code || "",
              active: true,
              hidden: false,
              readOnly: false,
            },
          }}
        >
          <SandpackContent onCodeChange={handleCodeChange}>{children}</SandpackContent>
        </SandpackProvider>
      </AnimatePresence>
    </div>
  );
}
