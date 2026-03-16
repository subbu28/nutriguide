import { useState, useCallback, useRef, useEffect } from 'react';

// Async state interface
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Execute options
export interface ExecuteOptions {
  retryCount?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

// UseAsync hook return type
export interface UseAsyncReturn<T> extends AsyncState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  retry: () => Promise<T | null>;
  reset: () => void;
  cancel: () => void;
  setData: (data: T | null) => void;
  setError: (error: Error | null) => void;
}

/**
 * Hook for managing async operations with loading, error, and data states.
 * Supports automatic retry, cancellation, and callbacks.
 */
export function useAsync<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  immediate = false,
  immediateArgs: any[] = []
): UseAsyncReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  // Refs for managing async operations
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastArgsRef = useRef<any[]>(immediateArgs);
  const retryCountRef = useRef(0);
  const maxRetriesRef = useRef(0);
  const retryDelayRef = useRef(1000);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cancel();
    };
  }, []);

  // Cancel any pending operation
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Reset state
  const reset = useCallback(() => {
    cancel();
    retryCountRef.current = 0;
    if (isMountedRef.current) {
      setState({
        data: null,
        loading: false,
        error: null,
      });
    }
  }, [cancel]);

  // Set data manually
  const setData = useCallback((data: T | null) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, data, error: null }));
    }
  }, []);

  // Set error manually
  const setError = useCallback((error: Error | null) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, error }));
    }
  }, []);

  // Execute the async function
  const execute = useCallback(async (
    ...args: any[]
  ): Promise<T | null> => {
    // Cancel any pending operation
    cancel();

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    // Store args for retry
    lastArgsRef.current = args;

    // Update state to loading
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      // Check if cancelled before executing
      if (signal.aborted) {
        throw new Error('Operation cancelled');
      }

      // Execute the async function
      const result = await asyncFunction(...args);

      // Check if still mounted and not cancelled
      if (isMountedRef.current && !signal.aborted) {
        setState({
          data: result,
          loading: false,
          error: null,
        });
        retryCountRef.current = 0; // Reset retry count on success
        return result;
      }

      return null;
    } catch (error) {
      // Check if still mounted and not cancelled
      if (isMountedRef.current && !signal.aborted) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        // Check if we should retry
        if (retryCountRef.current < maxRetriesRef.current) {
          retryCountRef.current++;
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelayRef.current));
          
          // Retry with same args
          return execute(...lastArgsRef.current);
        }

        setState(prev => ({ ...prev, loading: false, error: errorObj }));
        return null;
      }

      return null;
    }
  }, [asyncFunction, cancel]);

  // Retry the last operation
  const retry = useCallback(async (): Promise<T | null> => {
    retryCountRef.current = 0;
    return execute(...lastArgsRef.current);
  }, [execute]);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute(...immediateArgs);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    execute,
    retry,
    reset,
    cancel,
    setData,
    setError,
  };
}

/**
 * Hook for managing multiple async operations with loading states.
 */
export function useAsyncTasks<T extends Record<string, (...args: any[]) => Promise<any>>>(
  tasks: T
) {
  type TaskState = {
    [K in keyof T]: AsyncState<Awaited<ReturnType<T[K]>>>;
  };

  const initialState = Object.keys(tasks).reduce((acc, key) => {
    acc[key as keyof T] = { data: null, loading: false, error: null };
    return acc;
  }, {} as TaskState);

  const [states, setStates] = useState<TaskState>(initialState);
  const abortControllersRef = useRef<Map<keyof T, AbortController>>(new Map());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllersRef.current.forEach(controller => controller.abort());
      abortControllersRef.current.clear();
    };
  }, []);

  // Create execute function for each task
  const execute = useCallback(<K extends keyof T>(
    taskName: K,
    ...args: Parameters<T[K]>
  ): Promise<Awaited<ReturnType<T[K]>> | null> => {
    const task = tasks[taskName];
    
    // Cancel any pending operation for this task
    const existingController = abortControllersRef.current.get(taskName);
    if (existingController) {
      existingController.abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    abortControllersRef.current.set(taskName, controller);
    const { signal } = controller;

    // Update state to loading
    setStates(prev => ({
      ...prev,
      [taskName]: { ...prev[taskName], loading: true, error: null },
    }));

    return task(...args).then(
      (result) => {
        if (!signal.aborted) {
          setStates(prev => ({
            ...prev,
            [taskName]: { data: result, loading: false, error: null },
          }));
        }
        return result;
      },
      (error) => {
        if (!signal.aborted) {
          const errorObj = error instanceof Error ? error : new Error(String(error));
          setStates(prev => ({
            ...prev,
            [taskName]: { ...prev[taskName], loading: false, error: errorObj },
          }));
        }
        return null;
      }
    );
  }, [tasks]);

  // Cancel a specific task
  const cancel = useCallback((taskName: keyof T) => {
    const controller = abortControllersRef.current.get(taskName);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(taskName);
    }
  }, []);

  // Cancel all tasks
  const cancelAll = useCallback(() => {
    abortControllersRef.current.forEach(controller => controller.abort());
    abortControllersRef.current.clear();
  }, []);

  // Reset a specific task
  const reset = useCallback((taskName: keyof T) => {
    cancel(taskName);
    setStates(prev => ({
      ...prev,
      [taskName]: { data: null, loading: false, error: null },
    }));
  }, [cancel]);

  // Reset all tasks
  const resetAll = useCallback(() => {
    cancelAll();
    setStates(initialState);
  }, [cancelAll, initialState]);

  // Check if any task is loading
  const isLoading = Object.values(states).some(state => state.loading);

  // Get all errors
  const errors = Object.entries(states)
    .filter(([, state]) => state.error)
    .map(([name, state]) => ({ name, error: state.error }));

  return {
    states,
    execute,
    cancel,
    cancelAll,
    reset,
    resetAll,
    isLoading,
    errors,
  };
}

/**
 * Hook for optimistic updates with rollback support.
 */
export function useOptimistic<T>(
  initialValue: T,
  updateFn: (current: T, optimisticValue: T) => T
) {
  const [state, setState] = useState<T>(initialValue);
  const [isOptimistic, setIsOptimistic] = useState(false);
  const rollbackValueRef = useRef<T>(initialValue);

  const updateOptimistically = useCallback((optimisticValue: T) => {
    rollbackValueRef.current = state;
    setIsOptimistic(true);
    setState(prev => updateFn(prev, optimisticValue));
  }, [state, updateFn]);

  const confirm = useCallback(() => {
    setIsOptimistic(false);
  }, []);

  const rollback = useCallback(() => {
    setIsOptimistic(false);
    setState(rollbackValueRef.current);
  }, []);

  return {
    state,
    isOptimistic,
    updateOptimistically,
    confirm,
    rollback,
    setState,
  };
}

export default useAsync;
