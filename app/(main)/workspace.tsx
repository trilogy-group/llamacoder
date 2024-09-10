"use client";

import React, { useState, useEffect } from "react";
import HeaderV2 from "@/components/HeaderV2";
import ProjectHeader from "@/components/ProjectHeader";
import ArtifactList from "@/components/ArtifactLIst";
import Preview from "@/components/Preview";
import UpdateArtifact from "@/components/UpdateArtifact";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Artifact } from "@/types/Artifact";
import { Project } from "@/types/Project";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { projectApi } from "@/utils/apiClients/Project";
import { artifactApi } from "@/utils/apiClients/Artifact";
import { genAiApi, extractContent } from "@/utils/apiClients/GenAI";
import { Message } from "@/types/Message";
import { CircularProgress } from "@mui/material";
import EmptyArtifactsMessage from "@/components/EmptyArtifactsMessage";
import ArtifactOverviewInputForm from "@/components/ArtifactOverviewInputForm";
import { ChatSession } from "@/types/ChatSession";
import CodeViewer from "@/components/CodeViewer";
import ProjectShareModal from "@/components/ProjectShareModal";
import { v4 as uuidv4 } from "uuid";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import ArtifactInfoCard from "@/components/ArtifactInfoCard";
import Alert from "@/components/Alert";

interface WorkspaceProps {
  projectId: string;
}

