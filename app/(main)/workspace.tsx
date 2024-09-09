import React, { useEffect } from "react";
import HeaderV2 from "@/components/HeaderV2";
import { Artifact } from "@/types/Artifact";
import ArtifactList from "@/components/ArtifactLIst";
import Preview from "@/components/Preview";
import UpdateArtifact from "@/components/UpdateArtifact";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useAppContext } from "@/contexts/AppContext";

const Workspace: React.FC = () => {
  const { 
    currentProject, 
    setCurrentProject, 
    currentArtifact, 
    setCurrentArtifact,
    projects 
  } = useAppContext();

  console.log("currentProject", currentProject);
  console.log("currentArtifact", currentArtifact);
  console.log("projects", projects);
  
  const [isArtifactListCollapsed, setIsArtifactListCollapsed] = React.useState(false);
  const [isUpdateArtifactCollapsed, setIsUpdateArtifactCollapsed] = React.useState(false);

  useEffect(() => {
    // Set the first project as current if not already set
    if (!currentProject && projects.length > 0) {
      setCurrentProject(projects[0]);
    }
  }, [currentProject, projects, setCurrentProject]);

  useEffect(() => {
    // Set the first artifact as current if not already set
    if (currentProject && !currentArtifact && currentProject.artifacts.length > 0) {
      setCurrentArtifact(currentProject.artifacts[0]);
    }
  }, [currentProject, currentArtifact, setCurrentArtifact]);

  const handleSelectArtifact = (artifact: Artifact) => {
    setCurrentArtifact(artifact);
  };

  if (!currentProject || !currentArtifact) {
    return <div>Loading workspace...</div>; // Or a more sophisticated loading component
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
              artifacts={currentProject.artifacts}
              onSelectArtifact={handleSelectArtifact}
              selectedArtifact={currentArtifact}
              isCollapsed={isArtifactListCollapsed}
              setIsCollapsed={setIsArtifactListCollapsed}
            />
          </Panel>
          {!isArtifactListCollapsed && (
            <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors" />
          )}
          <Panel defaultSize={60} minSize={40} maxSize={100}>
            <div className="h-full">
              <Preview artifact={currentArtifact} />
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
              artifact={currentArtifact}
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