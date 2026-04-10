"use client";

import { Box, Button, Chip, Grid, ToggleButton, ToggleButtonGroup } from "@mui/material";
import dayjs from "dayjs";
import { MyAutocomplite } from "@/ui/Forms";

const getPeriodName = (periodType) => {
  if (periodType === "day") return "День";
  if (periodType === "week") return "Неделя";
  if (periodType === "month") return "Месяц";
  return periodType;
};

export default function PageFilters({
  filters,
  periodPresets,
  periodLabel,
  points,
  generatedAt,
  onFilterChange,
  onApply,
}) {
  const availablePeriods = periodPresets?.length
    ? periodPresets
    : [{ period_type: filters.period_type || "day" }];

  const generatedLabel = generatedAt ? dayjs(generatedAt).format("DD.MM.YYYY HH:mm") : null;

  return (
    <Box>
      <Grid
        container
        spacing={2}
        alignItems="flex-start"
      >
        <Grid size={{ xs: 12, md: 5 }}>
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

        <Grid size={{ xs: 12, md: 5 }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={filters.period_type || ""}
            onChange={(_, value) => {
              if (value) onFilterChange("period_type", value);
            }}
          >
            {availablePeriods.map((period) => (
              <ToggleButton
                key={period.period_type}
                value={period.period_type}
              >
                {getPeriodName(period.period_type)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {periodLabel ? (
            <Chip
              label={periodLabel}
              variant="outlined"
              sx={{ ml: 2 }}
            />
          ) : null}
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={onApply}
          >
            Показать
          </Button>
        </Grid>

        {generatedLabel ? (
          <Grid size={12}>
            <Chip
              label={`Обновлено: ${generatedLabel}`}
              variant="outlined"
            />
          </Grid>
        ) : null}
      </Grid>
    </Box>
  );
}
