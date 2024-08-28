import React, { useCallback } from 'react';
import Typewriter from 'typewriter-effect';
import twemoji from 'twemoji';
import { motion } from "framer-motion";
import CircularProgress from "@mui/material/CircularProgress";

interface FunFactRendererProps {
  funFact: string;
}

const FunFactRenderer: React.FC<FunFactRendererProps> = ({ funFact }) => {
  const renderEmoji = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      twemoji.parse(node, {
        folder: 'svg',
        ext: '.svg',
      });
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 backdrop-blur-sm bg-gray-900/70 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-8 shadow-xl w-96 max-w-full overflow-hidden"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
          }}
          className="absolute -top-12 -right-12 w-24 h-24 bg-yellow-300 rounded-full opacity-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -360],
            opacity: [1, 0.6, 1],
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
          }}
          className="absolute -bottom-8 -left-8 w-20 h-20 bg-green-300 rounded-full opacity-20"
        />
        <div className="flex justify-center mb-6">
          <CircularProgress size={70} thickness={4} style={{ color: '#ffffff' }} />
        </div>
        <div className="text-sm text-gray-100 text-center mb-4">
          ✨ We have sent your wish to the code genie. Meanwhile here is a fun fact! ✨
        </div>
        <div 
          className="text-base text-white text-center font-small bg-white/10 p-4 rounded-md backdrop-blur-sm"
          ref={renderEmoji}
        >
          <Typewriter
            options={{
              strings: [funFact],
              autoStart: true,
              loop: false,
              deleteSpeed: 1000000,
              delay: 30,
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FunFactRenderer;
