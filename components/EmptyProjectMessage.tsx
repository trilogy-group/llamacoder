import CreateProjectButton from "./CreateProjectButton";

const EmptyProjectMessage: React.FC<{ onCreateProject: () => void }> = ({ onCreateProject }) => {
  return (
    <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center">
      <h3 className="mt-4 text-xl font-semibold text-gray-700">
        No projects yet
      </h3>
      <p className="mb-4 mt-2 text-gray-500">
        Create a new project to get started
      </p>
      <CreateProjectButton onClick={onCreateProject} showSearch={false} />
    </div>
  );
};

export default EmptyProjectMessage;
