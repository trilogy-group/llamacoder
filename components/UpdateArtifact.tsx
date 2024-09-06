import React, { useState, useRef, useEffect } from "react";
import { FiPlus, FiX, FiSend, FiChevronDown } from "react-icons/fi";

const UpdateArtifact: React.FC = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude-3.5-sonnet");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAttachmentClick = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      setChatHistory([...chatHistory, inputMessage]);
      setInputMessage("");
    }
  };

  useEffect(() => {
    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      }
    };

    adjustHeight();
  }, [inputMessage]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="max-h-60 overflow-y-auto p-4 space-y-2">
        {chatHistory.map((message, index) => (
          <div key={index} className="p-2 bg-gray-100 rounded-lg text-sm">
            {message}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 space-y-2">
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
            />
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center bg-white rounded-full px-2 py-0.5 text-xs shadow-sm">
                    <span className="truncate max-w-[100px]">{file.name}</span>
                    <FiX
                      className="ml-1 cursor-pointer text-gray-500 hover:text-gray-700"
                      onClick={() => removeAttachment(index)}
                      size={12}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative flex-grow">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Update your artifact..."
              className="w-full py-2 px-3 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto"
              style={{ minHeight: "80px", maxHeight: "200px", paddingBottom: "30px" }}
            />
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
              <div className="relative inline-flex items-center">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-transparent text-gray-400 text-[10px] focus:outline-none focus:ring-0 appearance-none cursor-pointer pr-3"
                >
                  <option value="claude-3.5-sonnet">claude-3.5-sonnet</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="bedrock-claude-3.5-sonnet">bedrock-claude-3.5-sonnet</option>
                  {/* Add more model options here */}
                </select>
              </div>
              <button
                type="submit"
                className="text-blue-500 hover:text-blue-600"
              >
                <FiSend size={16} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdateArtifact;