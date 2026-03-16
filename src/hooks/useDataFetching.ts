import { useState, useCallback, useRef, useEffect } from 'react';
import { useAsync, type AsyncState, type ExecuteOptions } from './useAsync';

// Retry configuration
interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: Error) => boolean;
}

// Data fetching options
interface DataFetchingOptions<T> {
  initialData?: T | null;
  immediate?: boolean;
  retry?: RetryConfig;
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

// Cache entry
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Global cache store
const globalCache = new Map<string, CacheEntry<any>>();

// Default retry condition - retry on network errors or 5xx status
const defaultRetryCondition = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('timeout') ||
    message.includes('503') ||
    message.includes('504') ||
    message.includes('502') ||
    message.includes('500')
  );
};

/**
 * Enhanced hook for data fetching with automatic retry, caching, and store integration.
 */
export function useDataFetching<T = any>(
  fetchFn: (...args: any[]) => Promise<T>,
  options: DataFetchingOptions<T> = {}
) {
  const {
    initialData = null,
    immediate = false,
    retry: retryConfig = {},
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    onSuccess,
    onError,
    enabled = true,
  } = options;

  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryCondition = defaultRetryCondition,
  } = retryConfig;

  // State
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: immediate && enabled,
    error: null,
  });

  // Refs
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const lastArgsRef = useRef<any[]>([]);
  const isFetchingRef = useRef(false);

  // Check cache
  const getCachedData = useCallback((): T | null => {
    if (!cacheKey) return null;
    
    const cached = globalCache.get(cacheKey);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cacheDuration;
    if (isExpired) {
      globalCache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }, [cacheKey, cacheDuration]);

  // Set cache
  const setCachedData = useCallback((data: T) => {
    if (cacheKey) {
      globalCache.set(cacheKey, { data, timestamp: Date.now() });
    }
  }, [cacheKey]);

  // Invalidate cache
  const invalidateCache = useCallback(() => {
    if (cacheKey) {
      globalCache.delete(cacheKey);
    }
  }, [cacheKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Core fetch function
  const fetch = useCallback(async (
    ...args: any[]
  ): Promise<T | null> => {
    if (!enabled || isFetchingRef.current) {
      return state.data;
    }

    // Check cache first
    const cached = getCachedData();
    if (cached !== null && retryCountRef.current === 0) {
      if (isMountedRef.current) {
        setState({ data: cached, loading: false, error: null });
      }
      onSuccess?.(cached);
      return cached;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    lastArgsRef.current = args;
    isFetchingRef.current = true;

    // Set loading state
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      const result = await fetchFn(...args);

      if (isMountedRef.current && !signal.aborted) {
        setCachedData(result);
        setState({ data: result, loading: false, error: null });
        retryCountRef.current = 0;
        onSuccess?.(result);
        return result;
      }

      return null;
    } catch (error) {
      if (isMountedRef.current && !signal.aborted) {
        const errorObj = error instanceof Error ? error : new Error(String(error));

        // Check if we should retry
        if (
          retryCountRef.current < maxRetries &&
          retryCondition(errorObj)
        ) {
          retryCountRef.current++;
          
          // Exponential backoff
          const delay = retryDelay * Math.pow(2, retryCountRef.current - 1);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          
          isFetchingRef.current = false;
          return fetch(...lastArgsRef.current);
        }

        setState(prev => ({ ...prev, loading: false, error: errorObj }));
        onError?.(errorObj);
        return null;
      }

      return null;
    } finally {
      isFetchingRef.current = false;
    }
  }, [
    enabled,
    fetchFn,
    getCachedData,
    setCachedData,
    maxRetries,
    retryDelay,
    retryCondition,
    onSuccess,
    onError,
  ]);

  // Refetch with same args
  const refetch = useCallback(async (): Promise<T | null> => {
    retryCountRef.current = 0;
    invalidateCache();
    return fetch(...lastArgsRef.current);
  }, [fetch, invalidateCache]);

  // Retry after error
  const retry = useCallback(async (): Promise<T | null> => {
    retryCountRef.current = 0;
    return fetch(...lastArgsRef.current);
  }, [fetch]);

  // Cancel ongoing request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isFetchingRef.current = false;
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Reset state
  const reset = useCallback(() => {
    cancel();
    retryCountRef.current = 0;
    lastArgsRef.current = [];
    if (isMountedRef.current) {
      setState({ data: initialData, loading: false, error: null });
    }
  }, [cancel, initialData]);

  // Update data optimistically
  const updateData = useCallback((updater: (data: T | null) => T) => {
    setState(prev => {
      const newData = updater(prev.data);
      setCachedData(newData);
      return { ...prev, data: newData };
    });
  }, [setCachedData]);

  // Set data directly
  const setData = useCallback((data: T | null) => {
    if (data !== null) {
      setCachedData(data);
    }
    setState(prev => ({ ...prev, data, error: null }));
  }, [setCachedData]);

  // Set error directly
  const setError = useCallback((error: Error | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // Execute on mount if immediate is true
  useEffect(() => {
    if (immediate && enabled) {
      fetch();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    fetch,
    refetch,
    retry,
    cancel,
    reset,
    updateData,
    setData,
    setError,
    invalidateCache,
    isCached: cacheKey ? globalCache.has(cacheKey) : false,
  };
}

/**
 * Hook for fetching data from a store with loading states.
 */
export function useStoreData<T = any, S extends Record<string, any> = Record<string, any>>(
  store: S,
  dataSelector: (state: S) => T,
  fetchAction: (...args: any[]) => Promise<void>,
  options: DataFetchingOptions<T> = {}
) {
  const {
    immediate = false,
    retry: retryConfig = {},
    enabled = true,
  } = options;

  const {
    maxRetries = 3,
    retryDelay = 1000,
  } = retryConfig;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const retryCountRef = useRef(0);

  // Get data from store
  const data = dataSelector(store);

  // Fetch wrapper with retry
  const fetch = useCallback(async (...args: any[]): Promise<void> => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      await fetchAction(...args);
      retryCountRef.current = 0;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));

      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return fetch(...args);
      }

      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [enabled, fetchAction, maxRetries, retryDelay]);

  // Retry
  const retry = useCallback(async (...args: any[]): Promise<void> => {
    retryCountRef.current = 0;
    return fetch(...args);
  }, [fetch]);

  // Refetch
  const refetch = useCallback(async (...args: any[]): Promise<void> => {
    return fetch(...args);
  }, [fetch]);

  // Reset
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    retryCountRef.current = 0;
  }, []);

  // Execute on mount if immediate
  useEffect(() => {
    if (immediate && enabled) {
      fetch();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    fetch,
    retry,
    refetch,
    reset,
  };
}

/**
 * Hook for paginated data fetching.
 */
export function usePaginatedData<T = any>(
  fetchFn: (page: number, pageSize: number, ...args: any[]) => Promise<{ data: T[]; total: number }>,
  options: DataFetchingOptions<{ items: T[]; total: number; page: number; pageSize: number }> & {
    pageSize?: number;
  } = {}
) {
  const { pageSize = 10, ...restOptions } = options;

  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);

  const fetchPage = useCallback(async (
    pageNum: number,
    ...args: any[]
  ): Promise<{ items: T[]; total: number } | null> => {
    const result = await fetchFn(pageNum, pageSize, ...args);
    
    if (result) {
      setItems(prev => pageNum === 1 ? result.data : [...prev, ...result.data]);
      setTotal(result.total);
      return { items: result.data, total: result.total };
    }
    
    return null;
  }, [fetchFn, pageSize]);

  const { 
    loading, 
    error, 
    fetch, 
    retry, 
    refetch,
    reset,
    cancel,
  } = useDataFetching(
    async (...args: any[]) => {
      const result = await fetchPage(page, ...args);
      return { items: result?.items || [], total: result?.total || 0, page, pageSize };
    },
    restOptions
  );

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
    fetch();
  }, [fetch]);

  const nextPage = useCallback(() => {
    if (items.length < total) {
      goToPage(page + 1);
    }
  }, [goToPage, page, items.length, total]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      goToPage(page - 1);
    }
  }, [goToPage, page]);

  const resetPagination = useCallback(() => {
    setPage(1);
    setItems([]);
    setTotal(0);
    reset();
  }, [reset]);

  return {
    items,
    total,
    page,
    pageSize,
    loading,
    error,
    hasMore: items.length < total,
    hasPrev: page > 1,
    fetch: (...args: any[]) => fetch(...args),
    retry,
    refetch,
    goToPage,
    nextPage,
    prevPage,
    reset: resetPagination,
    cancel,
  };
}

/**
 * Hook for infinite scroll data fetching.
 */
export function useInfiniteData<T = any>(
  fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; hasMore: boolean }>,
  options: { pageSize?: number; immediate?: boolean } = {}
) {
  const { pageSize = 10, immediate = false } = options;

  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMore = useCallback(async (): Promise<void> => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn(page, pageSize);
      
      setItems(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, pageSize, loading, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setLoading(false);
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    await fetchMore();
  }, [fetchMore]);

  useEffect(() => {
    if (immediate) {
      fetchMore();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    items,
    loading,
    error,
    hasMore,
    fetchMore,
    reset,
    refresh,
  };
}

export default useDataFetching;
