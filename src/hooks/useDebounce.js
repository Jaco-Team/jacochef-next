"use client";

import { useCallback, useEffect, useRef } from "react";

export function useDebounce(fn, delay = 300) {
  const fnRef = useRef(fn);
  const timerRef = useRef(null);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const debouncedFn = useCallback(
    (...args) => {
      cancel();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        fnRef.current(...args);
      }, delay);
    },
    [cancel, delay],
  );

  debouncedFn.cancel = cancel;

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return debouncedFn;
}
