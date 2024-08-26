import { AnimatePresence, motion } from "framer-motion";

interface FloatingStatusIndicatorProps {
  message: string;
  isVisible: boolean;
}

const FloatingStatusIndicator: React.FC<FloatingStatusIndicatorProps> = ({ message, isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 flex items-center space-x-3 rounded-full border border-gray-200 bg-white px-6 py-3 text-gray-800 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-xl text-blue-500"
          >
            🔄
          </motion.div>
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingStatusIndicator;