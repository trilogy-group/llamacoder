import { motion } from "framer-motion";

interface ProgressMessageProps {
  message: string;
}

export default function ProgressMessage({ message }: ProgressMessageProps) {
  return message ? (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center space-x-2 rounded-full bg-white/50 backdrop-blur-sm px-4 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-200"
    >
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      <span>{message}</span>
    </motion.div>
  ) : null;
}