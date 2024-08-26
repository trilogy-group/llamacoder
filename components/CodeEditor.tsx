import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { dracula as draculaTheme } from "@codesandbox/sandpack-themes";
import { motion } from "framer-motion";
import { useEffect } from "react";

interface CodeEditorProps {
  loading: boolean;
  status: string;
  files: Record<string, string>;
  children?: React.ReactNode;
}

function SandpackContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sandpack, listen } = useSandpack();

  const {
    activeFile: sandpackActiveFile,
    setActiveFile: setSandpackActiveFile,
  } = sandpack;

  useEffect(() => {
    console.log("Active file: ", sandpackActiveFile);
  }, [sandpackActiveFile]);

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
  loading,
  status,
  files,
  children,
}: CodeEditorProps) {
  return (
    <div className="relative mt-8 w-full overflow-hidden">
      <div className="isolate">
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
          <SandpackContent
          >
            {children}
          </SandpackContent>
        </SandpackProvider>
      </div>

      {loading && (
        <motion.div
          initial={status === "updating" ? { x: "100%" } : undefined}
          animate={status === "updating" ? { x: "0%" } : undefined}
          exit={{ x: "100%" }}
          transition={{
            type: "spring",
            bounce: 0,
            duration: 0.85,
            delay: 0.5,
          }}
          className="absolute inset-x-0 bottom-0 top-1/2 flex items-center justify-center rounded-r border border-gray-400 bg-gradient-to-br from-gray-100 to-gray-300 md:inset-y-0 md:left-1/2 md:right-0"
        >
          <p className="animate-pulse text-3xl font-bold">
            {status === "creating"
              ? "Building your app..."
              : "Updating your app..."}
          </p>
        </motion.div>
      )}
    </div>
  );
}
