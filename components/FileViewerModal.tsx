import React, { useState, useEffect } from "react";
import { FiX, FiDownload } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { saveAs } from 'file-saver';
import Tooltip from "./Tooltip";

// Import language support for SyntaxHighlighter
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp';
import csharp from 'react-syntax-highlighter/dist/esm/languages/hljs/csharp';
import ruby from 'react-syntax-highlighter/dist/esm/languages/hljs/ruby';
import php from 'react-syntax-highlighter/dist/esm/languages/hljs/php';
import swift from 'react-syntax-highlighter/dist/esm/languages/hljs/swift';
import go from 'react-syntax-highlighter/dist/esm/languages/hljs/go';

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('ruby', ruby);
SyntaxHighlighter.registerLanguage('php', php);
SyntaxHighlighter.registerLanguage('swift', swift);
SyntaxHighlighter.registerLanguage('go', go);

interface FileViewerModalProps {
  file: File;
  onClose: () => void;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({ file, onClose }) => {
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setContent(e.target?.result as string);
    };
    
    if (file.type.startsWith("image/")) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  }, [file]);

  const getLanguage = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      js: 'javascript',
      ts: 'typescript',
      jsx: 'javascript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'cpp',
      cs: 'csharp',
      rb: 'ruby',
      php: 'php',
      swift: 'swift',
      go: 'go',
    };
    return languageMap[extension || ''] || 'text';
  };

  const renderContent = () => {
    if (!content) return null;

    if (file.type.startsWith("image/")) {
      return <img src={content} alt={file.name} className="max-w-full max-h-[70vh] object-contain mx-auto" />;
    }

    if (file.name.toLowerCase().endsWith(".md")) {
      return <ReactMarkdown className="prose max-w-none p-4">{content}</ReactMarkdown>;
    }

    const language = getLanguage(file.name);
    return (
      <SyntaxHighlighter 
        language={language} 
        style={docco} 
        customStyle={{padding: '1rem'}}
        wrapLines={true}
        showLineNumbers={true}
      >
        {content}
      </SyntaxHighlighter>
    );
  };

  const handleDownload = () => {
    saveAs(file, file.name);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white/80 sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-gray-800 truncate">{file.name}</h2>
          <div className="flex items-center space-x-2">
            <Tooltip content="Download">
              <button onClick={handleDownload} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition duration-300 ease-in-out">
                <FiDownload size={20} />
              </button>
            </Tooltip>
            <Tooltip content="Close">
              <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition duration-300 ease-in-out">
                <FiX size={20} />
              </button>
            </Tooltip>
          </div>
        </div>
        <div className="flex-grow overflow-auto bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-sm">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileViewerModal;