import { Result } from './types/result';

export function resultify<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => Result<ReturnType<T>> {
  return (...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      return { ok: true, value: result };
    } catch (error) {
      if (error instanceof Error) return { ok: false, error };
      return { ok: false, error: new Error(`${error}`) };
    }
  };
}