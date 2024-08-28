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
import { getAllComponents } from "../../utils/codeFileUtils";

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
      userPrompt = `
${prompt}
      
Use these relevant info wherever needed:
<relevant_info>
${fileContext}
</relevant_info>

Note: Do not use 'App' as any component's name. It is a reserved keyword in my workspace.
`;
    }

    setProgressMessage(
      "Sent your wishes to the code genie. Waiting for the magic...",
    );
    const newGeneratedCode = await generateCode(
      [
        { role: "user", content: userPrompt }
      ],
      selectedModel,
    );
    console.log("GeneratedCode: ", newGeneratedCode);
    if (newGeneratedCode) {
      const componentName = extractComponentName(newGeneratedCode);
      if (componentName === "App") {
        toast.error("Oops! The code genie got a bit confused. Let's try again!");
        setStatus("initial");
        setProgressMessage("");
        return;
      }
      const fileName = `/${componentName}.tsx`;
      setStatus("created");
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
          },
          "/public/index.html": {
            "code": indexHTML,
            "active": false,
            "hidden": true,
            "readOnly": true,
          },
        };
      });
      setProgressMessage(
        "Ta-da! The code genie has worked its magic! Preparing preview..."
      );
      setTimeout(() => {
        setProgressMessage("");
      }, 3000);
    } else {
      setStatus("initial");
      toast.error("Oops! The code genie got a bit confused. Let's try again!");
      setProgressMessage("");
    }
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
    const activeComponent = activeFile.slice(1, -4);
    const activeFileContent = getFileContent(activeFile);

    // Get all available components
    const availableComponents = getAllComponents(false);
    var query = `
You are helping me build a full fledged web application. Here is the overview of the application:
<overview>
${initialPrompt}
</overview>

Note: 
- Do not use 'App' as any component's name. It is a reserved keyword in my workspace.
- You should always return the complete code for a component irrespective of whether you are updating the given component or creating a new one.

<custom_components>
We have these custom components that you can use in your code:
${availableComponents.map(component => `  - <${component}>`).join('\n')}

Please use these components where appropriate in your code.
Make sure you import them before using them. A custom component can be imported like this:
import MyCustomComponent from "./MyCustomComponent";

Replace the component name with the actual component name.
</custom_components>

<required_changes>
I want you to make the following changes:
${prompt}

Note: This may require you to either modify the code given below or create new components.

Here is the component I am currently working on (You will have to either modify this or create a new component):
<${activeComponent}>
${activeFileContent}
</${activeComponent}>

Ensure you do not change the component name. Either modify the code given below or create a new component.
If you choose to create a new component, make sure you do not use name of any custom components provided above.
</required_changes>

Note: No component name should be 'App'. It is a reserved keyword in my workspace.
`;

    // Read content of selected files
    const fileContents = await Promise.all(selectedFiles.map(async (file) => {
      const content = await readFileContent(file);
      return `File: ${file.name}\n\nContent:\n${content}\n\n`;
    }));

    var fileContext = fileContents.join('\n');
    
    if (fileContext !== "") {
      query = `${query}\n\Here are some relevant content you may need to use (Please use them wherever appropriate):
  ${fileContext} 
`
    }

    const currentMessages = [
      { role: "user", content: query },
    ];

    setProgressMessage(
      "Sent your update wishes to the code genie. Waiting for the magic...",
    );
    console.log("Updated messages: ", currentMessages, selectedModel);
    const newGeneratedCode = await modifyCode(
      currentMessages,
      selectedModel,
    );

    console.log("GeneratedCode: ", newGeneratedCode);

    if (newGeneratedCode) {
      const componentName = extractComponentName(newGeneratedCode);
      if (componentName === "App") {
        toast.error("Oops! The code genie got a bit confused. Let's try again!");
        setStatus("created");
        setProgressMessage("");
        return;
      }
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
      setProgressMessage(
        "Ta-da! The code genie has worked its magic! Preparing preview..."
      );
      setTimeout(() => {
        setProgressMessage("");
      }, 3000);
    } else {
      setStatus("created");
      toast.error("Failed to update the code. Please try again.");
      setProgressMessage("");
    }
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