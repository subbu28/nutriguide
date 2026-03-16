/**
 * Functional Programming Utilities for Frontend
 * Implements Result/Either, Option/Maybe, and utility functions
 */

// ============ Result Type (Either Monad) ============

export type Result<T, E = Error> = Success<T> | Failure<E>;

interface Success<T> {
  readonly _tag: 'Success';
  readonly value: T;
}

interface Failure<E> {
  readonly _tag: 'Failure';
  readonly error: E;
}

export const success = <T>(value: T): Success<T> => ({ _tag: 'Success', value });
export const failure = <E>(error: E): Failure<E> => ({ _tag: 'Failure', error });

export const isSuccess = <T, E>(r: Result<T, E>): r is Success<T> => r._tag === 'Success';
export const isFailure = <T, E>(r: Result<T, E>): r is Failure<E> => r._tag === 'Failure';

export const mapResult = <T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E> =>
  isSuccess(r) ? success(fn(r.value)) : r;

export const flatMapResult = <T, U, E>(r: Result<T, E>, fn: (v: T) => Result<U, E>): Result<U, E> =>
  isSuccess(r) ? fn(r.value) : r;

export const getOrElse = <T, E>(r: Result<T, E>, defaultValue: T): T =>
  isSuccess(r) ? r.value : defaultValue;

export const fold = <T, E, U>(r: Result<T, E>, onSuccess: (v: T) => U, onFailure: (e: E) => U): U =>
  isSuccess(r) ? onSuccess(r.value) : onFailure(r.error);

export const tryCatch = <T>(fn: () => T): Result<T, Error> => {
  try {
    return success(fn());
  } catch (e) {
    return failure(e instanceof Error ? e : new Error(String(e)));
  }
};

export const tryCatchAsync = async <T>(fn: () => Promise<T>): Promise<Result<T, Error>> => {
  try {
    return success(await fn());
  } catch (e) {
    return failure(e instanceof Error ? e : new Error(String(e)));
  }
};

// ============ Option Type (Maybe Monad) ============

export type Option<T> = Some<T> | None;

interface Some<T> {
  readonly _tag: 'Some';
  readonly value: T;
}

interface None {
  readonly _tag: 'None';
}

export const some = <T>(value: T): Some<T> => ({ _tag: 'Some', value });
export const none: None = { _tag: 'None' };

export const isSome = <T>(o: Option<T>): o is Some<T> => o._tag === 'Some';
export const isNone = <T>(o: Option<T>): o is None => o._tag === 'None';

export const fromNullable = <T>(value: T | null | undefined): Option<T> =>
  value != null ? some(value) : none;

export const mapOption = <T, U>(o: Option<T>, fn: (v: T) => U): Option<U> =>
  isSome(o) ? some(fn(o.value)) : none;

export const flatMapOption = <T, U>(o: Option<T>, fn: (v: T) => Option<U>): Option<U> =>
  isSome(o) ? fn(o.value) : none;

export const getOrElseOption = <T>(o: Option<T>, defaultValue: T): T =>
  isSome(o) ? o.value : defaultValue;

// ============ Pipe & Compose ============

export const pipe = <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
  fns.reduce((acc, fn) => fn(acc), value);

export const pipeWith = <T>(value: T, ...fns: Array<(arg: T) => T>): T =>
  fns.reduce((acc, fn) => fn(acc), value);

export const compose = <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
  fns.reduceRight((acc, fn) => fn(acc), value);

// ============ Array Utilities (Immutable) ============

export const head = <T>(arr: readonly T[]): Option<T> =>
  arr.length > 0 ? some(arr[0]) : none;

export const tail = <T>(arr: readonly T[]): T[] =>
  arr.length > 0 ? arr.slice(1) : [];

export const last = <T>(arr: readonly T[]): Option<T> =>
  arr.length > 0 ? some(arr[arr.length - 1]) : none;

export const init = <T>(arr: readonly T[]): T[] =>
  arr.length > 0 ? arr.slice(0, -1) : [];

export const take = <T>(n: number) => (arr: readonly T[]): T[] =>
  arr.slice(0, n);

export const drop = <T>(n: number) => (arr: readonly T[]): T[] =>
  arr.slice(n);

export const takeWhile = <T>(predicate: (v: T) => boolean) => (arr: readonly T[]): T[] => {
  const result: T[] = [];
  for (const item of arr) {
    if (!predicate(item)) break;
    result.push(item);
  }
  return result;
};

export const dropWhile = <T>(predicate: (v: T) => boolean) => (arr: readonly T[]): T[] => {
  let dropping = true;
  return arr.filter(item => {
    if (dropping && predicate(item)) return false;
    dropping = false;
    return true;
  });
};

export const groupBy = <T, K extends string | number>(fn: (v: T) => K) => (arr: readonly T[]): Record<K, T[]> =>
  arr.reduce((acc, item) => {
    const key = fn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);

export const partition = <T>(predicate: (v: T) => boolean) => (arr: readonly T[]): [T[], T[]] =>
  arr.reduce<[T[], T[]]>(
    ([pass, fail], item) => {
      (predicate(item) ? pass : fail).push(item);
      return [pass, fail];
    },
    [[], []]
  );

export const unique = <T>(arr: readonly T[]): T[] => [...new Set(arr)];

export const uniqueBy = <T, K>(fn: (v: T) => K) => (arr: readonly T[]): T[] => {
  const seen = new Set<K>();
  return arr.filter(item => {
    const key = fn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const sortBy = <T>(fn: (v: T) => number | string) => (arr: readonly T[]): T[] =>
  [...arr].sort((a, b) => {
    const va = fn(a);
    const vb = fn(b);
    return va < vb ? -1 : va > vb ? 1 : 0;
  });

export const chunk = <T>(size: number) => (arr: readonly T[]): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

export const flatten = <T>(arr: readonly (readonly T[])[]): T[] =>
  arr.reduce<T[]>((acc, item) => acc.concat(item as T[]), []);

export const zip = <T, U>(arr1: readonly T[], arr2: readonly U[]): [T, U][] =>
  arr1.slice(0, Math.min(arr1.length, arr2.length)).map((v, i) => [v, arr2[i]]);

// ============ Object Utilities (Immutable) ============

export const pick = <T extends object, K extends keyof T>(keys: K[]) => (obj: T): Pick<T, K> =>
  keys.reduce((acc, key) => {
    if (key in obj) acc[key] = obj[key];
    return acc;
  }, {} as Pick<T, K>);

export const omit = <T extends object, K extends keyof T>(keys: K[]) => (obj: T): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

export const mapValues = <T extends object, U>(fn: (v: T[keyof T]) => U) => (obj: T): Record<keyof T, U> =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, fn(v as T[keyof T])])
  ) as Record<keyof T, U>;

export const filterObject = <T extends object>(predicate: (v: T[keyof T], k: keyof T) => boolean) => (obj: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(obj).filter(([k, v]) => predicate(v as T[keyof T], k as keyof T))
  ) as Partial<T>;

// ============ Misc Utilities ============

export const identity = <T>(v: T): T => v;
export const constant = <T>(v: T) => (): T => v;
export const noop = (): void => {};

export const not = <T extends (...args: any[]) => boolean>(fn: T) =>
  (...args: Parameters<T>): boolean => !fn(...args);

export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

export const debounce = <T extends (...args: any[]) => any>(fn: T, ms: number) => {
  let id: number;
  return (...args: Parameters<T>) => {
    clearTimeout(id);
    id = window.setTimeout(() => fn(...args), ms);
  };
};

export const throttle = <T extends (...args: any[]) => any>(fn: T, ms: number) => {
  let last = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  };
};
