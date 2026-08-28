"use client";

import { useEffect, useState } from "react";
import { Button, DialogActions, DialogContent, Stack } from "@mui/material";

import { MyTextInput } from "@/ui/Forms";
import MyModal from "@/ui/MyModal";

export default function SkladProductionCategoryDialog({
  open,
  loading = false,
  onClose,
  onSubmit,
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
    }
  }, [open]);

  const submit = () => {
    const normalizedName = name.trim();

    if (normalizedName) {
      onSubmit(normalizedName);
    }
  };

  return (
    <MyModal
      open={open}
      onClose={loading ? undefined : onClose}
      title="Новая категория рецептов и полуфабрикатов"
      maxWidth="sm"
    >
      <DialogContent>
        <MyTextInput
          label="Название"
          value={name}
          disabled={loading}
          func={(event) => setName(event.target.value)}
          autoFocus
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Stack
          direction="row"
          spacing={1.5}
        >
          <Button
            onClick={onClose}
            disabled={loading}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={submit}
            disabled={loading || !name.trim()}
          >
            Создать
          </Button>
        </Stack>
      </DialogActions>
    </MyModal>
  );
}
