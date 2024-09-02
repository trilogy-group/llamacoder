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
      className="flex items-center space-x-2 rounded-full border border-gray-200 bg-white/50 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm backdrop-blur-sm"
    >
      <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
      <span>{message}</span>
    </motion.div>
  ) : null;
}
