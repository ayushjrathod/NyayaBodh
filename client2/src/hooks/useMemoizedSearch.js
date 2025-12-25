import { useMemo } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Hook for memoized search functionality
 * Combines debouncing with memoization for optimal performance
 */
export const useMemoizedSearch = (items, searchTerm, searchFields = [], delay = 300) => {
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return items;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();

    return items.filter(item => {
      // If no specific fields provided, search all string properties
      if (searchFields.length === 0) {
        return Object.values(item).some(value => 
          typeof value === 'string' && 
          value.toLowerCase().includes(searchLower)
        );
      }

      // Search specific fields
      return searchFields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return typeof value === 'string' && 
               value.toLowerCase().includes(searchLower);
      });
    });
  }, [items, debouncedSearchTerm, searchFields]);

  return {
    filteredItems,
    isSearching: searchTerm !== debouncedSearchTerm,
    searchTerm: debouncedSearchTerm
  };
};

export default useMemoizedSearch;