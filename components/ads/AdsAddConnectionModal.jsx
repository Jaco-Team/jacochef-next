"use client";

import { useState } from "react";
import { Box, Typography, Button, Stack, TextField } from "@mui/material";
import MyModal from "@/ui/MyModal";
import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";

export default function AdsAddConnectionModal({ isOpened, onClose, onSuccess }) {
  const { api_laravel } = useApi("ads");
  const { showAlert } = useMyAlert();

  const [provider, setProvider] = useState("yandex_direct");
  const [externalAccountId, setExternalAccountId] = useState("");
  const [name, setName] = useState("");

  const handleCreate = async () => {
    try {
      const res = await api_laravel("create", {
        provider,
        external_account_id: externalAccountId,
        name,
      });
      if (!res?.st) throw new Error(res?.message || "Ошибка создания");

      onSuccess?.();
      onClose?.();
    } catch (e) {
      showAlert(e?.message || "Ошибка");
    }
  };

  return (
    <MyModal
      open={isOpened}
      onClose={onClose}
      title="Добавить рекламный кабинет"
    >
      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography
            variant="body2"
            sx={{ opacity: 0.7 }}
          >
            Здесь будет форма добавления нового рекламного кабинета.
          </Typography>

          <TextField
            label="Provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            fullWidth
          />

          <TextField
            label="External account id"
            value={externalAccountId}
            onChange={(e) => setExternalAccountId(e.target.value)}
            fullWidth
          />

          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />

          <Button
            variant="contained"
            onClick={handleCreate}
          >
            Добавить
          </Button>
        </Stack>
      </Box>
    </MyModal>
  );
}
