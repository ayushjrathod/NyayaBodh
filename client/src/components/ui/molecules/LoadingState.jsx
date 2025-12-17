import PropTypes from "prop-types";
import { Card, CardBody } from "@nextui-org/react";
import { Spinner } from "@nextui-org/react";

/**
 * Consistent loading state component
 */
const LoadingState = ({ 
  message = "Loading...", 
  size = "md", 
  fullScreen = false,
  variant = "card",
  className = ""
}) => {
  const sizeMap = {
    sm: { spinner: "sm", text: "text-sm" },
    md: { spinner: "md", text: "text-base" },
    lg: { spinner: "lg", text: "text-lg" }
  };

  const currentSize = sizeMap[size];

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size={currentSize.spinner} color="primary" />
          <p className={`${currentSize.text} text-foreground/70 font-medium animate-pulse`}>
            {message}
          </p>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Spinner size={currentSize.spinner} color="primary" />
        <span className={`${currentSize.text} text-foreground/70`}>{message}</span>
      </div>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardBody className="flex flex-col items-center justify-center py-12 gap-4">
        <Spinner size={currentSize.spinner} color="primary" />
        <p className={`${currentSize.text} text-foreground/70 font-medium text-center`}>
          {message}
        </p>
      </CardBody>
    </Card>
  );
};

LoadingState.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  fullScreen: PropTypes.bool,
  variant: PropTypes.oneOf(["card", "inline"]),
  className: PropTypes.string,
};

export default LoadingState;