import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

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
        return "bg-success/10 border-success/20 text-success-600";
      case "error":
        return "bg-danger/10 border-danger/20 text-danger-600";
      case "warning":
        return "bg-warning/10 border-warning/20 text-warning-600";
      default:
        return "bg-primary/10 border-primary/20 text-primary-600";
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-out
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <div
        className={`
          p-4 rounded-lg border backdrop-blur-sm
          flex items-start gap-3 shadow-lg
          ${getColorClasses()}
        `}
      >
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 text-default-400 hover:text-default-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
