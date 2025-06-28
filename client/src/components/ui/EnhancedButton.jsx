import { Button } from "@nextui-org/react";
import { forwardRef } from "react";

/**
 * Enhanced Button component with consistent styling and hover effects
 */
const EnhancedButton = forwardRef(
  (
    {
      children,
      className = "",
      variant = "solid",
      color = "primary",
      size = "md",
      isIconOnly = false,
      isLoading = false,
      startContent,
      endContent,
      fullWidth = false,
      radius = "md",
      onPress,
      ...props
    },
    ref
  ) => {
    const enhancedClassName = `
    btn-hover-lift
    transition-all 
    duration-200 
    ${isIconOnly ? "interactive-hover" : ""} 
    ${className}
  `.trim();

    return (
      <Button
        ref={ref}
        className={enhancedClassName}
        variant={variant}
        color={color}
        size={size}
        isIconOnly={isIconOnly}
        isLoading={isLoading}
        startContent={startContent}
        endContent={endContent}
        fullWidth={fullWidth}
        radius={radius}
        onPress={onPress}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

export default EnhancedButton;
