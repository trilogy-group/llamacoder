import apiClient from './apiClient';
import { Project } from '@/types/Project';
import { Artifact } from '@/types/Artifact';
import { Attachment } from '@/types/Attachment';

const code = `import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');

  const handleClick = (value: string) => {
    setDisplay(prev => prev === '0' ? value : prev + value);
  };

  const handleClear = () => setDisplay('0');

  const handleCalculate = () => {
    try {
      setDisplay(eval(display).toString());
    } catch (error) {
      setDisplay('Error');
    }
  };

  const Button: React.FC<{ value: string; color?: string }> = ({ value, color = 'bg-gray-700' }) => (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={\`\${color} text-white font-bold py-2 px-4 rounded-full\`}
      onClick={() => handleClick(value)}
    >
      {value}
    </motion.button>
  );

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-6 rounded-xl shadow-2xl"
      >
        <div className="mb-4">
          <input
            type="text"
            className="w-full bg-gray-900 text-white text-right text-2xl py-2 px-4 rounded"
            value={display}
            readOnly
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Button value="7" />
          <Button value="8" />
          <Button value="9" />
          <Button value="/" color="bg-orange-500" />
          <Button value="4" />
          <Button value="5" />
          <Button value="6" />
          <Button value="*" color="bg-orange-500" />
          <Button value="1" />
          <Button value="2" />
          <Button value="3" />
          <Button value="-" color="bg-orange-500" />
          <Button value="0" />
          <Button value="." />
          <Button value="+" color="bg-orange-500" />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-500 text-white font-bold py-2 px-4 rounded-full"
            onClick={handleCalculate}
          >
            =
          </motion.button>
        </div>
        <div className="mt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-full"
            onClick={handleClear}
          >
            Clear
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Calculator;
`;

const dummyArtifact: Artifact = {
    id: 'artifact1',
    name: 'Main Component',
    prompt: 'Create a React component for the main page',
    code: code,
    dependencies: [{ name: 'react', version: '17.0.2' }],
    chatSessions: {
        id: 'chat1',
        artifactId: 'artifact1',
        messages: [
            { id: 'msg1', text: 'Hello', role: 'user' },
            { id: 'msg2', text: 'Hi there!', role: 'assistant' }
        ],
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        user: 'user1',
        model: 'gpt-4'
    },
    createdAt: new Date(),
    updatedAt: new Date()
};

export const projectApi = {
    getProjects: async (): Promise<Project[]> => {
        // Implementation
        return [
            {
                id: '1',
                title: 'Sample Project',
                description: 'This is a sample project',
                thumbnail: 'https://example.com/thumbnail.jpg',
                attachments: [],
                artifacts: [dummyArtifact],
                entrypoint: dummyArtifact,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 'user1',
                updatedBy: 'user1',
                publishedUrl: 'https://example.com/project1'
            }
        ];
    },

    getProject: async (id: string): Promise<Project> => {
        return {
            id: id,
            title: 'Sample Project',
            description: 'This is a sample project',
            thumbnail: 'https://example.com/thumbnail.jpg',
            attachments: [],
            artifacts: [dummyArtifact],
            entrypoint: dummyArtifact,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user1',
            updatedBy: 'user1',
            publishedUrl: 'https://example.com/project1'
        };
    },

    createProject: async (projectData: Partial<Project>): Promise<Project> => {
        // Implementation
        return {
            id: '123',
            title: projectData.title || 'New Project',
            description: projectData.description || 'New project description',
            thumbnail: projectData.thumbnail,
            attachments: [],
            artifacts: [dummyArtifact],
            entrypoint: dummyArtifact,
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user1',
            updatedBy: 'user1',
            publishedUrl: ''
        };
    },

    updateProject: async (id: string, projectData: Partial<Project>): Promise<Project> => {
        // Implementation
        return {
            id: id,
            title: projectData.title || 'Updated Project',
            description: projectData.description || 'Updated project description',
            thumbnail: projectData.thumbnail,
            attachments: [],
            artifacts: [dummyArtifact],
            entrypoint: dummyArtifact,
            status: projectData.status || 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user1',
            updatedBy: 'user1',
            publishedUrl: projectData.publishedUrl || ''
        };
    },

    deleteProject: async (id: string): Promise<void> => {
        // Implementation
        return Promise.resolve();
    },
};