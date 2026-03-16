/**
 * Functional Programming Utilities - Pipe, Compose, and Higher-Order Functions
 */

export const pipe = <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
  fns.reduce((acc, fn) => fn(acc), value);

export const pipeAsync = <T>(...fns: Array<(arg: T) => Promise<T> | T>) =>
  async (value: T): Promise<T> => {
    let result = value;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  };

export const compose = <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
  fns.reduceRight((acc, fn) => fn(acc), value);

export const identity = <T>(value: T): T => value;

export const constant = <T>(value: T) => (): T => value;

export const tap = <T>(fn: (value: T) => void) => (value: T): T => {
  fn(value);
  return value;
};

export const when = <T>(
  predicate: (value: T) => boolean,
  fn: (value: T) => T
) => (value: T): T =>
  predicate(value) ? fn(value) : value;

export const unless = <T>(
  predicate: (value: T) => boolean,
  fn: (value: T) => T
) => (value: T): T =>
  predicate(value) ? value : fn(value);

export const curry = <T extends (...args: any[]) => any>(fn: T) => {
  const arity = fn.length;
  return function curried(...args: any[]): any {
    if (args.length >= arity) {
      return fn(...args);
    }
    return (...moreArgs: any[]) => curried(...args, ...moreArgs);
  };
};

export const partial = <T extends (...args: any[]) => any>(
  fn: T,
  ...partialArgs: any[]
) => (...args: any[]) => fn(...partialArgs, ...args);

export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const once = <T extends (...args: any[]) => any>(fn: T): T => {
  let called = false;
  let result: ReturnType<T>;
  return ((...args: Parameters<T>) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  }) as T;
};

export const not = <T extends (...args: any[]) => boolean>(fn: T) =>
  (...args: Parameters<T>): boolean => !fn(...args);

export const all = <T>(...predicates: Array<(value: T) => boolean>) =>
  (value: T): boolean => predicates.every(predicate => predicate(value));

export const any = <T>(...predicates: Array<(value: T) => boolean>) =>
  (value: T): boolean => predicates.some(predicate => predicate(value));
