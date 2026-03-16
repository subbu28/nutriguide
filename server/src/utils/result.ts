/**
 * Result Type - Functional Programming Pattern for Error Handling
 * Implements Either monad pattern for type-safe error handling
 */

export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  readonly _tag: 'Success';
  readonly value: T;
}

export interface Failure<E> {
  readonly _tag: 'Failure';
  readonly error: E;
}

export const success = <T>(value: T): Success<T> => ({
  _tag: 'Success',
  value,
});

export const failure = <E>(error: E): Failure<E> => ({
  _tag: 'Failure',
  error,
});

export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T> =>
  result._tag === 'Success';

export const isFailure = <T, E>(result: Result<T, E>): result is Failure<E> =>
  result._tag === 'Failure';

export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> =>
  isSuccess(result) ? success(fn(result.value)) : result;

export const flatMap = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> =>
  isSuccess(result) ? fn(result.value) : result;

export const mapError = <T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> =>
  isFailure(result) ? failure(fn(result.error)) : result;

export const fold = <T, E, U>(
  result: Result<T, E>,
  onSuccess: (value: T) => U,
  onFailure: (error: E) => U
): U =>
  isSuccess(result) ? onSuccess(result.value) : onFailure(result.error);

export const getOrElse = <T, E>(result: Result<T, E>, defaultValue: T): T =>
  isSuccess(result) ? result.value : defaultValue;

export const getOrThrow = <T, E>(result: Result<T, E>): T => {
  if (isSuccess(result)) return result.value;
  throw result.error;
};

export const tryCatch = <T>(fn: () => T): Result<T, Error> => {
  try {
    return success(fn());
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)));
  }
};

export const tryCatchAsync = async <T>(
  fn: () => Promise<T>
): Promise<Result<T, Error>> => {
  try {
    return success(await fn());
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)));
  }
};

export const fromNullable = <T>(
  value: T | null | undefined,
  error: Error = new Error('Value is null or undefined')
): Result<T, Error> =>
  value !== null && value !== undefined ? success(value) : failure(error);

export const combine = <T, E>(results: Result<T, E>[]): Result<T[], E> => {
  const values: T[] = [];
  for (const result of results) {
    if (isFailure(result)) return result;
    values.push(result.value);
  }
  return success(values);
};

export const combineObject = <T extends Record<string, unknown>, E>(
  results: { [K in keyof T]: Result<T[K], E> }
): Result<T, E> => {
  const obj = {} as T;
  for (const key in results) {
    const result = results[key];
    if (isFailure(result)) return result;
    obj[key] = result.value;
  }
  return success(obj);
};
