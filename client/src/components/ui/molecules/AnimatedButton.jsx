import { Button } from "@nextui-org/react";
import { motion } from "framer-motion";
import { forwardRef } from "react";
import PropTypes from "prop-types";

/**
 * Animated button with consistent feedback
 */
const AnimatedButton = forwardRef(
  (
    {
      children,
      onClick,
      isLoading = false,
      disabled = false,
      variant = "solid",
      color = "primary",
      size = "md",
      animation = "scale",
      className = "",
      ...props
    },
    ref
  ) => {
    const animations = {
      scale: {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
        transition: { type: "spring", stiffness: 400, damping: 17 }
      },
      lift: {
        whileHover: { y: -2 },
        whileTap: { y: 0 },
        transition: { type: "spring", stiffness: 400, damping: 17 }
      },
      glow: {
        whileHover: { 
          boxShadow: "0 0 20px rgba(var(--nextui-primary), 0.4)",
          scale: 1.02
        },
        whileTap: { scale: 0.98 },
        transition: { duration: 0.2 }
      }
    };

    const currentAnimation = animations[animation] || animations.scale;

    return (
      <motion.div
        {...currentAnimation}
        className="inline-block"
      >
        <Button
          ref={ref}
          onPress={onClick}
          isLoading={isLoading}
          isDisabled={disabled}
          variant={variant}
          color={color}
          size={size}
          className={`transition-all duration-200 ${className}`}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

AnimatedButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  variant: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.string,
  animation: PropTypes.oneOf(["scale", "lift", "glow"]),
  className: PropTypes.string,
};

export default AnimatedButton;