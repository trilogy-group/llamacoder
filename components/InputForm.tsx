import React, { useState, useRef, useEffect, useCallback } from "react";
import { FiPlus, FiSend } from "react-icons/fi";
import AttachmentList from "./AttachmentList";
import ModelSelector from "./ModelSelector";
import { Artifact } from "../types/Artifact";
import { Attachment } from "../types/Attachment";

interface InputFormProps {
  artifact: Artifact;
  onSubmit: (message: string, attachments: Attachment[]) => void;
  isEmpty: boolean;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const InputForm: React.FC<InputFormProps> = React.memo(({ artifact, onSubmit, isEmpty, selectedModel, onModelChange }) => {
  const [inputMessage, setInputMessage] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAttachmentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newAttachments: Attachment[] = await Promise.all(
        Array.from(e.target.files).map(async (file) => {
          const id = Math.random().toString(36).substr(2, 9);
          const url = URL.createObjectURL(file);
          return {
            id,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            url,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: "user", // Replace with actual user ID if available
            updatedBy: "user", // Replace with actual user ID if available
          };
        })
      );
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((attachment) => attachment.id !== id));
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputMessage.trim()) {
      onSubmit(inputMessage, attachments);
      setInputMessage("");
      setAttachments([]);
      setError(null);
    } else {
      setError("Please enter a message before sending.");
    }
  }, [inputMessage, attachments, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    if (e.target.value.trim()) {
      setError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`p-4 space-y-2 ${isEmpty ? '' : ''}`}>
      <div className="bg-gray-100 p-3 rounded-lg flex-grow">
        <div className="flex items-center space-x-2 mb-2">
          <button
            type="button"
            onClick={handleAttachmentClick}
            className="text-blue-500 hover:text-blue-600 bg-white rounded-full p-1 shadow-sm"
          >
            <FiPlus size={20} />
          </button>
          {attachments.length == 0 && <span className="text-xs text-gray-500">Add context</span>}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept=".json,.txt,.graphql,.md,.yaml,.ts,.tsx,.js,.jsx,.py,text/*,image/*,.docx"
          />
          <AttachmentList 
            attachments={attachments} 
            onRemove={removeAttachment} 
            badgeClassName="bg-white text-gray-800"
          />
        </div>
        <div className="relative flex-grow">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isEmpty ? "Update your artifact..." : "Ask followup question..."}
            className={`w-full py-2 px-3 border rounded-lg text-xs focus:outline-none focus:ring-2 ${
              error ? 'border-red-300 focus:ring-red-500' : 'focus:ring-blue-500'
            } resize-none overflow-y-auto`}
            style={{ minHeight: "80px", maxHeight: "200px", paddingBottom: "30px" }}
          />
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
            <ModelSelector selectedModel={selectedModel} onModelChange={onModelChange} />
            <button
              type="button"
              onClick={handleSubmit}
              className="text-blue-500 hover:text-blue-600"
            >
              <FiSend size={16} />
            </button>
          </div>
        </div>
      </div>
      {error && (
        <div className="text-red-500 text-xs mt-1 bg-red-50 border border-red-200 rounded-md p-2 flex items-center">
          <span className="mr-2">⚠️</span>
          {error}
        </div>
      )}
    </form>
  );
});

InputForm.displayName = 'InputForm';
export default React.memo(InputForm);