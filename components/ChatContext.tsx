import React, { useRef } from "react";
import { FiPlus } from "react-icons/fi";
import AttachmentList from "./AttachmentList";
import { Artifact } from "../types/Artifact";
import { Attachment } from "../types/Attachment";

interface ChatContextProps {
  artifact: Artifact;
  attachments: Attachment[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
}

const ChatContext: React.FC<ChatContextProps> = ({ artifact, attachments, onAdd, onRemove }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onAdd(Array.from(e.target.files));
    }
  };

  return (
    <div className="p-4 bg-gray-50 border-b">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Chat Context</h3>
        <button
          type="button"
          onClick={handleAttachmentClick}
          className="text-blue-500 hover:text-blue-600 bg-gray-100 rounded-full p-1 shadow-sm"
        >
          <FiPlus size={20} />
        </button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />
      <div className="overflow-y-auto max-h-[60px]">
        {attachments.length > 0 ? (
            <AttachmentList 
                attachments={attachments} 
                onRemove={onRemove}
                badgeClassName="bg-blue-100 text-blue-800"
            />
        ) : (
            <div className="flex justify-center items-center h-full">
                <span className="text-xs text-gray-500">No context</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatContext;