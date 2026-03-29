// Debounce Hook — delays value updates until user stops typing
// Use this instead of passing raw params to expensive effects.

import { useState, useEffect, useRef } from 'react';

export function useDebouncedValue<T>(value: T, delayMs: number = 500): T {
  const [debounced, setDebounced] = useState<T>(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, delayMs]);

  return debounced;
}

export default useDebouncedValue;
