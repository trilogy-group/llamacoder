import React from "react";
import CodeEditor from "./CodeEditor";
import { Artifact } from "../types/Artifact";

interface PreviewProps {
  artifact: Artifact | null;
}

const Preview: React.FC<PreviewProps> = ({ artifact }) => {
  const files = {
    "/App.tsx": {
      code: `import React, { useState } from 'react';
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
`,
      active: true,
      hidden: false,
      readOnly: false,
    },
  };

  const extraDependencies = [{ name: "framer-motion", version: "latest" }] as any[];

  return (
    <div className="w-full h-full">
      <CodeEditor 
        files={files} 
        extraDependencies={extraDependencies} 
      />
    </div>
  );
};

export default Preview;