const Workspace: React.FC<WorkspaceProps> = ({ projectId }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(
    null,
  );
  const [isArtifactListCollapsed, setIsArtifactListCollapsed] = useState(false);
  const [isUpdateArtifactCollapsed, setIsUpdateArtifactCollapsed] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(
    null,
  );
  const [mode, setMode] = useState<"preview" | "editor">("preview");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteArtifactConfirmation, setShowDeleteArtifactConfirmation] =
    useState(false);
  const [artifactToDelete, setArtifactToDelete] = useState<Artifact | null>(
    null,
  );
  const [hoveredArtifact, setHoveredArtifact] = useState<Artifact | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [alert, setAlert] = useState<{
    type: "error" | "info" | "warning" | "success";
    message: string;
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchProjectAndArtifacts = async () => {
      setIsLoading(true);
      try {
        if (!projectId) {
          throw new Error("Project ID is undefined");
        }
        console.log("Fetching project with ID:", projectId); // Add this log
        const fetchedProject = await projectApi.getProject(projectId);
        console.log("Fetched project:", fetchedProject); // Add this log
        const artifacts = await artifactApi.getArtifacts(projectId);
        console.log("Fetched artifacts:", artifacts); // Add this log

        setProject({
          ...fetchedProject,
          artifacts: artifacts,
        });

        if (artifacts.length > 0) {
          setSelectedArtifact(artifacts[0]);
        }
      } catch (err) {
        console.error("Error fetching project and artifacts:", err); // Improve error logging
        setError("Failed to fetch project and artifacts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectAndArtifacts();
  }, [projectId]);

  const showAlert = (
    type: "error" | "info" | "warning" | "success",
    message: string,
  ) => {
    setAlert({ type, message });
  };

  const handleSelectArtifact = (artifact: Artifact) => {
    setSelectedArtifact(artifact);
  };

  const handleMyProjectsClick = () => {
    router.push("/dashboard");
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await projectApi.deleteProject(projectId);
      showAlert("success", "Project deleted successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting project:", error);
      showAlert("error", "Failed to delete project");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
  };

  const handleCreateArtifact = async (description: string, callback: () => void) => {
    const defaultDependencies = [
      {
        name: "lucide-react",
        version: "latest",
      },
      {
        name: "recharts",
        version: "latest",
      },
      {
        name: "axios",
        version: "latest",
      },
      {
        name: "react-dom",
        version: "latest",
      },
      {
        name: "react-router-dom",
        version: "latest",
      },
      {
        name: "react-ui",
        version: "latest",
      },
      {
        name: "@mui/material",
        version: "latest",
      },
      {
        name: "@mui/styles",
        version: "latest",
      },
      {
        name: "@emotion/react",
        version: "latest",
      },
      {
        name: "@emotion/styled",
        version: "latest",
      },
      {
        name: "@mui/icons-material",
        version: "latest",
      },
      {
        name: "react-player",
        version: "latest",
      },
    ];

    let newArtifact = {
      id: uuidv4(),
      name: "New Artifact",
      code: `import React from 'react';
const App = () => {
return <div>Hello World</div>;
};
export default App;`,
      dependencies: defaultDependencies,
      description,
      projectId,
      status: "creating",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Artifact;

    try {
      if (!project) {
        throw new Error("Project is not loaded");
      }

      newArtifact = await artifactApi.createArtifact(project.id, newArtifact);
      callback();
      setShowCreateForm(false);
      setMode("editor");  
      setSelectedArtifact(newArtifact);
      setProject((prevProject) => ({
        ...prevProject!,
        artifacts: [...(prevProject?.artifacts || []), newArtifact],
      }));

      // Generate code for the artifact
      const messages: Message[] = [
        {
          role: "user",
          text: `Generate code for the following artifact: ${description}`,
        },
      ];

      const extractComponentName = (code: string): string => {
        const match = code.match(/export default (\w+)/);
        return match ? match[1] : "MyApp";
      };

      let response = "";
      let generatedCode = "";
      const onChunk = (
        chunks: { index: number; type: string; text: string }[],
      ) => {
        for (const chunk of chunks) {
          response += chunk.text;
          if (response.includes("</CODE>")) {
            if (generatedCode === "") {
              generatedCode = extractContent(response, "CODE") || "";
              newArtifact.code = generatedCode;
              newArtifact.name = extractComponentName(response);
              setSelectedArtifact(newArtifact);
              setProject((prevProject) => ({
                ...prevProject!,
                artifacts: prevProject?.artifacts?.map((a) =>
                  a.id === newArtifact.id ? newArtifact : a,
                ),
              }));
            }
            setMode("preview");
          }
          setStreamingMessage({
            role: "assistant",
            text: response,
          });
        }
      };

      const { code, dependencies } = await genAiApi.generateResponse(
        messages,
        onChunk,
      );

      // Create a new chat session
      const newChatSession: ChatSession = {
        id: Date.now().toString(), // Generate a unique ID
        artifactId: newArtifact.id,
        messages: [
          { role: "user", text: messages[0].text },
          { role: "assistant", text: response },
        ],
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: "user", // Replace with actual user ID if available
        model: "gpt-4", // Replace with the actual model used
      };

      const componentName = extractComponentName(code);

      newArtifact = {
        ...newArtifact,
        name: componentName,
        code: code,
        dependencies: [...defaultDependencies, ...dependencies],
        status: "idle",
        chatSession: newChatSession,
      };

      setSelectedArtifact(newArtifact);
      setProject((prevProject) => ({
        ...prevProject!,
        artifacts: prevProject?.artifacts?.map((a) =>
          a.id === newArtifact.id ? newArtifact : a,
        ),
      }));
      setStreamingMessage(null);
      setMode("preview");

      await artifactApi.updateArtifact(projectId, newArtifact.id, {
        name: componentName,
        code: code,
        dependencies: [...defaultDependencies, ...dependencies],
        status: "idle",
        chatSession: newChatSession,
      });

      showAlert("success", "Artifact created successfully");
    } catch (error) {
      console.error("Error creating artifact or generating code:", error);
      toast.error("Failed to create artifact or generate code", {
        duration: 3000,
      });
      showAlert("error", "Failed to create artifact");
    } finally {
      setShowCreateForm(false);
      setMode("preview");
    }
  };

  const handleDeleteArtifact = (artifact: Artifact) => {
    setArtifactToDelete(artifact);
    setShowDeleteArtifactConfirmation(true);
  };

  const handleArtifactHover = (
    artifact: Artifact | null,
    event: React.MouseEvent,
  ) => {
    setHoveredArtifact(artifact);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const confirmDeleteArtifact = async (): Promise<string> => {
    if (artifactToDelete) {
      try {
        await artifactApi.deleteArtifact(projectId, artifactToDelete.id);

        setProject((prevProject) => {
          const updatedArtifacts =
            prevProject?.artifacts?.filter(
              (a) => a.id !== artifactToDelete.id,
            ) || [];
          return {
            ...prevProject!,
            artifacts: updatedArtifacts,
          };
        });

        if (selectedArtifact?.id === artifactToDelete.id) {
          setProject((prevProject) => {
            const remainingArtifacts =
              prevProject?.artifacts?.filter(
                (a) => a.id !== artifactToDelete.id,
              ) || [];
            const newSelectedArtifact =
              remainingArtifacts.length > 0 ? remainingArtifacts[0] : null;
            setSelectedArtifact(newSelectedArtifact);
            return prevProject;
          });
        }
        showAlert("success", "Artifact deleted successfully");
        return "Artifact deleted successfully"; // Return a success message
      } catch (error) {
        console.error("Error deleting artifact:", error);
        showAlert("error", "Failed to delete artifact");
        return "Failed to delete artifact"; // Return an error message
      } finally {
        setShowDeleteArtifactConfirmation(false);
        setArtifactToDelete(null);
      }
    }
    return "No artifact to delete"; // Return a message if there's no artifact to delete
  };

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
        <CircularProgress size={64} />
        <h2 className="mb-2 mt-4 text-2xl font-semibold text-gray-700">
          Preparing Your Workspace
        </h2>
        <p className="text-gray-500">
          Loading project details and artifacts...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
        <svg
          className="mb-4 h-16 w-16 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="mb-2 text-2xl font-semibold text-gray-700">
          Oops! Something went wrong
        </h2>
        <p className="mb-4 text-gray-500">{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-full bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
        <svg
          className="mb-4 h-16 w-16 text-yellow-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 className="mb-2 text-2xl font-semibold text-gray-700">
          Project Not Found
        </h2>
        <p className="mb-4 text-gray-500">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          The project you're looking for doesn't exist or has been deleted.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-full bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <HeaderV2 />
      <div
        className="flex flex-1 flex-col overflow-hidden"
        style={{ marginTop: "64px" }}
      >
        <ProjectHeader
          projectTitle={project.title}
          projectDescription={project.description}
          onMyProjectsClick={handleMyProjectsClick}
          onShareClick={handleShare}
          onDeleteClick={handleDelete}
          projectId={project.id}
        />
        {project.artifacts && project.artifacts.length > 0 ? (
          <PanelGroup direction="horizontal" className="flex-1">
            <Panel
              defaultSize={20}
              minSize={0}
              maxSize={100}
              collapsible={true}
            >
              <ArtifactList
                artifacts={project.artifacts || []}
                onSelectArtifact={handleSelectArtifact}
                selectedArtifact={selectedArtifact}
                isCollapsed={isArtifactListCollapsed}
                setIsCollapsed={setIsArtifactListCollapsed}
                onCreateArtifact={() => setShowCreateForm(true)}
                onDeleteArtifact={handleDeleteArtifact}
                onArtifactHover={handleArtifactHover}
              />
            </Panel>
            {!isArtifactListCollapsed && (
              <PanelResizeHandle className="w-1 bg-gray-200 transition-colors hover:bg-gray-300" />
            )}
            <Panel defaultSize={60} minSize={40} maxSize={100}>
              <div className="h-full">
                {selectedArtifact &&
                  (mode === "preview" ? (
                    <Preview
                      project={project}
                      selectedArtifact={selectedArtifact}
                      initialMode={mode}
                    />
                  ) : (
                    <CodeViewer
                      status={selectedArtifact.status}
                      code={
                        extractContent(streamingMessage?.text || "", "CODE") ||
                        ""
                      }
                    />
                  ))}
              </div>
            </Panel>
            {!isUpdateArtifactCollapsed && (
              <PanelResizeHandle className="w-1 bg-gray-200 transition-colors hover:bg-gray-300" />
            )}
            <Panel
              defaultSize={20}
              minSize={0}
              maxSize={100}
              collapsible={true}
            >
              {selectedArtifact && (
                <UpdateArtifact
                  artifact={selectedArtifact}
                  isCollapsed={isUpdateArtifactCollapsed}
                  setIsCollapsed={setIsUpdateArtifactCollapsed}
                  streamingMessage={streamingMessage}
                />
              )}
            </Panel>
          </PanelGroup>
        ) : (
          <EmptyArtifactsMessage
            onCreateArtifact={() => setShowCreateForm(true)}
          />
        )}
      </div>
      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
            <h3 className="mb-4 text-xl font-semibold">Confirm Deletion</h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this project? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDeleteCancel}
                className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="rounded-md bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4 backdrop-blur-[2px]">
          <ArtifactOverviewInputForm
            onCancel={() => setShowCreateForm(false)}
            onNext={handleCreateArtifact}
          />
        </div>
      )}
      {showShareModal && (
        <ProjectShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          projectId={project.id}
          projectTitle={project.title}
        />
      )}
      {showDeleteArtifactConfirmation && artifactToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowDeleteArtifactConfirmation(false)}
          ></div>
          <div className="relative z-10">
            <ConfirmationDialog
              message={
                <>
                  Are you sure you want to <i>permanently</i> delete the
                  artifact{" "}
                  <span className="font-semibold text-blue-600">
                    {artifactToDelete.name}
                  </span>
                  ?
                </>
              }
              onConfirm={confirmDeleteArtifact}
              onCancel={() => setShowDeleteArtifactConfirmation(false)}
            />
          </div>
        </div>
      )}
      {hoveredArtifact && (
        <ArtifactInfoCard
          artifact={hoveredArtifact}
          position={mousePosition}
          onClose={() => setHoveredArtifact(null)}
        />
      )}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );
};

export default Workspace;
