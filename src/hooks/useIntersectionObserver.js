import { useEffect, useRef } from "react";

export function useIntersectionObserver({ enabled = true, onVisible }) {
  const ref = useRef();

  useEffect(() => {
    if (!enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onVisible();
        }
      },
      { threshold: 1 },
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [enabled, onVisible]);

  return ref;
}
