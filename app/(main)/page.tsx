"use client";

import { useScrollTo } from "@/hooks/use-scroll-to";
import { CircularProgress } from "@mui/material";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { generateCode, getApiSpec, modifyCode } from "../../utils/apiClient";
import { readFileContent } from "../../utils/fileUtils";
import { generateCodePrompt, modifyCodePrompt } from "../../utils/promptUtils";
import Dashboard from "./dashboard";
import LandingPage from "./landingpage";

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
  const [generatedCode, setGeneratedCodeMain] = useState<{
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
  const pathname = usePathname();

  const setGeneratedCode = (newGeneratedCode: {
    code: string;
    extraLibraries: { name: string; version: string }[];
  }) => {
    const updatedExtraLibraries = [
      ...generatedCode.extraLibraries,
      ...newGeneratedCode.extraLibraries.filter(
        (newLib) =>
          !generatedCode.extraLibraries.some(
            (existingLib: { name: string; version: string }) =>
              existingLib.name === newLib.name,
          ),
      ),
    ];
    setGeneratedCodeMain({
      ...newGeneratedCode,
      extraLibraries: updatedExtraLibraries,
    });
  };

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
    setGeneratedCodeMain({ code: "", extraLibraries: [] });
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
    var componentName = extractComponentName(newGeneratedCode.code);
    if (componentName === "App") {
      componentName = "MyApp";
    }
    onSuccess(componentName, newGeneratedCode);
  };

  const handleGenerateCode = async (
    e: FormEvent<HTMLFormElement>,
    images: File[],
  ) => {
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

    const imageBase64 = await Promise.all(
      images.map(async (image) => {
        const reader = new FileReader();
        return new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(image);
        });
      }),
    );

    var userPrompt = generateCodePrompt(prompt, fileContext, apiSpec);

    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          ...imageBase64.map((image) => ({
            type: "image_url",
            image_url: { url: image },
          })),
        ],
      },
    ];
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

  const handleModifyCode = async (
    e: FormEvent<HTMLFormElement>,
    images: File[],
  ) => {
    e.preventDefault();
    setStatus("updating");

    const formData = new FormData(e.currentTarget);
    const prompt = formData.get("prompt") as string;

    if (prompt.trim() === "") {
      toast.error("Please enter a valid prompt");
      setStatus("created");
      return;
    }

    const generatedCode = localStorage.getItem("generatedCode");
    if (!generatedCode) {
      toast.error("No generated code found");
      setStatus("created");
      return;
    }
    const generatedCodeJson = JSON.parse(generatedCode);
    const fileContext = await getFileContext();

    const imageBase64 = await Promise.all(
      images.map(async (image) => {
        const reader = new FileReader();
        return new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(image);
        });
      }),
    );

    var query = modifyCodePrompt(
      initialPrompt,
      prompt,
      generatedCodeJson.code,
      fileContext,
      apiSpec,
    );
    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: query },
          ...imageBase64.map((image) => ({
            type: "image_url",
            image_url: { url: image },
          })),
        ],
      },
    ];
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
    <>
      {pathname === "/" && <LandingPage />}
      {pathname === "/dashboard" && <Dashboard />}
    </>
  );
}
