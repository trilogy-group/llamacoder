import React, { useState } from "react";
import { FiX, FiEye } from "react-icons/fi";
import FileViewerModal from "./FileViewerModal";
import { Attachment } from "../types/Attachment";

interface AttachmentListProps {
  attachments: Attachment[];
  onRemove?: (id: string) => void; // Make onRemove optional
  badgeClassName?: string;
  showRemoveButton?: boolean; // Add this new prop
  backgroundColor?: string; // Add this new prop
}

const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  onRemove,
  badgeClassName = "",
  showRemoveButton = true, // Default to true
  backgroundColor = "bg-white" // Default to white background
}) => {
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

  if (attachments.length === 0) return null;

  const handleView = (attachment: Attachment) => {
    setSelectedAttachment(attachment);
  };

  const handleCloseModal = () => {
    setSelectedAttachment(null);
  };

  const isViewable = (fileType: string, fileName: string) => {
    const viewableExtensions = [
      ".txt", ".json", ".md", ".js", ".ts", ".jsx", ".tsx", ".py", ".java",
      ".cpp", ".c", ".cs", ".rb", ".php", ".swift", ".go"
    ];
    return fileType.startsWith("image/") || viewableExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className={`flex items-center px-2 py-1 rounded-full text-xs ${backgroundColor} ${badgeClassName}`}
          >
            <span className="truncate max-w-[100px]">{attachment.fileName}</span>
            {isViewable(attachment.fileType, attachment.fileName) && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleView(attachment);
                }}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <FiEye size={14} />
              </button>
            )}
            {showRemoveButton && onRemove && ( // Only show remove button if both conditions are true
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onRemove(attachment.id);
                }}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <FiX size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
      {selectedAttachment && (
        <FileViewerModal attachment={selectedAttachment} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default AttachmentList;