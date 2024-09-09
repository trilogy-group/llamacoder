import React, { useState, useEffect, useRef } from "react";
import { Artifact } from "../types/Artifact";
import { ChatSession } from "../types/ChatSession";
import { FiPaperclip, FiCopy } from "react-icons/fi";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from "../types/Message";

interface ChatHistoryProps {
  artifact: Artifact;
  chatSession: ChatSession;
  streamingMessage: Message | null; // Add this prop
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ artifact, chatSession, streamingMessage }) => {
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null);
  const [hoveredCodeBlock, setHoveredCodeBlock] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatSession.messages]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderMessageContent = (text: string, messageId: string) => {
    const parts = text.split(/(```[\s\S]*?```)/);
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
              className="rounded-md my-2 text-xs"
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
    <div ref={chatContainerRef} className="h-full w-full overflow-y-auto p-4 space-y-4">
      {chatSession.messages.map((message, index) => (
        <div
          key={index}
          className={`w-full rounded-lg shadow-sm relative ${
            message.role === "user" 
              ? "bg-gray-50 hover:border-blue-500" 
              : "bg-blue-50 hover:border-green-500"
          } ${
            hoveredMessage === index ? "border" : "border border-transparent"
          } transition-colors duration-200`}
          onMouseEnter={() => setHoveredMessage(index)}
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
                    {attachment.fileName}
                  </div>
                ))}
              </div>
            )}
            <div className="p-3 overflow-y-auto">
              <div className="text-xs text-gray-800 break-words">
                {renderMessageContent(message.text, index.toString())}
              </div>
            </div>
          </div>
          {hoveredMessage === index && (
            <button
              onClick={() => copyToClipboard(message.text)}
              className="absolute top-2 right-2 p-1 bg-gray-700 text-white rounded-md opacity-50 hover:opacity-100 transition-opacity duration-200"
            >
              <FiCopy size={14} />
            </button>
          )}
        </div>
      ))}
      
      {streamingMessage && (
        <div
          key="streaming-message"
          className={`w-full rounded-lg shadow-sm relative bg-blue-50 border border-transparent transition-colors duration-200`}
        >
          <div className="flex flex-col">
            <div className="p-3 overflow-y-auto">
              <div className="text-xs text-gray-800 break-words">
                {renderMessageContent(streamingMessage.text, 'streaming-message')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;