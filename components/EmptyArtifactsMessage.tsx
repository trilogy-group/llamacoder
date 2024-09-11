import CreateArtifactButton from "./CreateArtifactButton";

interface EmptyArtifactsMessageProps {
  onCreateArtifact: () => void;
  isViewer: boolean;
}

const EmptyArtifactsMessage: React.FC<EmptyArtifactsMessageProps> = ({ onCreateArtifact, isViewer }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <img src="/empty-artifacts.svg" alt="No artifacts" className="w-64 h-64 mb-8" />
      <h2 className="text-2xl font-semibold mb-4">No artifacts yet</h2>
      <p className="text-gray-600 mb-8 text-center">
        {isViewer
          ? "This project doesn't have any artifacts yet."
          : "Start by creating your first artifact for this project."}
      </p>
      {!isViewer && (
        <button
          onClick={onCreateArtifact}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
        >
          Create New Artifact
        </button>
      )}
    </div>
  );
};

export default EmptyArtifactsMessage;
