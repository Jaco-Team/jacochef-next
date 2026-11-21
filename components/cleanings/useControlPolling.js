import { useEffect, useRef } from "react";

export const CONTROL_POLL_INTERVAL_MS = 60_000;

function isPageVisible() {
  return document.visibilityState === "visible";
}

// Calls `onPoll` once `intervalMs` passed since `lastCheckedAt` (ms of the last finished load) while
// `enabled` and the browser tab is visible; a tab shown again after the interval is refreshed at once.
export default function useControlPolling({
  enabled,
  lastCheckedAt,
  onPoll,
  intervalMs = CONTROL_POLL_INTERVAL_MS,
}) {
  const onPollRef = useRef(onPoll);
  onPollRef.current = onPoll;

  useEffect(() => {
    if (!enabled || !lastCheckedAt) {
      return undefined;
    }

    const pollIfVisible = () => {
      if (isPageVisible()) {
        onPollRef.current();
      }
    };
    const pollIfDue = () => {
      if (Date.now() - lastCheckedAt >= intervalMs) {
        pollIfVisible();
      }
    };

    // A hidden tab skips the tick; `visibilitychange` catches up when it is shown again.
    const timer = window.setTimeout(
      pollIfVisible,
      Math.max(0, lastCheckedAt + intervalMs - Date.now()),
    );
    document.addEventListener("visibilitychange", pollIfDue);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", pollIfDue);
    };
  }, [enabled, intervalMs, lastCheckedAt]);
}
