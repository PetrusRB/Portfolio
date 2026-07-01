type Listener<T> = (value: T, prev: T) => void;

interface State<T> {
  get: () => T;
  set: (value: T | ((prev: T) => T)) => void;
  subscribe: (listener: Listener<T>) => () => void;
}

export function useState<T>(initial: T): State<T> {
  let value = initial;
  const listeners = new Set<Listener<T>>();

  return {
    get: () => value,
    set: (next) => {
      const prev = value;
      value = typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
      listeners.forEach((fn) => fn(value, prev));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
