import React, { useState, useRef, useEffect } from "react";
import { FiPlus, FiSend } from "react-icons/fi";
import AttachmentList from "./AttachmentList";
import ModelSelector from "./ModelSelector";


interface InputFormProps {
  onSubmit: (message: string, attachments: File[]) => void;
  isEmpty: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isEmpty }) => {
  const [inputMessage, setInputMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAttachmentClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSubmit(inputMessage, attachments);
      setInputMessage("");
      setAttachments([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`p-4 space-y-2 ${isEmpty ? '' : ''}`}>
      <div className="bg-gray-100 p-3 rounded-lg flex-grow">
        <div className="flex items-center space-x-2 mb-2">
          <button
            type="button" // Ensure this is type="button"
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
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isEmpty ? "Update your artifact..." : "Ask followup question..."}
            className="w-full py-2 px-3 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto"
            style={{ minHeight: "80px", maxHeight: "200px", paddingBottom: "30px" }}
          />
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
            <ModelSelector />
            <button
              type="submit"
              className="text-blue-500 hover:text-blue-600"
              disabled={!inputMessage.trim()}
            >
              <FiSend size={16} />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default InputForm;