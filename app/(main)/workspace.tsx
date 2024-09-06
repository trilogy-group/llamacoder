'use client';

import React, { useState, useEffect } from "react";
import HeaderV2 from "@/components/HeaderV2";
import ArtifactList from "@/components/ArtifactLIst";
import Preview from "@/components/Preview";
import UpdateArtifact from "@/components/UpdateArtifact";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Artifact } from "@/types/Artifact";
import { Project } from "@/types/Project";
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface WorkspaceProps {
  params: { id: string };
}

const Workspace: React.FC<WorkspaceProps> = ({ params }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [isArtifactListCollapsed, setIsArtifactListCollapsed] = useState(false);
  const [isUpdateArtifactCollapsed, setIsUpdateArtifactCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/projects?id=${params.id}`);
        setProject(response.data);
        if (response.data.artifacts && response.data.artifacts.length > 0) {
          setSelectedArtifact(response.data.artifacts[0]);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [params.id]);

  const handleSelectArtifact = (artifact: Artifact) => {
    setSelectedArtifact(artifact);
  };

  const handleMyProjectsClick = () => {
    router.push('/dashboard');
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <HeaderV2 />
      <div className="flex-1 flex flex-col mt-16 px-5">
        <div className="flex justify-between items-center py-4">
          <button
            onClick={handleMyProjectsClick}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-full shadow-md hover:bg-blue-700 hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            My Projects
          </button>
        </div>
        <div className="flex-1 overflow-hidden bg-white rounded-lg shadow-lg border border-gray-200">
          <PanelGroup direction="horizontal" className="h-full">
            <Panel
              defaultSize={20}
              minSize={0}
              maxSize={100}
              collapsible={true}
            >
              <ArtifactList
                artifacts={project.artifacts}
                onSelectArtifact={handleSelectArtifact}
                selectedArtifact={selectedArtifact}
                isCollapsed={isArtifactListCollapsed}
                setIsCollapsed={setIsArtifactListCollapsed}
              />
            </Panel>
            {!isArtifactListCollapsed && (
              <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors" />
            )}
            <Panel defaultSize={60} minSize={40} maxSize={100}>
              <div className="h-full">
                <Preview artifact={selectedArtifact} />
              </div>
            </Panel>
            {!isUpdateArtifactCollapsed && (
              <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors" />
            )}
            <Panel
              defaultSize={20}
              minSize={0}
              maxSize={100}
              collapsible={true}
            >
              <UpdateArtifact
                artifact={selectedArtifact}
                isCollapsed={isUpdateArtifactCollapsed}
                setIsCollapsed={setIsUpdateArtifactCollapsed}
              />
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </div>
  );
};

export default Workspace;