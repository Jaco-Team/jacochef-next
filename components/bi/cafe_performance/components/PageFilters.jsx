"use client";

import { useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { MyAutocomplite, MyDatePicker } from "@/ui/Forms";

export default function PageFilters({
  moduleName,
  filters,
  points,
  categories,
  stageTypes,
  generatedAt,
  onFilterChange,
  onApply,
}) {
  const selectedCategories = useMemo(
    () => categories.filter((category) => filters.category_ids.includes(category.id)),
    [categories, filters.category_ids],
  );

  const generatedLabel = generatedAt ? dayjs(generatedAt).format("DD.MM.YYYY HH:mm") : null;

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700 }}
          >
            {moduleName || "Эффективность кафе"}
          </Typography>
          <Typography sx={{ color: "#6B7280", mt: 0.5 }}>
            KPI по скорости, качеству и каналам продаж
          </Typography>
        </Box>
        {generatedLabel ? (
          <Chip
            label={`Обновлено: ${generatedLabel}`}
            sx={{
              alignSelf: { xs: "flex-start", md: "center" },
              bgcolor: "#F3F4F6",
              color: "#374151",
              borderRadius: "999px",
            }}
          />
        ) : null}
      </Stack>

      <Grid
        container
        spacing={2}
      >
        <Grid size={{ xs: 12, md: 3 }}>
          <MyAutocomplite
            label="Кафе"
            multiple
            data={points}
            value={filters.point_list}
            func={(_, value) => onFilterChange("point_list", value)}
            getOptionLabel={(option) => option?.name || ""}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <MyDatePicker
            label="Дата от"
            value={filters.date_start}
            maxDate={filters.date_end}
            func={(value) => onFilterChange("date_start", value)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <MyDatePicker
            label="Дата до"
            value={filters.date_end}
            minDate={filters.date_start}
            func={(value) => onFilterChange("date_end", value)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MyAutocomplite
            label="Категории"
            multiple
            data={categories}
            value={selectedCategories}
            func={(_, value) =>
              onFilterChange(
                "category_ids",
                value.map((item) => item.id),
              )
            }
            getOptionLabel={(option) => option?.name || ""}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 1 }}>
          <Button
            variant="contained"
            onClick={onApply}
          >
            Показать
          </Button>
        </Grid>

        {!!stageTypes?.length && (
          <Grid size={12}>
            <Stack spacing={1}>
              <Typography
                variant="body2"
                sx={{ color: "#4B5563" }}
              >
                Этап кухни
              </Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={filters.stage_type || ""}
                onChange={(_, value) => {
                  if (value) onFilterChange("stage_type", value);
                }}
                sx={{
                  flexWrap: "wrap",
                  gap: 1,
                  "& .MuiToggleButton-root": {
                    borderRadius: "999px !important",
                    borderColor: "#D1D5DB",
                    color: "#374151",
                    px: 2,
                    bgcolor: "#fff",
                  },
                  "& .MuiToggleButton-root.Mui-selected": {
                    bgcolor: "#1F2937",
                    color: "#fff",
                    "&:hover": { bgcolor: "#111827" },
                  },
                }}
              >
                {stageTypes.map((stage) => (
                  <ToggleButton
                    key={stage.id}
                    value={stage.id}
                  >
                    {stage.name}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
