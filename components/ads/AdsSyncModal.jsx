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

const DAYS_DEFAULT = "7";
export default function AdsSyncModal({ open, connection, onClose, onSubmit }) {
  const [days, setDays] = useState(DAYS_DEFAULT);

  useEffect(() => {
    if (open) setDays(DAYS_DEFAULT);
  }, [open]);

  const handleSubmit = () => {
    const n = Number(days);
    if (!Number.isFinite(n) || n < 1 || n > 90) return;
    onSubmit({ days: n });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Синхронизировать Кабинет</DialogTitle>
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
            label="Days (1..90)"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            inputMode="numeric"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          Start sync
        </Button>
      </DialogActions>
    </Dialog>
  );
}
