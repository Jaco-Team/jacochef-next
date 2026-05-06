"use client";

import { useEffect, useState } from "react";
import { Button, DialogActions, DialogContent, Stack } from "@mui/material";
import dayjs from "dayjs";
import { MyAutocomplite, MyDatePickerNew } from "@/ui/Forms";
import MyModal from "@/ui/MyModal";

export default function DeclarationEditDialog({
  declaration,
  isLoading,
  loadItemVendors,
  onClose,
  onSubmit,
  open,
  vendorOptions = [],
}) {
  const [expiresAt, setExpiresAt] = useState(null);
  const [isVendorSelectOpen, setIsVendorSelectOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setExpiresAt(
      declaration?.expires_at && dayjs(declaration.expires_at).isValid()
        ? dayjs(declaration.expires_at)
        : null,
    );
    setIsVendorSelectOpen(false);
    setSelectedVendor(null);
  }, [declaration, open]);

  useEffect(() => {
    if (!open || !declaration?.item_id || !isVendorSelectOpen) {
      return;
    }

    loadItemVendors?.(declaration.item_id);
  }, [declaration?.item_id, isVendorSelectOpen, open]);

  const submitDisabled =
    !declaration?.id ||
    !expiresAt ||
    !dayjs(expiresAt).isValid() ||
    (isVendorSelectOpen && !selectedVendor?.id) ||
    isLoading;

  const handleSubmit = async () => {
    const isSaved = await onSubmit(
      declaration.id,
      expiresAt,
      isVendorSelectOpen ? selectedVendor?.id : null,
    );

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
          <Button
            variant="text"
            size="small"
            sx={{ alignSelf: "flex-start", px: 0 }}
            onClick={() => {
              setIsVendorSelectOpen((value) => !value);
              setSelectedVendor(null);
            }}
          >
            сменить поставщика
          </Button>
          {isVendorSelectOpen ? (
            <MyAutocomplite
              multiple={false}
              label="Поставщик"
              data={vendorOptions}
              value={selectedVendor}
              func={(_, value) =>
                setSelectedVendor(value && Number(value.is_show) === 1 ? value : null)
              }
              renderOption={(params, option) => (
                <li
                  {...params}
                  key={option.id}
                  style={{
                    ...params.style,
                    color: Number(option.is_show) === 1 ? undefined : "rgba(0, 0, 0, 0.38)",
                  }}
                >
                  {option.name}
                </li>
              )}
            />
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
          onClick={handleSubmit}
          disabled={submitDisabled}
        >
          Сохранить
        </Button>
      </DialogActions>
    </MyModal>
  );
}
