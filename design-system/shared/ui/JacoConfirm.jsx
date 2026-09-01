import { useCallback, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import JacoButton from "./JacoButton";
import JacoModal from "./JacoModal";

const DEFAULT_OPTIONS = {
  title: "Предупреждение",
  message: "Подтвердите действие",
  cancelLabel: "Нет",
  confirmLabel: "ОК",
};

export function useJacoConfirm() {
  const resolverRef = useRef(null);
  const [state, setState] = useState({
    open: false,
    ...DEFAULT_OPTIONS,
  });

  const close = useCallback((result) => {
    setState((prev) => ({ ...prev, open: false }));
    resolverRef.current?.(result);
    resolverRef.current = null;
  }, []);

  const confirm = useCallback((options = {}) => {
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }

    setState({
      open: true,
      ...DEFAULT_OPTIONS,
      ...options,
    });

    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const withConfirm = useCallback(
    (callback, options = {}) => {
      return (...args) => {
        const event = args[0];

        if (event && typeof event === "object") {
          event.stopPropagation?.();
          event.preventDefault?.();
        }

        confirm(options).then((accepted) => {
          if (accepted) {
            callback?.(...args);
          }
        });
      };
    },
    [confirm],
  );

  const handleConfirm = () => close(true);
  const handleCancel = () => close(false);

  const ConfirmDialog = useCallback(
    () => (
      <JacoModal
        open={state.open}
        onClose={handleCancel}
        title={state.title}
        maxWidth="xs"
        titleContainerSx={{
          py: 1.25,
          backgroundColor: "#FF3333",
          borderBottom: "none",
        }}
        titleSx={{ color: "#FFFFFF", fontWeight: 700, fontSize: 16 }}
        closeButtonSx={{ color: "#FFFFFF" }}
        paperSx={{ borderRadius: "12px" }}
        contentSx={{ py: 3 }}
        actionsSx={{ justifyContent: "center", pt: 0, pb: 3, borderTop: "none" }}
        actions={
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, width: "100%" }}>
            <JacoButton
              tone="secondary"
              compact
              onClick={handleCancel}
              sx={{ minWidth: 86, borderRadius: "10px", fontWeight: 500, fontSize: 16 }}
            >
              {state.cancelLabel}
            </JacoButton>
            <JacoButton
              compact
              onClick={handleConfirm}
              tone="secondary"
              sx={{
                minWidth: 122,
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#E5E5E5",
                color: "#666666",
                fontWeight: 500,
                fontSize: 16,
                "&:hover": { backgroundColor: "#DCDCDC" },
              }}
            >
              {state.confirmLabel}
            </JacoButton>
          </Box>
        }
      >
        {typeof state.message === "string" ? (
          <Typography
            sx={{ color: "#666666", fontSize: 20, textAlign: "center", lineHeight: 1.25 }}
          >
            {state.message}
          </Typography>
        ) : (
          state.message
        )}
      </JacoModal>
    ),
    [state, handleCancel, handleConfirm],
  );

  return { confirm, withConfirm, ConfirmDialog };
}
