/**
 * Theme utility for consistent UI styling across the application
 */

/**
 * Get consistent dropdown/modal theme classes
 */
export const getDropdownThemeClasses = (isDarkMode) => {
  return `z-50 ${isDarkMode ? "yellow-bright" : ""} text-foreground bg-background`;
};

/**
 * Get consistent button theme classes
 */
export const getButtonThemeClasses = (size = "md") => {
  const baseClasses = "btn-hover-lift transition-all duration-200";
  const sizeClasses = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-4 py-2",
    lg: "text-lg px-6 py-3",
  };

  return `${baseClasses} ${sizeClasses[size]}`;
};

/**
 * Get consistent card theme classes
 */
export const getCardThemeClasses = (isHoverable = true, isBlurred = false) => {
  const baseClasses = "transition-all duration-300";
  const hoverClasses = isHoverable ? "card-enhanced" : "";
  const blurClasses = isBlurred ? "glass-morphism" : "";

  return `${baseClasses} ${hoverClasses} ${blurClasses}`.trim();
};

/**
 * Get consistent input theme classes
 */
export const getInputThemeClasses = () => {
  return "form-enhanced transition-all duration-200 focus-enhanced";
};

/**
 * Get consistent loading state classes
 */
export const getLoadingContainerClasses = (centered = true, fullScreen = false) => {
  const baseClasses = "flex items-center justify-center";
  const centerClasses = centered ? "flex-col gap-4" : "";
  const screenClasses = fullScreen ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50" : "py-8";

  return `${baseClasses} ${centerClasses} ${screenClasses}`.trim();
};

/**
 * Get consistent animation classes
 */
export const getAnimationClasses = (animation = "fadeInUp") => {
  const animationMap = {
    fadeInUp: "animate-fade-in-up",
    fadeInScale: "animate-fade-in-scale",
    shimmer: "animate-shimmer",
    pulse: "animate-pulse",
  };

  return animationMap[animation] || animationMap.fadeInUp;
};

/**
 * Get consistent spacing classes
 */
export const getSpacingClasses = (type = "section") => {
  const spacingMap = {
    section: "section-padding",
    container: "container-enhanced",
    grid: "grid-enhanced",
  };

  return spacingMap[type] || "";
};

/**
 * Get consistent error/success state classes
 */
export const getStatusClasses = (status = "default") => {
  const statusMap = {
    success: "text-success border-success/20 bg-success/10",
    error: "text-danger border-danger/20 bg-danger/10",
    warning: "text-warning border-warning/20 bg-warning/10",
    info: "text-primary border-primary/20 bg-primary/10",
    default: "text-foreground border-default/20 bg-default/10",
  };

  return statusMap[status] || statusMap.default;
};
