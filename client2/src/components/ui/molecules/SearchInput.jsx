import { Send } from "lucide-react";
import PropTypes from "prop-types";
import { useRef } from "react";
import Button from "../atoms/Button";
import Textarea from "../atoms/Textarea";

/**
 * SearchInput molecule component with integrated send button
 */
const SearchInput = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Enter your search query...",
  isLoading = false,
  isDisabled = false,
  className = "",
  ...props
}) => {
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const currentValue = e.target.value;

      onChange({
        target: {
          value: currentValue.substring(0, start) + "\n" + currentValue.substring(end),
        },
      });

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 1;
          textareaRef.current.selectionEnd = start + 1;
        }
      }, 0);
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading && !isDisabled) {
        onSubmit();
      }
    }
  };

  return (
    <div className={`flex items-end gap-3 ${className}`}>
      <div className="flex-1">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          minRows={1}
          maxRows={4}
          isDisabled={isDisabled}
          className="resize-none"
          {...props}
        />
      </div>
      <Button
        isIconOnly
        radius="full"
        size="lg"
        color="primary"
        variant={value.trim() ? "solid" : "bordered"}
        onClick={onSubmit}
        isDisabled={!value.trim() || isLoading || isDisabled}
        isLoading={isLoading}
        className="mb-0"
        aria-label="Search"
      >
        <Send className="w-5 h-5" />
      </Button>
    </div>
  );
};

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  isLoading: PropTypes.bool,
  isDisabled: PropTypes.bool,
  className: PropTypes.string,
};

export default SearchInput;