import { Textarea as NextUITextarea } from "@nextui-org/react";
import { forwardRef } from "react";
import PropTypes from "prop-types";

/**
 * Enhanced Textarea atom component with consistent styling
 */
const Textarea = forwardRef(
  (
    {
      label,
      placeholder,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      variant = "bordered",
      size = "md",
      radius = "md",
      color = "default",
      labelPlacement = "inside",
      isRequired = false,
      isDisabled = false,
      isReadOnly = false,
      isInvalid = false,
      minRows = 3,
      maxRows = 8,
      description,
      errorMessage,
      className = "",
      classNames = {},
      ...props
    },
    ref
  ) => {
    const enhancedClassName = `
      form-enhanced
      transition-all
      duration-200
      focus-enhanced
      ${className}
    `.trim();

    const enhancedClassNames = {
      input: ["bg-transparent", "text-foreground", "placeholder:text-default-400", "font-medium"],
      inputWrapper: [
        "border-default-200",
        "data-[hover=true]:border-default-300",
        "data-[focus=true]:border-primary",
        "group-data-[focus=true]:border-primary",
        "backdrop-blur-sm",
        "backdrop-saturate-150",
        "transition-all",
        "duration-200",
      ],
      label: ["font-medium", "text-default-600", "group-data-[filled=true]:text-default-700"],
      errorMessage: ["text-danger", "font-medium", "text-xs"],
      description: ["text-default-500", "text-xs"],
      ...classNames,
    };

    return (
      <NextUITextarea
        ref={ref}
        className={enhancedClassName}
        classNames={enhancedClassNames}
        label={label}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        variant={variant}
        size={size}
        radius={radius}
        color={color}
        labelPlacement={labelPlacement}
        isRequired={isRequired}
        isDisabled={isDisabled}
        isReadOnly={isReadOnly}
        isInvalid={isInvalid}
        minRows={minRows}
        maxRows={maxRows}
        description={description}
        errorMessage={errorMessage}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

Textarea.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  variant: PropTypes.oneOf(["flat", "bordered", "faded", "underlined"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  radius: PropTypes.oneOf(["none", "sm", "md", "lg", "full"]),
  color: PropTypes.oneOf(["default", "primary", "secondary", "success", "warning", "danger"]),
  labelPlacement: PropTypes.oneOf(["inside", "outside", "outside-left"]),
  isRequired: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isReadOnly: PropTypes.bool,
  isInvalid: PropTypes.bool,
  minRows: PropTypes.number,
  maxRows: PropTypes.number,
  description: PropTypes.string,
  errorMessage: PropTypes.string,
  className: PropTypes.string,
  classNames: PropTypes.object,
};

export default Textarea;