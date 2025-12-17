import { Card as NextUICard } from "@nextui-org/react";
import { forwardRef } from "react";
import PropTypes from "prop-types";

/**
 * Enhanced Card atom component with consistent styling and hover effects
 */
const Card = forwardRef(
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
      variant = "elevated",
      ...props
    },
    ref
  ) => {
    const enhancedClassName = `
    ${isHoverable ? "card-enhanced" : ""}
    ${isBlurred ? "glass-morphism" : ""}
    ${variant === "elevated" ? "border border-default-200/50 shadow-lg" : ""}
    ${variant === "flat" ? "bg-default-50 border border-default-200" : ""}
    ${variant === "bordered" ? "border-2 border-default-300" : ""}
    transition-all
    duration-300
    ${className}
  `.trim();

    return (
      <NextUICard
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
      </NextUICard>
    );
  }
);

Card.displayName = "Card";

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  shadow: PropTypes.oneOf(["none", "sm", "md", "lg"]),
  radius: PropTypes.oneOf(["none", "sm", "md", "lg", "full"]),
  isHoverable: PropTypes.bool,
  isPressable: PropTypes.bool,
  isBlurred: PropTypes.bool,
  fullWidth: PropTypes.bool,
  variant: PropTypes.oneOf(["elevated", "flat", "bordered"]),
};

export default Card;