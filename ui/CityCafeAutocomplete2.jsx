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
  "-1": "Офис",
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
  singleCityOnly = false,
  withOrganizationMode = true,
  compact = false,
  onBlur,
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
      name: cityNames[id] ?? cafes[0]?.cityName ?? "Без города",
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
  const normalizeCafeOption = useCallback((option) => {
    const cityId = option?.cityId ?? option?.city_id;

    return {
      ...option,
      cityId,
      cityName: option?.cityName ?? cityNames[cityId],
    };
  }, []);

  const actualValue = useMemo(() => {
    if (value) {
      if (withAll) {
        const isAll = value.length === points.length;
        if (isAll) return [ALL_OPTION];
      }

      return value.map(normalizeCafeOption);
    }

    return innerValue;
  }, [value, points, innerValue, withAll, normalizeCafeOption]);

  const allSelected = withAll && actualValue.some((v) => v.id === ALL_OPTION.id);
  const getOptionKey = useCallback(
    (option) => `${option?.id ?? option?.name ?? "option"}-${option?.cityId ?? "all"}`,
    [],
  );

  const limitToSingleCity = useCallback(
    (next, preferredCityId) => {
      const cafes = next.filter((item) => item.id !== ALL_OPTION.id).map(normalizeCafeOption);

      const lastCafe = cafes.length ? cafes[cafes.length - 1] : null;
      const cityId = preferredCityId ?? lastCafe?.cityId;

      if (!cityId) {
        return cafes;
      }

      return cafes.filter((item) => item.cityId === cityId);
    },
    [normalizeCafeOption],
  );

  const setValueSafe = (next, preferredCityId = null) => {
    if (!withAll) {
      const cleanNext = singleCityOnly ? limitToSingleCity(next, preferredCityId) : next;
      const mapped = cleanNext.map((v) => pointsMap.get(v.id)).filter(Boolean);
      onChange?.(mapped);
      if (value === undefined) setInnerValue(cleanNext);
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
      const preferredCityId = byOrg ? (actualValue[0]?.cityId ?? group[0]?.cityId) : key;
      const base = singleCityOnly
        ? actualValue.filter((c) => c.cityId === preferredCityId)
        : actualValue;
      const add = group.filter((c) => !selectedIds.has(c.id));
      const next = [...base, ...add];
      setValueSafe(next, singleCityOnly ? preferredCityId : null);
    }
  };

  useEffect(() => {
    const initKeys =
      groupMode === "city" ? cities.map((c) => c.id) : Array.from(cafesByOrganization.keys());
    setExpanded(new Set(initKeys));
  }, [cities, cafesByOrganization, groupMode]);

  useEffect(() => {
    if (!withAll || !withAllSelected || !points.length) return;

    const controlledValue = value;
    const isAlreadyAllSelected =
      controlledValue?.length === points.length &&
      points.every((point) => controlledValue?.some((item) => item.id === point.id));

    if (!isAlreadyAllSelected) {
      setValueSafe([ALL_OPTION]);
    }
  }, [points, withAll, withAllSelected]);

  useEffect(() => {
    if (!withOrganizationMode && groupMode !== "city") {
      setGroupMode("city");
    }
  }, [groupMode, withOrganizationMode]);

  const groupBy = useCallback(
    (opt) => {
      if (opt.id === ALL_OPTION.id) return "GALL";
      return groupMode === "city" || !withOrganizationMode
        ? opt.cityName
        : opt.organization || "Без организации";
    },
    [groupMode, withOrganizationMode],
  );

  const CustomPaper = React.forwardRef(function CustomPaper(props, ref) {
    const { children, ...other } = props;
    const hasOrganizations = withOrganizationMode && cafesByOrganization.size > 0;

    return (
      <Paper
        ref={ref}
        {...other}
      >
        {hasOrganizations && (
          <Box
            sx={{
              px: 1.5,
              py: 1,
              display: "flex",
              justifyContent: "center",
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
        )}
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
      onChange={(_, next, reason, details) =>
        setValueSafe(next, details?.option?.cityId ?? details?.option?.city_id ?? null)
      }
      getOptionLabel={(opt) => opt.name}
      getOptionKey={getOptionKey}
      groupBy={groupBy}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      disabled={disabled}
      autoFocus={autoFocus}
      onBlur={onBlur}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          sx={
            compact
              ? {
                  "& .MuiInputBase-root": { minHeight: 40 },
                  "& .MuiInputBase-input": { fontSize: 14 },
                  "& .MuiInputLabel-root": { fontSize: 13 },
                }
              : undefined
          }
        />
      )}
      limitTags={compact ? 1 : 2}
      getLimitTagsText={(more) => `+${more}`}
      size="small"
      renderOption={(props, option, { selected }) => {
        const isAll = option.id === ALL_OPTION.id;
        const { key, ...restProps } = props;
        return (
          <li
            key={getOptionKey(option) || key}
            {...restProps}
          >
            <Checkbox
              size="small"
              sx={compact ? { p: 0.5 } : undefined}
              checked={allSelected || selected}
              onMouseDown={(e) => e.preventDefault()}
            />
            <ListItemText
              sx={{ my: 0 }}
              primary={
                <Typography
                  noWrap
                  sx={{ fontSize: compact ? 14 : undefined }}
                >
                  {option.name}
                </Typography>
              }
              secondary={
                !isAll && (
                  <Typography
                    noWrap
                    color="text.secondary"
                    sx={{ fontSize: compact ? 12 : undefined }}
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

        const isCityMode = groupMode === "city" || !withOrganizationMode;
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
                sx={compact ? { p: 0.25 } : undefined}
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
              <ListItemText
                primary={
                  <Typography
                    fontWeight={600}
                    sx={{ fontSize: compact ? 14 : undefined }}
                  >
                    {entityName}
                  </Typography>
                }
              />
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
            [`& .${autocompleteClasses.option}`]: { py: compact ? 0.25 : 0, px: 1 },
            [`& .${autocompleteClasses.groupLabel}`]: { py: compact ? 0.5 : 1, px: 0 },
            [`& .${autocompleteClasses.listbox}`]: { maxHeight: compact ? 280 : 420 },
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
