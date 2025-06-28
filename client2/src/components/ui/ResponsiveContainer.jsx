import { useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Responsive container with breakpoint-aware rendering
 */
export const ResponsiveContainer = ({ 
  children, 
  className = "",
  breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  }
}) => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState('sm');
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });

      // Determine current breakpoint
      let breakpoint = 'sm';
      Object.entries(breakpoints)
        .sort(([,a], [,b]) => b - a) // Sort descending
        .forEach(([name, size]) => {
          if (width >= size) {
            breakpoint = name;
            return;
          }
        });
      
      setCurrentBreakpoint(breakpoint);
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [breakpoints]);

  const contextValue = {
    breakpoint: currentBreakpoint,
    screenSize,
    isMobile: currentBreakpoint === 'sm',
    isTablet: currentBreakpoint === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(currentBreakpoint),
    isLargeScreen: ['xl', '2xl'].includes(currentBreakpoint),
  };

  return (
    <div 
      className={`responsive-container ${className}`}
      data-breakpoint={currentBreakpoint}
    >
      {typeof children === 'function' ? children(contextValue) : children}
    </div>
  );
};

ResponsiveContainer.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  className: PropTypes.string,
  breakpoints: PropTypes.object,
};

/**
 * Hook for responsive behavior
 */
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState('sm');
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });

      if (width >= 1536) setBreakpoint('2xl');
      else if (width >= 1280) setBreakpoint('xl');
      else if (width >= 1024) setBreakpoint('lg');
      else if (width >= 768) setBreakpoint('md');
      else setBreakpoint('sm');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    screenSize,
    isMobile: breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(breakpoint),
    isLargeScreen: ['xl', '2xl'].includes(breakpoint),
  };
};

export default ResponsiveContainer;