import { Grid } from "@mui/material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  JacoButton,
  JacoCityCafe,
  JacoDatePicker,
  JacoSelect,
  JacoTextInput,
} from "@/design-system/shared/ui";

const ALL_VALUE = "__all__";

export default function CafeReviewsFilters({
  filters,
  points,
  dictionaries,
  showCafeFilter = true,
  onChange,
  onApply,
  onReset,
  idPrefix,
  compact = false,
}) {
  const id = (name) => `${idPrefix}-${name}`;
  const selectedPoints = points.filter((point) =>
    (filters.point_ids || []).some((pointId) => String(pointId) === String(point.id)),
  );
  const fieldSize = compact ? 12 : { xs: 12, md: 2 };

  // The first option clears the filter; an empty value shows the label as a placeholder.
  const select = (name, label, options, emptyLabel, { multiple = false, numeric = false } = {}) => (
    <JacoSelect
      id={id(name)}
      label={label}
      options={[{ id: multiple ? ALL_VALUE : "", name: emptyLabel }, ...options]}
      value={filters[name]}
      multiple={multiple}
      allowNone={false}
      onChange={(event) => {
        const value = event.target.value;
        if (Array.isArray(value)) {
          onChange(name, value.includes(ALL_VALUE) ? [] : value.filter(Boolean));
          return;
        }
        onChange(name, numeric && value !== "" ? Number(value) : value);
      }}
    />
  );

  return (
    <Grid
      container
      component="form"
      spacing={2}
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
      sx={{ alignItems: "start" }}
    >
      <Grid size={fieldSize}>
        <JacoDatePicker
          label="Дата от"
          value={filters.date_from}
          format="DD.MM.YYYY"
          maxDate={filters.date_to || undefined}
          onChange={(value) =>
            onChange("date_from", value?.isValid?.() ? value.format("YYYY-MM-DD") : "")
          }
        />
      </Grid>
      <Grid size={fieldSize}>
        <JacoDatePicker
          label="Дата до"
          value={filters.date_to}
          format="DD.MM.YYYY"
          minDate={filters.date_from || undefined}
          onChange={(value) =>
            onChange("date_to", value?.isValid?.() ? value.format("YYYY-MM-DD") : "")
          }
        />
      </Grid>
      {showCafeFilter ? (
        <Grid size={compact ? 12 : { xs: 12, md: 4 }}>
          <JacoCityCafe
            points={points}
            value={selectedPoints}
            label="Город + кафе"
            placeholder="Все кафе"
            withAll
            withOrganizationMode={false}
            compact={compact}
            disabled={!points.length}
            onChange={(value) =>
              onChange(
                "point_ids",
                (value || []).map((point) => point.id),
              )
            }
          />
        </Grid>
      ) : null}
      <Grid size={fieldSize}>
        {select(
          "rating",
          "Оценка",
          [5, 4, 3, 2, 1].map((rating) => ({ id: rating, name: String(rating) })),
          "Любая",
          { numeric: true },
        )}
      </Grid>
      <Grid size={fieldSize}>
        {select(
          "status",
          "Статус",
          dictionaries.statuses.map((option) => ({ id: option.value, name: option.label })),
          "Все статусы",
          { multiple: true },
        )}
      </Grid>
      <Grid size={fieldSize}>
        {select(
          "severity",
          "Критичность",
          dictionaries.severities.map((option) => ({ id: option.value, name: option.label })),
          "Любая",
        )}
      </Grid>
      <Grid size={fieldSize}>
        {select(
          "issue",
          "Причина",
          dictionaries.issues.map((issue) => ({ id: issue.code, name: issue.name })),
          "Все причины",
        )}
      </Grid>
      <Grid size={fieldSize}>
        {select(
          "has_photo",
          "Фото",
          [
            { id: "1", name: "Есть фото" },
            { id: "0", name: "Без фото" },
          ],
          "Неважно",
        )}
      </Grid>
      <Grid size={compact ? 12 : { xs: 12, md: 3 }}>
        <JacoTextInput
          id={id("search")}
          fullWidth
          label="Поиск"
          placeholder="ID или текст отзыва"
          type="search"
          value={filters.search}
          onChange={(event) => onChange("search", event.target.value)}
          inputProps={{ "aria-label": "Поиск по отзывам и инцидентам" }}
        />
      </Grid>
      <Grid
        size={compact ? 12 : { xs: 12, md: 3 }}
        sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
      >
        <JacoButton
          type="button"
          tone="secondary"
          startIcon={<RestartAltIcon />}
          onClick={onReset}
          sx={{ flex: 1, minWidth: 0 }}
        >
          Сбросить
        </JacoButton>
        <JacoButton
          type="submit"
          startIcon={<FilterAltOutlinedIcon />}
          sx={{ flex: 1, minWidth: 0 }}
        >
          Применить
        </JacoButton>
      </Grid>
    </Grid>
  );
}
