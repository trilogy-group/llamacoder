import React from "react";
import { FiX } from "react-icons/fi";

interface AttachmentListProps {
  attachments: File[];
  onRemove: (index: number) => void;
}

const AttachmentList: React.FC<AttachmentListProps> = ({ attachments, onRemove }) => {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {attachments.map((file, index) => (
        <div key={index} className="flex items-center bg-white rounded-full px-2 py-0.5 text-xs shadow-sm">
          <span className="truncate max-w-[100px]">{file.name}</span>
          <FiX
            className="ml-1 cursor-pointer text-gray-500 hover:text-gray-700"
            onClick={() => onRemove(index)}
            size={12}
          />
        </div>
      ))}
    </div>
  );
};

export default AttachmentList;