import React from "react";
import { Message } from "../types/Artifact";
import { FiPaperclip } from "react-icons/fi";

interface ChatHistoryProps {
  messages: Message[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  return (
    <div className="h-full w-full overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`w-full rounded-lg shadow-sm ${
            message.role === "user" 
              ? "bg-gray-50 ml-auto mr-0 sm:mr-8" 
              : "bg-blue-50 mr-auto ml-0 sm:ml-8"
          } max-w-[85%]`}
        >
          <div className="flex flex-col">
            {message.role === "user" && message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 p-3 pb-0">
                {message.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-white rounded-full px-2 py-0.5 text-[10px] text-gray-600 border border-gray-200"
                  >
                    <FiPaperclip className="mr-1" size={8} />
                    {attachment.name}
                  </div>
                ))}
              </div>
            )}
            <div className="p-3 max-h-[200px] overflow-y-auto">
              <div className="text-xs text-gray-800 break-words">{message.content}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;
