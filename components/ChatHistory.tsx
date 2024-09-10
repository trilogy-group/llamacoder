import React, { useState, useEffect, useRef, useCallback } from "react";
import { Artifact } from "../types/Artifact";
import { ChatSession } from "../types/ChatSession";
import { FiPaperclip, FiCopy, FiLoader } from "react-icons/fi";
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
  }, [chatSession.messages, streamingMessage]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const renderCodeBlock = useCallback((code: string, blockId: string, language: string = 'typescript') => {
    if (!code) return null;
    return (
      <div 
        key={blockId} 
        className="relative"
        onMouseEnter={() => setHoveredCodeBlock(blockId)}
        onMouseLeave={() => setHoveredCodeBlock(null)}
      >
        <SyntaxHighlighter
          language={language}
          style={tomorrow}
          className="rounded-md my-2 text-xs max-h-[300px] overflow-y-auto"
        >
          {code}
        </SyntaxHighlighter>
        {hoveredCodeBlock === blockId && (
          <button
            onClick={() => copyToClipboard(code.trim())}
            className="absolute top-2 right-2 p-1 bg-gray-200 text-gray-800 rounded-md opacity-70 hover:opacity-100 transition-opacity duration-200"
          >
            <FiCopy size={14} />
          </button>
        )}
      </div>
    );
  }, [hoveredCodeBlock, copyToClipboard]);

  const renderSpecialBlock = useCallback((content: string, title: string, messageId: string, index: number, emoji: string, color: string) => {
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
  }, []);

  const renderStreamingIndicator = useCallback((type: string) => {
    const messages = {
      CODE: "Generating code",
      ANALYSIS: "Analyzing",
      VERIFICATION: "Verifying",
      EXTRA_LIBRARIES: "Checking libraries",
    };
    const message = messages[type as keyof typeof messages] || "Processing";

    return (
      <div key="streaming-indicator" className="flex items-center space-x-2 p-2 bg-gray-100 rounded-md">
        <FiLoader className="animate-spin text-blue-500" />
        <span className="text-sm text-gray-700">{message}...</span>
      </div>
    );
  }, []);

  const renderMessageContent = useCallback((text: string, messageId: string, isStreaming: boolean = false) => {
    const parts = text.split(/(<CODE>[\s\S]*?<\/CODE>|<ANALYSIS>[\s\S]*?<\/ANALYSIS>|<VERIFICATION>[\s\S]*?<\/VERIFICATION>|<EXTRA_LIBRARIES>[\s\S]*?<\/EXTRA_LIBRARIES>)/);
  
    return parts.map((part, index) => {
      if (!part.trim()) return null;

      if (part.startsWith('<CODE>') && part.endsWith('</CODE>')) {
        return renderCodeBlock(part.slice(6, -7).trim(), `${messageId}-code-${index}`);
      } else if (part.startsWith('<ANALYSIS>') && part.endsWith('</ANALYSIS>')) {
        return renderSpecialBlock(part.slice(10, -11).trim(), 'Analysis', messageId, index, '🔬', 'purple');
      } else if (part.startsWith('<VERIFICATION>') && part.endsWith('</VERIFICATION>')) {
        return renderSpecialBlock(part.slice(14, -15).trim(), 'Verification', messageId, index, '✅', 'green');
      } else if (part.startsWith('<EXTRA_LIBRARIES>') && part.endsWith('</EXTRA_LIBRARIES>')) {
        return renderCodeBlock(part.slice(17, -18).trim(), `${messageId}-libraries-${index}`, 'bash');
      }

      if (isStreaming) {
        const match = part.match(/<(CODE|ANALYSIS|VERIFICATION|EXTRA_LIBRARIES)>/);
        if (match) {
          const type = match[1];
          return (
            <React.Fragment key={`${messageId}-streaming-${index}`}>
              <Markdown remarkPlugins={[remarkGfm]} className="text-xs">
                {part.slice(0, match.index).trim()}
              </Markdown>
              {renderStreamingIndicator(type)}
            </React.Fragment>
          );
        }
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
    }).filter(Boolean);
  }, [renderCodeBlock, renderSpecialBlock, renderStreamingIndicator]);

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
                {renderMessageContent(streamingMessage.text, 'streaming-message', true)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ChatHistory);