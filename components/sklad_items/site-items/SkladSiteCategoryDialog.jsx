"use client";

import { useEffect, useState } from "react";
import { Button, DialogActions, DialogContent, Stack } from "@mui/material";

import { MySelect, MyTextInput } from "@/ui/Forms";
import MyModal from "@/ui/MyModal";

export default function SkladSiteCategoryDialog({
  open,
  loading = false,
  parentOptions = [],
  onClose,
  onSubmit,
}) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("0");

  useEffect(() => {
    if (open) {
      setName("");
      setParentId("0");
    }
  }, [open]);

  const submit = () => {
    const normalizedName = name.trim();

    if (normalizedName) {
      onSubmit({ name: normalizedName, parent_id: Number(parentId) || 0 });
    }
  };

  return (
    <MyModal
      open={open}
      onClose={loading ? undefined : onClose}
      title="Новая категория товаров сайта"
      maxWidth="sm"
    >
      <DialogContent>
        <Stack spacing={2}>
          <MyTextInput
            label="Название"
            value={name}
            disabled={loading}
            func={(event) => setName(event.target.value)}
            autoFocus
          />
          <MySelect
            label="Родительская категория"
            data={[{ id: "0", name: "Без родительской категории" }, ...parentOptions]}
            is_none={false}
            value={parentId}
            disabled={loading}
            func={(event) => setParentId(event.target.value)}
          />
        </Stack>
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
