import React, { useState, useEffect, useRef } from "react";
import { Artifact } from "../types/Artifact";
import { ChatSession } from "../types/ChatSession";
import { FiPaperclip, FiCopy } from "react-icons/fi";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from "../types/Message";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatHistoryProps {
  artifact: Artifact;
  chatSession: ChatSession;
  streamingMessage: Message | null;
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
    const parts = text.split(/(<CODE>[\s\S]*?<\/CODE>|<ANALYSIS>[\s\S]*?<\/ANALYSIS>|<VERIFICATION>[\s\S]*?<\/VERIFICATION>|<EXTRA_LIBRARIES>[\s\S]*?<\/EXTRA_LIBRARIES>)/);
    return parts.map((part, index) => {
      if (!part.trim()) return null; // Skip empty parts

      if (part.startsWith('<CODE>') && part.endsWith('</CODE>')) {
        const code = part.slice(6, -7).trim();
        if (!code) return null; // Skip empty code blocks
        const codeBlockId = `${messageId}-code-${index}`;
        return (
          <div 
            key={codeBlockId} 
            className="relative"
            onMouseEnter={() => setHoveredCodeBlock(codeBlockId)}
            onMouseLeave={() => setHoveredCodeBlock(null)}
          >
            <SyntaxHighlighter
              language="typescript"
              style={tomorrow}
              className="rounded-md my-2 text-xs max-h-[300px] overflow-y-auto"
            >
              {code}
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
      } else if (part.startsWith('<ANALYSIS>') && part.endsWith('</ANALYSIS>')) {
        const analysis = part.slice(10, -11).trim();
        if (!analysis) return null; // Skip empty analysis blocks
        return renderSpecialBlock(analysis, 'Analysis', messageId, index, '🔬', 'purple');
      } else if (part.startsWith('<VERIFICATION>') && part.endsWith('</VERIFICATION>')) {
        const verification = part.slice(14, -15).trim();
        if (!verification) return null; // Skip empty verification blocks
        return renderSpecialBlock(verification, 'Verification', messageId, index, '✅', 'green');
      } else if (part.startsWith('<EXTRA_LIBRARIES>') && part.endsWith('</EXTRA_LIBRARIES>')) {
        const libraries = part.slice(17, -18).trim();
        if (!libraries) return null; // Skip empty libraries blocks
        const codeBlockId = `${messageId}-libraries-${index}`;
        return (
          <div 
            key={codeBlockId} 
            className="relative"
            onMouseEnter={() => setHoveredCodeBlock(codeBlockId)}
            onMouseLeave={() => setHoveredCodeBlock(null)}
          >
            <SyntaxHighlighter
              language="bash"
              style={tomorrow}
              className="rounded-md my-2 text-xs max-h-[200px] overflow-y-auto"
            >
              {libraries}
            </SyntaxHighlighter>
            {hoveredCodeBlock === codeBlockId && (
              <button
                onClick={() => copyToClipboard(libraries.trim())}
                className="absolute top-2 right-2 p-1 bg-gray-200 text-gray-800 rounded-md opacity-70 hover:opacity-100 transition-opacity duration-200"
              >
                <FiCopy size={14} />
              </button>
            )}
          </div>
        );
      }
      return (
        <Markdown
          key={`${messageId}-${index}`}
          remarkPlugins={[remarkGfm]}
          className="text-xs"
        >
          {part.trim()}
        </Markdown>
      );
    }).filter(Boolean); // Remove null elements
  };

  const renderSpecialBlock = (content: string, title: string, messageId: string, index: number, emoji: string, color: string) => {
    let textColorClass = 'text-white';
    let borderColorClass = 'border-gray-500';
    let titleColorClass = 'text-white';
    let bgColorClass = 'bg-gray-800';

    if (color === 'green') {
      borderColorClass = 'border-green-400';
      titleColorClass = 'text-green-300';
      bgColorClass = 'bg-gray-900';
    } else if (color === 'purple') {
      borderColorClass = 'border-purple-400';
      titleColorClass = 'text-purple-300';
      bgColorClass = 'bg-gray-900';
    }

    return (
      <div
        key={`${messageId}-${title.toLowerCase()}-${index}`}
        className={`${bgColorClass} ${textColorClass} p-3 rounded-md my-2 border ${borderColorClass} w-full max-h-[300px] overflow-y-auto`}
      >
        <div className="flex items-center mb-2">
          <span className="mr-2" role="img" aria-label={title}>{emoji}</span>
          <span className={`font-semibold ${titleColorClass}`}>{title}</span>
        </div>
        <div className="w-full overflow-wrap-break-word">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0 w-full">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2 last:mb-0 w-full">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 last:mb-0 w-full">{children}</ol>,
              li: ({ children }) => <li className="mb-1 last:mb-0 w-full">{children}</li>,
            }}
            className="text-xs w-full"
          >
            {content}
          </Markdown>
        </div>
      </div>
    );
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