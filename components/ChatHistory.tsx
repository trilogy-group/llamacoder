import React, { useState } from "react";
import { Message } from "../types/Artifact";
import { FiPaperclip, FiCopy } from "react-icons/fi";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatHistoryProps {
  messages: Message[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [hoveredCodeBlock, setHoveredCodeBlock] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderMessageContent = (content: string, messageId: string) => {
    const parts = content.split(/(```[\s\S]*?```)/);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const [, language, code] = part.match(/```(\w+)?\n?([\s\S]+?)```/) || [];
        const codeBlockId = `${messageId}-${index}`;
        return (
          <div 
            key={codeBlockId} 
            className="relative"
            onMouseEnter={() => setHoveredCodeBlock(codeBlockId)}
            onMouseLeave={() => setHoveredCodeBlock(null)}
          >
            <SyntaxHighlighter
              language={language || 'text'}
              style={tomorrow}
              className="rounded-md my-2"
            >
              {code.trim()}
            </SyntaxHighlighter>
            {hoveredCodeBlock === codeBlockId && (
              <button
                onClick={() => copyToClipboard(code.trim())}
                className="absolute top-2 right-2 p-1 bg-gray-200 text-gray-800 rounded-md opacity-70 hover:opacity-100 transition-opacity duration-200"
              >
                <FiCopy size={14} />
              </button>
            )}
          </div>
        );
      }
      return <span key={`${messageId}-${index}`}>{part}</span>;
    });
  };

  return (
    <div className="h-full w-full overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`w-full rounded-lg shadow-sm relative ${
            message.role === "user" 
              ? "bg-gray-50 ml-auto mr-0 sm:mr-8" 
              : "bg-blue-50 mr-auto ml-0 sm:ml-8"
          } max-w-[85%]`}
          onMouseEnter={() => setHoveredMessage(message.id)}
          onMouseLeave={() => setHoveredMessage(null)}
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
            <div className="p-3 overflow-y-auto">
              <div className="text-xs text-gray-800 break-words">
                {renderMessageContent(message.content, message.id)}
              </div>
            </div>
          </div>
          {hoveredMessage === message.id && (
            <button
              onClick={() => copyToClipboard(message.content)}
              className="absolute top-2 right-2 p-1 bg-gray-700 text-white rounded-md opacity-50 hover:opacity-100 transition-opacity duration-200"
            >
              <FiCopy size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;