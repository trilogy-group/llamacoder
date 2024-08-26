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
import { useEffect } from "react";
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
  const { activeFile } = sandpack;
  const { code } = useActiveCode();

  useEffect(() => {
    console.log(`File ${activeFile} updated: `, code);
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

    if (activeFile === "/App.tsx") {
      localStorage.setItem("generatedCode", code);
    }
  }, [code]);

  useEffect(() => {
    // listens for any message dispatched between sandpack and the bundler
    const stopListening = listen((msg) => {
      console.log(msg);
    });

    return () => {
      // unsubscribe
      stopListening();
    };
  }, [listen]);

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
        />
        <SandpackPreview style={{ height: "80vh" }} />
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
