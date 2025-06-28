import PropTypes from "prop-types";
import { Card, CardBody, Button } from "@nextui-org/react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Consistent error state component
 */
const ErrorState = ({ 
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  retryLabel = "Try Again",
  variant = "card",
  className = ""
}) => {
  const content = (
    <div className="flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-danger" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-foreground/70 max-w-md leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button
          color="primary"
          variant="flat"
          onPress={onRetry}
          startContent={<RefreshCw className="w-4 h-4" />}
          className="mt-2"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );

  if (variant === "inline") {
    return <div className={`py-8 ${className}`}>{content}</div>;
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardBody className="py-12">
        {content}
      </CardBody>
    </Card>
  );
};

ErrorState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onRetry: PropTypes.func,
  retryLabel: PropTypes.string,
  variant: PropTypes.oneOf(["card", "inline"]),
  className: PropTypes.string,
};

export default ErrorState;