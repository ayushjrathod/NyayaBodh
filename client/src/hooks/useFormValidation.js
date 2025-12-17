import { useState, useCallback } from "react";

/**
 * Custom hook for form validation
 */
export const useFormValidation = (validationSchema) => {
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback(
    async (fieldName, value, formData = {}) => {
      if (!validationSchema) return null;

      try {
        setIsValidating(true);
        
        // If using zod schema
        if (validationSchema.safeParse) {
          const result = validationSchema.safeParse({ ...formData, [fieldName]: value });
          if (!result.success) {
            const fieldError = result.error.errors.find(err => err.path.includes(fieldName));
            return fieldError ? fieldError.message : null;
          }
          return null;
        }
        
        // If using custom validation function
        if (typeof validationSchema[fieldName] === 'function') {
          return await validationSchema[fieldName](value, formData);
        }
        
        return null;
      } catch (error) {
        console.error('Validation error:', error);
        return 'Validation failed';
      } finally {
        setIsValidating(false);
      }
    },
    [validationSchema]
  );

  const validateForm = useCallback(
    async (formData) => {
      if (!validationSchema) return { isValid: true, errors: {} };

      try {
        setIsValidating(true);
        
        // If using zod schema
        if (validationSchema.safeParse) {
          const result = validationSchema.safeParse(formData);
          if (!result.success) {
            const formErrors = {};
            result.error.errors.forEach(err => {
              const fieldName = err.path[0];
              if (fieldName && !formErrors[fieldName]) {
                formErrors[fieldName] = err.message;
              }
            });
            setErrors(formErrors);
            return { isValid: false, errors: formErrors };
          }
          setErrors({});
          return { isValid: true, errors: {} };
        }
        
        // If using custom validation functions
        const formErrors = {};
        for (const [fieldName, validator] of Object.entries(validationSchema)) {
          if (typeof validator === 'function') {
            const error = await validator(formData[fieldName], formData);
            if (error) {
              formErrors[fieldName] = error;
            }
          }
        }
        
        setErrors(formErrors);
        const isValid = Object.keys(formErrors).length === 0;
        return { isValid, errors: formErrors };
      } catch (error) {
        console.error('Form validation error:', error);
        const fallbackErrors = { _form: 'Validation failed' };
        setErrors(fallbackErrors);
        return { isValid: false, errors: fallbackErrors };
      } finally {
        setIsValidating(false);
      }
    },
    [validationSchema]
  );

  const setFieldError = useCallback((fieldName, error) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error,
    }));
  }, []);

  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    isValidating,
    validateField,
    validateForm,
    setFieldError,
    clearFieldError,
    clearAllErrors,
  };
};

export default useFormValidation;