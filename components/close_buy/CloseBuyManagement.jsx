import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  ButtonGroup,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import { MySelect } from "@/ui/Forms";

import CategoryCard from "./CategoryCard";
import CloseBuyCategory from "./CloseBuyCategory";
import { CLOSE_BUY_STATUS_FILTERS } from "./closeBuyUtils";

function SummaryCard({ label, value }) {
  return (
    <Paper sx={{ p: 2, borderRadius: "18px", border: "1px solid #EAEAEA" }}>
      <Typography
        variant="body2"
        sx={{ color: "#6B6B6B" }}
      >
        {label}
      </Typography>
      <Typography
        variant="h6"
        sx={{ mt: 0.75, fontWeight: 700 }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

export default function CloseBuyManagement({
  points,
  selectedPointId,
  search,
  statusFilter,
  summary,
  categories,
  selectedCategory,
  visibleCategoryItems,
  loading,
  pendingItemId,
  pendingCategoryId,
  onPointChange,
  onSearchChange,
  onStatusFilterChange,
  onSelectCategory,
  onRetry,
  onCategoryAction,
  onToggleItem,
}) {
  return (
    <Stack spacing={3}>
      <Grid
        container
        spacing={2}
      >
        <Grid size={{ xs: 12, md: 4 }}>
          <MySelect
            is_none={false}
            data={points}
            value={selectedPointId}
            func={onPointChange}
            label="Кафе"
            unifiedPopup
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            fullWidth
            size="small"
            label="Поиск по товарам и категориям"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
            sx={{ minHeight: 40, borderColor: "#c03", color: "#c03" }}
          >
            Обновить
          </Button>
        </Grid>
      </Grid>

      <ButtonGroup
        variant="outlined"
        sx={{ flexWrap: "wrap" }}
      >
        {CLOSE_BUY_STATUS_FILTERS.map((option) => (
          <Button
            key={option.value}
            variant={statusFilter === option.value ? "contained" : "outlined"}
            onClick={() => onStatusFilterChange(option.value)}
            sx={{
              borderColor: "#c03",
              color: statusFilter === option.value ? "#fff" : "#c03",
              bgcolor: statusFilter === option.value ? "#c03" : undefined,
              "&:hover": {
                borderColor: "#c03",
                bgcolor: statusFilter === option.value ? "#a8002b" : "rgba(204, 0, 51, 0.04)",
              },
            }}
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>

      {summary ? (
        <Grid
          container
          spacing={2}
        >
          <Grid size={{ xs: 12, sm: 4 }}>
            <SummaryCard
              label="Открытые категории"
              value={summary.open_categories}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <SummaryCard
              label="Закрытые категории"
              value={summary.closed_categories}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <SummaryCard
              label="Смешанные категории"
              value={summary.mixed_categories}
            />
          </Grid>
        </Grid>
      ) : null}

      {loading ? (
        <Grid
          container
          spacing={2}
        >
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  variant="rounded"
                  height={120}
                  sx={{ borderRadius: "18px" }}
                />
              ))}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Skeleton
              variant="rounded"
              height={420}
              sx={{ borderRadius: "18px" }}
            />
          </Grid>
        </Grid>
      ) : categories.length ? (
        <Grid
          container
          spacing={2}
          alignItems="flex-start"
        >
          <Grid
            size={{ xs: 12, md: 5 }}
            sx={{ height: "max-content" }}
          >
            <Stack spacing={2}>
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  selected={selectedCategory?.id === category.id}
                  disabled={pendingCategoryId === category.id}
                  onSelect={onSelectCategory}
                  onAction={onCategoryAction}
                />
              ))}
            </Stack>
          </Grid>
          <Grid
            size={{ xs: 12, md: 7 }}
            sx={{ height: "max-content" }}
          >
            <CloseBuyCategory
              category={selectedCategory}
              items={visibleCategoryItems}
              pendingItemId={pendingItemId}
              onToggleItem={onToggleItem}
            />
          </Grid>
        </Grid>
      ) : (
        <Paper sx={{ p: 4, borderRadius: "20px", border: "1px dashed #DADADA" }}>
          <Typography sx={{ fontWeight: 600 }}>Категории не найдены</Typography>
          <Typography
            variant="body2"
            sx={{ mt: 1, color: "#6B6B6B" }}
          >
            Попробуйте изменить фильтр или строку поиска.
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}
