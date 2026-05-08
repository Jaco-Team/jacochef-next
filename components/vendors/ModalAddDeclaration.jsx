"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button, DialogActions, DialogContent, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { MyAutocomplite, MyDatePickerNew } from "@/ui/Forms";
import MyModal from "@/ui/MyModal";
import useVendorDetailsStore from "./useVendorDetailsStore";
import useVendorDocumentsView from "./useVendorDocumentsView";
import useVendorsStore from "./useVendorsStore";

export default function ModalAddDeclaration({ open, onClose, onSubmit }) {
  const { docModalExpiresAt, docModalFile, docModalItemId, vendorItems, vendorItemsOptions } =
    useVendorDocumentsView();
  const isLoading = useVendorsStore((state) => state.isLoading);
  const { setDocModalExpiresAt, setDocModalFile, setDocModalItemId } = useVendorDetailsStore(
    useShallow((state) => ({
      setDocModalExpiresAt: state.setDocModalExpiresAt,
      setDocModalFile: state.setDocModalFile,
      setDocModalItemId: state.setDocModalItemId,
    })),
  );

  const selectedVendorItem = useMemo(
    () => vendorItemsOptions.find((item) => String(item.id) === String(docModalItemId)) || null,
    [docModalItemId, vendorItemsOptions],
  );

  const submitDisabled =
    !docModalItemId || !docModalFile || (Boolean(docModalFile) && !docModalExpiresAt) || isLoading;

  return (
    <MyModal
      open={open}
      onClose={onClose}
      title="Добавить декларацию"
      maxWidth="sm"
    >
      <DialogContent>
        <Stack spacing={2}>
          <MyAutocomplite
            multiple={false}
            label="Товар поставщика"
            data={vendorItemsOptions}
            value={selectedVendorItem}
            func={(_, value) => setDocModalItemId(value?.id || "")}
            disabled={isLoading || !vendorItems.length}
          />

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
                  setDocModalFile(file || null);
                  if (!file) {
                    setDocModalExpiresAt(null);
                  }
                }}
              />
            </Button>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {docModalFile ? docModalFile.name : "Файл не выбран"}
            </Typography>
          </Stack>

          {docModalFile ? (
            <MyDatePickerNew
              size="small"
              label="Действует до"
              required
              minDate={dayjs().add(1, "week")}
              value={docModalExpiresAt}
              func={(value) => setDocModalExpiresAt(value || null)}
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
          onClick={onSubmit}
          disabled={submitDisabled}
        >
          Добавить
        </Button>
      </DialogActions>
    </MyModal>
  );
}
