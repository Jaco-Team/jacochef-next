import { Box, CircularProgress, Stack, Typography } from "@mui/material";

import {
  JacoAlert,
  JacoBackdropLoader,
  JacoSelectableList,
  JacoSelectableListItem,
  JacoSurface,
} from "@/design-system/shared/ui";
import { uiColors, uiRadii } from "@/design-system/shared/tokens";

const meta = {
  title: "Chef Design System/Shared UI/Surfaces And Feedback",
  parameters: {
    docs: {
      description: {
        component:
          "Переиспользуемые поверхности, списки выбора и feedback states из design-system/shared/ui для плотных Chef-интерфейсов.",
      },
    },
  },
};

export default meta;

function StoryCanvas({ children }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: { xs: 2, md: 4 } }}>
      {children}
    </Box>
  );
}

export function Surfaces() {
  return (
    <StoryCanvas>
      <Stack
        spacing={2}
        sx={{ maxWidth: 560 }}
      >
        <JacoSurface sx={{ p: 2 }}>
          <Typography sx={{ fontWeight: 700 }}>График сотрудников</Typography>
          <Typography sx={{ mt: 0.75, color: "text.secondary" }}>
            Стандартная поверхность для рабочих блоков без декоративной карточности.
          </Typography>
        </JacoSurface>
        <JacoSurface sx={{ p: 2, bgcolor: uiColors.surfaceMuted }}>
          <Typography sx={{ fontWeight: 700 }}>Muted surface</Typography>
          <Typography sx={{ mt: 0.75, color: "text.secondary" }}>
            Для вложенных блоков, фильтров и плотных рабочих групп.
          </Typography>
        </JacoSurface>
      </Stack>
    </StoryCanvas>
  );
}

export function FeedbackStates() {
  return (
    <StoryCanvas>
      <Stack
        spacing={2}
        sx={{ maxWidth: 560 }}
      >
        <JacoAlert severity="success">Изменения сохранены</JacoAlert>
        <JacoAlert severity="warning">Проверьте данные перед сохранением</JacoAlert>
        <JacoAlert severity="error">Не удалось сохранить изменения</JacoAlert>
        <JacoAlert severity="info">Данные обновлены 5 минут назад</JacoAlert>
        <JacoSurface
          sx={{
            p: 3,
            minHeight: 116,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: "center" }}
          >
            <CircularProgress size={20} />
            <Typography>Загрузка данных</Typography>
          </Stack>
        </JacoSurface>
        <JacoSurface
          sx={{
            p: 3,
            minHeight: 116,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
            borderStyle: "dashed",
          }}
        >
          <Typography>Нет данных для отображения</Typography>
        </JacoSurface>
      </Stack>
    </StoryCanvas>
  );
}

export function LoadingOverlay() {
  return (
    <StoryCanvas>
      <Box sx={{ position: "relative", width: 360, height: 180, maxWidth: "100%" }}>
        <JacoSurface sx={{ p: 2, height: "100%" }}>
          <Typography sx={{ fontWeight: 700 }}>Сохранение смены</Typography>
          <Typography sx={{ mt: 0.75, color: "text.secondary" }}>
            Контент под системным overlay остается на месте.
          </Typography>
        </JacoSurface>
        <JacoBackdropLoader
          open
          sx={{ position: "absolute", borderRadius: uiRadii.md, color: uiColors.primary }}
        />
      </Box>
    </StoryCanvas>
  );
}

export function SelectableListExample() {
  return (
    <StoryCanvas>
      <JacoSelectableList sx={{ width: 360, bgcolor: "background.paper" }}>
        <JacoSelectableListItem
          selected
          label="Часы"
        />
        <JacoSelectableListItem label="Смена" />
        <JacoSelectableListItem label="Кафе" />
        <JacoSelectableListItem
          destructive
          selected
          label="Удалить смену"
        />
      </JacoSelectableList>
    </StoryCanvas>
  );
}
