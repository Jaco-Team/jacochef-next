import { Box, Stack, Typography } from "@mui/material";
import { V2Button, V2Modal } from "@/ui/v2";

const colorLegendItems = [
  {
    label: "Обычный сотрудник",
    description: "Белый фон в колонке сотрудника.",
    color: "#FFFFFF",
    textColor: "#111827",
    border: true,
  },
  {
    label: "Особый тип сотрудника",
    description: "Желтый фон имени для типа 2.",
    color: "#ffcc00",
    textColor: "#111827",
  },
  {
    label: "Критический тип сотрудника",
    description: "Красный фон имени для типа 3.",
    color: "#cc0033",
    textColor: "#FFFFFF",
  },
  {
    label: "Приглушенная строка",
    description: "Серый фон, когда строка отмечена как выключенная/без цветов.",
    color: "#D3D3D3",
    textColor: "#111827",
  },
  {
    label: "Смена 10:00 - 22:00",
    description: "Основной дневной интервал в календаре.",
    color: "#98e38d",
    textColor: "#111827",
  },
  {
    label: "Смена 10:00 - 16:00",
    description: "Первая половина дня.",
    color: "#3dcef2",
    textColor: "#FFFFFF",
  },
  {
    label: "Смена 16:00 - 22:00",
    description: "Вторая половина дня.",
    color: "#1560bd",
    textColor: "#FFFFFF",
  },
  {
    label: "Другое время",
    description: "Нестандартный интервал смены.",
    color: "#926eae",
    textColor: "#FFFFFF",
  },
  {
    label: "Выходной/праздник",
    description: "Красная диагональная штриховка поверх цвета смены.",
    gradient:
      "repeating-linear-gradient(-45deg, #98e38d, #98e38d 8px, rgba(255, 0, 0, 0.3) 8px, rgba(255, 0, 0, 0.3) 12px)",
    textColor: "#111827",
  },
  {
    label: "Бонус дня",
    description: "Зеленая подсветка текущего бонусного дня в нижних строках.",
    color: "#CFF4C8",
    textColor: "#111827",
  },
];

export default function StaffScheduleColorLegendModal({ open, onClose }) {
  return (
    <V2Modal
      open={open}
      onClose={onClose}
      title="Цветовые обозначения"
      maxWidth="sm"
      actions={
        <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
          <V2Button
            compact
            onClick={onClose}
          >
            Понятно
          </V2Button>
        </Box>
      }
    >
      <Stack spacing={1.25}>
        {colorLegendItems.map((item) => (
          <Stack
            key={item.label}
            direction="row"
            spacing={1.5}
            alignItems="flex-start"
          >
            <Box
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
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              12
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                {item.label}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#666666", lineHeight: 1.35 }}>
                {item.description}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </V2Modal>
  );
}
