import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import { Box, FormControlLabel, Stack, Tooltip, Typography } from "@mui/material";

import {
  JacoButton,
  JacoCheckbox,
  JacoCompactTabs,
  JacoFieldSwitch,
  JacoIconButton,
  JacoSegmentedTabs,
  JacoSwitch,
} from "@/design-system/shared/ui";

const meta = {
  title: "Chef Design System/Shared UI/Controls",
  parameters: {
    docs: {
      description: {
        component:
          "Переиспользуемые контролы из design-system/shared/ui. Использовать как базовые действия, переключатели и табы для новых Chef-интерфейсов.",
      },
    },
  },
};

export default meta;

const tabItems = [
  { id: "month", label: "На месяц" },
  { id: "period", label: "На 2 недели" },
];

function StoryCanvas({ children }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: { xs: 2, md: 4 } }}>
      {children}
    </Box>
  );
}

export function Buttons() {
  return (
    <StoryCanvas>
      <Stack
        direction="row"
        sx={{
          gap: 1.5,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <JacoButton startIcon={<SaveIcon />}>Сохранить</JacoButton>
        <JacoButton tone="secondary">Отмена</JacoButton>
        <JacoButton
          tone="outlinePrimary"
          compact
          startIcon={<RefreshIcon />}
        >
          Обновить
        </JacoButton>
        <JacoButton
          tone="danger"
          startIcon={<DeleteOutlinedIcon />}
        >
          Удалить
        </JacoButton>
        <JacoButton loading>Загрузка</JacoButton>
        <JacoButton disabled>Недоступно</JacoButton>
        <JacoButton compact>Компактно</JacoButton>
        <Tooltip title="Добавить">
          <JacoIconButton aria-label="Добавить">
            <AddIcon />
          </JacoIconButton>
        </Tooltip>
        <Tooltip title="Недоступно">
          <JacoIconButton
            aria-label="Недоступно"
            disabled
          >
            <AddIcon />
          </JacoIconButton>
        </Tooltip>
      </Stack>
    </StoryCanvas>
  );
}

export function ButtonStateMatrix() {
  const tones = ["primary", "success", "secondary", "outlinePrimary", "danger"];

  return (
    <StoryCanvas>
      <Stack spacing={1.5}>
        {tones.map((tone) => (
          <Stack
            key={tone}
            direction="row"
            sx={{
              gap: 1.5,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Typography sx={{ width: 120, fontSize: 13, fontWeight: 700 }}>{tone}</Typography>
            <JacoButton tone={tone}>{tone}</JacoButton>
            <JacoButton
              tone={tone}
              compact
            >
              Compact
            </JacoButton>
            <JacoButton
              tone={tone}
              loading
            >
              Loading
            </JacoButton>
            <JacoButton
              tone={tone}
              disabled
            >
              Disabled
            </JacoButton>
          </Stack>
        ))}
      </Stack>
    </StoryCanvas>
  );
}

export function SelectionControls() {
  const [checked, setChecked] = useState(true);
  const [boxChecked, setBoxChecked] = useState(true);

  return (
    <StoryCanvas>
      <Stack
        spacing={2}
        sx={{ width: 360, maxWidth: "100%" }}
      >
        <JacoFieldSwitch
          label="Показывать только активных"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
        />
        <JacoFieldSwitch
          label="Недоступное состояние"
          checked={false}
          disabled
        />
        <JacoSwitch
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
          slotProps={{ input: { "aria-label": "Активность" } }}
        />
        <JacoSwitch
          checked={false}
          disabled
          slotProps={{ input: { "aria-label": "Недоступная активность" } }}
        />
        <FormControlLabel
          control={
            <JacoCheckbox
              checked={boxChecked}
              onChange={(event) => setBoxChecked(event.target.checked)}
            />
          }
          label="Выбран сотрудник"
          sx={{ m: 0, gap: 1 }}
        />
        <FormControlLabel
          control={<JacoCheckbox disabled />}
          label="Недоступный выбор"
          disabled
          sx={{ m: 0, gap: 1 }}
        />
      </Stack>
    </StoryCanvas>
  );
}

export function Tabs() {
  const [segmented, setSegmented] = useState("month");
  const [compact, setCompact] = useState("main");

  return (
    <StoryCanvas>
      <Stack
        spacing={3}
        sx={{ width: 520, maxWidth: "100%" }}
      >
        <JacoSegmentedTabs
          value={segmented}
          onChange={(_event, value) => setSegmented(value)}
          items={tabItems}
        />
        <JacoSegmentedTabs
          value={segmented}
          onChange={(_event, value) => setSegmented(value)}
          items={tabItems}
          size="compact"
          variant="standard"
          sx={{ width: "fit-content" }}
        />
        <JacoCompactTabs
          value={compact}
          onChange={(_event, value) => setCompact(value)}
          items={[
            { id: "main", label: "Основное" },
            { id: "history", label: "История" },
            { id: "settings", label: "Настройки" },
          ]}
        />
      </Stack>
    </StoryCanvas>
  );
}
