import { Box, Stack, Typography } from "@mui/material";
import { JacoButton } from "@/design-system/shared/ui";
import StaffScheduleResponsiveModal from "../modals/StaffScheduleResponsiveModal";
import { getHourPresetByType } from "../staffScheduleHourPresets";

const fullPreset = getHourPresetByType(0);
const morningPreset = getHourPresetByType(1);
const eveningPreset = getHourPresetByType(2);
const customPreset = getHourPresetByType(3);

const colorLegendGroups = [
  {
    title: "Поле сотрудника",
    sample: "ФИО",
    items: [
      {
        label: "Медкнижка скоро истекает",
        description: "До окончания осталось меньше 14 дней.",
        color: "#ffcc00",
        textColor: "#111827",
      },
      {
        label: "Медкнижка просрочена или не сдана",
        color: "#cc0033",
        textColor: "#FFFFFF",
      },
      {
        label: "Один человек в нескольких строках",
        description: "Наведите на фамилию, чтобы увидеть остальные строки.",
        color: "#E8F0FC",
        textColor: "#111827",
        border: true,
      },
    ],
  },
  {
    title: "Смена в ячейке дня",
    sample: "12",
    items: [
      { label: "Полный день 10:00–22:00", color: fullPreset.color, textColor: fullPreset.textColor },
      { label: "Утро 10:00–16:00", color: morningPreset.color, textColor: morningPreset.textColor },
      { label: "Вечер 16:00–22:00", color: eveningPreset.color, textColor: eveningPreset.textColor },
      {
        label: "Своё время или несколько интервалов",
        color: customPreset.color,
        textColor: customPreset.textColor,
      },
      {
        label: "Отпуск / выходной по заявлению",
        description: "Красная штриховка поверх цвета смены.",
        gradient: `repeating-linear-gradient(-45deg, ${fullPreset.color}, ${fullPreset.color} 8px, rgba(255, 0, 0, 0.3) 8px, rgba(255, 0, 0, 0.3) 12px)`,
        textColor: "#111827",
      },
    ],
  },
  {
    title: "Отметки поверх смены",
    sample: "12",
    items: [
      {
        label: "Не отмечена температура",
        description: "Только для сегодняшнего рабочего дня.",
        color: "#45161c",
        textColor: "#FFFFFF",
      },
      {
        label: "Загрузка повара 80–90%",
        description: "Считается автоматически по заказам, только для поваров.",
        color: "#ffba00",
        textColor: "#FFFFFF",
      },
      { label: "Загрузка повара 50–80%", color: "#d5265b", textColor: "#FFFFFF" },
      { label: "Загрузка повара ниже 50%", color: "#000000", textColor: "#FFFFFF" },
    ],
  },
];

export default function StaffScheduleColorLegendModal({ open, onClose }) {
  return (
    <StaffScheduleResponsiveModal
      open={open}
      onClose={onClose}
      title="Цветовые обозначения"
      maxWidth="sm"
      actions={
        <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
          <JacoButton
            compact
            onClick={onClose}
          >
            Понятно
          </JacoButton>
        </Box>
      }
    >
      <Stack spacing={2.25}>
        {colorLegendGroups.map((group, groupIndex) => (
          <Stack
            key={group.title}
            spacing={1}
          >
            <Typography
              sx={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.4 }}
            >
              {group.title}
            </Typography>
            {group.items.map((item, itemIndex) => {
              const index = `${groupIndex}-${itemIndex}`;
              return (
                <Stack
                  key={item.label}
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  data-testid={`color-legend-item-${index}`}
                  sx={{ alignItems: "center !important" }}
                >
                  <Box
                    data-testid={`color-legend-swatch-${index}`}
                    sx={{
                      width: 42,
                      height: 28,
                      flexShrink: 0,
                      borderRadius: "6px",
                      border: item.border ? "1px solid #E5E5E5" : "none",
                      background: item.gradient || item.color,
                      color: item.textColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {group.sample}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{item.label}</Typography>
                    {item.description ? (
                      <Typography sx={{ fontSize: 13, color: "#666666", lineHeight: 1.35 }}>
                        {item.description}
                      </Typography>
                    ) : null}
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        ))}
      </Stack>
    </StaffScheduleResponsiveModal>
  );
}
