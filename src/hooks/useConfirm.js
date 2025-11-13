"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

export function useConfirm() {
  const [open, setOpen] = useState(false);
  const optsRef = useRef({ message: "", callback: null, delay: 0 });
  const argsRef = useRef([]);
  const textRef = useRef(null);
  const countdownRef = useRef(0);
  const timerRef = useRef(null);
  const isLockedRef = useRef(false); // purely ref — no re-render

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    isLockedRef.current = false;
  };

  const withConfirm = useCallback((callback, message = "Подтвердите действие", delay = 0) => {
    return (...args) => {
      const e = args[0];
      if (e && typeof e === "object") {
        e.stopPropagation?.();
        e.preventDefault?.();
        e.persist?.();
      }
      if (isLockedRef.current) return; // ignore if still active
      argsRef.current = args;
      optsRef.current = { message, callback, delay };
      countdownRef.current = 0;
      setOpen(true);
    };
  }, []);

  const handleCancel = () => {
    stopTimer();
    setOpen(false);
    argsRef.current = [];
  };

  const handleOk = () => {
    const { callback, delay } = optsRef.current;
    if (isLockedRef.current) return;
    isLockedRef.current = true;

    const fire = () => {
      const args = argsRef.current;
      argsRef.current = [];
      stopTimer();
      setOpen(false);
      callback?.(...args);
    };

    if (!delay || delay <= 0) {
      fire();
      return;
    }

    countdownRef.current = delay;
    if (textRef.current)
      textRef.current.textContent = `можно отменить ${countdownRef.current} сек. …`;

    timerRef.current = setInterval(() => {
      countdownRef.current -= 1;
      if (textRef.current)
        textRef.current.textContent = `можно отменить ${countdownRef.current} сек. …`;

      if (countdownRef.current <= 0) {
        fire();
      }
    }, 1000);
  };

  useEffect(() => stopTimer, []);

  const ConfirmDialog = () => (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Требуется подтверждение</DialogTitle>
      <DialogContent>
        <DialogContentText>{optsRef.current.message}</DialogContentText>
        <Typography
          ref={textRef}
          variant="body2"
          sx={{ color: "text.secondary", minHeight: 15 }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCancel}
          autoFocus
        >
          Отмена
        </Button>
        <Button
          onClick={handleOk}
          variant="contained"
          color="primary"
          disabled={isLockedRef.current}
        >
          ОК
        </Button>
      </DialogActions>
    </Dialog>
  );

  return { withConfirm, ConfirmDialog };
}
