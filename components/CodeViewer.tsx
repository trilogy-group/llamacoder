import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackLayout,
} from "@codesandbox/sandpack-react";
import { dracula as draculaTheme } from "@codesandbox/sandpack-themes";
import { useEffect, useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import CircularProgress from "@mui/material/CircularProgress";
import { ArtifactStatus } from "@/types/Artifact";

interface CodeEditorProps {
  code: string;
  status: ArtifactStatus;
}

function SandpackContent({
  status,
  code,
}: {
  status: ArtifactStatus;
  code: string;
}) {
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    if (code === "") {
      if (status === "creating") {
        setStatusMessage("🚀 Please wait while we create your artifact...");
      } else if (status === "updating") {
        setStatusMessage("🚀 Please wait while we update your artifact...");
      }
    } else {
      setStatusMessage("");
    }
  }, [status, statusMessage, code]);

  return (
    <div className="relative">
      <SandpackLayout>
        {statusMessage === "" ? (
          <SandpackCodeEditor
            style={{ height: "calc(80vh - 10px)", width: "100%" }}
            showRunButton={false}
            showInlineErrors={false}
            wrapContent={true}
            showLineNumbers={true}
            showTabs={true}
            showReadOnly={true}
          />
        ) : (
          <div
            className="relative"
            style={{
              height: "calc(80vh - 10px)",
              width: "100%",
            }}
          >
            <SandpackPreview
              style={{
                height: "calc(80vh - 10px)",
                width: "100%",
              }}
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
        )}
      </SandpackLayout>
    </div>
  );
}

export default function CodeEditor({ code, status }: CodeEditorProps) {
  const sandpackFiles = useMemo(() => {
    const files: Record<
      string,
      { code: string; active: boolean; hidden: boolean; readOnly: boolean }
    > = {};

    files["/App.tsx"] = {
      code: code || "",
      active: true,
      hidden: false,
      readOnly: true,
    };

    return files;
  }, [code]);

  return (
    <div className="h-full w-full">
      <div className="relative h-full w-full">
        <AnimatePresence>
          <SandpackProvider
            template="react-ts"
            options={{
              externalResources: [
                "https://unpkg.com/@tailwindcss/ui/dist/tailwind-ui.min.css",
              ],
            }}
            theme={draculaTheme}
            files={sandpackFiles}
          >
            <SandpackContent status={status} code={code}></SandpackContent>
          </SandpackProvider>
        </AnimatePresence>
      </div>
    </div>
  );
}
