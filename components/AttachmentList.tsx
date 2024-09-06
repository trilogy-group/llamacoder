import React, { useState } from "react";
import { FiX, FiEye } from "react-icons/fi";
import FileViewerModal from "./FileViewerModal";

interface AttachmentListProps {
  attachments: File[];
  onRemove: (index: number) => void;
  badgeClassName?: string;
}

const AttachmentList: React.FC<AttachmentListProps> = ({ attachments, onRemove, badgeClassName = "" }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (attachments.length === 0) return null;

  const handleView = (file: File) => {
    setSelectedFile(file);
  };

  const handleCloseModal = () => {
    setSelectedFile(null);
  };

  const isViewable = (file: File) => {
    const viewableExtensions = [
      ".txt", ".json", ".md", ".js", ".ts", ".jsx", ".tsx", ".py", ".java",
      ".cpp", ".c", ".cs", ".rb", ".php", ".swift", ".go"
    ];
    return file.type.startsWith("image/") || viewableExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {attachments.map((file, index) => (
          <div
            key={index}
            className={`flex items-center px-2 py-1 rounded-full text-xs ${badgeClassName}`}
          >
            <span className="truncate max-w-[100px]">{file.name}</span>
            {isViewable(file) && (
              <button
                onClick={() => handleView(file)}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <FiEye size={14} />
              </button>
            )}
            <button
              onClick={() => onRemove(index)}
              className="ml-1 text-gray-500 hover:text-gray-700"
            >
              <FiX size={14} />
            </button>
          </div>
        ))}
      </div>
      {selectedFile && (
        <FileViewerModal file={selectedFile} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default AttachmentList;