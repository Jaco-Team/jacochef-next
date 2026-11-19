"use client";

import { useRef } from "react";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { JacoButton, JacoIconButton, uiColors, uiRadii } from "@/design-system/shared/ui";
import { PHOTO_LIMIT, PHOTO_TYPES } from "../complaintTree.mjs";
import FieldMessage from "./FieldMessage";

const thumbSx = {
  position: "relative",
  width: 88,
  height: 88,
  borderRadius: uiRadii.sm,
  overflow: "hidden",
  border: `1px solid ${uiColors.border}`,
  backgroundColor: uiColors.surfaceMuted,
  flexShrink: 0,
};

export default function PhotoPicker({ photos = [], required = false, error, onAdd, onRemove }) {
  const inputRef = useRef(null);
  const keptCount = photos.filter((photo) => photo.status !== "error").length;
  const full = keptCount >= PHOTO_LIMIT;
  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "center", flexWrap: "wrap" }}
        useFlexGap
      >
        <JacoButton
          compact
          tone="outlinePrimary"
          startIcon={<AddPhotoAlternateOutlinedIcon />}
          disabled={full}
          onClick={() => inputRef.current?.click()}
        >
          Добавить фото
        </JacoButton>
        <Typography
          variant="body2"
          color={required && keptCount === 0 ? "error" : "text.secondary"}
        >
          {required ? "Фото обязательно. " : "Фото по желанию. "}
          {keptCount}/{PHOTO_LIMIT}, JPEG, PNG или WebP до 10 МБ.
        </Typography>
        <input
          ref={inputRef}
          hidden
          multiple
          type="file"
          accept={PHOTO_TYPES.join(",")}
          onChange={(event) => {
            onAdd(event.target.files);
            event.target.value = "";
          }}
        />
      </Stack>
      {photos.length ? (
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ flexWrap: "wrap" }}
        >
          {photos.map((photo) => (
            <Box
              key={photo.key}
              sx={{
                ...thumbSx,
                ...(photo.status === "error" ? { borderColor: uiColors.danger } : {}),
              }}
            >
              {photo.previewUrl ? (
                <Box
                  component="img"
                  src={photo.previewUrl}
                  alt={photo.name || "Фото ошибки"}
                  sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : null}
              {photo.status === "uploading" ? (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,255,255,0.6)",
                  }}
                >
                  <CircularProgress size={22} />
                </Box>
              ) : null}
              <JacoIconButton
                aria-label="Убрать фото"
                onClick={() => onRemove(photo.key)}
                sx={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 28,
                  height: 28,
                  minWidth: 28,
                  backgroundColor: "rgba(255,255,255,0.85)",
                }}
              >
                <CloseIcon fontSize="small" />
              </JacoIconButton>
            </Box>
          ))}
        </Stack>
      ) : null}
      {photos
        .filter((photo) => photo.status === "error")
        .map((photo) => (
          <FieldMessage key={`${photo.key}-error`}>
            {photo.name ? `${photo.name}: ` : ""}
            {photo.error}
          </FieldMessage>
        ))}
      <FieldMessage>{error}</FieldMessage>
    </Stack>
  );
}
