import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#FFFFFF",
  },
};

function SelectField({ id, label, value, onChange, children, disabled = false }) {
  return (
    <FormControl
      fullWidth
      size="small"
      disabled={disabled}
      sx={fieldSx}
    >
      <InputLabel id={`${id}-label`}>{label}</InputLabel>
      <Select
        labelId={`${id}-label`}
        id={id}
        value={value}
        label={label}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </Select>
    </FormControl>
  );
}

export default function CafeReviewsFilters({
  filters,
  cities,
  points,
  dictionaries,
  onChange,
  onApply,
  onReset,
  idPrefix,
  compact = false,
}) {
  const id = (name) => `${idPrefix}-${name}`;

  return (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
      sx={{
        display: "grid",
        gridTemplateColumns: compact ? "minmax(0, 1fr)" : "repeat(auto-fit, minmax(170px, 1fr))",
        gap: 1.5,
        alignItems: "start",
      }}
    >
      <TextField
        id={id("date-from")}
        label="Дата от"
        type="date"
        size="small"
        value={filters.date_from}
        onChange={(event) => onChange("date_from", event.target.value)}
        slotProps={{
          inputLabel: { shrink: true },
          htmlInput: { max: filters.date_to || undefined },
        }}
        sx={fieldSx}
      />
      <TextField
        id={id("date-to")}
        label="Дата до"
        type="date"
        size="small"
        value={filters.date_to}
        onChange={(event) => onChange("date_to", event.target.value)}
        slotProps={{
          inputLabel: { shrink: true },
          htmlInput: { min: filters.date_from || undefined },
        }}
        sx={fieldSx}
      />
      <SelectField
        id={id("city")}
        label="Город"
        value={filters.city_id}
        onChange={(value) => onChange("city_id", value)}
      >
        <MenuItem value="">Все города</MenuItem>
        {cities.map((city) => (
          <MenuItem
            key={city.id}
            value={city.id}
          >
            {city.name}
          </MenuItem>
        ))}
      </SelectField>
      <SelectField
        id={id("point")}
        label="Кафе"
        value={filters.point_id}
        onChange={(value) => onChange("point_id", value)}
        disabled={!points.length}
      >
        <MenuItem value="">Все кафе</MenuItem>
        {points.map((point) => (
          <MenuItem
            key={point.id}
            value={point.id}
          >
            {point.name}
          </MenuItem>
        ))}
      </SelectField>
      <SelectField
        id={id("rating")}
        label="Оценка"
        value={filters.rating}
        onChange={(value) => onChange("rating", value)}
      >
        <MenuItem value="">Любая</MenuItem>
        {[5, 4, 3, 2, 1].map((rating) => (
          <MenuItem
            key={rating}
            value={rating}
          >
            {rating}
          </MenuItem>
        ))}
      </SelectField>
      <SelectField
        id={id("status")}
        label="Статус"
        value={filters.status}
        onChange={(value) => onChange("status", value)}
      >
        <MenuItem value="">Все статусы</MenuItem>
        {dictionaries.statuses.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
          >
            {option.label}
          </MenuItem>
        ))}
      </SelectField>
      <SelectField
        id={id("severity")}
        label="Критичность"
        value={filters.severity}
        onChange={(value) => onChange("severity", value)}
      >
        <MenuItem value="">Любая</MenuItem>
        {dictionaries.severities.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
          >
            {option.label}
          </MenuItem>
        ))}
      </SelectField>
      <SelectField
        id={id("issue")}
        label="Причина"
        value={filters.issue}
        onChange={(value) => onChange("issue", value)}
      >
        <MenuItem value="">Все причины</MenuItem>
        {dictionaries.issues.map((issue) => (
          <MenuItem
            key={issue.id ?? issue.code}
            value={issue.code}
          >
            {issue.name}
          </MenuItem>
        ))}
      </SelectField>
      <SelectField
        id={id("has-photo")}
        label="Фото"
        value={filters.has_photo}
        onChange={(value) => onChange("has_photo", value)}
      >
        <MenuItem value="">Неважно</MenuItem>
        <MenuItem value="1">Есть фото</MenuItem>
        <MenuItem value="0">Без фото</MenuItem>
      </SelectField>
      <TextField
        id={id("search")}
        label="Поиск"
        placeholder="ID или текст отзыва"
        size="small"
        value={filters.search}
        onChange={(event) => onChange("search", event.target.value)}
        sx={{
          ...fieldSx,
          gridColumn: compact ? "auto" : "span 2",
        }}
        slotProps={{
          htmlInput: { "aria-label": "Поиск по отзывам и инцидентам" },
        }}
      />
      <Box
        sx={{
          display: "flex",
          gap: 1,
          gridColumn: "auto",
          justifyContent: "flex-end",
        }}
      >
        <Button
          type="button"
          variant="outlined"
          startIcon={<RestartAltIcon />}
          onClick={onReset}
          sx={{ minHeight: 40, borderRadius: "12px", textTransform: "none" }}
        >
          Сбросить
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={<FilterAltOutlinedIcon />}
          sx={{
            minHeight: 40,
            borderRadius: "12px",
            textTransform: "none",
            boxShadow: "none",
          }}
        >
          Применить
        </Button>
      </Box>
    </Box>
  );
}
