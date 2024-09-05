import React, { useState } from "react";
import { FiSend, FiMessageSquare, FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { Artifact, Message } from "../types/Artifact";

interface UpdateArtifactProps {
  artifact: Artifact | null;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

const UpdateArtifact: React.FC<UpdateArtifactProps> = ({ artifact, isCollapsed, setIsCollapsed }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: inputMessage,
        role: "user",
      };
      setMessages([...messages, newMessage]);
      setInputMessage("");
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: "Updating artifact...",
        role: "assistant",
      };
      setTimeout(() => {
        setMessages([...messages, assistantMessage]);
      }, 1000);
    }
  };

  if (isCollapsed) {
    return (
      <div className="h-full bg-white/60 backdrop-blur-md rounded-r-xl shadow-sm flex flex-col items-center justify-center">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
        >
          <FiChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-sm p-6 h-full flex flex-col transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] bg-gradient-to-br from-blue-50/80 to-white/70">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiMessageSquare className="mr-2 text-blue-500" />
          Update Artifact
        </h2>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
        >
          <FiChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      {artifact ? (
        <>
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.role === "user" ? "bg-blue-100 ml-auto" : "bg-gray-100"
                } max-w-3/4`}
              >
                {message.content}
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={`Update ${artifact.name}...`}
              className="flex-1 rounded-full bg-gray-100 py-2 px-4 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-300 transition-all duration-300"
            />
            <button
              onClick={handleSendMessage}
              className="rounded-full bg-blue-600 p-2 text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-700"
            >
              <FiSend />
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-600">Select an artifact to update</p>
      )}
    </div>
  );
};

export default UpdateArtifact;