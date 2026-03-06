"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";

export default function AdsAddConnectionModal({
  api_laravel,
  isOpened,
  onClose,
  onSuccess,
  showAlert,
}) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    provider: "yandex_direct",
    name: "",
    title: "",
  });

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api_laravel("create", form);
      if (!res?.st) throw new Error(res?.message || "Ошибка создания");

      onClose();
      await onSuccess?.();
    } catch (e) {
      showAlert?.(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpened}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Add connection</DialogTitle>
      <DialogContent>
        <Stack
          spacing={2}
          mt={1}
        >
          <TextField
            fullWidth
            label="Провайдер"
            value={form.provider}
            onChange={(e) => setField("provider", e.target.value)}
            disabled
          />
          <TextField
            fullWidth
            label="Логин"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
          <TextField
            fullWidth
            label="Название (для отображения в интерфейсе)"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !form.provider}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
