import { useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";

/**
 * Focus management component for modals, dropdowns, and other interactive elements
 */
export const FocusManager = ({ 
  children, 
  autoFocus = true, 
  restoreFocus = true, 
  trapFocus = true,
  className = ""
}) => {
  const containerRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Store the previously focused element
  useEffect(() => {
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement;
    }

    return () => {
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [restoreFocus]);

  // Auto focus first focusable element
  useEffect(() => {
    if (autoFocus && containerRef.current) {
      const firstFocusable = getFocusableElements(containerRef.current)[0];
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, [autoFocus]);

  // Trap focus within container
  const handleKeyDown = useCallback((event) => {
    if (!trapFocus || event.key !== 'Tab') return;

    const focusableElements = getFocusableElements(containerRef.current);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }, [trapFocus]);

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={className}
      role="region"
      aria-label="Focus managed content"
    >
      {children}
    </div>
  );
};

// Helper function to get focusable elements
const getFocusableElements = (container) => {
  if (!container) return [];

  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors))
    .filter(element => {
      return element.offsetWidth > 0 && 
             element.offsetHeight > 0 && 
             !element.hasAttribute('hidden');
    });
};

FocusManager.propTypes = {
  children: PropTypes.node.isRequired,
  autoFocus: PropTypes.bool,
  restoreFocus: PropTypes.bool,
  trapFocus: PropTypes.bool,
  className: PropTypes.string,
};

export default FocusManager;