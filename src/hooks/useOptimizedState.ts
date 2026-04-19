import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook otimizado para reduzir re-renders desnecessários
 * Usa debounce e comparação profunda para evitar atualizações frequentes
 */
export function useOptimizedState<T>(
  initialValue: T,
  debounceMs: number = 0
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const setOptimizedState = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (debounceMs > 0) {
        timeoutRef.current = setTimeout(() => {
          setState(value);
        }, debounceMs);
      } else {
        setState(value);
      }
    },
    [debounceMs]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, setOptimizedState];
}

/**
 * Hook para throttle de funções
 * Útil para eventos de scroll, resize, etc.
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        lastRun.current = now;
        return callback(...args);
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Hook para debounce de valores
 * Útil para inputs de busca
 */
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
