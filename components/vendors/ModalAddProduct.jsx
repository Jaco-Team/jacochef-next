"use client";

import { useMemo } from "react";
import { Button, DialogActions, DialogContent, Divider, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { MyAutocomplite, MyDatePickerNew } from "@/ui/Forms";
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
  canUpload = false,
  declarationFile,
  declarationExpiresAt,
  onDeclarationFileChange,
  onDeclarationExpiresAtChange,
}) {
  const selectedCatalogItem = useMemo(
    () => itemsSelectData.find((item) => String(item.id) === String(selectedCatalogItemId)) || null,
    [itemsSelectData, selectedCatalogItemId],
  );

  const hasIncompleteDeclaration = Boolean(declarationFile) !== Boolean(declarationExpiresAt);

  const submitDisabled =
    isLoading ||
    !selectedCatalogItemId ||
    vendorItemIds.has(Number(selectedCatalogItemId)) ||
    hasIncompleteDeclaration;

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
            data={itemsSelectData}
            value={selectedCatalogItem}
            func={(_, value) => setSelectedCatalogItemId(value?.id || "")}
            disabled={isLoading || !itemsSelectData.length}
          />
          {!isLoading && !itemsSelectData.length ? (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Нет доступных товаров для добавления.
            </Typography>
          ) : null}
          {isLoading && !itemsSelectData.length ? (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Загрузка товаров...
            </Typography>
          ) : null}

          {canUpload && selectedCatalogItemId ? (
            <>
              <Divider />
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700 }}
              >
                Декларация
              </Typography>
              <Stack spacing={1}>
                <Button
                  variant="outlined"
                  component="label"
                  disabled={isLoading}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Выбрать файл
                  <input
                    hidden
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.docx,application/pdf,image/png,image/jpeg,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      onDeclarationFileChange(file || null);
                      if (!file) {
                        onDeclarationExpiresAtChange(null);
                      }
                    }}
                  />
                </Button>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {declarationFile ? declarationFile.name : "Файл не выбран (необязательно)"}
                </Typography>
              </Stack>

              {declarationFile ? (
                <MyDatePickerNew
                  size="small"
                  label="Действует до"
                  required
                  minDate={dayjs().add(1, "week")}
                  value={declarationExpiresAt}
                  func={(value) => onDeclarationExpiresAtChange(value || null)}
                />
              ) : null}
            </>
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
          disabled={submitDisabled}
        >
          Добавить
        </Button>
      </DialogActions>
    </MyModal>
  );
}
