import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { Stack } from "@mui/material";
import StaffScheduleColorLegendModal from "./StaffScheduleColorLegendModal";
import { V2Button, V2FieldSwitch, V2IconButton, V2Surface, v2Colors } from "@/ui/v2";
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
          <V2Button
            tone="secondary"
            onClick={onOpenCreateSmena}
            sx={{
              borderRadius: "18px",
              color: v2Colors.textMuted,
              "&.MuiButton-root": {
                fontSize: 16,
                lineHeight: 1.25,
                fontWeight: 500,
              },
            }}
          >
            Новая смена
          </V2Button>
        ) : null}

        <V2FieldSwitch
          label="Календарь"
          checked={!isCalendarHidden}
          onChange={onCalendarVisibilityChange}
        />

        <V2FieldSwitch
          label="Цветовые обозначения"
          checked={useColors}
          onChange={onColorModeChange}
          action={
            <V2IconButton
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
            </V2IconButton>
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
