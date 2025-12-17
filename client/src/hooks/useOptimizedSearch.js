import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Optimized search hook with debouncing and memoization
 */
const useOptimizedSearch = (
  items = [],
  searchFields = [],
  options = {}
) => {
  const {
    debounceDelay = 300,
    caseSensitive = false,
    exactMatch = false,
    minSearchLength = 1
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);

  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < minSearchLength) {
      return items;
    }

    const searchValue = caseSensitive 
      ? debouncedSearchTerm 
      : debouncedSearchTerm.toLowerCase();

    return items.filter(item => {
      if (searchFields.length === 0) {
        // Search all string properties
        return Object.values(item).some(value => {
          if (typeof value !== 'string') return false;
          const itemValue = caseSensitive ? value : value.toLowerCase();
          return exactMatch 
            ? itemValue === searchValue
            : itemValue.includes(searchValue);
        });
      }

      // Search specific fields
      return searchFields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        if (typeof value !== 'string') return false;
        const itemValue = caseSensitive ? value : value.toLowerCase();
        return exactMatch 
          ? itemValue === searchValue
          : itemValue.includes(searchValue);
      });
    });
  }, [items, debouncedSearchTerm, searchFields, caseSensitive, exactMatch, minSearchLength]);

  const updateSearchTerm = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  return {
    searchTerm,
    debouncedSearchTerm,
    filteredItems,
    updateSearchTerm,
    clearSearch,
    isSearching: searchTerm !== debouncedSearchTerm,
    hasResults: filteredItems.length > 0,
    resultCount: filteredItems.length
  };
};

export default useOptimizedSearch;