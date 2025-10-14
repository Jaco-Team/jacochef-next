import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  Autocomplete,
  TextField,
  Checkbox,
  ListItemText,
  IconButton,
  Box,
  autocompleteClasses,
  Typography,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

// TODO: для того, чтобы это привести в порядок, Helper->getMyPointsList должен возвращать
// атомарные данные cityId и cityName, но придется весь фронт обойти и автокомплиты привести
// поэтому пока так
const cityNames = {
  1: "Тольятти",
  2: "Самара",
  3: "Москва",
};

const ALL_OPTION = { id: "__ALL__", name: "Все кафе", cityId: null, cityName: null };

export default function CityCafeAutocomplete2({
  points,
  value,
  defaultValue,
  onChange,
  label = "Кафе",
  placeholder = "Выбери кафе…",
  disabled,
  autoFocus,
  withAll = false,
  withAllSelected = false,
}) {
  // prepare map to update parent point []
  const pointsMap = useMemo(() => {
    const map = new Map();
    for (const p of points) {
      map.set(p.id, p);
    }
    return map;
  }, [points]);

  // adapter for common points structure
  const cities = useMemo(() => {
    const citiesMap =
      points.length > 0
        ? points.reduce((acc, p) => {
            const cityId = p.city_id;
            if (!acc[cityId]) acc[cityId] = [];
            acc[cityId].push({
              id: p.id,
              base: p.base,
              name: p.name,
              cityId,
              cityName: cityNames[cityId], // will be overwritten below
            });
            return acc;
          }, {})
        : {};
    return (
      Object.entries(citiesMap).map(([id, cafes]) => ({
        id: Number(id),
        name: cityNames[id],
        cafes,
      })) || []
    );
  }, [points]);

  const getNamesFromCafeName = (name = "") => {
    const splitted = name
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return splitted.length > 1 ? [splitted[0], splitted[1]] : [name, name];
  };

  const allCafes = useMemo(() => {
    const cafes =
      cities.flatMap((c) =>
        c.cafes.map((k) => {
          const [cityName, name] = getNamesFromCafeName(k.name);
          return {
            id: k.id,
            name,
            cityId: c.id,
            cityName: cityName || cityNames[c.id],
            base: k.base,
          };
        }),
      ) || [];
    return withAll ? [ALL_OPTION, ...cafes] : cafes;
  }, [cities, withAll]);

  const [innerValue, setInnerValue] = useState(() => defaultValue || []);

  const actualValue = useMemo(() => {
    if (withAll && value) {
      const isAll = value.length === points.length;
      if (isAll) return [ALL_OPTION]; // collapse to single All chip
      return value.map((v) => ({ ...v, cityId: v.city_id, cityName: cityNames[v.city_id] }));
    }
    return innerValue;
  }, [value, points, innerValue]);

  const allSelected = withAll && actualValue.some((v) => v.id === ALL_OPTION.id);

  const setValueSafe = (next) => {
    if (!withAll) {
      const mapped = next.map((v) => pointsMap.get(v.id)).filter(Boolean);
      onChange?.(mapped);
      if (value === undefined) setInnerValue(next);
      return;
    }

    const hasAll = next.some((o) => o.id === ALL_OPTION.id);
    const hasOthers = next.some((o) => o.id !== ALL_OPTION.id);
    const wasAll = (value ?? []).length === points.length; // parent holds full set when All active

    let cleanNext = [];
    let mapped = [];

    if (hasAll && !hasOthers) {
      // Only All → expand to full
      cleanNext = [ALL_OPTION];
      mapped = points;
    } else if (wasAll && hasOthers) {
      // All was active, user clicked another → uncheck All and keep others selected
      cleanNext = points.filter(
        (o) => o.id !== ALL_OPTION.id && !next.map((n) => n.id).includes(o.id),
      );
      mapped = cleanNext.map((v) => pointsMap.get(v.id)).filter(Boolean);
    } else if (hasAll && hasOthers) {
      // User toggled All along with others → collapse back to All
      cleanNext = [ALL_OPTION];
      mapped = points;
    } else {
      // Normal case
      cleanNext = next.filter((o) => o.id !== ALL_OPTION.id);
      mapped = cleanNext.map((v) => pointsMap.get(v.id)).filter(Boolean);
    }

    onChange?.(mapped);
    if (value === undefined) setInnerValue(cleanNext);
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

  useEffect(() => {
    setExpanded(new Set(cities.map((c) => c.id)));
  }, [cities]);

  useEffect(() => {
    withAll && withAllSelected && setValueSafe([ALL_OPTION]);
  }, [withAll, allCafes]);

  return (
    <Autocomplete
      multiple
      options={allCafes}
      disableCloseOnSelect
      value={actualValue}
      onChange={(_, next) => setValueSafe(next)}
      getOptionLabel={(opt) => opt.name}
      groupBy={(opt) => (opt.id === ALL_OPTION.id ? "GALL" : opt.cityName)}
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
      limitTags={2}
      getLimitTagsText={(more) => `+${more}`}
      size="small"
      renderOption={(props, option, { selected }) => {
        const isAll = option.id === ALL_OPTION.id;
        const { key, ...restProps } = props;
        if (isAll) {
          return (
            <li
              key={key}
              {...restProps}
              // key={ALL_OPTION.id}
            >
              <Checkbox
                size="small"
                checked={allSelected}
                onMouseDown={(e) => e.preventDefault()}
              />
              <ListItemText primary={<Typography noWrap>{option.name}</Typography>} />
            </li>
          );
        }

        return (
          <li
            key={key}
            {...restProps}
            // key={`${option.id}-${option.cityId}`}
          >
            <Checkbox
              size="small"
              checked={allSelected || selected}
              onMouseDown={(e) => e.preventDefault()}
            />
            <ListItemText
              sx={{ my: 0 }}
              primary={<Typography noWrap>{option.name}</Typography>}
              secondary={
                !isAll && (
                  <Typography
                    noWrap
                    color="text.secondary"
                  >
                    {option.cityName}
                  </Typography>
                )
              }
            />
          </li>
        );
      }}
      renderGroup={(groupParams) => {
        if (groupParams.group === "GALL") {
          return (
            <Box
              key={groupParams.key}
              component="li"
              sx={{ borderTop: "1px solid", borderColor: "divider" }}
            >
              <ul
                className={autocompleteClasses.groupUl}
                style={{ paddingLeft: 0 }}
              >
                {groupParams.children}
              </ul>
            </Box>
          );
        }
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
                zIndex: 1,
                background: "var(--mui-palette-background-paper)",
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 1,
                cursor: "pointer",
                "&:hover": { backgroundColor: "action.hover" },
              },
              [`& .${autocompleteClasses.groupUl}`]: {
                pl: 5,
                display: isOpen ? "block" : "none",
              },
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <div
              className={autocompleteClasses.groupLabel}
              onClick={(e) => {
                e.stopPropagation();
                cityId && handleToggleCity(cityId);
              }}
            >
              <IconButton
                size="small"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  cityId && toggleCityExpanded(cityId);
                }}
              >
                {isOpen ? <ExpandLess /> : <ExpandMore />}
              </IconButton>

              <Checkbox
                size="small"
                sx={{ p: 0 }}
                indeterminate={some && !all}
                checked={all || allSelected}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  cityId && handleToggleCity(cityId);
                }}
              />
              <ListItemText
                primary={<Typography fontWeight={600}>{groupParams.group}</Typography>}
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
              py: 0,
              px: 1,
            },
            [`& .${autocompleteClasses.groupLabel}`]: {
              py: 1,
              px: 0,
            },
            maxHeight: 420,
          },
          elevation: 3,
        },
        popper: {
          sx: {
            zIndex: 1300,
            // maxWidth: 400
          },
        },
        tag: { size: "small" },
      }}
    />
  );
}
