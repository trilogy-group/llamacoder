import React, { useState, useRef } from 'react';
import { FiArrowRight, FiPlus, FiInfo } from 'react-icons/fi';
import AttachmentList from './AttachmentList';
import { Attachment } from '../types/Attachment';
import Tooltip from './Tooltip';

interface ArtifactOverviewInputFormProps {
  onCancel: () => void;
  onNext: (name: string, description: string, attachments: Attachment[], callback: () => void) => void;
}

const AdditionalContext: React.FC<{
  attachments: Attachment[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
}> = ({ attachments, onAdd, onRemove }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const allowedFiles = Array.from(e.target.files).filter(file => {
        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();
        return (
          fileType.startsWith('image/') ||
          fileType === 'application/json' ||
          fileName.endsWith('.graphql') ||
          fileType === 'text/plain' ||
          fileType === 'text/markdown' ||
          fileName.endsWith('.md') ||
          fileType === 'application/pdf' ||
          fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // Add this line for DOCX
        );
      });
      onAdd(allowedFiles);
    }
  };

  return (
    <div className="p-4 bg-gray-50 border-b rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <h3 className="text-sm font-semibold mr-2">Additional Context</h3>
          <Tooltip content="Attached files will be used for this artifact only. Project level context will be coming soon!">
            <FiInfo className="text-gray-400 hover:text-gray-600 cursor-pointer" size={16} />
          </Tooltip>
        </div>
        <button
          type="button"
          onClick={handleAttachmentClick}
          className="text-blue-500 hover:text-blue-600 bg-gray-100 rounded-full p-1 shadow-sm"
        >
          <FiPlus size={20} />
        </button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept="image/*,.json,.graphql,.txt,.md,.yaml,.ts,.tsx,.js,.jsx,.py,.docx"
      />
      <div className="overflow-y-auto max-h-[60px]">
        {attachments.length > 0 ? (
          <AttachmentList 
            attachments={attachments} 
            onRemove={onRemove}
            badgeClassName="bg-blue-100 text-blue-800"
          />
        ) : (
          <div className="flex justify-center items-center h-full">
            <span className="text-xs text-gray-500">No additional context</span>
          </div>
        )}
      </div>
    </div>
  );
};

const ArtifactOverviewInputForm: React.FC<ArtifactOverviewInputFormProps> = ({ onCancel, onNext }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddAttachments = (files: File[]) => {
    const newAttachments: Attachment[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      url: URL.createObjectURL(file),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current_user',
      updatedBy: 'current_user',
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((attachment) => attachment.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    onNext(name, description, attachments, () => setIsLoading(false));
  };

  const isFormValid = name.trim() !== '' && description.trim() !== '';

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Artifact</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Name</h3>
          <input
            type="text"
            className="w-full text-sm p-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            placeholder="What do you want to call your artifact?"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
          <textarea
            className="w-full text-sm p-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none shadow-sm"
            placeholder="Describe what your artifact should do, how it should look, and any other important details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
        </div>
        <div className="mb-6">
          <AdditionalContext
            attachments={attachments}
            onAdd={handleAddAttachments}
            onRemove={handleRemoveAttachment}
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-300 ease-in-out"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`px-6 py-2 text-sm font-medium text-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out flex items-center ${
              isFormValid && !isLoading
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-blue-300 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                Next
                <FiArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArtifactOverviewInputForm;