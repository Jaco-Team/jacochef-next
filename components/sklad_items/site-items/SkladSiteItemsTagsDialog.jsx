"use client";

import { useEffect, useState } from "react";

import { Button, DialogActions, DialogContent, Stack } from "@mui/material";

import MyModal from "@/ui/MyModal";
import { MyAutocomplite, MyTextInput } from "@/ui/Forms";

export default function SkladSiteItemsTagsDialog({
  open,
  tags = [],
  onClose,
  onSubmit,
  showAlert,
}) {
  const [selectedTag, setSelectedTag] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setSelectedTag(null);
    setName("");
    setLoading(false);
  }, [open]);

  const submit = async () => {
    if (!selectedTag?.id) {
      showAlert?.("Выберите тег", false);
      return;
    }

    if (!String(name || "").trim()) {
      showAlert?.("Название тега обязательно", false);
      return;
    }

    setLoading(true);

    try {
      const result = await onSubmit?.(selectedTag.id, name);
      showAlert?.(result?.text || "Тег обновлен", true);
      onClose?.();
    } catch (error) {
      showAlert?.(error?.message || "Ошибка сохранения тега", false);
      setLoading(false);
    }
  };

  return (
    <MyModal
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      title="Редактирование тегов"
    >
      <DialogContent dividers>
        <Stack
          spacing={2}
          sx={{ pt: 1 }}
        >
          <MyAutocomplite
            label="Тег"
            multiple={false}
            unifiedPopup
            data={tags}
            value={selectedTag}
            disabled={loading}
            func={(_, value) => {
              setSelectedTag(value || null);
              setName(value?.name || "");
            }}
          />
          <MyTextInput
            label="Новое название"
            value={name}
            disabled={loading}
            func={(event) => setName(event.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          disabled={loading}
          onClick={onClose}
        >
          Закрыть
        </Button>
        <Button
          variant="contained"
          disabled={loading || !selectedTag?.id || !String(name || "").trim()}
          onClick={submit}
        >
          {loading ? "Сохраняем..." : "Сохранить"}
        </Button>
      </DialogActions>
    </MyModal>
  );
}
