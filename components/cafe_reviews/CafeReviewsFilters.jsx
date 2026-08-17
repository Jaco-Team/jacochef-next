import { Button, Grid } from "@mui/material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import { MyDatePickerNew, MySelect, MyTextInput } from "@/ui/Forms";
import dayjs from "dayjs";
import { blockBorder, brandRed, white } from "./shared";

const fieldSx = {
  "& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: white,
  },
  "& .MuiPickersInputBase-root": {
    minHeight: 40,
  },
  "& .MuiPickersOutlinedInput-notchedOutline": {
    borderColor: blockBorder,
  },
  "&:hover .MuiPickersOutlinedInput-notchedOutline": {
    borderColor: "#BDBDBD",
  },
  "& .MuiPickersOutlinedInput-root.Mui-focused .MuiPickersOutlinedInput-notchedOutline": {
    borderColor: brandRed,
    borderWidth: 2,
  },
  "& .MuiPickersInputBase-root .MuiSvgIcon-root": {
    color: "#7A7A7A",
  },
};

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
  const select = (name, label, data, emptyLabel, multiple = false) => (
    <MySelect
      label={label}
      data={[{ id: multiple ? "__all__" : "", name: emptyLabel }, ...data]}
      value={filters[name]}
      multiple={multiple}
      emptyLabel={emptyLabel}
      displayEmptyLabel
      func={(event) => {
        const value = event.target.value;
        if (Array.isArray(value)) {
          onChange(name, value.includes("__all__") ? [] : value.filter(Boolean));
          return;
        }
        onChange(name, value);
      }}
      is_none={false}
      sx={fieldSx}
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
      sx={{
        alignItems: "start",
      }}
    >
      <Grid size={{ xs: 12, md: 2 }}>
        <MyDatePickerNew
          label="Дата от"
          value={filters.date_from}
          format="DD.MM.YYYY"
          maxDate={filters.date_to ? dayjs(filters.date_to) : null}
          func={(value) =>
            onChange("date_from", value?.isValid() ? value.format("YYYY-MM-DD") : "")
          }
          sx={fieldSx}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <MyDatePickerNew
          label="Дата до"
          value={filters.date_to}
          format="DD.MM.YYYY"
          minDate={filters.date_from ? dayjs(filters.date_from) : null}
          func={(value) => onChange("date_to", value?.isValid() ? value.format("YYYY-MM-DD") : "")}
          sx={fieldSx}
        />
      </Grid>
      {showCafeFilter ? (
        <Grid size={{ xs: 12, md: 4 }}>
          <CityCafeAutocomplete2
            points={points}
            value={selectedPoints}
            label="Город + кафе"
            placeholder="Все кафе"
            withAll
            withOrganizationMode={false}
            compact={compact}
            disabled={!points.length}
            textFieldSx={fieldSx}
            onChange={(value) =>
              onChange(
                "point_ids",
                value.map((point) => point.id),
              )
            }
          />
        </Grid>
      ) : null}
      <Grid size={{ xs: 12, md: 2 }}>
        {select(
          "rating",
          "Оценка",
          [5, 4, 3, 2, 1].map((rating) => ({ id: rating, name: rating })),
          "Любая",
        )}
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        {select(
          "status",
          "Статус",
          dictionaries.statuses.map((option) => ({ id: option.value, name: option.label })),
          "Все статусы",
          true,
        )}
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        {select(
          "severity",
          "Критичность",
          dictionaries.severities.map((option) => ({ id: option.value, name: option.label })),
          "Любая",
        )}
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        {select(
          "issue",
          "Причина",
          dictionaries.issues.map((issue) => ({ id: issue.code, name: issue.name })),
          "Все причины",
        )}
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
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
      <Grid size={{ xs: 12, md: 3 }}>
        <MyTextInput
          id={id("search")}
          label="Поиск"
          placeholder="ID или текст отзыва"
          type="search"
          value={filters.search}
          func={(event) => onChange("search", event.target.value)}
          inputProps={{ "aria-label": "Поиск по отзывам и инцидентам" }}
          sx={fieldSx}
        />
      </Grid>
      <Grid
        size={{ xs: 12, md: 3 }}
        sx={{
          display: "flex",
          gap: 1,
          justifyContent: "flex-end",
        }}
      >
        <Button
          type="button"
          variant="outlined"
          startIcon={<RestartAltIcon />}
          onClick={onReset}
          sx={{
            minHeight: 40,
            minWidth: 0,
            flex: 1,
            borderRadius: "12px",
            textTransform: "none",
            px: 1.5,
            whiteSpace: "nowrap",
          }}
        >
          Сбросить
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={<FilterAltOutlinedIcon />}
          sx={{
            minHeight: 40,
            minWidth: 0,
            flex: 1,
            borderRadius: "12px",
            textTransform: "none",
            boxShadow: "none",
            px: 1.5,
            whiteSpace: "nowrap",
          }}
        >
          Применить
        </Button>
      </Grid>
    </Grid>
  );
}
