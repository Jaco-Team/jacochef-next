"use client";

import { DialogContent } from "@mui/material";
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
          draft={draft}
          isLoading={isLoading}
          onCancel={onCancel}
          onSave={onSave}
          onDraftChange={onDraftChange}
        />
      </DialogContent>
    </MyModal>
  );
}
