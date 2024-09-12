import React, { useState } from "react";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="bg-transparent text-gray-400 text-[10px] focus:outline-none focus:ring-0 appearance-none cursor-pointer pr-3"
      >
        <option value="claude-3.5-sonnet">claude-3.5-sonnet</option>
        <option value="gpt-4">gpt-4</option>
        <option value="bedrock-claude-3.5-sonnet">bedrock-claude-3.5-sonnet</option>
        {/* Add more model options here */}
      </select>
    </div>
  );
};

export default ModelSelector;