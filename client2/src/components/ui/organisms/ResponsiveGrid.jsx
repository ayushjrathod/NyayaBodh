import PropTypes from "prop-types";
import { useResponsive } from "../ResponsiveContainer";

/**
 * Responsive grid component with consistent breakpoints
 */
const ResponsiveGrid = ({ 
  children, 
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = "gap-6",
  className = ""
}) => {
  const { isMobile, isTablet, isDesktop, isLargeScreen } = useResponsive();

  const getGridCols = () => {
    if (isLargeScreen) return `grid-cols-${columns.xl}`;
    if (isDesktop) return `grid-cols-${columns.lg}`;
    if (isTablet) return `grid-cols-${columns.md}`;
    return `grid-cols-${columns.sm}`;
  };

  return (
    <div className={`grid ${getGridCols()} ${gap} ${className}`}>
      {children}
    </div>
  );
};

ResponsiveGrid.propTypes = {
  children: PropTypes.node.isRequired,
  columns: PropTypes.shape({
    sm: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number,
    xl: PropTypes.number,
  }),
  gap: PropTypes.string,
  className: PropTypes.string,
};

export default ResponsiveGrid;