import { useEffect, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";

import JacoPeriodSwitch from "./JacoPeriodSwitch";

const meta = {
  title: "Chef Design System/Shared UI/JacoPeriodSwitch",
  component: JacoPeriodSwitch,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Сегментированный переключатель с полупрозрачной стеклянной плашкой. Подходит для периода, режима и других взаимоисключающих вариантов.",
      },
    },
  },
};

export default meta;

const periodItems = [
  { id: "first-half", value: 0, label: "01.09–15.09" },
  { id: "second-half", value: 1, label: "16.09–30.09" },
];

const cityItems = [
  { id: "samara", label: "Самара" },
  { id: "tolyatti", label: "Тольятти" },
  { id: "syzran", label: "Сызрань" },
];

function StoryCanvas({ children, title, description }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: { xs: 2, md: 4 } }}>
      <Stack
        spacing={2}
        sx={{ width: 720, maxWidth: "100%" }}
      >
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{title}</Typography>
          {description ? (
            <Typography sx={{ mt: 0.5, color: "text.secondary" }}>{description}</Typography>
          ) : null}
        </Box>
        {children}
      </Stack>
    </Box>
  );
}

function ControlledSwitch({ initialValue, items, disabled = false }) {
  const [value, setValue] = useState(initialValue);
  const [renderVersion, setRenderVersion] = useState(0);

  useEffect(() => {
    setRenderVersion((current) => current + 1);
  }, [value]);

  return (
    <Box data-render-version={renderVersion}>
      <JacoPeriodSwitch
        aria-label="Выбор периода"
        value={value}
        onChange={(_event, nextValue) => setValue(nextValue)}
        items={items}
        disabled={disabled}
      />
    </Box>
  );
}

export function Default() {
  return (
    <StoryCanvas
      title="Период графика"
      description="Плашка плавно перетекает между сегментами и поддерживает reduced motion."
    >
      <ControlledSwitch
        initialValue={0}
        items={periodItems}
      />
    </StoryCanvas>
  );
}

export function MultipleItems() {
  return (
    <StoryCanvas
      title="Несколько вариантов"
      description="Компонент не привязан к периоду и может использоваться для любого взаимоисключающего выбора."
    >
      <ControlledSwitch
        initialValue="samara"
        items={cityItems}
      />
    </StoryCanvas>
  );
}

export function Disabled() {
  return (
    <StoryCanvas title="Недоступное состояние">
      <ControlledSwitch
        initialValue={0}
        items={periodItems}
        disabled
      />
    </StoryCanvas>
  );
}
