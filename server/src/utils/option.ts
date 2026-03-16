/**
 * Option Type - Functional Programming Pattern for Nullable Values
 * Implements Maybe/Optional monad pattern
 */

export type Option<T> = Some<T> | None;

export interface Some<T> {
  readonly _tag: 'Some';
  readonly value: T;
}

export interface None {
  readonly _tag: 'None';
}

export const some = <T>(value: T): Some<T> => ({
  _tag: 'Some',
  value,
});

export const none: None = { _tag: 'None' };

export const isSome = <T>(option: Option<T>): option is Some<T> =>
  option._tag === 'Some';

export const isNone = <T>(option: Option<T>): option is None =>
  option._tag === 'None';

export const fromNullable = <T>(value: T | null | undefined): Option<T> =>
  value !== null && value !== undefined ? some(value) : none;

export const map = <T, U>(option: Option<T>, fn: (value: T) => U): Option<U> =>
  isSome(option) ? some(fn(option.value)) : none;

export const flatMap = <T, U>(
  option: Option<T>,
  fn: (value: T) => Option<U>
): Option<U> =>
  isSome(option) ? fn(option.value) : none;

export const filter = <T>(
  option: Option<T>,
  predicate: (value: T) => boolean
): Option<T> =>
  isSome(option) && predicate(option.value) ? option : none;

export const fold = <T, U>(
  option: Option<T>,
  onNone: () => U,
  onSome: (value: T) => U
): U =>
  isSome(option) ? onSome(option.value) : onNone();

export const getOrElse = <T>(option: Option<T>, defaultValue: T): T =>
  isSome(option) ? option.value : defaultValue;

export const getOrElseLazy = <T>(option: Option<T>, getDefault: () => T): T =>
  isSome(option) ? option.value : getDefault();

export const orElse = <T>(option: Option<T>, alternative: Option<T>): Option<T> =>
  isSome(option) ? option : alternative;

export const toArray = <T>(option: Option<T>): T[] =>
  isSome(option) ? [option.value] : [];

export const toNullable = <T>(option: Option<T>): T | null =>
  isSome(option) ? option.value : null;

export const toUndefined = <T>(option: Option<T>): T | undefined =>
  isSome(option) ? option.value : undefined;

export const zip = <T, U>(
  optionT: Option<T>,
  optionU: Option<U>
): Option<[T, U]> =>
  isSome(optionT) && isSome(optionU)
    ? some([optionT.value, optionU.value])
    : none;

export const sequence = <T>(options: Option<T>[]): Option<T[]> => {
  const values: T[] = [];
  for (const option of options) {
    if (isNone(option)) return none;
    values.push(option.value);
  }
  return some(values);
};

export const traverse = <T, U>(
  values: T[],
  fn: (value: T) => Option<U>
): Option<U[]> => {
  const results: U[] = [];
  for (const value of values) {
    const result = fn(value);
    if (isNone(result)) return none;
    results.push(result.value);
  }
  return some(results);
};
