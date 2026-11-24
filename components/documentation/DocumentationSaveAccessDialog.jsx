"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { JacoButton, JacoModal, uiColors, uiRadii, uiTypography } from "@/design-system/shared/ui";

import { accessBlockHasRules } from "./accessBlocks";

function formatNames(items) {
  if (!items?.length) {
    return "не выбраны";
  }

  return items.map((item) => item.name).join(", ");
}

function RestrictionLine({ label, value }) {
  return (
    <Typography sx={{ ...uiTypography.label, color: uiColors.text }}>
      {label}: {value}
    </Typography>
  );
}

export default function DocumentationSaveAccessDialog({
  open,
  blocks,
  saving,
  onClose,
  onConfirm,
}) {
  const hasBlocks = blocks.length > 0;

  return (
    <JacoModal
      open={open}
      onClose={saving ? () => {} : onClose}
      title="Ограничения статьи"
      maxWidth="sm"
      actions={
        <>
          <JacoButton
            tone="secondary"
            compact
            disabled={saving}
            onClick={onClose}
          >
            Отмена
          </JacoButton>
          <JacoButton
            compact
            loading={saving}
            onClick={onConfirm}
          >
            Сохранить
          </JacoButton>
        </>
      }
    >
      {hasBlocks ? (
        <Stack spacing={1.5}>
          <Typography sx={{ ...uiTypography.body, color: uiColors.text }}>
            При сохранении будут записаны такие ограничения.
          </Typography>
          {blocks.map((block) => (
            <Box
              key={block.id}
              sx={{
                p: 1.5,
                borderRadius: uiRadii.md,
                border: `1px solid ${uiColors.border}`,
                borderLeft: `3px solid ${uiColors.primary}`,
              }}
            >
              <Typography sx={{ mb: 0.75, ...uiTypography.bodyMedium, color: uiColors.textStrong }}>
                {block.name || "Блок"}
              </Typography>
              {accessBlockHasRules(block) ? (
                <Stack spacing={0.25}>
                  <RestrictionLine
                    label="Сотрудники"
                    value={formatNames(block.users)}
                  />
                  <RestrictionLine
                    label="Должности"
                    value={formatNames(block.positions)}
                  />
                  <RestrictionLine
                    label="Права"
                    value={formatNames(block.rights)}
                  />
                  <RestrictionLine
                    label="Условие"
                    value={block.match === "all" ? "Все условия" : "Хотя бы одно условие"}
                  />
                </Stack>
              ) : (
                <Typography sx={{ ...uiTypography.label, color: uiColors.textMuted }}>
                  Ограничения не выбраны. Фрагмент будет виден всем, у кого открыт модуль.
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography sx={{ ...uiTypography.body, color: uiColors.text }}>
          Ограничения доступа не выбраны. Статья будет доступна всем сотрудникам, у которых открыт
          этот модуль.
        </Typography>
      )}
    </JacoModal>
  );
}
