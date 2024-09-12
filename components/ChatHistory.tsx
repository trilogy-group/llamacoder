import React, { useState, memo, useEffect, useRef, useCallback, useMemo } from "react";
import { Artifact } from "../types/Artifact";
import { ChatSession } from "../types/ChatSession";
import { FiCopy, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from "../types/Message";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AttachmentList from "./AttachmentList";
import { Attachment } from "../types/Attachment";

interface ChatHistoryProps {
  artifact: Artifact;
  chatSession: ChatSession;
}

const ChatHistory: React.FC<ChatHistoryProps> = memo(({ artifact, chatSession }) => {
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null);
  const [hoveredCodeBlock, setHoveredCodeBlock] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [collapsedMessages, setCollapsedMessages] = useState<Set<number>>(() => 
    new Set(chatSession.messages.map((_, index) => index).filter(index => index % 2 !== 0))
  );

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatSession.messages]);

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
    } else if (color === 'blue') {
      borderColorClass = 'border-blue-400';
      titleColorClass = 'text-blue-300';
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

  const renderMessageContent = useCallback((text: string, messageId: string): React.ReactNode => {
    const parts = text.split(/(<CODE>[\s\S]*?<\/CODE>|<ANALYSIS>[\s\S]*?<\/ANALYSIS>|<VERIFICATION>[\s\S]*?<\/VERIFICATION>|<EXTRA_LIBRARIES>[\s\S]*?<\/EXTRA_LIBRARIES>|<EXPLANATION>[\s\S]*?<\/EXPLANATION>)/);
  
    return (
      <React.Fragment>
        {parts.map((part, index) => {
          if (!part.trim()) return null;

          if (part.startsWith('<CODE>') && part.endsWith('</CODE>')) {
            return renderCodeBlock(part.slice(6, -7).trim(), `${messageId}-code-${index}`);
          } else if (part.startsWith('<ANALYSIS>') && part.endsWith('</ANALYSIS>')) {
            return renderSpecialBlock(part.slice(10, -11).trim(), 'Analysis', messageId, index, '🔬', 'purple');
          } else if (part.startsWith('<VERIFICATION>') && part.endsWith('</VERIFICATION>')) {
            return renderSpecialBlock(part.slice(14, -15).trim(), 'Verification', messageId, index, '✅', 'green');
          } else if (part.startsWith('<EXTRA_LIBRARIES>') && part.endsWith('</EXTRA_LIBRARIES>')) {
            return renderCodeBlock(part.slice(17, -18).trim(), `${messageId}-libraries-${index}`, 'bash');
          } else if (part.startsWith('<EXPLANATION>') && part.endsWith('</EXPLANATION>')) {
            return renderSpecialBlock(part.slice(13, -14).trim(), 'Explanation', messageId, index, '💡', 'blue');
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
        })}
      </React.Fragment>
    );
  }, [renderCodeBlock, renderSpecialBlock]);

  const renderAttachments = useCallback((attachments: Attachment[], isUserMessage: boolean) => {
    if (!attachments || attachments.length === 0) return null;
    return (
      <div className="mb-2">
        <AttachmentList 
          attachments={attachments} 
          showRemoveButton={false}
          backgroundColor={"bg-blue-100"}
          badgeClassName="text-gray-800"
        />
      </div>
    );
  }, []);

  const toggleMessageCollapse = useCallback((index: number) => {
    setCollapsedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const renderedMessages = useMemo(() => {
    return chatSession.messages.map((message, index) => (
      <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
        <MessageItem
          message={message}
          index={index}
          hoveredMessage={hoveredMessage}
          setHoveredMessage={setHoveredMessage}
          renderMessageContent={renderMessageContent}
          renderAttachments={renderAttachments}
          copyToClipboard={copyToClipboard}
          isCollapsed={message.role === "assistant" && collapsedMessages.has(index)}
          toggleCollapse={() => toggleMessageCollapse(index)}
        />
      </div>
    ));
  }, [chatSession.messages, hoveredMessage, renderMessageContent, renderAttachments, copyToClipboard, collapsedMessages, toggleMessageCollapse]);

  return (
    <div ref={chatContainerRef} className="h-full w-full overflow-y-auto p-4 space-y-4">
      {renderedMessages}
    </div>
  );
});

interface MessageItemProps {
  message: Message;
  index: number;
  hoveredMessage: number | null;
  setHoveredMessage: React.Dispatch<React.SetStateAction<number | null>>;
  renderMessageContent: (text: string, messageId: string) => React.ReactNode;
  renderAttachments: (attachments: Attachment[], isUserMessage: boolean) => React.ReactNode | null;
  copyToClipboard: (text: string) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const MessageItem: React.FC<MessageItemProps> = memo(({
  message,
  index,
  hoveredMessage,
  setHoveredMessage,
  renderMessageContent,
  renderAttachments,
  copyToClipboard,
  isCollapsed,
  toggleCollapse
}) => {
  const previewWords = 20;
  const previewText = message.text.split(' ').slice(0, previewWords).join(' ') + (message.text.split(' ').length > previewWords ? '...' : '');

  return (
    <div
      className={`rounded-lg shadow-sm relative ${
        message.role === "user" 
          ? "bg-blue-100 hover:border-blue-500 ml-12" 
          : "bg-blue-50 hover:border-green-500 mr-12"
      } ${
        hoveredMessage === index ? "border" : "border border-transparent"
      } transition-colors duration-200 ${
        message.role === "assistant" && !isCollapsed ? "w-[calc(100%-3rem)]" : "max-w-[75%]"
      }`}
      onMouseEnter={() => setHoveredMessage(index)}
      onMouseLeave={() => setHoveredMessage(null)}
    >
      <div className="flex flex-col p-3">
        {message.role === "assistant" && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
              🚀 v{Math.floor(index / 2) + 1}
            </span>
            <button onClick={toggleCollapse} className="text-gray-500 hover:text-gray-700">
              {isCollapsed ? <FiChevronDown size={16} /> : <FiChevronUp size={16} />}
            </button>
          </div>
        )}
        {message.role === "assistant" && isCollapsed ? (
          <div className="text-xs text-gray-800 break-words">
            {previewText}
          </div>
        ) : (
          <>
            {message.attachments && message.attachments.length > 0 && renderAttachments(message.attachments, message.role === "user")}
            <div className="overflow-y-auto">
              <div className="text-xs text-gray-800 break-words">
                {renderMessageContent(message.text, index.toString())}
              </div>
            </div>
          </>
        )}
      </div>
      {hoveredMessage === index && !isCollapsed && message.role === "user" && (
        <button
          onClick={() => copyToClipboard(message.text)}
          className="absolute top-2 right-2 p-1 bg-gray-700 text-white rounded-md opacity-50 hover:opacity-100 transition-opacity duration-200"
        >
          <FiCopy size={14} />
        </button>
      )}
    </div>
  );
});

MessageItem.displayName = 'MessageItem';
ChatHistory.displayName = 'ChatHistory';

export default React.memo(ChatHistory);