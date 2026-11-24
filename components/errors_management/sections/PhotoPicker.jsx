"use client";

import { useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Box, ButtonBase, CircularProgress, Stack, Typography } from "@mui/material";
import { JacoButton, uiColors, uiRadii } from "@/design-system/shared/ui";
import { PHOTO_LIMIT, PHOTO_TYPES } from "../complaintTree.mjs";
import FieldMessage from "./FieldMessage";

const thumbSx = {
  position: "relative",
  width: 52,
  height: 52,
  borderRadius: uiRadii.sm,
  border: `1px solid ${uiColors.border}`,
  backgroundColor: uiColors.surfaceMuted,
  flexShrink: 0,
};

function photoNote(required, count) {
  if (required && count === 0) return "Для этой проблемы нужно фото";
  if (count === 0) return "Фото по желанию";
  return `${count} из ${PHOTO_LIMIT}`;
}

export default function PhotoPicker({ photos = [], required = false, error, onAdd, onRemove }) {
  const inputRef = useRef(null);
  const keptCount = photos.filter((photo) => photo.status !== "error").length;
  const missing = required && keptCount === 0;
  return (
    <Stack spacing={0.75}>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ alignItems: "center", flexWrap: "wrap" }}
      >
        {photos
          .filter((photo) => photo.status !== "error")
          .map((photo) => (
            <Box
              key={photo.key}
              sx={thumbSx}
            >
              {photo.previewUrl ? (
                <Box
                  component="img"
                  src={photo.previewUrl}
                  alt={photo.name || "Фото ошибки"}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    borderRadius: uiRadii.sm,
                  }}
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
                    borderRadius: uiRadii.sm,
                    backgroundColor: "rgba(255,255,255,0.6)",
                  }}
                >
                  <CircularProgress size={20} />
                </Box>
              ) : null}
              <ButtonBase
                aria-label="Убрать фото"
                onClick={() => onRemove(photo.key)}
                sx={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  width: 24,
                  height: 24,
                  borderRadius: uiRadii.full,
                  backgroundColor: uiColors.textStrong,
                  color: uiColors.surface,
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </ButtonBase>
            </Box>
          ))}
        {keptCount < PHOTO_LIMIT ? (
          <JacoButton
            compact
            tone={missing ? "outlinePrimary" : "secondary"}
            onClick={() => inputRef.current?.click()}
          >
            + Фото
          </JacoButton>
        ) : null}
        <Typography
          variant="body2"
          color={missing ? "error" : "text.secondary"}
        >
          {photoNote(required, keptCount)}
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
      {photos
        .filter((photo) => photo.status === "error")
        .map((photo) => (
          <Stack
            key={photo.key}
            direction="row"
            spacing={1}
            sx={{ alignItems: "center" }}
          >
            <FieldMessage>
              {photo.name ? `${photo.name}: ` : ""}
              {photo.error}
            </FieldMessage>
            <ButtonBase
              aria-label="Скрыть сообщение"
              onClick={() => onRemove(photo.key)}
              sx={{ borderRadius: uiRadii.full, p: 0.5 }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </ButtonBase>
          </Stack>
        ))}
      <FieldMessage>{error}</FieldMessage>
    </Stack>
  );
}
