import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
  useActiveCode,
} from "@codesandbox/sandpack-react";
import { dracula as draculaTheme } from "@codesandbox/sandpack-themes";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { AnimatePresence } from "framer-motion";

interface CodeEditorProps {
  status: string;
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
    const files: Record<
      string,
      { code: string; active: boolean; hidden: boolean; readOnly: boolean }
    > = JSON.parse(localStorage.getItem("codeFiles") || "{}");
    files[activeFile] = {
      code: code,
      active: true,
      hidden: false,
      readOnly: false,
    };
    localStorage.setItem("codeFiles", JSON.stringify(files));

    localStorage.setItem("generatedCode", code);
  }, [code]);

  useEffect(() => {
    updateFile("/App.tsx", code);
  }, [activeFile, code]);

  useEffect(() => {
    const stopListening = listen((msg) => {
      console.log(msg);
      if (msg.type === "status") {
        if (msg.status === "transpiling") {
          setStatusMessage("🚀 Assembling your code... Almost there!");
        } else if (msg.status === "evaluating") {
          setStatusMessage("🧠 Analyzing your creation... Your app is almost ready!");
        } else if (msg.status === "idle") {
          setStatusMessage("");
        }
      }
    });
    console.log("statusMessage: ", statusMessage);
    return () => {
      stopListening();
    };
  }, [listen, statusMessage]);

  useEffect(() => {
    localStorage.setItem('activeFile', activeFile);
  }, [activeFile]);

  return (
    <>
      <div className="flex items-center gap-4 p-4">{children}</div>
      <SandpackLayout>
        <SandpackCodeEditor
          style={{ height: "80vh" }}
          showRunButton={true}
          showInlineErrors={true}
          wrapContent={true}
          showLineNumbers={true}
          showTabs={true}
          showReadOnly={true}
        />
        <div className="relative" style={{ height: "80vh", width: "50%" }}>
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
  status,
  files,
  children,
}: CodeEditorProps) {
  const randomMessage = "Brewing code magic...";

  return (
    <div className="relative mt-8 w-full overflow-hidden">
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

            {(status === "creating" || status === "updating") && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black bg-opacity-10 backdrop-blur-[0.5px]"
              >
                <CircularProgress size={60} thickness={4} color="primary" />
                <p className="mt-4 text-xl font-bold text-white">
                  {randomMessage}
                </p>
              </motion.div>
            )}
          </div>
        </SandpackProvider>
      </AnimatePresence>
    </div>
  );
}
