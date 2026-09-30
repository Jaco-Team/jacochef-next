import { useState } from "react";
import { Box, Stack, Typography } from "@mui/material";

import { JacoButton, JacoResponsiveModalShell, useJacoConfirm } from "@/design-system/shared/ui";

const meta = {
  title: "Chef Design System/Shared UI/Modals",
  parameters: {
    docs: {
      description: {
        component:
          "Переиспользуемый responsive modal shell из design-system/shared/ui: desktop Dialog и mobile SwipeableDrawer по одному контракту.",
      },
    },
  },
};

export default meta;

function ActionConfirmation({ destructive = false }) {
  const { confirm, ConfirmDialog } = useJacoConfirm();
  return (
    <>
      <JacoButton
        onClick={() =>
          confirm({
            message: destructive ? "Закрыть без сохранения?" : "Сохранить изменения?",
            confirmLabel: destructive ? "Закрыть" : "Сохранить",
            confirmTone: destructive ? "danger" : "success",
            cancelLabel: "Отмена",
            cancelTone: "danger",
          })
        }
      >
        Открыть подтверждение
      </JacoButton>
      <ConfirmDialog />
    </>
  );
}
export const SaveConfirmation = () => <ActionConfirmation />;
export const DiscardConfirmation = () => <ActionConfirmation destructive />;

export function ResponsiveModal() {
  const [open, setOpen] = useState(true);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: 4 }}>
      <JacoButton onClick={() => setOpen(true)}>Открыть модальное окно</JacoButton>
      <JacoResponsiveModalShell
        open={open}
        onClose={() => setOpen(false)}
        title="Редактирование"
        actions={
          <Stack
            direction="row"
            sx={{
              gap: 1,
              justifyContent: "flex-end",
            }}
          >
            <JacoButton
              tone="secondary"
              onClick={() => setOpen(false)}
            >
              Отмена
            </JacoButton>
            <JacoButton onClick={() => setOpen(false)}>Сохранить</JacoButton>
          </Stack>
        }
      >
        <Stack spacing={1.5}>
          <Typography sx={{ fontWeight: 700 }}>Иванов Иван</Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Единый shell для desktop dialog и mobile bottom sheet в Chef-потоках.
          </Typography>
        </Stack>
      </JacoResponsiveModalShell>
    </Box>
  );
}
