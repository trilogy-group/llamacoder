import {
  SandpackProvider,
  SandpackPreview,
  useSandpack,
  useActiveCode,
  SandpackCodeEditor,
  SandpackLayout,
  useSandpackConsole,
} from "@codesandbox/sandpack-react";
import { dracula as draculaTheme } from "@codesandbox/sandpack-themes";
import { useEffect, useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CodeIcon from "@mui/icons-material/Code";
import DownloadIcon from "@mui/icons-material/GetApp"; // Changed to a more appropriate icon
import { saveAs } from "file-saver";
import CircularProgress from "@mui/material/CircularProgress";
import { Artifact } from "../types/Artifact";
import { Project } from "../types/Project"; // Assuming you have a Project type
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";

interface CodeEditorProps {
  project: Project;
  selectedArtifact: Artifact;
  onFixIt?: (errorMessage: string) => void;
  children?: React.ReactNode;
}

function SandpackContent({
  children,
  status,
  onFixIt,
  onReset,
}: {
  children: React.ReactNode;
  status: "idle" | "creating" | "updating";
  onFixIt: (errorMessage: string) => void;
  onReset: () => void;
}) {
  const [isPreviewOnly, setIsPreviewOnly] = useState(true);
  const [hasCompilationError, setHasCompilationError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFixButtonDisabled, setIsFixButtonDisabled] = useState(false);

  const { sandpack, listen } = useSandpack();
  const { files, activeFile, updateFile } = sandpack;
  const { code } = useActiveCode();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const { logs, reset } = useSandpackConsole({ resetOnPreviewRestart: true });

  const handleDownload = () => {
    const blob = new Blob([code], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, "App.tsx");
  };

  const handleFixIt = () => {
    if (errorMessage) {
      onFixIt(errorMessage);
      setIsFixButtonDisabled(true);
    }
  };

  const actionButtons = (
    <div className="absolute bottom-2 left-2 z-20 flex gap-2">
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

  useEffect(() => {
    updateFile("/App.tsx", code);
  }, [code, activeFile]);

  useEffect(() => {
    console.log("files: ", files);
  }, [files]);

  useEffect(() => {
    const stopListening = listen((msg) => {
      console.log("msg: ", msg);
      if (msg.type === "action" && msg.action === "show-error") {
        setErrorMessage(msg.message);
        setIsFixButtonDisabled(false);
      } else if (msg.type === "dependencies") {
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
        if ("compilatonError" in msg) {
          setHasCompilationError(msg.compilatonError);
          if (msg.compilatonError) {
            setIsFixButtonDisabled(false);
          }
        }
        console.log("logs: ", logs);
      }
    });
    return () => {
      stopListening();
    };
  }, [listen, statusMessage]);

  return (
    <div className="relative">
      <div className="flex items-center gap-4 py-2">{children}</div>
      <SandpackLayout>
        {!isPreviewOnly && (
          <SandpackCodeEditor
            style={{ height: "calc(80vh - 10px)", width: "50%" }}
            showRunButton={false}
            showInlineErrors={true}
            wrapContent={true}
            showLineNumbers={true}
            showTabs={true}
            showReadOnly={true}
          />
        )}
        <div
          className="relative"
          style={{
            height: "calc(80vh - 10px)",
            width: isPreviewOnly ? "100%" : "50%",
          }}
        >
          <SandpackPreview
            style={{
              height: "calc(80vh - 10px)",
              width: "100%",
            }}
            showRefreshButton={true}
            showNavigator={false}
            showRestartButton={true}
            showOpenInCodeSandbox={true}
            showOpenNewtab={false}
            showSandpackErrorOverlay={false}
          />
          {statusMessage && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center"
              style={{ backgroundColor: "#1e2029" }}
            >
              <div className="flex flex-col items-center">
                <CircularProgress size={60} thickness={4} color="primary" />
                <p className="mt-2 text-lg font-semibold text-white">
                  {statusMessage}
                </p>
              </div>
            </div>
          )}
        </div>
        {statusMessage === "" && actionButtons}
      </SandpackLayout>
      {statusMessage !== "" && (
        <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center">
          <button
            onClick={onReset}
            className="sp-icon-standalone sp-c-bxeRRt sp-c-gMfcns sp-c-dEbKhQ sp-button flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2"
            title="Reset Sandbox"
          >
            <RefreshIcon style={{ width: "16px", height: "16px" }} />
          </button>
        </div>
      )}
      {/* {errorMessage && (
        <button
          onClick={handleFixIt}
          className={`flex items-center gap-2 absolute top-6 right-2 z-50 font-medium py-2 px-4 rounded-full transition-colors
            ${isFixButtonDisabled 
              ? 'bg-blue-300 text-white cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          title="Fix Compilation Error"
          disabled={isFixButtonDisabled}
        >
          <ErrorOutlineIcon style={{ width: "16px", height: "16px" }} />
          <span>Auto Fix</span>
        </button>
      )} */}
    </div>
  );
}

export default function CodeEditor({
  project,
  selectedArtifact,
  children,
}: CodeEditorProps) {
  const [key, setKey] = useState(0);

  const normalizedDependencies = useMemo(() => {
    const allDependencies =
      project.artifacts?.flatMap((artifact) => artifact.dependencies || []) ||
      [];
    return allDependencies.reduce(
      (acc, dep) => {
        acc[dep.name] = "latest";
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [project.artifacts]);

  const sandpackFiles = useMemo(() => {
    const files: Record<
      string,
      { code: string; active: boolean; hidden: boolean; readOnly: boolean }
    > = {};

    // Add all project artifacts as files
    project.artifacts?.forEach((artifact) => {
      files[`/${artifact.name}.tsx`] = {
        code: artifact.code || "",
        active: artifact.id === selectedArtifact.id,
        hidden: artifact.id !== selectedArtifact.id,
        readOnly: false,
      };
    });

    // Add App.tsx with the selected artifact's code, but hidden
    files["/App.tsx"] = {
      code: selectedArtifact.code || "",
      active: false,
      hidden: true,
      readOnly: true,
    };

    return files;
  }, [project.artifacts, selectedArtifact]);

  const handleFixIt = (errorMessage: string) => {
    console.log("errorMessage: ", errorMessage);
  };

  const handleReset = () => {
    console.log("handleReset: ", key);
    setKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="relative h-full w-full">
      <AnimatePresence>
        <SandpackProvider
          key={key}
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
          files={sandpackFiles}
        >
          <SandpackContent
            status={selectedArtifact.status}
            onFixIt={handleFixIt}
            onReset={handleReset}
          >
            {children}
          </SandpackContent>
        </SandpackProvider>
      </AnimatePresence>
    </div>
  );
}
