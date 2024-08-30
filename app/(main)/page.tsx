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
import {
  generateCode,
  modifyCode,
  getApiSpec,
} from "../../utils/apiClient";
import UpdatePromptForm from "../../components/UpdatePromptForm";
import PublishButton from "../../components/PublishButton";
import PublishedAppLink from "../../components/PublishedAppLink";
import { CircularProgress } from "@mui/material";
import { getActiveFile, getFileContent, getAllComponents } from "../../utils/codeFileUtils";
import { readFileContent } from "../../utils/fileUtils";
import { v4 as uuidv4 } from "uuid";
import { generateCodePrompt, modifyCodePrompt } from "../../utils/promptUtils";

function extractComponentName(code: string): string {
  const match = code.match(/export default (\w+)/);
  return match ? match[1] : "App";
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
  const [generatedCode, setGeneratedCode] = useState<{
    code: string;
    extraLibraries: { name: string; version: string }[];
  }>({ code: "", extraLibraries: [] });
  const [ref, scrollTo] = useScrollTo();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [files, setFiles] = useState<Record<
    string,
    { code: string; active: boolean; hidden: boolean; readOnly: boolean }
  > | null>(null);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [publishedUrl, setPublishedUrl] = useState<string | null>("");
  const [loading, setLoading] = useState(true);
  const [initialPrompt, setInitialPrompt] = useState<string>("");
  const [apiSpec, setApiSpec] = useState<string>("");

  
  useEffect(() => {
    const loadData = async () => {
      const storedFiles = localStorage.getItem("codeFiles");
      const storedModel = localStorage.getItem("selectedModel");
      const storedPrompt = localStorage.getItem("initialPrompt");
      const storedGeneratedCode = localStorage.getItem("generatedCode");
      const storedPublishedUrl = localStorage.getItem("publishedUrl");
      const storedApiSpec = await getApiSpec();
      setApiSpec(storedApiSpec.apiDocs);

      if (storedFiles) {
        try {
          const parsedFiles = JSON.parse(storedFiles);
          setFiles(parsedFiles);
          setStatus("created");
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
        setGeneratedCode(JSON.parse(storedGeneratedCode));
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
        localStorage.setItem("codeFiles", JSON.stringify(files));
      }
      localStorage.setItem("selectedModel", selectedModel);
      localStorage.setItem("initialPrompt", initialPrompt);
      localStorage.setItem("generatedCode", JSON.stringify(generatedCode));
      if (publishedUrl) {
        localStorage.setItem("publishedUrl", publishedUrl);
      } else {
        localStorage.removeItem("publishedUrl");
      }
    }
  }, [
    files,
    selectedModel,
    initialPrompt,
    generatedCode,
    loading,
    publishedUrl,
  ]);

  useEffect(() => {
    if (generatedCode) {
      setFiles((prevFiles) => ({
        ...(prevFiles || {}),
        "/App.tsx": {
          code: generatedCode.code,
          active: false,
          hidden: true,
          readOnly: true,
        },
        "/public/index.html": {
          code: indexHTML,
          active: false,
          hidden: true,
          readOnly: true,
        },
      }));
    }
  }, [generatedCode]);

  const resetLocalStorage = () => {
    localStorage.removeItem("generatedCode");
    localStorage.removeItem("codeFiles");
    localStorage.removeItem("activeFile");
    localStorage.removeItem("publishedUrl");
    setPublishedUrl(null);
  };

  const getFileContext = async () => {
    const fileContents = await Promise.all(
      selectedFiles.map(async (file) => {
        const content = await readFileContent(file);
        return `File: ${file.name}\n\nContent:\n${content}\n\n`;
      }),
    );
    return fileContents.join("\n");
  };

  const updateGeneratedCode = (
    componentName: string,
    newGeneratedCode: {
      code: string;
      extraLibraries: { name: string; version: string }[];
    },
  ) => {
    setGeneratedCode(newGeneratedCode);
    const fileName = `/${componentName}.tsx`;
    setFiles((prevFiles) => {
      const updatedFiles = Object.entries(prevFiles || {}).reduce(
        (acc, [key, value]) => {
          acc[key] = { ...value, active: false };
          return acc;
        },
        {} as Record<
          string,
          { code: string; active: boolean; hidden: boolean; readOnly: boolean }
        >,
      );

      return {
        ...updatedFiles,
        [fileName]: {
          code: newGeneratedCode.code,
          active: true,
          hidden: false,
          readOnly: false,
        },
      };
    });
  };

  const processGeneratedCode = async (
    newGeneratedCode: {
      code: string;
      extraLibraries: { name: string; version: string }[];
    },
    onSuccess: (
      componentName: string,
      newGeneratedCode: {
        code: string;
        extraLibraries: { name: string; version: string }[];
      },
    ) => void,
    onFailure: () => void,
  ) => {
    console.log("newGeneratedCode: ", newGeneratedCode);
    const componentName = extractComponentName(newGeneratedCode.code);
    if (componentName === "App") {
      onFailure();
      return;
    }
    onSuccess(componentName, newGeneratedCode);
  };

  const handleGenerateCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== "initial") {
      scrollTo({ delay: 0.5 });
    }
    setStatus("creating");
    setGeneratedCode({ code: "", extraLibraries: [] });
    setFiles(null);

    // Generate a 7-character UUID and save it to local storage
    const artifactId = uuidv4().slice(0, 7);
    localStorage.setItem("artifactId", artifactId);

    resetLocalStorage();

    const formData = new FormData(e.currentTarget);
    const prompt = formData.get("prompt") as string;
    setInitialPrompt(prompt);

    // Read content of selected files
    const fileContext = await getFileContext();
    var userPrompt = generateCodePrompt(prompt, fileContext, apiSpec);

    const messages = [{ role: "user", content: userPrompt }];
    console.log("Messages: ", messages, selectedModel);

    const onSuccess = (
      componentName: string,
      newGeneratedCode: {
        code: string;
        extraLibraries: { name: string; version: string }[];
      },
    ) => {
      updateGeneratedCode(componentName, newGeneratedCode);
      setStatus("created");
    };

    const onFailure = () => {
      console.log("onFailure called");
      setStatus("initial");
    };

    try {
      const newGeneratedCode = await generateCode(messages, selectedModel);
      processGeneratedCode(newGeneratedCode, onSuccess, onFailure);
    } catch (error) {
      console.error("Error generating code: ", error);
      onFailure();
    }
  };

  const handleModifyCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("updating");

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
    const availableComponents = getAllComponents(false);
    const fileContext = await getFileContext();
    var query = modifyCodePrompt(
      initialPrompt,
      prompt,
      activeComponent,
      activeFileContent,
      availableComponents,
      fileContext,
      apiSpec,
    );
    const messages = [{ role: "user", content: query }];
    console.log("Messages: ", messages, selectedModel);

    const onSuccess = (
      componentName: string,
      newGeneratedCode: {
        code: string;
        extraLibraries: { name: string; version: string }[];
      },
    ) => {
      console.log("onSuccess called");
      updateGeneratedCode(componentName, newGeneratedCode);
      setStatus("created");
    };

    const onFailure = () => {
      console.log("onFailure called");
      setStatus("created");
    };
    try {
      const newGeneratedCode = await modifyCode(messages, selectedModel);
      processGeneratedCode(newGeneratedCode, onSuccess, onFailure);
    } catch (error) {
      console.error("Error modifying code: ", error);
      onFailure();
    }
  };

  const handlePublish = (url: string) => {
    setPublishedUrl(url);
    localStorage.setItem("publishedUrl", url);
  };

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

        <FileUploader setSelectedFiles={setSelectedFiles} />

        <PromptForm
          loading={status === "creating"}
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

        {status !== "initial" && status !== "creating" && files && (
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
              <div className="mb-8 flex w-full justify-center">
                <div className="w-full md:w-3/5">
                  <UpdatePromptForm
                    loading={status === "updating"}
                    onUpdate={handleModifyCode}
                  />
                </div>
              </div>

              {(status === "created" || status === "updated") && (
                <div className="w-full">
                  <div className="mb-0 flex justify-between">
                    <CodeDownloader loading={loading} />
                    <PublishButton
                      loading={loading}
                      onPublish={handlePublish}
                    />
                  </div>
                  <CodeEditor files={files} extraDependencies={generatedCode.extraLibraries || []} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
      <Footer />
      <Toaster invert={true} />
      {status !== "creating" && status !== "initial" && (
        <div className="fixed bottom-4 left-4 z-50">
          <PublishedAppLink url={publishedUrl} />
        </div>
      )}

      {/* {(status === "creating" || status === "updating") && (
        <FunFactRenderer funFact={funFact} />
      )} */}
    </div>
  );
}
