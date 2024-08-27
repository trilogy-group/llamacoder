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
import { getActiveFile, getFileContent } from "../../utils/codeFileUtils";
import { readFileContent } from "../../utils/fileUtils";
import { v4 as uuidv4 } from 'uuid';

function extractComponentName(code: string): string {
  const match = code.match(/export default (\w+)/);
  return match ? match[1] : 'App';
}

const indexHTML = `<!DOCTYPE html>
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
</html>`;


export default function Home() {
  const [status, setStatus] = useState<
    "initial" | "creating" | "created" | "updating" | "updated"
  >("initial");
  const [generatedCode, setGeneratedCode] = useState("");
  const [ref, scrollTo] = useScrollTo();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [progressMessage, setProgressMessage] = useState("");
  const [files, setFiles] = useState<Record<string, { code: string, active: boolean, hidden: boolean, readOnly: boolean }> | null>(null);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [publishedUrl, setPublishedUrl] = useState<string | null>("");
  const [loading, setLoading] = useState(true);
  const [initialPrompt, setInitialPrompt] = useState<string>("");

  useEffect(() => {
    const loadData = () => {
      const storedFiles = localStorage.getItem('codeFiles');
      const storedModel = localStorage.getItem('selectedModel');
      const storedPrompt = localStorage.getItem('initialPrompt');
      const storedGeneratedCode = localStorage.getItem('generatedCode');
      const storedPublishedUrl = localStorage.getItem('publishedUrl');
      
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
      
      if (storedPublishedUrl) {
        setPublishedUrl(storedPublishedUrl);
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
      if (publishedUrl) {
        localStorage.setItem('publishedUrl', publishedUrl);
      } else {
        localStorage.removeItem('publishedUrl');
      }
    }
  }, [files, selectedModel, initialPrompt, generatedCode, loading, publishedUrl]);

  useEffect(() => {
    if (generatedCode) {
      setFiles((prevFiles) => ({
        ...(prevFiles || {}),
        "/App.tsx": {
          "code": generatedCode,
          "active": false,
          "hidden": true,
          "readOnly": true,
        },
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
    setFiles(null);
    setProgressMessage("Warming up the code genie...");

    // Generate a 7-character UUID and save it to local storage
    const artifactId = uuidv4().slice(0, 7);
    localStorage.setItem('artifactId', artifactId);

    // Reset localStorage
    localStorage.removeItem('generatedCode');
    localStorage.removeItem('codeFiles');
    localStorage.removeItem('activeFile');
    localStorage.removeItem('publishedUrl');
    setPublishedUrl(null);
    
    const formData = new FormData(e.currentTarget);
    const prompt = formData.get("prompt") as string;
    setInitialPrompt(prompt);

    // Read content of selected files
    const fileContents = await Promise.all(selectedFiles.map(async (file) => {
      const content = await readFileContent(file);
      return `File: ${file.name}\n\nContent:\n${content}\n\n`;
    }));

    const fileContext = fileContents.join('\n');
    var userPrompt = prompt;
    if (fileContext !== "") {
      userPrompt = `${prompt}\n\nUse these relevant info wherever needed: \n<relevant_info>\n${fileContext}\n</relevant_info>`;
    }

    setProgressMessage(
      "Sent your wishes to the code genie. Waiting for the magic...",
    );
    const newGeneratedCode = await generateCode(
      [
        { role: "user", content: userPrompt }
      ],
      selectedModel,
      setGeneratedCode,
    );

    if (newGeneratedCode) {
      const componentName = extractComponentName(newGeneratedCode);
      const fileName = `/${componentName}.tsx`;
      setStatus("created");
      setFiles((prevFiles) => {
        const updatedFiles = Object.entries(prevFiles || {}).reduce((acc, [key, value]) => {
          acc[key] = { ...value, active: false };
          return acc;
        }, {} as Record<string, { code: string, active: boolean, hidden: boolean, readOnly: boolean }>);
        
        return {
          ...updatedFiles,
          [fileName]: {
            "code": newGeneratedCode,
            "active": true,
            "hidden": false,
            "readOnly": false,
          },
          "/public/index.html": {
            "code": indexHTML,
            "active": false,
            "hidden": true,
            "readOnly": true,
          },
        };
      });
    } else {
      setStatus("initial");
      toast.error("Oops! The code genie got a bit confused. Let's try again!");
    }
    setProgressMessage(
      "Ta-da! The code genie has worked its magic! Preparing preview... "
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

    const activeFile = getActiveFile();
    const activeFileContent = getFileContent(activeFile);

    // Read content of selected files
    const fileContents = await Promise.all(selectedFiles.map(async (file) => {
      const content = await readFileContent(file);
      return `File: ${file.name}\n\nContent:\n${content}\n\n`;
    }));

    var fileContext = fileContents.join('\n');

    setProgressMessage(
      "Sent your update wishes to the code genie. Waiting for the magic...",
    );
    var userPrompt = initialPrompt;
    if (fileContext !== "") {
      userPrompt = `${initialPrompt}\n\nUse these relevant info wherever needed: \n<relevant_info>\n${fileContext}\n</relevant_info>`;
    }
    const currentMessages = [
      { role: "user", content: userPrompt },
      { role: "assistant", content: activeFileContent },
      { role: "user", content: prompt }
    ];
    console.log("Updated messages: ", currentMessages, selectedModel);
    const newGeneratedCode = await modifyCode(
      currentMessages,
      selectedModel,
      setGeneratedCode,
    );

    if (newGeneratedCode) {
      const componentName = extractComponentName(newGeneratedCode);
      const fileName = `/${componentName}.tsx`;
      setGeneratedCode(newGeneratedCode); // Ensure generatedCode is updated
      setFiles((prevFiles) => {
        const updatedFiles = Object.entries(prevFiles || {}).reduce((acc, [key, value]) => {
          acc[key] = { ...value, active: false };
          return acc;
        }, {} as Record<string, { code: string, active: boolean, hidden: boolean, readOnly: boolean }>);

        return {
          ...updatedFiles,
          [fileName]: {
            "code": newGeneratedCode,
            "active": true,
            "hidden": false,
            "readOnly": false,
          }
        };
      });
      setStatus("updated");
    } else {
      setStatus("created");
      toast.error("Failed to update the code. Please try again.");
    }
    setProgressMessage(
      "Ta-da! The code genie has worked its magic! Preparing preview... ✨"
    );
  };

  const handlePublish = (url: string) => {
    setPublishedUrl(url);
    localStorage.setItem('publishedUrl', url);
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
              <div className="mb-8 w-full flex justify-center">
                <div className="w-full md:w-3/5">
                  <UpdatePromptForm
                    loading={loading}
                    onUpdate={handleModifyCode}
                  />
                </div>
              </div>

              {status !== "creating" && (
                <div className="w-full">
                  <div className="flex justify-between mb-0">
                    <CodeDownloader
                      loading={loading}
                    />
                    <PublishButton
                      loading={loading}
                      onPublish={handlePublish}
                    />
                  </div>
                  <CodeEditor
                    status={status}
                    files={files}
                  />
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

      {status !== "creating" && status !== "initial" && (
        <div className="fixed bottom-4 left-4 z-50">
          <PublishedAppLink url={publishedUrl} />
        </div>
      )}
    </div>
  );
}