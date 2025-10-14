import { useCallback, useEffect, useRef } from "react";

export function useDebounce(fn, delay = 300) {
  const fnRef = useRef(fn);
  const timerRef = useRef(null);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const debouncedFn = useCallback(
    (...args) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        fnRef.current(...args);
      }, delay);
    },
    [delay],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return debouncedFn;
}
