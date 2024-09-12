import React, { useState, useEffect, useCallback } from "react";
import ChatHistory from "./ChatHistory";
import InputForm from "./InputForm";
import ArtifactInfo from "./ArtifactInfo"; // Add this import
import { Artifact } from "../types/Artifact";
import { Message } from "../types/Message";
import { ChatSession } from "../types/ChatSession";
import { FiLoader } from "react-icons/fi"; // Add this import
import { Attachment } from "../types/Attachment";

interface UpdateArtifactProps {
  artifact: Artifact;
  streamingMessage: Message | null;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onUpdateArtifact: (chatSession: ChatSession, artifact: Artifact) => void;
}

const UpdateArtifact: React.FC<UpdateArtifactProps> = ({ 
  artifact, 
  streamingMessage, 
  isCollapsed, 
  setIsCollapsed,
  onUpdateArtifact
}) => {
  const [chatSession, setChatSession] = useState<ChatSession>(() => {
    return artifact.chatSession || {
      id: Date.now().toString(),
      artifactId: artifact.id,
      messages: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: "current_user",
      model: "bedrock-claude-3.5-sonnet",
    };
  });

  useEffect(() => {
    if (artifact.chatSession) {
      setChatSession(artifact.chatSession);
    }
  }, [artifact.chatSession]);

  const handleSubmit = useCallback((text: string, attachments: Attachment[]) => {
    if (text.trim()) {
      const newMessage: Message = {
        text: text,
        role: "user",
        attachments: attachments,
      };
      const updatedSession = {
        ...chatSession,
        messages: [...chatSession.messages, newMessage],
        updatedAt: new Date().toISOString(),
      };
      setChatSession(updatedSession);
      onUpdateArtifact(updatedSession, artifact);
    }
  }, [chatSession, artifact, onUpdateArtifact]);

  const handleModelChange = useCallback((model: string) => {
    const updatedSession = {
      ...chatSession,
      model: model,
      updatedAt: new Date().toISOString(),
    };
    setChatSession(updatedSession);
  }, [chatSession]);

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
          selectedModel={chatSession.model}
          onModelChange={handleModelChange}
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

export default React.memo(UpdateArtifact);