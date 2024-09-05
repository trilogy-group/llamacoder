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
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';


interface CodeEditorProps {
  status: string
  files: Record<
    string,
    { code: string; active: boolean; hidden: boolean; readOnly: boolean }
  >;
  extraDependencies: { name: string; version: string }[];
  children?: React.ReactNode;
  onFixIt: (errorMessage: string) => void;
}

function SandpackContent({ status, children, onFixIt }: { status: string, children: React.ReactNode, onFixIt: (errorMessage: string) => void }) {
  const [isPreviewOnly, setIsPreviewOnly] = useState(true);
  const [hasCompilationError, setHasCompilationError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFixButtonDisabled, setIsFixButtonDisabled] = useState(false);

  const handleDownload = () => {
    const generatedCode: { code: string; extraLibraries: string[] } | null =
      localStorage.getItem("generatedCode")
        ? JSON.parse(localStorage.getItem("generatedCode") || "")
        : null;
    const activeFile: string | null = localStorage.getItem("activeFile") || "";
    if (!generatedCode || !activeFile) {
      return;
    }
    const blob = new Blob([generatedCode.code], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, activeFile.slice(1, activeFile.length));
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

  const { sandpack, listen } = useSandpack();
  const { activeFile, updateFile } = sandpack;
  const { code } = useActiveCode();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const { logs, reset } = useSandpackConsole({ resetOnPreviewRestart: true });

  useEffect(() => {
    updateFile("/App.tsx", code);
    const files: Record<
      string,
      { code: string; active: boolean; hidden: boolean; readOnly: boolean }
    > = JSON.parse(localStorage.getItem("codeFiles") || "{}");
    // Set active status to false for all files
    Object.keys(files).forEach((key) => {
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
    const generatedCode = JSON.parse(
      localStorage.getItem("generatedCode") || "{}",
    );
    localStorage.setItem(
      "generatedCode",
      JSON.stringify({
        code,
        extraLibraries: generatedCode.extraLibraries || [],
      }),
    );
  }, [code, activeFile]);

  useEffect(() => {
    console.log("status: ", status, statusMessage);
  }, [status, statusMessage]);

  useEffect(() => {
    const stopListening = listen((msg) => {
      console.log("msg: ", msg);
      if(status === "creating" || status === "updating") {
        setStatusMessage("🚀 Generating code...");
      } else if (msg.type === "action" && msg.action === "show-error") {
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
  }, [listen, statusMessage, status]);

  const handleFixIt = () => {
    if (errorMessage) {
      onFixIt(errorMessage);
      setIsFixButtonDisabled(true);
    }
  };

  useEffect(() => {
    localStorage.setItem("activeFile", activeFile);
  }, [activeFile]);

  return (
    <div className="relative">
      <div className="flex items-center gap-4 py-2">
        {children}
      </div>
      <SandpackLayout>
        {!isPreviewOnly && (
          <SandpackCodeEditor
            style={{ height: "calc(80vh - 40px)", width: "50%" }}
            showRunButton={true}
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
            height: "calc(80vh - 40px)",
            width: isPreviewOnly ? "100%" : "50%",
          }}
        >
          <SandpackPreview
            style={{
              height: "calc(80vh - 40px)",
              width: "100%"
            }}
          />
          {statusMessage && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center"
              style={{ backgroundColor: '#1e2029' }}
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
      {errorMessage && (
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
      )}
    </div>
  );
}

export default function CodeEditor({
  status,
  files,
  extraDependencies,
  children,
  onFixIt,
}: CodeEditorProps) {
  const dependencies = {
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
    "react-player": "latest",
  };

  const [customDependencies, setCustomDependencies] = useState(dependencies);

  useEffect(() => {
    const normalizedExtraDependencies = extraDependencies.reduce(
      (acc, dep) => {
        acc[dep.name] = "latest";
        return acc;
      },
      {} as Record<string, string>,
    );

    setCustomDependencies({
      ...dependencies,
      ...normalizedExtraDependencies,
    });

    // console.log("customDependencies: ", customDependencies)
    console.log("dependencies: ", dependencies);
    console.log("extraDependencies: ", extraDependencies);
    console.log("normalizedExtraDependencies: ", normalizedExtraDependencies);
  }, [extraDependencies]);

  useEffect(() => {
    console.log("customDependencies: ", customDependencies);
  }, [customDependencies]);

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
            dependencies: customDependencies,
          }}
          files={files}
        >
          <div className="relative">
            <SandpackContent status={status} onFixIt={onFixIt}>{children}</SandpackContent>
          </div>
        </SandpackProvider>
      </AnimatePresence>
    </div>
  );
}
