"use client";

import { useMemo } from "react";
import { Button, DialogActions, DialogContent, Stack, Typography } from "@mui/material";
import { MyAutocomplite } from "@/ui/Forms";
import MyModal from "@/ui/MyModal";

export default function ModalAddProduct({
  open,
  onClose,
  onSubmit,
  isLoading,
  itemsSelectData,
  selectedCatalogItemId,
  setSelectedCatalogItemId,
  vendorItemIds,
}) {
  const selectedCatalogItem = useMemo(
    () => itemsSelectData.find((item) => String(item.id) === String(selectedCatalogItemId)) || null,
    [itemsSelectData, selectedCatalogItemId],
  );

  return (
    <MyModal
      open={open}
      onClose={onClose}
      title="Добавить продукт"
      maxWidth="sm"
    >
      <DialogContent>
        <Stack spacing={1}>
          <MyAutocomplite
            multiple={false}
            label="Продукт"
            data={itemsSelectData}
            value={selectedCatalogItem}
            func={(_, value) => setSelectedCatalogItemId(value?.id || "")}
            disabled={isLoading || !itemsSelectData.length}
          />
          {!itemsSelectData.length ? (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Нет доступных товаров для добавления.
            </Typography>
          ) : null}
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
          onClick={onSubmit}
          disabled={
            isLoading || !selectedCatalogItemId || vendorItemIds.has(Number(selectedCatalogItemId))
          }
        >
          Добавить
        </Button>
      </DialogActions>
    </MyModal>
  );
}
