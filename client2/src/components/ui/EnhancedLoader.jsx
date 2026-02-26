import PropTypes from "prop-types";
import { forwardRef } from "react";

/**
 * Enhanced Loader component with consistent styling and animations
 * Uses the legal document/pen writing animation design
 */
const EnhancedLoader = forwardRef(
  (
    {
      size = "md",
      className = "",
      label = "Loading...",
      showLabel = true,
      center = true,
      fullScreen = false,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "w-16 h-20 loader-sm",
      md: "w-20 h-26",
      lg: "w-24 h-32 loader-lg",
      xl: "w-32 h-40 loader-xl",
    };

    const labelSizeClasses = {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    };

    const containerClasses = center
      ? "flex flex-col items-center justify-center gap-4"
      : "flex flex-col items-start gap-4";

    const wrapperClasses = fullScreen
      ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
      : "";

    const loaderContent = (
      <div className={`${containerClasses} ${className}`} ref={ref} {...props}>
        <div className={`loader ${sizeClasses[size]}`}>{/* The CSS handles all the animation */}</div>

        {showLabel && (
          <p className={`${labelSizeClasses[size]} text-foreground/70 font-medium text-center animate-pulse`}>
            {label}
          </p>
        )}
      </div>
    );

    if (fullScreen) {
      return <div className={wrapperClasses}>{loaderContent}</div>;
    }

    return loaderContent;
  }
);

EnhancedLoader.displayName = "EnhancedLoader";

EnhancedLoader.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  className: PropTypes.string,
  label: PropTypes.string,
  showLabel: PropTypes.bool,
  center: PropTypes.bool,
  fullScreen: PropTypes.bool,
};

export default EnhancedLoader;
