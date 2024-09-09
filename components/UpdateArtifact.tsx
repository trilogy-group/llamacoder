import React, { useState } from "react";
import ChatHistory from "./ChatHistory";
import InputForm from "./InputForm";
import ChatContext from "./ChatContext";
import { Artifact } from "../types/Artifact";
import { Message } from "../types/Message";
import { ChatSession } from "../types/ChatSession";
import { Attachment } from "../types/Attachment";

interface UpdateArtifactProps {
  artifact: Artifact;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const UpdateArtifact: React.FC<UpdateArtifactProps> = ({ artifact, isCollapsed, setIsCollapsed }) => {
  const [chatSession, setChatSession] = useState<ChatSession>({
    id: Date.now().toString(),
    artifactId: artifact.id,
    messages: [],
    attachments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    user: "current_user", // Replace with actual user info
    model: "default_model", // Replace with actual model info
  });

  const handleSubmit = (text: string, attachments: Attachment[]) => {
    if (text.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: text,
        role: "user",
        attachments: attachments,
      };
      setChatSession((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
        updatedAt: new Date(),
      }));
      
      // Simulated assistant response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Updated message",
          role: "assistant",
        };
        setChatSession((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          updatedAt: new Date(),
        }));
      }, 1000);
    }
  };

  const handleContextAttachmentAdd = (files: File[]) => {
    const newAttachments = files.map(fileToAttachment);
    setChatSession((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments],
      updatedAt: new Date(),
    }));
  };

  const handleContextAttachmentRemove = (id: string) => {
    setChatSession((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((attachment) => attachment.id !== id),
      updatedAt: new Date(),
    }));
  };

  const fileToAttachment = (file: File): Attachment => ({
    id: Date.now().toString(),
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    url: URL.createObjectURL(file),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "current_user", // Replace with actual user info
    updatedBy: "current_user", // Replace with actual user info
  });

  return (
    <div className="w-full h-full flex flex-col bg-white shadow-sm rounded-lg overflow-hidden">
      {!isCollapsed && (
        <>
          <div className="flex-shrink-0">
            <ChatContext
              artifact={artifact}
              attachments={chatSession.attachments}
              onAdd={handleContextAttachmentAdd}
              onRemove={handleContextAttachmentRemove}
            />
          </div>
          <div className="flex-grow overflow-hidden flex flex-col">
            <ChatHistory artifact={artifact} chatSession={chatSession} />
          </div>
          <InputForm 
            artifact={artifact} 
            onSubmit={handleSubmit} 
            isEmpty={chatSession.messages.length === 0} 
          />
        </>
      )}
    </div>
  );
};

export default UpdateArtifact;