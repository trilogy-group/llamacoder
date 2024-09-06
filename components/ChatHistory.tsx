import React from "react";

interface ChatHistoryProps {
  messages: string[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  return (
    <div className="max-h-60 overflow-y-auto p-4 space-y-2">
      {messages.map((message, index) => (
        <div key={index} className="p-2 bg-gray-100 rounded-lg text-sm">
          {message}
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;
