import { Button, Chip, Paper, Stack, Typography } from "@mui/material";

import { getCategoryStatusLabel } from "./closeBuyUtils";

export default function CategoryCard({ category, selected, disabled, onSelect, onAction }) {
  const actionLabel =
    category.status === "open"
      ? "Закрыть все"
      : category.status === "closed"
        ? "Открыть все"
        : "Настроить";
  const actionColors =
    category.status === "closed"
      ? { color: "#2E7D32", bgcolor: "rgba(46, 125, 50, 0.09)" }
      : category.status === "mixed"
        ? { color: "#8A5A00", bgcolor: "rgba(255, 152, 0, 0.12)" }
        : { color: "#555555", bgcolor: "#F2F2F2" };

  return (
    <Paper
      onClick={() => onSelect?.(category.id)}
      sx={{
        position: "relative",
        overflow: "hidden",
        p: 2,
        borderRadius: "16px",
        border: `1px solid ${selected ? "#BDBDBD" : "#E3E3E3"}`,
        bgcolor: selected ? "#FAFAFA" : "#FFFFFF",
        cursor: "pointer",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
        boxShadow: selected ? "0 8px 22px rgba(0, 0, 0, 0.07)" : "none",
        "&::before": selected
          ? {
              content: '""',
              position: "absolute",
              inset: "0 auto 0 0",
              width: 3,
              bgcolor: "#CC0033",
            }
          : undefined,
        "&:hover": {
          borderColor: "#C8C8C8",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.06)",
        },
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Stack
          spacing={0.75}
          sx={{ minWidth: 0 }}
        >
          <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#2B2B2B" }}>
            {category.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#6B6B6B" }}
          >
            {category.open_count} из {category.count} товаров открыто
          </Typography>
        </Stack>
        <Chip
          label={getCategoryStatusLabel(category.status)}
          size="small"
          sx={{
            bgcolor:
              category.status === "open"
                ? "rgba(46, 125, 50, 0.12)"
                : category.status === "closed"
                  ? "rgba(117, 117, 117, 0.12)"
                  : category.status === "mixed"
                    ? "rgba(255, 152, 0, 0.16)"
                    : "rgba(0, 0, 0, 0.06)",
            color:
              category.status === "open"
                ? "#2e7d32"
                : category.status === "closed"
                  ? "#616161"
                  : category.status === "mixed"
                    ? "#ef6c00"
                    : "#616161",
            fontWeight: 600,
            borderRadius: "9px",
          }}
        />
      </Stack>
      <Stack
        direction="row"
        sx={{
          justifyContent: "flex-end",
          mt: 1.5,
        }}
      >
        {category.count > 0 ? (
          <Button
            variant="text"
            size="small"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              onAction?.(category);
            }}
            sx={{
              minHeight: 34,
              px: 1.5,
              borderRadius: "10px",
              color: actionColors.color,
              bgcolor: actionColors.bgcolor,
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                bgcolor:
                  category.status === "closed"
                    ? "rgba(46, 125, 50, 0.16)"
                    : category.status === "mixed"
                      ? "rgba(255, 152, 0, 0.2)"
                      : "#E8E8E8",
              },
            }}
          >
            {actionLabel}
          </Button>
        ) : (
          <Typography
            variant="body2"
            sx={{ color: "#8A8A8A" }}
          >
            В категории пока нет товаров
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
