"use client";

import { Box, Button, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import dayjs from "dayjs";
import { MyAutocomplite, MyDatePickerNew } from "@/ui/Forms";
import { CP_RADIUS, CP_SPACE } from "../layout";

const PERIOD_NAMES = {
  day: "День",
  week: "Неделя",
  month: "Месяц",
};

const getPeriodName = (periodType) => PERIOD_NAMES[periodType] || periodType;

export default function PageFilters({ filters, periodPresets, points, onFilterChange, onApply }) {
  const availablePeriods = periodPresets?.length
    ? periodPresets
    : [{ period_type: filters.period_type || "day" }];

  const dateStartValue = filters.date_start ? dayjs(filters.date_start) : null;
  const dateEndValue = filters.date_end ? dayjs(filters.date_end) : null;

  return (
    <Box
      sx={{
        borderRadius: CP_RADIUS.card,
        p: 0,
      }}
    >
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={CP_SPACE.group}
        alignItems={{ xs: "stretch", lg: "center" }}
        justifyContent="space-between"
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={CP_SPACE.component}
          alignItems={{ xs: "stretch", sm: "center" }}
          flexWrap="wrap"
          useFlexGap
          sx={{ flex: 1, minWidth: 0 }}
        >
          <Box sx={{ minWidth: { xs: "100%", sm: 260 }, flex: { sm: 1 }, maxWidth: { sm: 420 } }}>
            <MyAutocomplite
              label="Кафе"
              multiple
              data={points}
              value={filters.point_list}
              func={(_, value) => onFilterChange("point_list", value)}
              getOptionLabel={(option) => option?.name || ""}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
            />
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={CP_SPACE.component}
            flexWrap="wrap"
            useFlexGap
          >
            <ToggleButtonGroup
              exclusive
              size="small"
              value={filters.period_type || ""}
              onChange={(_, value) => {
                if (value) onFilterChange("period_type", value);
              }}
              // sx={{
              //   backgroundColor: "action.hover",
              //   borderRadius: CP_RADIUS.control,
              //   p: CP_SPACE.micro,
              //   "& .MuiToggleButton-root": {
              //     border: 0,
              //     borderRadius: CP_RADIUS.control,
              //     px: CP_SPACE.compact,
              //     py: CP_SPACE.micro,
              //     textTransform: "none",
              //     fontWeight: 600,
              //     color: "text.secondary",
              //   },
              //   "& .MuiToggleButton-root.Mui-selected": {
              //     backgroundColor: "background.paper",
              //     color: "text.primary",
              //     boxShadow: "0 1px 2px rgba(16,24,40,0.06)",
              //   },
              //   "& .MuiToggleButton-root.Mui-selected:hover": {
              //     backgroundColor: "background.paper",
              //   },
              // }}
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

            <Stack
              spacing={CP_SPACE.related}
              direction={{ xs: "column", sm: "row" }}
              sx={{
                width: { xs: "100%", sm: "auto" },
                minWidth: { xs: "100%", md: 220 },
              }}
            >
              <MyDatePickerNew
                label="Дата от"
                // customActions
                value={dateStartValue}
                maxDate={dateEndValue || dayjs()}
                func={(value) =>
                  onFilterChange("date_start", value ? dayjs(value).format("YYYY-MM-DD") : null)
                }
              />
              <MyDatePickerNew
                label="Дата до"
                // customActions
                value={dateEndValue}
                minDate={dateStartValue || undefined}
                maxDate={dayjs()}
                func={(value) =>
                  onFilterChange("date_end", value ? dayjs(value).format("YYYY-MM-DD") : null)
                }
              />
            </Stack>
          </Stack>
        </Stack>

        <Button
          variant="contained"
          onClick={onApply}
          sx={{
            borderRadius: CP_RADIUS.control,
            fontWeight: 600,
            px: CP_SPACE.component,
            width: { xs: "100%", sm: "fit-content" },
            ml: { xs: 0, sm: "auto" },
          }}
        >
          Показать
        </Button>
      </Stack>
    </Box>
  );
}
