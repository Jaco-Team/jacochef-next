import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { Stack } from "@mui/material";
import StaffScheduleColorLegendModal from "./StaffScheduleColorLegendModal";
import {
  JacoButton,
  JacoFieldSwitch,
  JacoIconButton,
  JacoSurface,
  uiColors,
} from "@/design-system/shared/ui";
import { CONTROL_RADIUS } from "../staffScheduleConstants";
import { useState } from "react";

export default function StaffScheduleMobileScheduleControls({
  canCreateSmena,
  isCalendarHidden,
  onCalendarVisibilityChange,
  useColors,
  onColorModeChange,
  onOpenCreateSmena,
}) {
  const [isColorLegendOpen, setIsColorLegendOpen] = useState(false);

  return (
    <>
      <Stack
        spacing={1.25}
        sx={{ pb: 1.5 }}
      >
        {canCreateSmena ? (
          <JacoButton
            tone="secondary"
            onClick={onOpenCreateSmena}
            sx={{
              borderRadius: "18px",
              color: uiColors.textMuted,
              "&.MuiButton-root": {
                fontSize: 16,
                lineHeight: 1.25,
                fontWeight: 500,
              },
            }}
          >
            Новая смена
          </JacoButton>
        ) : null}

        <JacoFieldSwitch
          label="Календарь"
          checked={!isCalendarHidden}
          onChange={onCalendarVisibilityChange}
        />

        <JacoFieldSwitch
          label="Цветовые обозначения"
          checked={useColors}
          onChange={onColorModeChange}
          action={
            <JacoIconButton
              aria-label="Показать цветовые обозначения"
              onClick={() => setIsColorLegendOpen(true)}
              sx={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: "none",
                backgroundColor: "transparent",
                color: "#666666",
                "&:hover": { backgroundColor: "#F2F2F2" },
              }}
            >
              <HelpOutlineRoundedIcon sx={{ fontSize: 18 }} />
            </JacoIconButton>
          }
        />
      </Stack>

      <StaffScheduleColorLegendModal
        open={isColorLegendOpen}
        onClose={() => setIsColorLegendOpen(false)}
      />
    </>
  );
}
