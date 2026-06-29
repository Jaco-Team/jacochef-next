import { useCallback, useState } from "react";
import { Box, Typography } from "@mui/material";
import V2Button from "./Button";
import V2Modal from "./Modal";

const DEFAULT_OPTIONS = {
  title: "Предупреждение",
  message: "Подтвердите действие",
  cancelLabel: "Нет",
  confirmLabel: "ОК",
};

export function useConfirm() {
  const [resolver, setResolver] = useState(null);
  const [state, setState] = useState({
    open: false,
    ...DEFAULT_OPTIONS,
  });

  const close = useCallback(
    (result) => {
      setState((prev) => ({ ...prev, open: false }));
      resolver?.(result);
      setResolver(null);
    },
    [resolver],
  );

  const confirm = useCallback((options = {}) => {
    setState({
      open: true,
      ...DEFAULT_OPTIONS,
      ...options,
    });

    return new Promise((resolve) => {
      setResolver(() => resolve);
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
      <V2Modal
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
            <V2Button
              tone="secondary"
              compact
              onClick={handleCancel}
              sx={{ minWidth: 86, borderRadius: "10px", fontWeight: 500, fontSize: 16 }}
            >
              {state.cancelLabel}
            </V2Button>
            <V2Button
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
            </V2Button>
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
      </V2Modal>
    ),
    [state, handleCancel],
  );

  return { confirm, withConfirm, ConfirmDialog };
}
