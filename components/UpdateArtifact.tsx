import React, { useState } from "react";
import ChatHistory from "./ChatHistory";
import InputForm from "./InputForm";
import ChatContext from "./ChatContext";
import { Message } from "../types/Artifact";

const UpdateArtifact: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [contextAttachments, setContextAttachments] = useState<File[]>([]);

  const handleSubmit = (message: string, attachments: File[]) => {
    if (message.trim()) {  // Only proceed if there's a non-empty message
      const newMessage: Message = {
        id: Date.now().toString(),
        content: message,
        role: "user",
        attachments: attachments,
      };
      setChatHistory((prevHistory) => [...prevHistory, newMessage]);
      
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Updated message",
          role: "assistant",
          attachments: [],
        };
        setChatHistory((prevHistory) => [...prevHistory, assistantMessage]);
      }, 1000);
    }
  };

  const handleContextAttachmentAdd = (files: File[]) => {
    setContextAttachments((prev) => [...prev, ...files]);
  };

  const handleContextAttachmentRemove = (index: number) => {
    setContextAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full h-full flex flex-col bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="flex-shrink-0">
        <ChatContext
          attachments={contextAttachments}
          onAdd={handleContextAttachmentAdd}
          onRemove={handleContextAttachmentRemove}
        />
      </div>
      <div className="flex-grow overflow-hidden flex flex-col">
        <ChatHistory messages={chatHistory} />
      </div>
      <InputForm onSubmit={handleSubmit} isEmpty={chatHistory.length === 0} />
    </div>
  );
};

export default UpdateArtifact;