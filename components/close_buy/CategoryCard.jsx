import { Button, Chip, Paper, Stack, Typography } from "@mui/material";

import { getCategoryStatusLabel } from "./closeBuyUtils";

export default function CategoryCard({ category, selected, disabled, onSelect, onAction }) {
  return (
    <Paper
      onClick={() => onSelect?.(category.id)}
      sx={{
        p: 2,
        borderRadius: "18px",
        border: selected ? "1px solid #c03" : "1px solid #E5E5E5",
        cursor: "pointer",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        boxShadow: selected ? "0 12px 28px rgba(204, 0, 51, 0.08)" : "none",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
      >
        <Stack
          spacing={1}
          sx={{ minWidth: 0 }}
        >
          <Typography sx={{ fontWeight: 700, color: "#2B2B2B" }}>{category.name}</Typography>
          <Typography
            variant="body2"
            sx={{ color: "#6B6B6B" }}
          >
            Открыто {category.open_count} из {category.count}
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
          }}
        />
      </Stack>

      <Stack
        spacing={1.5}
        sx={{ mt: 2 }}
      >
        {category.count > 0 ? (
          <Button
            variant={category.status === "open" ? "outlined" : "contained"}
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              onAction?.(category);
            }}
            sx={{
              minHeight: 44,
              borderRadius: "14px",
              bgcolor: category.status === "open" ? undefined : "#c03",
              borderColor: "#c03",
              color: category.status === "open" ? "#c03" : "#fff",
              "&:hover": {
                borderColor: "#c03",
                bgcolor: category.status === "open" ? "rgba(204, 0, 51, 0.04)" : "#a8002b",
              },
            }}
          >
            {category.status === "open"
              ? "Закрыть все"
              : category.status === "closed"
                ? "Открыть все"
                : "Действия с категорией"}
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
