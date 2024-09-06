import React, { useState } from "react";
import ChatHistory from "./ChatHistory";
import InputForm from "./InputForm";

const UpdateArtifact: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  const handleSubmit = (message: string) => {
    if (message.trim()) {
      setChatHistory([...chatHistory, message]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white shadow-sm rounded-lg overflow-hidden">
      {chatHistory.length === 0 ? (
        <InputForm onSubmit={handleSubmit} isEmpty={true} />
      ) : (
        <>
          <div className="flex-grow overflow-y-auto">
            <ChatHistory messages={chatHistory} />
          </div>
          <InputForm onSubmit={handleSubmit} isEmpty={false} />
        </>
      )}
    </div>
  );
};

export default UpdateArtifact;