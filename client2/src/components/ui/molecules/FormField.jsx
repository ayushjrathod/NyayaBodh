import PropTypes from "prop-types";
import Input from "../atoms/Input";
import Textarea from "../atoms/Textarea";

/**
 * FormField molecule component that handles different input types
 */
const FormField = ({
  type = "input",
  label,
  name,
  value,
  onChange,
  placeholder,
  isRequired = false,
  isInvalid = false,
  errorMessage,
  description,
  startContent,
  endContent,
  className = "",
  ...props
}) => {
  const commonProps = {
    label,
    name,
    value,
    onChange,
    placeholder,
    isRequired,
    isInvalid,
    errorMessage,
    description,
    startContent,
    endContent,
    className,
    ...props,
  };

  if (type === "textarea") {
    return <Textarea {...commonProps} />;
  }

  return <Input type={type} {...commonProps} />;
};

FormField.propTypes = {
  type: PropTypes.oneOf(["input", "textarea", "email", "password", "number", "tel", "url"]),
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  isRequired: PropTypes.bool,
  isInvalid: PropTypes.bool,
  errorMessage: PropTypes.string,
  description: PropTypes.string,
  startContent: PropTypes.node,
  endContent: PropTypes.node,
  className: PropTypes.string,
};

export default FormField;