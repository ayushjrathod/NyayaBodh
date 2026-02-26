import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
    focusVisible: true,
  });

  useEffect(() => {
    // Check for user preferences
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setPreferences(prev => ({
      ...prev,
      reducedMotion,
      highContrast,
    }));

    // Listen for changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e) => {
      setPreferences(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    const handleContrastChange = (e) => {
      setPreferences(prev => ({ ...prev, highContrast: e.matches }));
    };

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AccessibilityContext.Provider value={{ preferences, updatePreference }}>
      <div 
        className={`
          ${preferences.reducedMotion ? 'motion-reduce' : ''}
          ${preferences.highContrast ? 'high-contrast' : ''}
          ${preferences.fontSize === 'large' ? 'text-lg' : preferences.fontSize === 'small' ? 'text-sm' : ''}
        `}
        data-focus-visible={preferences.focusVisible}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

AccessibilityProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AccessibilityProvider;