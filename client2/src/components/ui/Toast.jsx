import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Toast = ({ type = "info", message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case "success":
        return "bg-white dark:bg-gray-800 border-l-4 border-l-green-500 text-green-800 dark:text-green-200 shadow-green-500/20";
      case "error":
        return "bg-white dark:bg-gray-800 border-l-4 border-l-red-500 text-red-800 dark:text-red-200 shadow-red-500/20";
      case "warning":
        return "bg-white dark:bg-gray-800 border-l-4 border-l-yellow-500 text-yellow-800 dark:text-yellow-200 shadow-yellow-500/20";
      default:
        return "bg-white dark:bg-gray-800 border-l-4 border-l-blue-500 text-blue-800 dark:text-blue-200 shadow-blue-500/20";
    }
  };

  const getIconColorClasses = () => {
    switch (type) {
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      default:
        return "text-blue-500";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.3 
          }}
          className={`
            fixed top-4 right-4 z-50 max-w-sm w-full
            pointer-events-auto
          `}
        >
          <div
            className={`
              p-4 rounded-lg border border-gray-200 dark:border-gray-700
              backdrop-blur-sm shadow-lg
              flex items-start gap-3
              ${getColorClasses()}
            `}
          >
            <div className={`flex-shrink-0 mt-0.5 ${getIconColorClasses()}`}>
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-relaxed break-words">
                {message}
              </p>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;