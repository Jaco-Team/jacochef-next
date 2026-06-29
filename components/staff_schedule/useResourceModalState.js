import { useCallback, useRef, useState } from "react";

export default function useResourceModalState(initialState) {
  const initialStateRef = useRef(initialState);
  const [state, setState] = useState(initialState);

  const openLoading = useCallback((nextState = {}) => {
    setState((prev) => ({
      ...prev,
      open: true,
      loading: true,
      error: "",
      ...nextState,
    }));
  }, []);

  const openReady = useCallback((nextState = {}) => {
    setState((prev) => ({
      ...prev,
      open: true,
      loading: false,
      error: "",
      ...nextState,
    }));
  }, []);

  const openError = useCallback((error, nextState = {}) => {
    setState((prev) => ({
      ...prev,
      open: true,
      loading: false,
      error,
      ...nextState,
    }));
  }, []);

  const patch = useCallback((updater) => {
    setState((prev) => (typeof updater === "function" ? updater(prev) : { ...prev, ...updater }));
  }, []);

  const close = useCallback(() => {
    setState(initialStateRef.current);
  }, []);

  return {
    state,
    openLoading,
    openReady,
    openError,
    close,
    patch,
  };
}
