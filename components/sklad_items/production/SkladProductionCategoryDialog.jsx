"use client";

import { useEffect, useState } from "react";
import { Stack } from "@mui/material";

import { JacoButton, JacoModal, JacoTextInput } from "@/design-system/shared/ui";

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
    <JacoModal
      open={open}
      onClose={loading ? undefined : onClose}
      title="Новая категория рецептов и полуфабрикатов"
      maxWidth="sm"
      actions={
        <Stack
          direction="row"
          spacing={1.5}
        >
          <JacoButton
            tone="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Отмена
          </JacoButton>
          <JacoButton
            onClick={submit}
            loading={loading}
            disabled={!name.trim()}
          >
            Создать
          </JacoButton>
        </Stack>
      }
    >
      <JacoTextInput
        label="Название"
        value={name}
        disabled={loading}
        onChange={(event) => setName(event.target.value)}
        autoFocus
      />
    </JacoModal>
  );
}
