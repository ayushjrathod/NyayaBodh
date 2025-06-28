import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { X } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import AccessibleButton from "./AccessibleButton";
import FocusManager from "./FocusManager";

/**
 * Fully accessible modal with proper ARIA attributes and focus management
 */
const AccessibleModal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  scrollBehavior = "inside",
  closeButton = true,
  className = "",
  ariaLabelledBy,
  ariaDescribedBy,
  ...props
}) => {
  const titleId = useRef(`modal-title-${Math.random().toString(36).substr(2, 9)}`);
  const descriptionId = useRef(`modal-description-${Math.random().toString(36).substr(2, 9)}`);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      scrollBehavior={scrollBehavior}
      className={className}
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "border border-default-200",
        header: "border-b border-default-200",
        footer: "border-t border-default-200",
      }}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
      {...props}
    >
      <ModalContent>
        {(onClose) => (
          <FocusManager trapFocus autoFocus restoreFocus>
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={ariaLabelledBy || titleId.current}
              aria-describedby={ariaDescribedBy || descriptionId.current}
            >
              {title && (
                <ModalHeader className="flex justify-between items-center">
                  <h2 
                    id={titleId.current}
                    className="text-xl font-semibold text-foreground"
                  >
                    {title}
                  </h2>
                  {closeButton && (
                    <AccessibleButton
                      isIconOnly
                      variant="light"
                      size="sm"
                      onClick={onClose}
                      ariaLabel="Close modal"
                      className="text-default-500 hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </AccessibleButton>
                  )}
                </ModalHeader>
              )}
              
              <ModalBody>
                <div id={descriptionId.current}>
                  {children}
                </div>
              </ModalBody>
              
              {footer && (
                <ModalFooter>
                  {footer}
                </ModalFooter>
              )}
            </div>
          </FocusManager>
        )}
      </ModalContent>
    </Modal>
  );
};

AccessibleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  size: PropTypes.string,
  scrollBehavior: PropTypes.string,
  closeButton: PropTypes.bool,
  className: PropTypes.string,
  ariaLabelledBy: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
};

export default AccessibleModal;