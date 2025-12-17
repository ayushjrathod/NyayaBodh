import { createContext, useContext, useState, useCallback } from "react";
import PropTypes from "prop-types";
import Toast from "./Toast";
import { AnimatePresence } from "framer-motion";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: "info",
      duration: 5000,
      ...toast,
    };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = useCallback({
    success: (message, options = {}) => addToast({ 
      type: "success", 
      message, 
      duration: 4000,
      ...options 
    }),
    error: (message, options = {}) => addToast({ 
      type: "error", 
      message, 
      duration: 6000, // Longer duration for errors
      ...options 
    }),
    warning: (message, options = {}) => addToast({ 
      type: "warning", 
      message, 
      duration: 5000,
      ...options 
    }),
    info: (message, options = {}) => addToast({ 
      type: "info", 
      message, 
      duration: 4000,
      ...options 
    }),
    loading: (message, options = {}) => addToast({ 
      type: "info", 
      message, 
      duration: 8000, // Longer duration for loading states
      ...options 
    }),
  }, [addToast]);

  const contextValue = {
    toast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container with proper stacking */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toastItem, index) => (
            <div
              key={toastItem.id}
              style={{
                zIndex: 1000 + index,
              }}
            >
              <Toast
                type={toastItem.type}
                message={toastItem.message}
                duration={toastItem.duration}
                onClose={() => removeToast(toastItem.id)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ToastProvider;