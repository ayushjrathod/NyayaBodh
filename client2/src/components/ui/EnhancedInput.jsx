import { Input } from "@nextui-org/react";
import { forwardRef } from "react";

/**
 * Enhanced Input component with consistent styling and animations
 */
const EnhancedInput = forwardRef((props, ref) => {
  const {
    className = "",
    variant = "bordered",
    size = "md",
    radius = "md",
    color = "default",
    labelPlacement = "inside",
    isClearable = false,
    startContent,
    endContent,
    description,
    errorMessage,
    isInvalid = false,
    isRequired = false,
    isDisabled = false,
    ...restProps
  } = props;

  const enhancedClassName = `
    form-enhanced
    transition-all
    duration-200
    focus-enhanced
    ${className}
  `.trim();

  return (
    <Input
      ref={ref}
      className={enhancedClassName}
      variant={variant}
      size={size}
      radius={radius}
      color={color}
      labelPlacement={labelPlacement}
      isClearable={isClearable}
      startContent={startContent}
      endContent={endContent}
      description={description}
      errorMessage={errorMessage}
      isInvalid={isInvalid}
      isRequired={isRequired}
      isDisabled={isDisabled}
      classNames={{
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
      }}
      {...restProps}
    />
  );
});

EnhancedInput.displayName = "EnhancedInput";

export default EnhancedInput;
