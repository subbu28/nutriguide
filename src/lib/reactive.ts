/**
 * Reactive Utilities - Observable Pattern for State Management
 * Implements Observer/Observable pattern with functional programming
 */

type Subscriber<T> = (value: T) => void;
type Unsubscribe = () => void;
type Operator<T, U> = (source: Observable<T>) => Observable<U>;

export class Observable<T> {
  private subscribers: Set<Subscriber<T>> = new Set();
  private _value: T;

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get value(): T {
    return this._value;
  }

  subscribe(subscriber: Subscriber<T>): Unsubscribe {
    this.subscribers.add(subscriber);
    subscriber(this._value);
    return () => this.subscribers.delete(subscriber);
  }

  next(value: T): void {
    this._value = value;
    this.subscribers.forEach(sub => sub(value));
  }

  pipe<U>(...operators: Operator<any, any>[]): Observable<U> {
    return operators.reduce(
      (source, operator) => operator(source),
      this as Observable<any>
    ) as Observable<U>;
  }
}

export const createObservable = <T>(initialValue: T): Observable<T> =>
  new Observable(initialValue);

export const map = <T, U>(fn: (value: T) => U): Operator<T, U> =>
  (source: Observable<T>) => {
    const result = new Observable<U>(fn(source.value));
    source.subscribe(value => result.next(fn(value)));
    return result;
  };

export const filter = <T>(predicate: (value: T) => boolean): Operator<T, T> =>
  (source: Observable<T>) => {
    const result = new Observable<T>(source.value);
    source.subscribe(value => {
      if (predicate(value)) result.next(value);
    });
    return result;
  };

export const distinctUntilChanged = <T>(): Operator<T, T> =>
  (source: Observable<T>) => {
    let prev = source.value;
    const result = new Observable<T>(prev);
    source.subscribe(value => {
      if (value !== prev) {
        prev = value;
        result.next(value);
      }
    });
    return result;
  };

export const debounceTime = <T>(ms: number): Operator<T, T> =>
  (source: Observable<T>) => {
    const result = new Observable<T>(source.value);
    let timeoutId: number;
    source.subscribe(value => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => result.next(value), ms);
    });
    return result;
  };

export const throttleTime = <T>(ms: number): Operator<T, T> =>
  (source: Observable<T>) => {
    const result = new Observable<T>(source.value);
    let lastEmit = 0;
    source.subscribe(value => {
      const now = Date.now();
      if (now - lastEmit >= ms) {
        lastEmit = now;
        result.next(value);
      }
    });
    return result;
  };

export const combineLatest = <T extends any[]>(
  ...observables: { [K in keyof T]: Observable<T[K]> }
): Observable<T> => {
  const values = observables.map(o => o.value) as T;
  const result = new Observable<T>(values);
  
  observables.forEach((observable, index) => {
    observable.subscribe(value => {
      values[index] = value;
      result.next([...values] as T);
    });
  });
  
  return result;
};

export const merge = <T>(...observables: Observable<T>[]): Observable<T> => {
  const result = new Observable<T>(observables[0].value);
  observables.forEach(observable => {
    observable.subscribe(value => result.next(value));
  });
  return result;
};

export const switchMap = <T, U>(fn: (value: T) => Observable<U>): Operator<T, U> =>
  (source: Observable<T>) => {
    let innerUnsub: Unsubscribe | null = null;
    const initial = fn(source.value);
    const result = new Observable<U>(initial.value);
    
    source.subscribe(value => {
      if (innerUnsub) innerUnsub();
      const inner = fn(value);
      innerUnsub = inner.subscribe(innerValue => result.next(innerValue));
    });
    
    return result;
  };

export const tap = <T>(fn: (value: T) => void): Operator<T, T> =>
  (source: Observable<T>) => {
    const result = new Observable<T>(source.value);
    source.subscribe(value => {
      fn(value);
      result.next(value);
    });
    return result;
  };

export const scan = <T, U>(
  fn: (acc: U, value: T) => U,
  initial: U
): Operator<T, U> =>
  (source: Observable<T>) => {
    let acc = initial;
    const result = new Observable<U>(fn(acc, source.value));
    source.subscribe(value => {
      acc = fn(acc, value);
      result.next(acc);
    });
    return result;
  };

export class Subject<T> extends Observable<T> {
  constructor() {
    super(undefined as T);
  }

  emit(value: T): void {
    this.next(value);
  }
}

export class BehaviorSubject<T> extends Observable<T> {
  constructor(initialValue: T) {
    super(initialValue);
  }

  emit(value: T): void {
    this.next(value);
  }

  getValue(): T {
    return this.value;
  }
}
