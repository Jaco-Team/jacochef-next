"use client";

import { useState } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { JacoIconButton, JacoModal, uiColors, uiRadii } from "@/design-system/shared/ui";

export default function PhotoThumbnails({ photos = [], size = 48, max = 3, title = "Фото ошибки" }) {
  const [active, setActive] = useState(null);
  const items = photos.filter((photo) => photo?.url);
  if (!items.length) return <Typography variant="body2">—</Typography>;
  const visible = items.slice(0, max);
  const hidden = items.length - visible.length;
  const current = active === null ? null : items[active];
  const move = (step) => setActive((index) => (index + step + items.length) % items.length);

  return (
    <>
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ alignItems: "center" }}
      >
        {visible.map((photo, index) => (
          <ButtonBase
            key={photo.id}
            aria-label={`Открыть фото ${index + 1}`}
            onClick={() => setActive(index)}
            sx={{
              width: size,
              height: size,
              borderRadius: uiRadii.sm,
              overflow: "hidden",
              border: `1px solid ${uiColors.border}`,
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={photo.url}
              alt={`Фото ${index + 1}`}
              loading="lazy"
              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </ButtonBase>
        ))}
        {hidden > 0 ? (
          <ButtonBase
            aria-label="Открыть остальные фото"
            onClick={() => setActive(visible.length)}
            sx={{
              width: size,
              height: size,
              borderRadius: uiRadii.sm,
              border: `1px solid ${uiColors.border}`,
              backgroundColor: uiColors.surfaceMuted,
              fontWeight: 600,
            }}
          >
            +{hidden}
          </ButtonBase>
        ) : null}
      </Stack>
      <JacoModal
        open={Boolean(current)}
        onClose={() => setActive(null)}
        title={`${title} · ${active === null ? 0 : active + 1} из ${items.length}`}
        maxWidth="md"
      >
        {current ? (
          <Stack spacing={1.5}>
            <Box
              component="img"
              src={current.url}
              alt={`Фото ${active + 1}`}
              sx={{
                width: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: uiRadii.md,
                backgroundColor: uiColors.surfaceMuted,
              }}
            />
            {items.length > 1 ? (
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: "center" }}
              >
                <JacoIconButton
                  aria-label="Предыдущее фото"
                  onClick={() => move(-1)}
                >
                  <ChevronLeftIcon />
                </JacoIconButton>
                <JacoIconButton
                  aria-label="Следующее фото"
                  onClick={() => move(1)}
                >
                  <ChevronRightIcon />
                </JacoIconButton>
              </Stack>
            ) : null}
          </Stack>
        ) : null}
      </JacoModal>
    </>
  );
}
