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
import PublishedAppLink from "../../components/PublishedAppLink";
import FloatingStatusIndicator from "../../components/FloatingStatusIndicator";
import { CircularProgress } from "@mui/material";

export default function Home() {
  const [status, setStatus] = useState<
    "initial" | "creating" | "created" | "updating" | "updated"
  >("initial");
  const [generatedCode, setGeneratedCode] = useState("");
  const [ref, scrollTo] = useScrollTo();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [],
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [progressMessage, setProgressMessage] = useState("");
  const [files, setFiles] = useState<Record<string, string> | null>(null);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialPrompt, setInitialPrompt] = useState<string>("");

  useEffect(() => {
    const loadData = () => {
      const storedFiles = localStorage.getItem('codeFiles');
      const storedModel = localStorage.getItem('selectedModel');
      const storedPrompt = localStorage.getItem('initialPrompt');
      const storedGeneratedCode = localStorage.getItem('generatedCode');
      
      if (storedFiles) {
        try {
          const parsedFiles = JSON.parse(storedFiles);
          setFiles(parsedFiles);
          setStatus('created');
        } catch (error) {
          console.error("Error parsing stored files:", error);
        }
      }
      
      if (storedModel) {
        setSelectedModel(storedModel);
      }
      
      if (storedPrompt) {
        setInitialPrompt(storedPrompt);
      }

      if (storedGeneratedCode) {
        setGeneratedCode(storedGeneratedCode);
      }
      
      // Update messages if we have both the initial prompt and generated code
      if (storedPrompt && storedGeneratedCode) {
        setMessages([
          { role: "user", content: storedPrompt },
          { role: "assistant", content: storedGeneratedCode }
        ]);
      }
      
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (files) {
        localStorage.setItem('codeFiles', JSON.stringify(files));
      }
      localStorage.setItem('selectedModel', selectedModel);
      localStorage.setItem('initialPrompt', initialPrompt);
      localStorage.setItem('generatedCode', generatedCode);
    }
  }, [files, selectedModel, initialPrompt, generatedCode, loading]);

  useEffect(() => {
    if (generatedCode) {
      setFiles((prevFiles) => ({
        ...(prevFiles || {}),
        "App.tsx": generatedCode,
      }));
    }
  }, [generatedCode]);

  const handleGenerateCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== "initial") {
      scrollTo({ delay: 0.5 });
    }
    setStatus("creating");
    setGeneratedCode("");
    setProgressMessage("Warming up the code genie...");

    const formData = new FormData(e.currentTarget);
    const prompt = formData.get("prompt") as string;
    setInitialPrompt(prompt);

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

    setProgressMessage(
      "Sent your wishes to the code genie. Waiting for the response...",
    );
    const newGeneratedCode = await generateCode(
      newMessages,
      selectedModel,
      setGeneratedCode,
    );

    if (newGeneratedCode) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: newGeneratedCode },
      ]);
      setStatus("created");
      setFiles({
        "App.tsx": newGeneratedCode,
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
    } else {
      setStatus("initial");
      toast.error("Oops! The code genie got a bit confused. Let's try again!");
    }
    setProgressMessage(
      "Ta-da! The code genie has worked its magic! Preparing preview...",
    );
  };

  const handleModifyCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("updating");
    setProgressMessage("Warming up the code genie for modifications...");

    const formData = new FormData(e.currentTarget);
    const prompt = formData.get("prompt") as string;

    if (prompt.trim() === "") {
      toast.error("Please enter a valid prompt");
      setStatus("created");
      return;
    }

    let updatedMessages = [...messages, { role: "user", content: prompt }];

    setGeneratedCode("");
    setProgressMessage(
      "Sent your update wishes to the code genie. Waiting for the response...",
    );
    console.log("Updated messages: ", updatedMessages, selectedModel);
    const newGeneratedCode = await modifyCode(
      updatedMessages,
      selectedModel,
      setGeneratedCode,
    );

    if (newGeneratedCode) {
      updatedMessages.push({ role: "assistant", content: newGeneratedCode });
      setMessages(updatedMessages);
      setStatus("updated");
    } else {
      setStatus("created");
    }
    setProgressMessage(
      "Ta-da! The code genie has worked its magic! Preparing preview...",
    );
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const isStatusVisible = status === "creating" || status === "updating";

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <CircularProgress size={60} thickness={4} />
      </div>
    );
  }

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
          initialPrompt={initialPrompt}
        />

        <ModelSelector
          loading={loading}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />

        <hr className="border-1 mb-20 h-px bg-gray-700 dark:bg-gray-700" />

        {status !== "initial" && files && (
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
              <div className="mx-auto mb-8 w-3/5">
                <UpdatePromptForm
                  loading={loading}
                  onUpdate={handleModifyCode}
                />
              </div>

              {status !== "creating" && (
                <div className="w-full">
                  <CodeEditor
                    loading={loading}
                    status={status}
                    files={files}
                  >
                    <CodeDownloader
                      loading={loading}
                      generatedCode={generatedCode}
                    />
                  </CodeEditor>
                </div>
              )}
              {status !== "creating" && status !== "updating" && (
                <div className="mt-8 w-full max-w-md">
                  <PublishButton
                    loading={loading}
                    generatedCode={generatedCode}
                    messages={messages}
                    modelUsedForInitialCode={selectedModel}
                    onPublish={(url) => setPublishedUrl(url)}
                  />
                  <PublishedAppLink url={publishedUrl} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
      <Footer />
      <Toaster invert={true} />
      <FloatingStatusIndicator 
        message={progressMessage}
        isVisible={isStatusVisible}
      />
    </div>
  );
}