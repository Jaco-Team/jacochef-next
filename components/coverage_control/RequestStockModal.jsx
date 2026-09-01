"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";

import MyModal from "@/ui/MyModal";
import { MyAutocomplite } from "@/ui/Forms";
import { formatValue } from "./utils";

export default function RequestStockModal({
  open,
  onClose,
  onSubmit,
  supplierName = "",
  materials = [],
  initialMaterialIds = [],
  loading = false,
  saving = false,
}) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!open) return;

    const initialIds = new Set((initialMaterialIds || []).map(String));
    const preselected = materials.filter((item) => initialIds.has(String(item.id)));
    setSelected(preselected.length ? preselected : []);
  }, [open, materials, initialMaterialIds]);

  const handleSubmit = () => {
    if (loading || saving || !selected.length) return;
    onSubmit?.(selected.map((item) => item.id));
  };

  return (
    <MyModal
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title="Запросить остатки"
    >
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2}>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              Поставщик: {formatValue(supplierName)}
            </Typography>
            <MyAutocomplite
              label="Сырьё у поставщика"
              data={materials}
              value={selected}
              multiple={true}
              func={(event, value) => setSelected(Array.isArray(value) ? value : [])}
            />
            {!materials.length ? (
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                }}
              >
                У поставщика нет доступного сырья для запроса
              </Typography>
            ) : null}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          variant="contained"
          disabled={loading || saving || !selected.length}
          onClick={handleSubmit}
        >
          Отправить запрос
        </Button>
      </DialogActions>
    </MyModal>
  );
}
