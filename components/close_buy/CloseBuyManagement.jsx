import RefreshIcon from "@mui/icons-material/Refresh";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Skeleton,
  Stack,
  SwipeableDrawer,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import {
  JacoButton,
  JacoSegmentedTabs,
  JacoSelect,
  JacoTextInput,
} from "@/design-system/shared/ui";

import CategoryCard from "./CategoryCard";
import CloseBuyCategory from "./CloseBuyCategory";
import { CLOSE_BUY_STATUS_FILTERS, filterCategoryItems } from "./closeBuyUtils";

function SummaryCard({ label, value }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        height: 50,
        px: 2,
        borderRadius: "14px",
        borderColor: "#E3E3E3",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography sx={{ fontSize: 16, lineHeight: "20px", color: "#6B6B6B", fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: 16,
            lineHeight: "20px",
            fontWeight: 700,
            color: "#2B2B2B",
            flexShrink: 0,
          }}
        >
          {value}
        </Typography>
      </Box>
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
  const isMobile = useMediaQuery(theme.breakpoints.down("md"), { noSsr: true });
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
          <JacoSelect
            options={points}
            value={selectedPointId}
            onChange={onPointChange}
            label="Кафе"
            allowNone={false}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <JacoTextInput
            fullWidth
            size="small"
            type="search"
            placeholder="Поиск по товарам и категориям"
            value={search}
            inputProps={{ minLength: 2 }}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <JacoButton
            fullWidth
            compact
            tone="outlinePrimary"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
          >
            Обновить
          </JacoButton>
        </Grid>
      </Grid>
      <JacoSegmentedTabs
        items={CLOSE_BUY_STATUS_FILTERS.map((option) => ({
          id: option.value,
          value: option.value,
          label: option.label,
        }))}
        value={statusFilter}
        onChange={(_, nextStatus) => {
          if (nextStatus) onStatusFilterChange(nextStatus);
        }}
        aria-label="Фильтр категорий по статусу"
        size="compact"
        variant="standard"
        sx={{
          width: "fit-content",
          maxWidth: "100%",
        }}
      />
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
        <SwipeableDrawer
          anchor="bottom"
          open={Boolean(mobileCategory)}
          onClose={handleCloseCategoryModal}
          onOpen={() => {}}
          disableSwipeToOpen
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            "& .MuiBackdrop-root": {
              bgcolor: "rgba(0, 0, 0, 0.48)",
            },
          }}
          slotProps={{
            paper: {
              sx: {
                height: "75dvh",
                maxHeight: "calc(100dvh - 24px)",
                borderRadius: "24px 24px 0 0",
                overflow: "hidden",
                bgcolor: "#FFFFFF",
              },
            },
          }}
        >
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ flexShrink: 0, pt: 1.25, px: 2.5, pb: 1.5 }}>
              <Box
                sx={{
                  width: 48,
                  height: 5,
                  mx: "auto",
                  mb: 1.75,
                  borderRadius: "999px",
                  bgcolor: "#D9D9D9",
                }}
              />
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#292929" }}
              >
                {mobileCategory ? `Категория: ${mobileCategory.name}` : "Категория"}
              </Typography>
            </Box>

            <Box
              sx={{
                minHeight: 0,
                flex: 1,
                overflowY: "auto",
                overscrollBehavior: "contain",
                px: 2,
                pb: "calc(16px + env(safe-area-inset-bottom))",
              }}
            >
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
            </Box>
          </Box>
        </SwipeableDrawer>
      ) : null}
    </Stack>
  );
}
