import { Paper, Stack, Typography } from "@mui/material";

import ItemRow from "./ItemRow";

export default function CloseBuyCategory({
  category,
  items,
  pendingItemId,
  onToggleItem,
  categoryAction,
  itemsFilter,
}) {
  if (!category) {
    return (
      <Paper sx={{ p: 3, borderRadius: "20px", border: "1px solid #EAEAEA" }}>
        <Typography sx={{ color: "#6B6B6B" }}>
          Выберите категорию слева, чтобы посмотреть товары.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: "20px", border: "1px solid #EAEAEA" }}>
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            {category.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#6B6B6B" }}
          >
            Открыто {category.open_count} из {category.count}
          </Typography>
        </Stack>

        {categoryAction}
        {itemsFilter}

        {items.length ? (
          <Stack spacing={1.25}>
            {items.map((item) => (
              <ItemRow
                key={item.item_id}
                item={item}
                disabled={pendingItemId === item.item_id}
                onToggle={(nextIsActive) =>
                  onToggleItem?.({
                    itemId: item.item_id,
                    isActive: nextIsActive,
                    categoryId: category.id,
                  })
                }
              />
            ))}
          </Stack>
        ) : (
          <Typography sx={{ color: "#8A8A8A" }}>По текущему поиску товаров не найдено.</Typography>
        )}
      </Stack>
    </Paper>
  );
}
