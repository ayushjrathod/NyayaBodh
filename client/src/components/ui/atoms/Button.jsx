import { Button as NextUIButton } from "@nextui-org/react";
import { forwardRef } from "react";
import PropTypes from "prop-types";

/**
 * Enhanced Button atom component with consistent styling and behavior
 */
const Button = forwardRef(
  (
    {
      children,
      variant = "solid",
      color = "primary",
      size = "md",
      isIconOnly = false,
      isLoading = false,
      isDisabled = false,
      startContent,
      endContent,
      fullWidth = false,
      radius = "md",
      className = "",
      onClick,
      type = "button",
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
      <NextUIButton
        ref={ref}
        className={enhancedClassName}
        variant={variant}
        color={color}
        size={size}
        isIconOnly={isIconOnly}
        isLoading={isLoading}
        isDisabled={isDisabled}
        startContent={startContent}
        endContent={endContent}
        fullWidth={fullWidth}
        radius={radius}
        onPress={onClick}
        type={type}
        {...props}
      >
        {children}
      </NextUIButton>
    );
  }
);

Button.displayName = "Button";

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(["solid", "bordered", "light", "flat", "faded", "shadow", "ghost"]),
  color: PropTypes.oneOf(["default", "primary", "secondary", "success", "warning", "danger"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  isIconOnly: PropTypes.bool,
  isLoading: PropTypes.bool,
  isDisabled: PropTypes.bool,
  startContent: PropTypes.node,
  endContent: PropTypes.node,
  fullWidth: PropTypes.bool,
  radius: PropTypes.oneOf(["none", "sm", "md", "lg", "full"]),
  className: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
};

export default Button;