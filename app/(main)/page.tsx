"use client";

import { Toaster, toast } from "sonner";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useScrollTo } from "@/hooks/use-scroll-to";
import { Sandpack, useSandpack} from "@codesandbox/sandpack-react";
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview } from "@codesandbox/sandpack-react";
import { dracula as draculaTheme } from "@codesandbox/sandpack-themes";
import { CheckIcon } from "@heroicons/react/16/solid";
import { ArrowDownIcon } from "@heroicons/react/20/solid";
import {
  ArrowLongRightIcon,
  ChevronDownIcon,
  ArrowUpOnSquareIcon,
} from "@heroicons/react/20/solid";
// import { ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";
import * as Select from "@radix-ui/react-select";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useEffect, useState } from "react";
import LoadingDots from "../../components/loading-dots";
import { shareApp } from "./actions";
import { domain } from "@/utils/domain";
import { saveAs } from 'file-saver';
import { AmplifyClient, CreateAppCommand, CreateBranchCommand, StartDeploymentCommand, Platform} from "@aws-sdk/client-amplify";
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();


async function publishApp(generatedCode: string) {
  const config = {
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      sessionToken: process.env.AWS_SESSION_TOKEN,
    },
  };

  const amplifyClient = new AmplifyClient(config);
  const uniqueAppName = `GeneratedApp-${uuidv4()}`;

  const createAppParams = {
    name: uniqueAppName,
    platform: 'WEB' as Platform,
  };

  try {
    const createAppCommand = new CreateAppCommand(createAppParams);
    const app = await amplifyClient.send(createAppCommand);

    const createBranchParams = {
      appId: app.app?.appId,
      branchName: uniqueAppName,
    };

    const createBranchCommand = new CreateBranchCommand(createBranchParams);
    await amplifyClient.send(createBranchCommand);

    const fileMap = {
      'public/index.html': `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body>
            <div id="root"></div>
          </body>
        </html>`,
      'src/index.tsx': `
        import React, { StrictMode } from "react";
        import { createRoot } from "react-dom/client";
        import "./styles.css";
        import App from "./App";
        const root = createRoot(document.getElementById("root"));
        root.render(
          <StrictMode>
            <App />
          </StrictMode>
        );`,
      'src/App.tsx': generatedCode,
      'src/styles.css': `
        body {
          font-family: sans-serif;
          -webkit-font-smoothing: auto;
          -moz-font-smoothing: auto;
          -moz-osx-font-smoothing: grayscale;
          font-smoothing: auto;
          text-rendering: optimizeLegibility;
          font-smooth: always;
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }
        h1 {
          font-size: 1.5rem;
        }`,
      'tsconfig.json': JSON.stringify({
        "include": [
          "./**/*"
        ],
        "compilerOptions": {
          "strict": true,
          "esModuleInterop": true,
          "lib": [ "dom", "es2015" ],
          "jsx": "react-jsx"
        }
      }, null, 2),
      'package.json': JSON.stringify({
        "dependencies": {
          "react": "^18.0.0",
          "react-dom": "latest",
          "react-scripts": "^4.0.0",
          "lucide-react": "latest",
          "recharts": "2.9.0",
          "axios": "latest",
          "react-router-dom": "latest",
          "react-ui": "latest",
          "@mui/material": "latest",
          "@emotion/react": "latest",
          "@emotion/styled": "latest",
          "@mui/icons-material": "latest"
        },
        "devDependencies": {
          "@types/react": "^18.0.0",
          "@types/react-dom": "^18.0.0",
          "typescript": "^4.0.0"
        },
        "main": "/index.tsx"
      }, null, 2),
    };

    const startDeploymentParams = {
      appId: app.app?.appId,
      branchName: uniqueAppName,
      sourceUrl: `data:application/zip;base64,${Buffer.from(JSON.stringify(fileMap)).toString('base64')}`,
    };

    const startDeploymentCommand = new StartDeploymentCommand(startDeploymentParams);
    await amplifyClient.send(startDeploymentCommand);

    return `https://${uniqueAppName}.${app.app?.defaultDomain}`;
  } catch (error) {
    console.error('Error in publishApp:', error);
    throw error;
  }
}

const CodeDownloader = ({ loading }: { loading: boolean }) => {
  const { sandpack } = useSandpack();
  const { files, activeFile } = sandpack;
 
  const code = files[activeFile].code;

  function downloadCode() {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "generatedComponent.tsx");
  }

  return ( <button
    onClick={downloadCode}
    disabled={loading}
    className="inline-flex h-[40px] items-center justify-center gap-2 rounded-2xl bg-green-500 transition disabled:grayscale"
    style={{ width: '120px' }}
  >
    <span className="relative">
      <ArrowDownIcon className="size-5 text-xl text-white" />
    </span>
    <p className="text-lg font-small text-white">
      Code
    </p>
  </button>);
};

