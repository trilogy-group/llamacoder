import React, { useState, useEffect } from "react";
import HeaderV2 from "@/components/HeaderV2";
import { dummyProjects } from "./dummy-projects";
import ArtifactList from "@/components/ArtifactLIst";
import Preview from "@/components/Preview";
import UpdateArtifact from "@/components/UpdateArtifact";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Artifact } from "@/types/Artifact";
import { Project } from "@/types/Project";

interface WorkspaceProps {
  projectId: string;
}

const Workspace: React.FC<WorkspaceProps> = ({ projectId }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [isArtifactListCollapsed, setIsArtifactListCollapsed] = useState(false);
  const [isUpdateArtifactCollapsed, setIsUpdateArtifactCollapsed] = useState(false);

  useEffect(() => {
    const foundProject = dummyProjects.find(p => p.id === projectId);
    if (foundProject) {
      setProject(foundProject);
      setSelectedArtifact(foundProject.artifacts[0]);
    }
  }, [projectId]);

  const handleSelectArtifact = (artifact: Artifact) => {
    setSelectedArtifact(artifact);
  };

  if (!project || !selectedArtifact) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <HeaderV2 />
      <div className="flex-1 overflow-hidden mt-24 mb-5 mx-5 bg-white rounded-lg shadow-lg border border-gray-200">
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
  );
};

export default Workspace;