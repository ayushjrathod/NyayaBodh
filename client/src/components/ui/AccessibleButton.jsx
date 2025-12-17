import { forwardRef, useState } from "react";
import { Button } from "@nextui-org/react";
import PropTypes from "prop-types";

/**
 * Enhanced accessible button with proper ARIA attributes and keyboard support
 */
const AccessibleButton = forwardRef(({
  children,
  onClick,
  onKeyDown,
  disabled = false,
  loading = false,
  ariaLabel,
  ariaDescribedBy,
  ariaExpanded,
  ariaControls,
  ariaPressed,
  role = "button",
  className = "",
  variant = "solid",
  color = "primary",
  size = "md",
  startContent,
  endContent,
  ...props
}, ref) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleKeyDown = (event) => {
    // Handle Enter and Space key activation
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!disabled && !loading) {
        setIsPressed(true);
        onClick?.(event);
      }
    }
    onKeyDown?.(event);
  };

  const handleKeyUp = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      setIsPressed(false);
    }
  };

  const handleClick = (event) => {
    if (!disabled && !loading) {
      onClick?.(event);
    }
  };

  const enhancedClassName = `
    focus-visible:outline-none 
    focus-visible:ring-2 
    focus-visible:ring-primary 
    focus-visible:ring-offset-2
    transition-all 
    duration-200
    ${isPressed ? 'scale-95' : ''}
    ${className}
  `.trim();

  return (
    <Button
      ref={ref}
      className={enhancedClassName}
      variant={variant}
      color={color}
      size={size}
      isDisabled={disabled}
      isLoading={loading}
      startContent={startContent}
      endContent={endContent}
      onPress={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-pressed={ariaPressed}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      {children}
    </Button>
  );
});

AccessibleButton.displayName = "AccessibleButton";

AccessibleButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  onKeyDown: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  ariaExpanded: PropTypes.bool,
  ariaControls: PropTypes.string,
  ariaPressed: PropTypes.bool,
  role: PropTypes.string,
  className: PropTypes.string,
  variant: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.string,
  startContent: PropTypes.node,
  endContent: PropTypes.node,
};

export default AccessibleButton;