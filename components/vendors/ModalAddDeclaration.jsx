"use client";

import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button, DialogActions, DialogContent, Stack, Typography } from "@mui/material";
import { MyAutocomplite } from "@/ui/Forms";
import MyModal from "@/ui/MyModal";
import useVendorDetailsStore from "./useVendorDetailsStore";
import useVendorDocumentsView from "./useVendorDocumentsView";
import useVendorsStore from "./useVendorsStore";

function getDeclarationOptionLabel(declaration) {
  const fileName = declaration?.filename?.split("/")?.pop() || "Декларация";
  return declaration?.created_at ? `${fileName} · ${declaration.created_at}` : fileName;
}

export default function ModalAddDeclaration({ open, onClose, onSubmit }) {
  const {
    availableDeclarationsForBind,
    bindDeclarationId,
    docModalFile,
    docModalItemId,
    vendorItems,
    vendorItemsOptions,
  } = useVendorDocumentsView();
  const isLoading = useVendorsStore((state) => state.isLoading);
  const { setBindDeclarationId, setDocModalFile, setDocModalItemId } = useVendorDetailsStore(
    useShallow((state) => ({
      setBindDeclarationId: state.setBindDeclarationId,
      setDocModalFile: state.setDocModalFile,
      setDocModalItemId: state.setDocModalItemId,
    })),
  );

  const selectedVendorItem = useMemo(
    () => vendorItemsOptions.find((item) => String(item.id) === String(docModalItemId)) || null,
    [docModalItemId, vendorItemsOptions],
  );

  const selectedDeclaration = useMemo(
    () =>
      availableDeclarationsForBind.find((decl) => String(decl.id) === String(bindDeclarationId)) ||
      null,
    [availableDeclarationsForBind, bindDeclarationId],
  );

  const submitDisabled = !docModalItemId || (!bindDeclarationId && !docModalFile) || isLoading;

  useEffect(() => {
    if (bindDeclarationId && !selectedDeclaration) {
      setBindDeclarationId("");
    }
  }, [bindDeclarationId, selectedDeclaration, setBindDeclarationId]);

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

          <MyAutocomplite
            multiple={false}
            label="Существующая декларация"
            data={availableDeclarationsForBind}
            value={selectedDeclaration}
            func={(_, value) => {
              setBindDeclarationId(value?.id || "");
              if (value?.id) {
                setDocModalFile(null);
              }
            }}
            disabled={isLoading || !docModalItemId || !availableDeclarationsForBind.length}
            renderOption={(props, option) => (
              <li
                {...props}
                key={option.id}
              >
                {getDeclarationOptionLabel(option)}
              </li>
            )}
          />

          <Stack spacing={1}>
            <Button
              variant="outlined"
              component="label"
              disabled={isLoading || Boolean(bindDeclarationId)}
              sx={{ alignSelf: "flex-start" }}
            >
              Выбрать файл
              <input
                hidden
                type="file"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  setDocModalFile(file || null);
                  if (file) {
                    setBindDeclarationId("");
                  }
                }}
              />
            </Button>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {docModalFile
                ? docModalFile.name
                : bindDeclarationId
                  ? "Будет привязана выбранная декларация"
                  : "Файл не выбран"}
            </Typography>
          </Stack>
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
