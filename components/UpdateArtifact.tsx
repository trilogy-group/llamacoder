import React, { useState, useEffect } from "react";
import ChatHistory from "./ChatHistory";
import InputForm from "./InputForm";
import ArtifactInfo from "./ArtifactInfo"; // Add this import
import { Artifact } from "../types/Artifact";
import { Message } from "../types/Message";
import { ChatSession } from "../types/ChatSession";
import { FiLoader } from "react-icons/fi"; // Add this import

interface UpdateArtifactProps {
  artifact: Artifact;
  streamingMessage: Message | null;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const UpdateArtifact: React.FC<UpdateArtifactProps> = ({ artifact, streamingMessage, isCollapsed, setIsCollapsed }) => {
  const [chatSession, setChatSession] = useState<ChatSession>(() => {
    if (artifact.chatSession) {
      return artifact.chatSession;
    } else {
      return {
        id: Date.now().toString(),
        artifactId: artifact.id,
        messages: [],
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: "current_user", // Replace with actual user info
        model: "default_model", // Replace with actual model info
      };
    }
  });

  useEffect(() => {
    if (artifact.chatSession) {
      setChatSession(artifact.chatSession);
    }
  }, [artifact.chatSession]);

  const handleSubmit = (text: string) => {
    if (text.trim()) {
      const newMessage: Message = {
        text: text,
        role: "user",
      };
      setChatSession((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
        updatedAt: new Date().toISOString(),
      }));
      
      // Simulated assistant response
      setTimeout(() => {
        const assistantMessage: Message = {
          text: "Updated message",
          role: "assistant",
        };
        setChatSession((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          updatedAt: new Date().toISOString(),
        }));
      }, 1000);
    }
  };

  const renderContent = () => {
    if (!streamingMessage && (artifact.status === "creating" || artifact.status === "updating")) {
      return (
        <div className="flex-grow flex items-center justify-center">
          <FiLoader className="animate-spin text-blue-500" size={24} />
          <span className="text-gray-700 text-xs">Thinking...</span>
        </div>
      );
    }

    return (
      <>
        <div className="flex-grow overflow-hidden flex flex-col">
          <ChatHistory artifact={artifact} chatSession={chatSession} streamingMessage={streamingMessage}/>
        </div>
        <InputForm 
          artifact={artifact} 
          onSubmit={handleSubmit} 
          isEmpty={chatSession.messages.length === 0} 
        />
      </>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-white shadow-sm rounded-lg overflow-hidden">
      {!isCollapsed && (
        <>
          <div className="flex-shrink-0">
            <ArtifactInfo artifact={artifact} />
          </div>
          {renderContent()}
        </>
      )}
    </div>
  );
};

export default UpdateArtifact;