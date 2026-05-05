"use client";

import { useEffect, useState } from "react";
import { Button, DialogActions, DialogContent, Stack } from "@mui/material";
import dayjs from "dayjs";
import { MyDatePickerNew } from "@/ui/Forms";
import MyModal from "@/ui/MyModal";

export default function DeclarationEditDialog({ declaration, isLoading, onClose, onSubmit, open }) {
  const [expiresAt, setExpiresAt] = useState(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setExpiresAt(
      declaration?.expires_at && dayjs(declaration.expires_at).isValid()
        ? dayjs(declaration.expires_at)
        : null,
    );
  }, [declaration, open]);

  const submitDisabled = !declaration?.id || !expiresAt || !dayjs(expiresAt).isValid() || isLoading;

  const handleSubmit = async () => {
    const isSaved = await onSubmit(declaration.id, expiresAt);

    if (isSaved) {
      onClose();
    }
  };

  return (
    <MyModal
      open={open}
      onClose={onClose}
      title="Редактировать декларацию"
      maxWidth="sm"
    >
      <DialogContent>
        <Stack spacing={2}>
          <MyDatePickerNew
            size="small"
            label="Действует до"
            required
            value={expiresAt}
            func={(value) => setExpiresAt(value || null)}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          disabled={isLoading}
        >
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitDisabled}
        >
          Сохранить
        </Button>
      </DialogActions>
    </MyModal>
  );
}
