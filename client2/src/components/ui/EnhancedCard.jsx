import { Card } from "@nextui-org/react";
import { forwardRef } from "react";

/**
 * Enhanced Card component with consistent styling and hover effects
 */
const EnhancedCard = forwardRef(
  (
    {
      children,
      className = "",
      shadow = "md",
      radius = "lg",
      isHoverable = true,
      isPressable = false,
      isBlurred = false,
      fullWidth = true,
      ...props
    },
    ref
  ) => {
    const enhancedClassName = `
    ${isHoverable ? "card-enhanced" : ""}
    ${isBlurred ? "glass-morphism" : ""}
    transition-all
    duration-300
    ${className}
  `.trim();

    return (
      <Card
        ref={ref}
        className={enhancedClassName}
        shadow={shadow}
        radius={radius}
        isPressable={isPressable}
        isBlurred={isBlurred}
        fullWidth={fullWidth}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

EnhancedCard.displayName = "EnhancedCard";

export default EnhancedCard;
