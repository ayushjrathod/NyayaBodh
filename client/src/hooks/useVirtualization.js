import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Custom hook for virtualizing large lists
 * Only renders visible items to improve performance
 */
export const useVirtualization = ({
  items = [],
  itemHeight = 100,
  containerHeight = 400,
  overscan = 5
}) => {
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      ...item,
      index: startIndex + index,
      offsetY: (startIndex + index) * itemHeight
    }));
  }, [items, visibleRange, itemHeight]);

  // Total height of all items
  const totalHeight = items.length * itemHeight;

  // Scroll handler
  const handleScroll = useCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    visibleRange
  };
};

/**
 * Hook for infinite scrolling with virtualization
 */
export const useInfiniteVirtualization = ({
  items = [],
  itemHeight = 100,
  containerHeight = 400,
  overscan = 5,
  hasNextPage = false,
  loadMore,
  threshold = 5
}) => {
  const virtualization = useVirtualization({
    items,
    itemHeight,
    containerHeight,
    overscan
  });

  const [isLoading, setIsLoading] = useState(false);

  // Enhanced scroll handler with infinite loading
  const handleScroll = useCallback(async (event) => {
    virtualization.handleScroll(event);

    // Check if we need to load more items
    if (hasNextPage && !isLoading && loadMore) {
      const { endIndex } = virtualization.visibleRange;
      const shouldLoadMore = endIndex >= items.length - threshold;

      if (shouldLoadMore) {
        setIsLoading(true);
        try {
          await loadMore();
        } finally {
          setIsLoading(false);
        }
      }
    }
  }, [virtualization, hasNextPage, isLoading, loadMore, items.length, threshold]);

  return {
    ...virtualization,
    handleScroll,
    isLoading
  };
};

export default useVirtualization;