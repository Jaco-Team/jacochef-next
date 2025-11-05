import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  Checkbox,
  ListItemText,
  IconButton,
  Box,
  autocompleteClasses,
  Typography,
  Button,
  Paper,
  ButtonGroup,
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
  // map for fast lookup
  const pointsMap = useMemo(() => {
    const map = new Map();
    for (const p of points) map.set(p.id, p);
    return map;
  }, [points]);

  // group points by city
  const cities = useMemo(() => {
    if (!points?.length) return [];
    const citiesMap = points.reduce((acc, p) => {
      if (!acc[p.city_id]) acc[p.city_id] = [];
      acc[p.city_id].push({
        id: p.id,
        base: p.base,
        name: p.name,
        cityId: p.city_id,
        cityName: cityNames[p.city_id],
        organization: p.organization,
      });
      return acc;
    }, {});
    return Object.entries(citiesMap).map(([id, cafes]) => ({
      id: Number(id),
      name: cityNames[id],
      cafes,
    }));
  }, [points]);

  const [groupMode, setGroupMode] = useState("city"); // "city" | "org"

  const getNamesFromCafeName = (name = "") => {
    const parts = name
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length > 1 ? [parts[0], parts[1]] : [name, name];
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
            organization: k.organization,
          };
        }),
      ) || [];
    return withAll ? [ALL_OPTION, ...cafes] : cafes;
  }, [cities, withAll]);

  const [innerValue, setInnerValue] = useState(defaultValue || []);
  const actualValue = useMemo(() => {
    if (withAll && value) {
      const isAll = value.length === points.length;
      if (isAll) return [ALL_OPTION];
      return value.map((v) => ({
        ...v,
        cityId: v.city_id,
        cityName: cityNames[v.city_id],
      }));
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

  // expanded state: key = cityId | orgName
  const [expanded, setExpanded] = useState(new Set(cities.map((c) => c.id)));

  const toggleGroupExpanded = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
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

  const cafesByOrganization = useMemo(() => {
    const map = new Map();
    for (const cafe of allCafes) {
      if (!cafe.organization) continue;
      const org = cafe.organization;
      if (!map.has(org)) map.set(org, []);
      map.get(org).push(cafe);
    }
    return map;
  }, [allCafes]);

  const selectedIds = useMemo(() => new Set(actualValue.map((v) => v.id)), [actualValue]);

  const groupSelectState = useCallback(
    (key, byOrg = false) => {
      const group = byOrg ? (cafesByOrganization.get(key) ?? []) : (cafesByCity.get(key) ?? []);
      const total = group.length;
      const selectedCount = group.filter((c) => selectedIds.has(c.id)).length;
      return {
        all: total > 0 && selectedCount === total,
        none: selectedCount === 0,
        some: selectedCount > 0 && selectedCount < total,
      };
    },
    [cafesByCity, cafesByOrganization, selectedIds],
  );

  const handleToggleGroup = (key, byOrg = false) => {
    const { all } = groupSelectState(key, byOrg);
    const group = byOrg ? (cafesByOrganization.get(key) ?? []) : (cafesByCity.get(key) ?? []);

    if (all) {
      const next = actualValue.filter((c) => (byOrg ? c.organization !== key : c.cityId !== key));
      setValueSafe(next);
    } else {
      const add = group.filter((c) => !selectedIds.has(c.id));
      const next = [...actualValue, ...add];
      setValueSafe(next);
    }
  };

  useEffect(() => {
    const initKeys =
      groupMode === "city" ? cities.map((c) => c.id) : Array.from(cafesByOrganization.keys());
    setExpanded(new Set(initKeys));
  }, [cities, cafesByOrganization, groupMode]);

  useEffect(() => {
    withAll && withAllSelected && setValueSafe([ALL_OPTION]);
  }, [withAll, allCafes]);

  const groupBy = useCallback(
    (opt) => {
      if (opt.id === ALL_OPTION.id) return "GALL";
      return groupMode === "city" ? opt.cityName : opt.organization || "Без организации";
    },
    [groupMode],
  );

  const CustomPaper = React.forwardRef(function CustomPaper(props, ref) {
    if (!cafesByOrganization.size) return null;
    const { children, ...other } = props;

    return (
      <Paper
        ref={ref}
        {...other}
      >
        <Box
          sx={{
            px: 1.5,
            py: 1,
            // mb: 0.5,
            display: "flex",
            justifyContent: "center",
            // borderBottom: "1px solid",
            // borderColor: "divider",
            position: "sticky",
            top: 0,
            backgroundColor: "background.paper",
            zIndex: 2,
          }}
        >
          <ButtonGroup
            size="small"
            variant="outlined"
            fullWidth
            sx={{
              "& .MuiButton-root": {
                textTransform: "none",
                minWidth: 100,
              },
            }}
          >
            <Button
              variant={groupMode === "city" ? "contained" : "outlined"}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setGroupMode("city");
              }}
            >
              По городам
            </Button>
            <Button
              variant={groupMode === "org" ? "contained" : "outlined"}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setGroupMode("org");
              }}
            >
              По организациям
            </Button>
          </ButtonGroup>
        </Box>
        {children}
      </Paper>
    );
  });

  return (
    <Autocomplete
      multiple
      options={allCafes}
      disableCloseOnSelect
      value={actualValue}
      onChange={(_, next) => setValueSafe(next)}
      getOptionLabel={(opt) => opt.name}
      groupBy={groupBy}
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
        return (
          <li
            key={key}
            {...restProps}
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
              // sx={{ borderTop: "1px solid", borderColor: "divider" }}
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

        const isCityMode = groupMode === "city";
        const entityName = groupParams.group;
        const entityKey = isCityMode
          ? (cities.find((c) => c.name === entityName)?.id ?? "")
          : entityName;
        const isOpen = expanded.has(entityKey);
        const { all, some } = groupSelectState(entityKey, !isCityMode);

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
                // py: 1,
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
                handleToggleGroup(entityKey, !isCityMode);
              }}
            >
              <IconButton
                size="small"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleGroupExpanded(entityKey);
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
                  handleToggleGroup(entityKey, !isCityMode);
                }}
              />
              <ListItemText primary={<Typography fontWeight={600}>{entityName}</Typography>} />
            </div>

            <ul className={autocompleteClasses.groupUl}>{groupParams.children}</ul>
          </Box>
        );
      }}
      slots={{
        paper: CustomPaper,
      }}
      slotProps={{
        paper: {
          sx: {
            [`& .${autocompleteClasses.option}`]: { py: 0, px: 1 },
            [`& .${autocompleteClasses.groupLabel}`]: { py: 1, px: 0 },
            [`& .${autocompleteClasses.listbox}`]: { maxHeight: 420 },
            position: "relative",
          },
          elevation: 3,
        },
        popper: { sx: { zIndex: 1300 } },
        tag: { size: "small" },
      }}
    />
  );
}
