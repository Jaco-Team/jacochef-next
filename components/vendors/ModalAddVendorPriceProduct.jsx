"use client";

import { useMemo } from "react";
import { Button, DialogActions, DialogContent, Grid, Stack, Typography } from "@mui/material";
import { MyAutocomplite, MySelect, MyTextInput } from "@/ui/Forms";
import MyModal from "@/ui/MyModal";
import { formatUnitPriceLabel } from "./vendorItemPriceUtils";

export default function ModalAddVendorPriceProduct({
  open,
  onClose,
  onSubmit,
  isLoading,
  catalogSelectOptions,
  addDraft,
  onCatalogItemSelect,
}) {
  const selectedCatalogItem = useMemo(
    () =>
      catalogSelectOptions.find((item) => String(item.id) === String(addDraft?.item_id)) || null,
    [addDraft?.item_id, catalogSelectOptions],
  );

  const canSubmit = Boolean(addDraft?.item_id);

  return (
    <MyModal
      open={open}
      onClose={onClose}
      title="Добавить продукт"
      maxWidth="sm"
    >
      <DialogContent>
        <Stack spacing={2}>
          <MyAutocomplite
            multiple={false}
            label="Продукт"
            data={catalogSelectOptions}
            value={selectedCatalogItem}
            func={onCatalogItemSelect}
            disabled={isLoading || !catalogSelectOptions.length}
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
          onClick={onSubmit}
          disabled={isLoading || !canSubmit}
        >
          Добавить
        </Button>
      </DialogActions>
    </MyModal>
  );
}
