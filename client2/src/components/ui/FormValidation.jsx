import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Input, Textarea } from "@nextui-org/react";
import { CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

/**
 * Enhanced form field with real-time validation feedback
 */
const ValidatedInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  validation,
  placeholder,
  isRequired = false,
  showValidationIcon = true,
  realTimeValidation = true,
  className = "",
  ...props
}) => {
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Real-time validation
  useEffect(() => {
    if (realTimeValidation && isTouched && validation) {
      validateField(value);
    }
  }, [value, isTouched, realTimeValidation, validation]);

  const validateField = async (fieldValue) => {
    if (!validation) return;

    try {
      if (typeof validation === "function") {
        const result = await validation(fieldValue);
        if (result === true || result === undefined) {
          setError("");
          setIsValid(!!fieldValue);
        } else {
          setError(result || "Invalid input");
          setIsValid(false);
        }
      } else if (validation.test) {
        // RegExp validation
        const isValidValue = validation.test(fieldValue);
        setIsValid(isValidValue && !!fieldValue);
        setError(isValidValue ? "" : "Invalid format");
      }
    } catch (err) {
      setError("Validation error");
      setIsValid(false);
    }
  };

  const handleChange = (e) => {
    onChange(e);
    if (!isTouched) setIsTouched(true);
  };

  const handleBlur = (e) => {
    setIsTouched(true);
    if (validation) {
      validateField(e.target.value);
    }
    if (onBlur) onBlur(e);
  };

  const getValidationState = () => {
    if (!isTouched) return "default";
    if (error) return "invalid";
    if (isValid) return "valid";
    return "default";
  };

  const validationState = getValidationState();
  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;

  const getEndContent = () => {
    const elements = [];

    // Password toggle
    if (isPasswordField) {
      elements.push(
        <button
          key="password-toggle"
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="focus:outline-none p-1 rounded-md transition-colors hover:bg-default-100"
          aria-label="Toggle password visibility"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 text-default-400" />
          ) : (
            <Eye className="w-4 h-4 text-default-400" />
          )}
        </button>
      );
    }

    // Validation icon
    if (showValidationIcon && isTouched && (isValid || error)) {
      elements.push(
        <div key="validation-icon" className="flex items-center">
          {isValid ? (
            <CheckCircle className="w-4 h-4 text-success" />
          ) : error ? (
            <AlertCircle className="w-4 h-4 text-danger" />
          ) : null}
        </div>
      );
    }

    return elements.length > 0 ? (
      <div className="flex items-center gap-2">
        {elements}
      </div>
    ) : null;
  };

  const commonProps = {
    label,
    name,
    value,
    onChange: handleChange,
    onBlur: handleBlur,
    placeholder,
    isRequired,
    isInvalid: validationState === "invalid",
    errorMessage: error,
    endContent: getEndContent(),
    classNames: {
      input: "text-foreground",
      inputWrapper: [
        "transition-all duration-200",
        validationState === "valid" && "border-success data-[hover=true]:border-success",
        validationState === "invalid" && "border-danger data-[hover=true]:border-danger",
      ],
      errorMessage: "text-danger text-xs mt-1",
    },
    className,
    ...props,
  };

  if (type === "textarea") {
    return <Textarea {...commonProps} type={undefined} />;
  }

  return <Input {...commonProps} type={inputType} />;
};

ValidatedInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["text", "email", "password", "tel", "url", "number", "textarea"]),
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  validation: PropTypes.oneOfType([PropTypes.func, PropTypes.instanceOf(RegExp)]),
  placeholder: PropTypes.string,
  isRequired: PropTypes.bool,
  showValidationIcon: PropTypes.bool,
  realTimeValidation: PropTypes.bool,
  className: PropTypes.string,
};

/**
 * Common validation functions
 */
export const validationRules = {
  email: (value) => {
    if (!value) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? true : "Please enter a valid email address";
  },
  
  password: (value) => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])/.test(value)) return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(value)) return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(value)) return "Password must contain at least one number";
    return true;
  },
  
  required: (value) => {
    return value && value.trim() ? true : "This field is required";
  },
  
  minLength: (min) => (value) => {
    return value && value.length >= min ? true : `Must be at least ${min} characters`;
  },
  
  maxLength: (max) => (value) => {
    return !value || value.length <= max ? true : `Must be no more than ${max} characters`;
  },
  
  phone: (value) => {
    if (!value) return "Phone number is required";
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/\s/g, "")) ? true : "Please enter a valid phone number";
  },
  
  url: (value) => {
    if (!value) return true; // Optional field
    try {
      new URL(value);
      return true;
    } catch {
      return "Please enter a valid URL";
    }
  },
};

export default ValidatedInput;