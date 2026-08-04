import RefreshIcon from "@mui/icons-material/Refresh";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  DialogContent,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import { MySelect } from "@/ui/Forms";
import MyModal from "@/ui/MyModal";

import CategoryCard from "./CategoryCard";
import CloseBuyCategory from "./CloseBuyCategory";
import { CLOSE_BUY_STATUS_FILTERS, filterCategoryItems } from "./closeBuyUtils";

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
  onOpenCategoryActions,
  onToggleItem,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileCategoryId, setMobileCategoryId] = useState(null);
  const [mobileCategorySearch, setMobileCategorySearch] = useState("");
  const mobileCategory = categories.find((category) => category.id === mobileCategoryId) || null;
  const mobileCategoryItems = mobileCategory
    ? filterCategoryItems(mobileCategory.items, mobileCategorySearch)
    : [];

  const handleCloseCategoryModal = () => {
    setMobileCategoryId(null);
    setMobileCategorySearch("");
  };

  const handleSelectCategory = (categoryId) => {
    onSelectCategory?.(categoryId);

    if (isMobile) {
      setMobileCategoryId(categoryId);
      setMobileCategorySearch("");
    }
  };

  useEffect(() => {
    if (!isMobile) {
      setMobileCategoryId(null);
    }
  }, [isMobile]);

  return (
    <Stack spacing={3}>
      <Grid
        container
        spacing={2}
      >
        <Grid size={{ xs: 12, md: 4 }}>
          <MySelect
            is_none={true}
            data={points}
            value={selectedPointId}
            func={onPointChange}
            label="Кафе"
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
        <>
          {isMobile ? (
            <Paper
              sx={{
                px: 2,
                py: 1.25,
                borderRadius: "12px",
                bgcolor: "rgba(204, 0, 51, 0.06)",
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "#c03", fontWeight: 600 }}
              >
                {summary.open_categories} открыто • {summary.closed_categories} закрыто •{" "}
                {summary.mixed_categories} смешано
              </Typography>
            </Paper>
          ) : (
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
          )}
        </>
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
                  selected={!isMobile && selectedCategory?.id === category.id}
                  disabled={pendingCategoryId === category.id}
                  onSelect={isMobile ? handleSelectCategory : onSelectCategory}
                  onAction={onCategoryAction}
                />
              ))}
            </Stack>
          </Grid>
          {isMobile ? null : (
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
          )}
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

      {isMobile ? (
        <MyModal
          open={Boolean(mobileCategory)}
          onClose={handleCloseCategoryModal}
          title={mobileCategory ? `Категория: ${mobileCategory.name}` : "Категория"}
          maxWidth="sm"
        >
          <DialogContent sx={{ px: 2, pb: 2 }}>
            <CloseBuyCategory
              category={mobileCategory}
              items={
                mobileCategory && mobileCategory.id === selectedCategory?.id
                  ? filterCategoryItems(visibleCategoryItems, mobileCategorySearch)
                  : mobileCategoryItems
              }
              pendingItemId={pendingItemId}
              onToggleItem={onToggleItem}
              categoryAction={
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => onOpenCategoryActions?.(mobileCategory?.id)}
                  disabled={pendingCategoryId === mobileCategory?.id}
                  sx={{ minHeight: 40, borderRadius: "12px", borderColor: "#777", color: "#222" }}
                >
                  Действия со всей категорией
                </Button>
              }
              itemsFilter={
                <TextField
                  fullWidth
                  size="small"
                  type="search"
                  label="Поиск в категории"
                  value={mobileCategorySearch}
                  onChange={(event) => setMobileCategorySearch(event.target.value)}
                />
              }
            />
          </DialogContent>
        </MyModal>
      ) : null}
    </Stack>
  );
}
