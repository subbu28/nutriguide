/**
 * React Hook for Observable Integration
 * Bridges reactive observables with React component lifecycle
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Observable, BehaviorSubject, createObservable } from '../lib/reactive';

export function useObservable<T>(observable: Observable<T>): T {
  const [value, setValue] = useState<T>(observable.value);

  useEffect(() => {
    const unsubscribe = observable.subscribe(setValue);
    return unsubscribe;
  }, [observable]);

  return value;
}

export function useBehaviorSubject<T>(
  initialValue: T
): [T, (value: T) => void, BehaviorSubject<T>] {
  const subjectRef = useRef<BehaviorSubject<T>>();
  
  if (!subjectRef.current) {
    subjectRef.current = new BehaviorSubject(initialValue);
  }

  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const unsubscribe = subjectRef.current!.subscribe(setValue);
    return unsubscribe;
  }, []);

  const emit = useCallback((newValue: T) => {
    subjectRef.current!.emit(newValue);
  }, []);

  return [value, emit, subjectRef.current];
}

export function useObservableState<T>(
  initialValue: T
): [T, (value: T) => void, Observable<T>] {
  const observableRef = useRef<Observable<T>>();
  
  if (!observableRef.current) {
    observableRef.current = createObservable(initialValue);
  }

  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const unsubscribe = observableRef.current!.subscribe(setValue);
    return unsubscribe;
  }, []);

  const update = useCallback((newValue: T) => {
    observableRef.current!.next(newValue);
  }, []);

  return [value, update, observableRef.current];
}

export function useObservableEffect<T>(
  observable: Observable<T>,
  effect: (value: T) => void | (() => void),
  deps: any[] = []
): void {
  useEffect(() => {
    let cleanup: (() => void) | void;
    
    const unsubscribe = observable.subscribe((value) => {
      if (cleanup) cleanup();
      cleanup = effect(value);
    });

    return () => {
      unsubscribe();
      if (cleanup) cleanup();
    };
  }, [observable, ...deps]);
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastExecuted.current;

    if (elapsed >= interval) {
      lastExecuted.current = now;
      setThrottledValue(value);
    } else {
      const timerId = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval - elapsed);

      return () => clearTimeout(timerId);
    }
  }, [value, interval]);

  return throttledValue;
}
