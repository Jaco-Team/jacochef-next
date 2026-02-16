"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
} from "@mui/material";

export default function AdsOauthCodeModal({ open, connection, onClose, onSubmit }) {
  const [code, setCode] = useState("");

  useEffect(() => {
    if (open) setCode("");
  }, [open]);

  const handleSubmit = () => {
    const v = code.trim();
    if (!v) return;
    onSubmit({ code: v });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Обновить токены c OAuth Code</DialogTitle>
      <DialogContent>
        <Stack
          spacing={2}
          mt={1}
        >
          <Typography
            variant="body2"
            sx={{ opacity: 0.8 }}
          >
            Connection: {connection?.provider || "—"} • {connection?.name || connection?.id || "—"}
          </Typography>

          <TextField
            fullWidth
            label="One-time code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoFocus
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          Exchange
        </Button>
      </DialogActions>
    </Dialog>
  );
}
