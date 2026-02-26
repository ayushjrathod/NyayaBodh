import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

/**
 * Live region for announcing dynamic content changes to screen readers
 */
const LiveRegion = ({ 
  message, 
  politeness = "polite", 
  clearOnUnmount = true,
  className = "sr-only"
}) => {
  const regionRef = useRef(null);

  useEffect(() => {
    if (regionRef.current && message) {
      // Clear previous message first
      regionRef.current.textContent = "";
      
      // Set new message after a brief delay to ensure it's announced
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      }, 100);
    }
  }, [message]);

  useEffect(() => {
    return () => {
      if (clearOnUnmount && regionRef.current) {
        regionRef.current.textContent = "";
      }
    };
  }, [clearOnUnmount]);

  return (
    <div
      ref={regionRef}
      aria-live={politeness}
      aria-atomic="true"
      className={className}
      role="status"
    />
  );
};

LiveRegion.propTypes = {
  message: PropTypes.string,
  politeness: PropTypes.oneOf(["polite", "assertive", "off"]),
  clearOnUnmount: PropTypes.bool,
  className: PropTypes.string,
};

export default LiveRegion;