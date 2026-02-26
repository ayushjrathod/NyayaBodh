import PropTypes from "prop-types";

/**
 * Skip link for keyboard navigation accessibility
 */
const SkipLink = ({ href = "#main-content", children = "Skip to main content" }) => {
  return (
    <a
      href={href}
      className="
        sr-only 
        focus:not-sr-only 
        focus:absolute 
        focus:top-4 
        focus:left-4 
        focus:z-50 
        focus:px-4 
        focus:py-2 
        focus:bg-primary 
        focus:text-primary-foreground 
        focus:rounded-md 
        focus:font-medium
        focus:shadow-lg
        focus:outline-none
        focus:ring-2
        focus:ring-primary-500
        focus:ring-offset-2
        transition-all
        duration-200
      "
      tabIndex={0}
    >
      {children}
    </a>
  );
};

SkipLink.propTypes = {
  href: PropTypes.string,
  children: PropTypes.node,
};

export default SkipLink;