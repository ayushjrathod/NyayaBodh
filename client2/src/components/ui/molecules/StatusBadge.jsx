import PropTypes from "prop-types";
import { Chip } from "@nextui-org/react";
import { CheckCircle, AlertCircle, Clock, XCircle } from "lucide-react";

/**
 * Consistent status badge component
 */
const StatusBadge = ({ 
  status = "default",
  label,
  size = "md",
  variant = "flat",
  showIcon = true,
  className = ""
}) => {
  const statusConfig = {
    success: {
      color: "success",
      icon: CheckCircle,
      defaultLabel: "Success"
    },
    error: {
      color: "danger", 
      icon: XCircle,
      defaultLabel: "Error"
    },
    warning: {
      color: "warning",
      icon: AlertCircle,
      defaultLabel: "Warning"
    },
    pending: {
      color: "default",
      icon: Clock,
      defaultLabel: "Pending"
    },
    info: {
      color: "primary",
      icon: AlertCircle,
      defaultLabel: "Info"
    },
    default: {
      color: "default",
      icon: null,
      defaultLabel: "Status"
    }
  };

  const config = statusConfig[status] || statusConfig.default;
  const Icon = config.icon;
  const displayLabel = label || config.defaultLabel;

  return (
    <Chip
      color={config.color}
      variant={variant}
      size={size}
      className={`font-medium ${className}`}
      startContent={showIcon && Icon ? <Icon className="w-3 h-3" /> : null}
    >
      {displayLabel}
    </Chip>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.oneOf(["success", "error", "warning", "pending", "info", "default"]),
  label: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  variant: PropTypes.oneOf(["solid", "bordered", "light", "flat", "faded", "shadow"]),
  showIcon: PropTypes.bool,
  className: PropTypes.string,
};

export default StatusBadge;