export default function Home() {
  let [status, setStatus] = useState<
    "initial" | "creating" | "created" | "updating" | "updated"
  >("initial");
  let [generatedCode, setGeneratedCode] = useState("");
  let [modelUsedForInitialCode, setModelUsedForInitialCode] = useState("");
  let [ref, scrollTo] = useScrollTo();
  let [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [],
  );
  let [isPublishing, setIsPublishing] = useState(false);
  let [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [progressMessage, setProgressMessage] = useState("");

  const [files, setFiles] = useState({
    "App.tsx": generatedCode,
    "/public/index.html": `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>`,
  });

  useEffect(() => {
    setFiles((prevFiles) => ({
      ...prevFiles,
      "App.tsx": generatedCode,
    }));
  }, [generatedCode]);

  let loading = status === "creating" || status === "updating";


  function downloadCode() {
    const blob = new Blob([generatedCode], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "generatedComponent.tsx");
  }

  async function generateCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  
    if (status !== "initial") {
      scrollTo({ delay: 0.5 });
    }
  
    setStatus("creating");
    setGeneratedCode("");
    setProgressMessage("Initializing code generation...");
  
    let formData = new FormData(e.currentTarget);
    let model = formData.get("model");
    let prompt = formData.get("prompt");
    if (typeof prompt !== "string" || typeof model !== "string") {
      return;
    }
  
    let newMessages = [{ role: "user", content: prompt }];
  
    if (selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        const fileContent = await readFileContent(file);
        newMessages.push({ role: "user", content: `File content: ${fileContent}` });
      }
    }
  
    await sendRequest(newMessages, model);
  }
  
  function readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }
  
  async function sendRequest(messages: { role: string; content: string }[], model: string) {
    setProgressMessage("Sending request to AI model...");
    const chatRes = await fetch("/api/generateCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        model,
      }),
    });
  
    if (!chatRes.ok) {
      throw new Error(chatRes.statusText);
    }
  
    const data = chatRes.body;
    if (!data) {
      return;
    }
  
    let newGeneratedCode = "";
  
    const onParse = (event: ParsedEvent | ReconnectInterval) => {
      if (event.type === "event") {
        const data = event.data;
        try {
          const text = JSON.parse(data).text ?? "";
          newGeneratedCode += text;
          setGeneratedCode(newGeneratedCode);
        } catch (e) {
          console.error(e);
        }
      }
    };
  
    const reader = data.getReader();
    const decoder = new TextDecoder();
    const parser = createParser(onParse);
    let done = false;
  
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      parser.feed(chunkValue);
    }
  
    setModelUsedForInitialCode(model);
    setMessages([...messages, { role: "assistant", content: newGeneratedCode }]);
    setStatus("created");
    setProgressMessage("Code generation complete. Preparing preview...");
  }
  
  async function modifyCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  
    setStatus("updating");
  
    let formData = new FormData(e.currentTarget);
    let prompt = formData.get("prompt");
    if (typeof prompt !== "string" || prompt.trim() === "") {
      toast.error("Please enter a valid prompt");
      setStatus("created");
      return;
    }
  
    let updatedMessages = [...messages, { role: "user", content: prompt }];
  
    setGeneratedCode("");
    const chatRes = await fetch("/api/generateCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: updatedMessages,
        model: modelUsedForInitialCode,
      }),
    });
  
    if (!chatRes.ok) {
      toast.error("An error occurred while generating code");
      setStatus("created");
      return;
    }
  
    const data = chatRes.body;
    if (!data) {
      return;
    }
  
    let newGeneratedCode = "";
  
    const onParse = (event: ParsedEvent | ReconnectInterval) => {
      if (event.type === "event") {
        const data = event.data;
        try {
          const text = JSON.parse(data).text ?? "";
          newGeneratedCode += text;
          setGeneratedCode(newGeneratedCode);
        } catch (e) {
          console.error(e);
        }
      }
    };
  
    const reader = data.getReader();
    const decoder = new TextDecoder();
    const parser = createParser(onParse);
    let done = false;
  
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      parser.feed(chunkValue);
    }
  
    updatedMessages.push({ role: "assistant", content: newGeneratedCode });
  
    setMessages(updatedMessages);
    setStatus("updated");
  }

  useEffect(() => {
    let el = document.querySelector(".cm-scroller");
    if (el && loading) {
      let end = el.scrollHeight - el.clientHeight;
      el.scrollTo({ top: end });
    }
  }, [loading, generatedCode]);


  useEffect(() => {
    if (status === "created" || status === "updated") {
      let previewTimer = setTimeout(() => {
        setProgressMessage("Preview is still being generated. Please wait...");
      }, 8000);

      return () => clearTimeout(previewTimer);
    }
  }, [status]);

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center py-2">
      <Header />

      <main className="mt-12 flex w-full flex-1 flex-col items-center px-4 text-center sm:mt-20">
        <h1 className="my-6 max-w-3xl text-4xl font-bold text-gray-800 sm:text-6xl">
          Turn your <span className="text-blue-600">idea</span>
          <br /> into an Ar<span className="text-blue-600">TI</span>fact
        </h1>

        <div className="mb-4 w-full max-w-sm">
          <div className="relative">
            <div className="absolute -inset-2 rounded-[32px] bg-gray-300/50" />
            <div className="relative flex rounded-3xl bg-white shadow-sm">
            <input
              type="file"
              multiple
              onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
              className="w-full rounded-3xl bg-transparent px-4 py-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 file:mr-3 file:rounded-full file:border-0 file:bg-blue-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-400"
            />
            </div>
          </div>
        </div>

        <form className="w-full max-w-xl" onSubmit={(e) => {
            e.preventDefault();
            generateCode(e);
          }}>
          <fieldset disabled={loading} className="disabled:opacity-75">
          <div className="relative mt-5">
            <div className="absolute -inset-2 rounded-[32px] bg-gray-300/50" />
            <div className="relative flex rounded-3xl bg-white shadow-sm">
              <div className="relative flex flex-grow items-stretch focus-within:z-10">
                <textarea
                  required
                  name="prompt"
                  className="w-full rounded-l-3xl bg-transparent px-6 py-5 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                  placeholder="Build me a calculator app..."
                  rows={4} // Adjust the number of rows as needed
                  style={{ height: '150px', overflowY: 'auto' }} // Fixed height and scrollable
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      (e.currentTarget.form as HTMLFormElement).requestSubmit();
                    }
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-3xl px-3 py-2 text-sm font-semibold text-blue-500 hover:text-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:text-gray-900"
              >
                {status === "creating" ? (
                  <LoadingDots color="black" style="large" />
                ) : (
                  <ArrowLongRightIcon className="-ml-0.5 size-6" />
                )}
              </button>
            </div>
          </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <p className="text-xs text-gray-500">Model:</p>
              <Select.Root
                name="model"
                defaultValue="gpt-4o"
                disabled={loading}
              >
                <Select.Trigger className="group flex w-full max-w-xs items-center rounded-2xl border-[6px] border-gray-300 bg-white px-4 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">
                  <Select.Value />
                  <Select.Icon className="ml-auto">
                    <ChevronDownIcon className="size-6 text-gray-300 group-focus-visible:text-gray-500 group-enabled:group-hover:text-gray-500" />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="overflow-hidden rounded-md bg-white shadow-lg">
                    <Select.Viewport className="p-2">
                    {[
                      {
                        label: "GPT-4o",
                        value: "gpt-4o",
                      },
                      {
                        label: "GPT-3.5 Turbo",
                        value: "gpt-3.5-turbo",
                      },
                      {
                        label: "GPT-4",
                        value: "gpt-4",
                      },
                      {
                        label: "GPT-4 Turbo",
                        value: "gpt-4-1106-preview",
                      },
                      {
                        label: "Claude Sonnet 3.5",
                        value: "claude-3-5-sonnet-20240620",
                      },
                      {
                        label: "Bedrock Claude",
                        value: "anthropic.claude-3-5-sonnet-20240620-v1:0",
                      },
                    ].map((model) => (
                      <Select.Item
                        key={model.value}
                        value={model.value}
                        className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm data-[highlighted]:bg-gray-100 data-[highlighted]:outline-none"
                      >
                        <Select.ItemText asChild>
                          <span className="inline-flex items-center gap-2 text-gray-500">
                            <div className="size-2 rounded-full bg-green-500" />
                            {model.label}
                          </span>
                        </Select.ItemText>
                        <Select.ItemIndicator className="ml-auto">
                          <CheckIcon className="size-5 text-blue-600" />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
          </fieldset>
        </form>

        <hr className="border-1 mb-20 h-px bg-gray-700 dark:bg-gray-700" />

        {status !== "initial" && (
          <motion.div
            initial={{ height: 0 }}
            animate={{
              height: "auto",
              overflow: "hidden",
              transitionEnd: { overflow: "visible" },
            }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            className="w-full pb-[25vh] pt-10"
            onAnimationComplete={() => scrollTo()}
            ref={ref}
          >
            <div className="mt-5 flex gap-4">
              <form className="w-full" onSubmit={modifyCode}>
              <fieldset disabled={loading} className="group">
                <div className="relative">
                  <div className="relative flex rounded-3xl bg-white shadow-sm group-disabled:bg-gray-50">
                    <div className="relative flex flex-grow items-stretch focus-within:z-10">
                      <textarea
                        required
                        name="prompt"
                        className="w-full rounded-l-3xl bg-transparent px-6 py-5 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed"
                        placeholder="Make changes to your app here"
                        rows={4} // Adjust the number of rows as needed
                        style={{ height: '70px', overflowY: 'auto' }} // Fixed height and scrollable
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            (e.currentTarget.form as HTMLFormElement).requestSubmit();
                          }
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-3xl px-3 py-2 text-sm font-semibold text-blue-500 hover:text-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:text-gray-900"
                    >
                      {loading ? (
                        <LoadingDots color="black" style="large" />
                      ) : (
                        <ArrowLongRightIcon className="-ml-0.5 size-6" />
                      )}
                    </button>
                  </div>
                </div>
              </fieldset>
              </form>
              <div>
                <Toaster invert={true} />
                <Tooltip.Provider>
                  <Tooltip.Root delayDuration={0}>
                    <Tooltip.Trigger asChild>
                    <button
                      disabled={loading || isPublishing}
                      onClick={async () => {
                        setIsPublishing(true);
                        let userMessages = messages.filter(
                          (message) => message.role === "user",
                        );
                        let prompt =
                          userMessages[userMessages.length - 1].content;

                        // const appId = await minDelay(
                        //   shareApp({
                        //     generatedCode,
                        //     prompt,
                        //     model: modelUsedForInitialCode,
                        //   }),
                        //   1000,
                        // );

                        try {
                          const liveUrl = await publishApp(generatedCode);
                          toast.success(`Your app has been published! Live URL: ${liveUrl}`);
                          navigator.clipboard.writeText(liveUrl);
                        } catch (error) {
                          console.error('Error publishing app:', error);
                          toast.error("An error occurred while publishing the app");
                        } finally {
                          setIsPublishing(false);
                        }
                      }}
                      className="inline-flex h-[68px] w-40 items-center justify-center gap-2 rounded-3xl bg-blue-500 transition disabled:grayscale"
                    >
                      <span className="relative">
                        {isPublishing && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <LoadingDots color="white" style="large" />
                          </span>
                        )}

                        <ArrowUpOnSquareIcon
                          className={`${isPublishing ? "invisible" : ""} size-5 text-xl text-white`}
                        />
                      </span>

                      <p className="text-lg font-medium text-white">
                        Publish app
                      </p>
                    </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="select-none rounded bg-white px-4 py-2.5 text-sm leading-none shadow-md shadow-black/20"
                        sideOffset={5}
                      >
                        Publishes your app to the internet
                        <Tooltip.Arrow className="fill-white" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </div>
            </div>
            <div className="relative mt-8 w-full overflow-hidden">
              <div className="isolate">
              
              <SandpackProvider
                  template="react-ts"
                  options={{
                    externalResources: [
                      "https://unpkg.com/@tailwindcss/ui/dist/tailwind-ui.min.css",
                    ]
                  }}
                  theme={draculaTheme}
                  customSetup={{
                    dependencies: {
                      "lucide-react": "latest",
                      "recharts": "2.9.0",
                      "axios": "latest",
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
                  
                  <div className="flex items-center gap-4 p-4">
                    <CodeDownloader loading={loading} />
                    {progressMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center space-x-2 rounded-full bg-white/50 backdrop-blur-sm px-4 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-200"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>{progressMessage}</span>
                      </motion.div>
                    )}
                  </div>
                  <SandpackLayout>
                    <SandpackCodeEditor 
                      style={{ height: "80vh" }} 
                      showRunButton={true} 
                      showInlineErrors={true} 
                      wrapContent={true}
                    />
                    <SandpackPreview 
                      style={{ height: "80vh" }}
                    />
                  </SandpackLayout>
                  
                </SandpackProvider>
              </div>

              <AnimatePresence>
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
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}

async function minDelay<T>(promise: Promise<T>, ms: number) {
  let delay = new Promise((resolve) => setTimeout(resolve, ms));
  let [p] = await Promise.all([promise, delay]);

  return p;
}
