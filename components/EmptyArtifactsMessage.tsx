import CreateArtifactButton from "./CreateArtifactButton";

const EmptyArtifactsMessage: React.FC<{ onCreateArtifact: () => void }> = ({ onCreateArtifact }) => {
  return (
    <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center">
      <h3 className="mt-4 text-xl font-semibold text-gray-700">
        No artifacts yet
      </h3>
      <p className="mb-4 mt-2 text-gray-500">
        Create a new artifact to get started
      </p>
      <CreateArtifactButton onClick={onCreateArtifact} />
    </div>
  );
};

export default EmptyArtifactsMessage;
