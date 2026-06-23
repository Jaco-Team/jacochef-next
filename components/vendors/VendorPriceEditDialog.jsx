"use client";

import { Button, DialogActions, DialogContent } from "@mui/material";
import MyModal from "@/ui/MyModal";
import VendorPriceItemForm from "./VendorPriceItemForm";

export default function VendorPriceEditDialog({
  open,
  onClose,
  canEdit,
  cityLabel,
  draft,
  isLoading,
  onCancel,
  onSave,
  onDraftChange,
}) {
  return (
    <MyModal
      open={open}
      onClose={onClose}
      title="Редактирование цены"
      maxWidth="md"
    >
      <DialogContent>
        <VendorPriceItemForm
          canEdit={canEdit}
          cityLabel={cityLabel}
          hideTitle
          hideActions
          draft={draft}
          isLoading={isLoading}
          onCancel={onCancel}
          onSave={onSave}
          onDraftChange={onDraftChange}
        />
      </DialogContent>
      {canEdit ? (
        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 0,
            flexDirection: { xs: "column-reverse", sm: "row" },
            gap: 1,
            "& > :not(style) ~ :not(style)": { ml: { xs: 0, sm: 1 } },
          }}
        >
          <Button
            onClick={onCancel}
            disabled={isLoading}
            fullWidth
            sx={{ width: { sm: "auto" }, m: 0 }}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={onSave}
            disabled={isLoading}
            fullWidth
            sx={{ width: { sm: "auto" }, m: 0 }}
          >
            Сохранить
          </Button>
        </DialogActions>
      ) : null}
    </MyModal>
  );
}
