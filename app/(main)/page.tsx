"use client";

import { useState, useEffect, FormEvent } from "react";
import { Toaster, toast } from "sonner";
import { useScrollTo } from "@/hooks/use-scroll-to";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUploader from "../../components/FileUploader";
import PromptForm from "../../components/PromptForm";
import ModelSelector from "../../components/ModelSelector";
import CodeEditor from "../../components/CodeEditor";
import CodeDownloader from "../../components/CodeDownloader";
import { generateCode, modifyCode } from "../../utils/CodeGeneration";
import UpdatePromptForm from "../../components/UpdatePromptForm";
import PublishButton from "../../components/PublishButton";
import { AnimatePresence } from "framer-motion";
import PublishedAppLink from "../../components/PublishedAppLink";


export default function Home() {
  const [status, setStatus] = useState<
    "initial" | "creating" | "created" | "updating" | "updated"
  >("initial");
  const [generatedCode, setGeneratedCode] = useState("");
  const [modelUsedForInitialCode, setModelUsedForInitialCode] = useState("");
  const [ref, scrollTo] = useScrollTo();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [],
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
    "/public/abc.txt": "Hello",
    "/public/def.txt": "World",
    "/public/ghi.txt": "Hello",
    "/public/jkl.txt": "World",
    "/public/mno.txt": "Hello",
    "/public/pqr.txt": "World",
    "/public/stu.txt": "Hello",
    "/public/vwx.txt": "World",
    "/public/yz.txt": "Hello",
  });
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const loading = status === "creating" || status === "updating";

  useEffect(() => {
    setFiles((prevFiles) => ({
      ...prevFiles,
      "App.tsx": generatedCode,
    }));
  }, [generatedCode]);

  const handleGenerateCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== "initial") {
      scrollTo({ delay: 0.5 });
    }
    setStatus("creating");
    setGeneratedCode("");
    setProgressMessage("Initializing code generation...");

    const formData = new FormData(e.currentTarget);
    const prompt = formData.get("prompt") as string;

    let newMessages = [{ role: "user", content: prompt }];

    if (selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        const fileContent = await readFileContent(file);
        newMessages.push({
          role: "user",
          content: `File content: ${fileContent}`,
        });
      }
    }

    setProgressMessage("Sending request to AI model...");
    const newGeneratedCode = await generateCode(
      newMessages,
      selectedModel,
      setGeneratedCode,
      setProgressMessage,
    );

    setModelUsedForInitialCode(selectedModel);
    if (newGeneratedCode) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: newGeneratedCode },
      ]);
      setStatus("created");
    } else {
      setStatus("initial");
      toast.error("Failed to generate code. Please try again.");
    }
    setProgressMessage("Code generation complete. Preparing preview...");
  };

  const handleModifyCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("updating");
    setProgressMessage("Updating code...");

    const formData = new FormData(e.currentTarget);
    const prompt = formData.get("prompt") as string;

    if (prompt.trim() === "") {
      toast.error("Please enter a valid prompt");
      setStatus("created");
      return;
    }

    let updatedMessages = [...messages, { role: "user", content: prompt }];

    setGeneratedCode("");
    const newGeneratedCode = await modifyCode(
      updatedMessages,
      modelUsedForInitialCode,
      setGeneratedCode,
      setProgressMessage,
    );

    if (newGeneratedCode) {
      updatedMessages.push({ role: "assistant", content: newGeneratedCode });
      setMessages(updatedMessages);
      setStatus("updated");
    } else {
      setStatus("created");
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  console.log("Status : ", status);
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center py-2">
      <Header />

      <main className="mt-12 flex w-full flex-1 flex-col items-center px-4 text-center sm:mt-20">
        <h1 className="my-6 max-w-3xl text-4xl font-bold text-gray-800 sm:text-6xl">
          Turn your <span className="text-blue-600">idea</span>
          <br /> into an Ar<span className="text-blue-600">TI</span>fact
        </h1>

        <FileUploader
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
        />

        <PromptForm
          loading={loading}
          onSubmit={handleGenerateCode}
          status={status}
        />

        <ModelSelector
          loading={loading}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />

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
            <div className="flex flex-col items-center">
              <div className="mb-8 w-full flex flex-col md:flex-row gap-4 items-start">
                <div className="w-full md:w-3/4">
                  <UpdatePromptForm
                    loading={loading}
                    onUpdate={handleModifyCode}
                  />
                </div>
                <div className="w-full md:w-1/4 flex flex-col items-stretch">
                  <PublishButton
                    loading={loading}
                    generatedCode={generatedCode}
                    messages={messages}
                    modelUsedForInitialCode={modelUsedForInitialCode}
                    onPublish={(url) => setPublishedUrl(url)}
                  />
                  <PublishedAppLink url={publishedUrl} />
                </div>
              </div>

              <div className="w-full">
                <CodeEditor
                  loading={loading}
                  status={status}
                  files={files}
                  setProgressMessage={setProgressMessage}
                >
                  <CodeDownloader
                    loading={loading}
                    generatedCode={generatedCode}
                  />
                </CodeEditor>
              </div>
            </div>
          </motion.div>
        )}
      </main>
      <Footer />
      <Toaster invert={true} />
      <AnimatePresence>
        {(status === "creating" || status === "updating") && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg"
          >
            {status === "creating" ? "Creating..." : "Updating..."}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}