import React, { useState } from "react";
import HeaderV2 from "@/components/HeaderV2";
import { dummyProjects } from "./dummy-projects";
import ArtifactList from "@/components/ArtifactLIst";
import Preview from "@/components/Preview";
import UpdateArtifact from "@/components/UpdateArtifact";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Artifact } from "@/types/Artifact";

const Workspace: React.FC = () => {
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact>(dummyProjects[0].artifacts[0]);
  const [isArtifactListCollapsed, setIsArtifactListCollapsed] = useState(false);
  const [isUpdateArtifactCollapsed, setIsUpdateArtifactCollapsed] = useState(false);

  const handleSelectArtifact = (artifact: Artifact) => {
    setSelectedArtifact(artifact);
  };

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
              artifacts={dummyProjects[0].artifacts}
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