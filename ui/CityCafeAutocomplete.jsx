import React, { useMemo, useState, useCallback } from "react";
import {
  Autocomplete,
  TextField,
  Checkbox,
  ListItemText,
  IconButton,
  Chip,
  Box,
  autocompleteClasses,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

export default function CityCafeAutocomplete({
  cities,
  value,
  defaultValue,
  onChange,
  label = "Кафе",
  placeholder = "Выбери кафе…",
  disabled,
  autoFocus,
}) {
  const allCafes = useMemo(() => {
    return cities.flatMap((c) =>
      c.cafes.map((k) => ({
        id: k.id,
        name: k.name,
        cityId: c.id,
        cityName: c.name,
      })),
    );
  }, [cities]);

  const [innerValue, setInnerValue] = useState(defaultValue ?? []);
  const actualValue = value ?? innerValue;

  const setValueSafe = (next) => {
    if (onChange) onChange(next);
    if (value === undefined) setInnerValue(next);
  };

  const [expanded, setExpanded] = useState(new Set(cities.map((c) => c.id)));

  const toggleCityExpanded = (cityId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cityId)) next.delete(cityId);
      else next.add(cityId);
      return next;
    });
  };

  const cafesByCity = useMemo(() => {
    const map = new Map();
    for (const cafe of allCafes) {
      if (!map.has(cafe.cityId)) map.set(cafe.cityId, []);
      map.get(cafe.cityId).push(cafe);
    }
    return map;
  }, [allCafes]);

  const selectedIds = useMemo(() => new Set(actualValue.map((v) => v.id)), [actualValue]);

  const citySelectState = useCallback(
    (cityId) => {
      const cityCafes = cafesByCity.get(cityId) ?? [];
      const total = cityCafes.length;
      const selectedCount = cityCafes.filter((c) => selectedIds.has(c.id)).length;
      return {
        all: total > 0 && selectedCount === total,
        none: selectedCount === 0,
        some: selectedCount > 0 && selectedCount < total,
      };
    },
    [cafesByCity, selectedIds],
  );

  const handleToggleCity = (cityId) => {
    const { all } = citySelectState(cityId);
    const cityCafes = cafesByCity.get(cityId) ?? [];
    if (all) {
      const next = actualValue.filter((c) => c.cityId !== cityId);
      setValueSafe(next);
    } else {
      const add = cityCafes.filter((c) => !selectedIds.has(c.id));
      const next = [...actualValue, ...add];
      setValueSafe(next);
    }
  };

  return (
    <Autocomplete
      multiple
      options={allCafes}
      disableCloseOnSelect
      value={actualValue}
      onChange={(_, next) => setValueSafe(next)}
      getOptionLabel={(opt) => opt.name}
      groupBy={(opt) => opt.cityName}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      disabled={disabled}
      autoFocus={autoFocus}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
        />
      )}
      renderTags={(selected, getTagProps) => {
        const maxVisible = 2;
        const extra = selected.length - maxVisible;
        const visible = selected.slice(0, maxVisible);
        return (
          <>
            {visible.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option.id}
                label={`${option.name} (${option.cityName})`}
              />
            ))}
            {extra > 0 && <Chip label={`+${extra}`} />}
          </>
        );
      }}
      renderOption={(props, option, { selected }) => (
        <li
          {...props}
          key={option.id}
        >
          <Checkbox
            size="small"
            checked={selected}
            onMouseDown={(e) => e.preventDefault()}
          />
          <ListItemText
            primary={option.name}
            secondary={option.cityName}
            primaryTypographyProps={{ noWrap: true }}
            secondaryTypographyProps={{ noWrap: true }}
          />
        </li>
      )}
      renderGroup={(groupParams) => {
        const city = cities.find((c) => c.name === groupParams.group);
        const cityId = city?.id ?? "";
        const isOpen = cityId ? expanded.has(cityId) : true;
        const { all, some } = cityId ? citySelectState(cityId) : { all: false, some: false };

        return (
          <Box
            key={groupParams.key}
            component="li"
            sx={{
              [`& .${autocompleteClasses.groupLabel}`]: {
                position: "sticky",
                top: 0,
                zIndex: 1,
                background: "var(--mui-palette-background-paper)",
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 0.5,
              },
              [`& .${autocompleteClasses.groupUl}`]: {
                pl: 5,
                display: isOpen ? "block" : "none",
              },
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <div className={autocompleteClasses.groupLabel}>
              <IconButton
                size="small"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => cityId && toggleCityExpanded(cityId)}
              >
                {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>

              <Checkbox
                size="small"
                indeterminate={some && !all}
                checked={all}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => cityId && handleToggleCity(cityId)}
              />
              <ListItemText
                primary={groupParams.group}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </div>

            <ul className={autocompleteClasses.groupUl}>{groupParams.children}</ul>
          </Box>
        );
      }}
      slotProps={{
        paper: {
          sx: {
            [`& .${autocompleteClasses.option}`]: {
              py: 0.5,
            },
            maxHeight: 420,
          },
          elevation: 3,
        },
        popper: {
          sx: { zIndex: 1300 },
        },
      }}
    />
  );
}

// const cities = [
//   {
//     id: "msk",
//     name: "Москва",
//     cafes: [
//       { id: "1", name: "Кофеин" },
//       { id: "2", name: "Пушкин" },
//     ],
//   },
//   {
//     id: "spb",
//     name: "Санкт-Петербург",
//     cafes: [
//       { id: "3", name: "Двойка" },
//       { id: "4", name: "Зингер" },
//     ],
//   },
// ];

// function App() {
//   return (
//     <div style={{ width: 400, padding: 20 }}>
//       <CityCafeAutocomplete
//         cities={cities}
//         onChange={(v) => console.log("Selected cafes:", v)}
//       />
//     </div>
//   );
// }

// export default App;
