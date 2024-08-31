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

interface CodeEditorProps {
  files: Record<
    string,
    { code: string; active: boolean; hidden: boolean; readOnly: boolean }
  >;
  extraDependencies: { name: string; version: string }[];
  children?: React.ReactNode;
}

function SandpackContent({ children }: { children: React.ReactNode }) {
  const [isPreviewOnly, setIsPreviewOnly] = useState(true);

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
    <div className="absolute bottom-2 left-2 flex gap-2 z-10">
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

  useEffect(() => {
    localStorage.setItem("activeFile", activeFile);
  }, [activeFile]);

  return (
    <div className="relative">
      <div className="flex items-center gap-4 py-2">{children}</div>
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
          style={{ height: "calc(80vh - 40px)", width: isPreviewOnly ? "100%" : "50%" }}
        >
        <SandpackPreview
          style={{
            height: "calc(80vh - 40px)",
            width: isPreviewOnly ? "100%" : "50%",
          }}
        />
        {statusMessage === "" && actionButtons}
        {statusMessage && (
            <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 transform flex-col items-center">
              <CircularProgress size={60} thickness={4} color="primary" />
              <p className="mt-2 text-lg font-semibold text-white">
                {statusMessage}
              </p>
            </div>
          )}
                  </div>

      </SandpackLayout>
    </div>
  );
}

export default function CodeEditor({
  files,
  extraDependencies,
  children,
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
            <SandpackContent>{children}</SandpackContent>
          </div>
        </SandpackProvider>
      </AnimatePresence>
    </div>
  );
}
