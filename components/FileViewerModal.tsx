import React, { useState, useEffect } from "react";
import { FiX, FiDownload } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { saveAs } from 'file-saver';

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
      return <img src={content} alt={file.name} className="max-w-full max-h-[80vh] object-contain" />;
    }

    if (file.name.toLowerCase().endsWith(".md")) {
      return <ReactMarkdown className="prose">{content}</ReactMarkdown>;
    }

    const language = getLanguage(file.name);
    return (
      <SyntaxHighlighter language={language} style={docco}>
        {content}
      </SyntaxHighlighter>
    );
  };

  const handleDownload = () => {
    saveAs(file, file.name);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{file.name}</h2>
          <div>
            <button onClick={handleDownload} className="mr-2 text-gray-500 hover:text-gray-700">
              <FiDownload size={24} />
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiX size={24} />
            </button>
          </div>
        </div>
        <div className="overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default FileViewerModal;