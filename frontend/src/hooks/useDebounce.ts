import { useState, useEffect } from 'react';

// Delays passing text values forward until a specified delay window passes (e.g., 300ms)
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer); // Resets the timer instantly if you hit another key!
    };
  }, [value, delay]);

  return debouncedValue;
}