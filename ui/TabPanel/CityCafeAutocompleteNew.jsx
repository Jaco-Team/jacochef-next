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
  Button,
  Paper,
  ButtonGroup,
  InputAdornment,
  Popper,
  ClickAwayListener,
} from "@mui/material";
import Image from "next/image";
import Office from "../../public/Office.png";
import City from "../../public/City.png";
import Spacing from "../../public/Spacing.png";
import SearchIcon from "@mui/icons-material/Search";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import Chip from "@mui/material/Chip";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";

const cityNames = {
  1: "Тольятти",
  2: "Самара",
  3: "Москва",
};

const ALL_OPTION = { id: "__ALL__", name: "Все кафе", cityId: null, cityName: null };

const TopPopper = React.memo((props) => {
  const { open, anchorEl, ...rest } = props;
  const [frozenPosition, setFrozenPosition] = React.useState(null);

  React.useEffect(() => {
    if (open && anchorEl && !frozenPosition) {
      const rect = anchorEl.getBoundingClientRect();
      setFrozenPosition({
        top: rect.top + window.scrollY + 75,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }

    if (!open) {
      setFrozenPosition(null);
    }
  }, [open, anchorEl]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: frozenPosition ? frozenPosition.top - 80 : 0,
        left: frozenPosition?.left || 0,
        width: frozenPosition?.width || "auto",
        zIndex: 1500,
        pointerEvents: "auto",
      }}
      ref={rest.popperRef}
    >
      {props.children}
    </div>
  );
});

const CustomPaper = React.memo(
  React.forwardRef(function CustomPaper(
    {
      children,
      searchQuery,
      setSearchQuery,
      groupMode,
      setGroupMode,
      cafesByOrganization,
      allSelected,
      handleSelectAll,
      expanded,
      setExpanded,
      cafesByCity,
      cities,
      groupSelectState,
      handleToggleGroup,
      toggleGroupExpanded,
    },
    ref,
  ) {
    const hasOrganizations = cafesByOrganization.size > 0;
    const searchInputRef = useRef(null);

    // Фокус на поле поиска при открытии
    useEffect(() => {
      if (searchInputRef.current) {
        const input = searchInputRef.current.querySelector("input");
        if (input) {
          // Небольшая задержка для гарантии, что компонент отрендерился
          const timer = setTimeout(() => {
            input.focus();
          }, 50);
          return () => clearTimeout(timer);
        }
      }
    }, []);

    const handleSearchMouseDown = (e) => {
      e.stopPropagation();
    };

    const handleSearchClick = (e) => {
      e.stopPropagation();
    };

    return (
      <Paper ref={ref}>
        {hasOrganizations && (
          <Box
            sx={{
              px: 1.5,
              py: 1,
              display: "flex",
              justifyContent: "center",
              position: "sticky",
              top: 10,
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
                <Image
                  src={City}
                  alt=""
                  width={16}
                  height={16}
                  loading="lazy"
                  style={{ marginRight: "9px", marginBottom: "2px" }}
                />
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
                <Image
                  src={Office}
                  alt=""
                  width={16}
                  height={16}
                  loading="lazy"
                  style={{ marginRight: "9px", marginBottom: "2px" }}
                />
                По организациям
              </Button>
            </ButtonGroup>
          </Box>
        )}

        {/* Select All row */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            style={{
              padding: "6px",
              backgroundColor: "white",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              border: "1px solid #CAC4D0",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setSearchQuery("");

              const newExpanded = new Set();
              if (groupMode === "city") {
                cafesByCity.forEach((cafes, cityId) => {
                  if (cafes.length > 0) newExpanded.add(cityId);
                });
              } else {
                cafesByOrganization.forEach((cafes, orgName) => {
                  if (cafes.length > 0) newExpanded.add(orgName);
                });
              }
              setExpanded(newExpanded);
            }}
          >
            <Image
              src={Spacing}
              alt="Clear search"
              width={20}
              height={20}
              loading="lazy"
            />
          </button>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              size="small"
              checked={allSelected}
              onChange={handleSelectAll}
              sx={{ mr: 0.25 }}
            />
            <span
              className="items-label-all"
              onClick={handleSelectAll}
            >
              Выбрать все
            </span>
          </Box>
        </Box>

        <Box sx={{ px: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Что ищете?"
            value={searchQuery}
            ref={searchInputRef}
            onChange={(e) => setSearchQuery(e.target.value)}
            onMouseDown={handleSearchMouseDown}
            onClick={handleSearchClick}
            InputProps={{
              endAdornment: (
                <InputAdornment
                  position="end"
                  onMouseDown={handleSearchMouseDown}
                >
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
              },
            }}
          />
        </Box>

        {children}
      </Paper>
    );
  }),
);

export default function CityCafeAutocompleteNew({
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
  const paperRef = useRef(null);
  const containerRef = useRef(null);

  // map for fast lookup
  const pointsMap = useMemo(() => {
    const map = new Map();
    for (const p of points) map.set(p.id, p);
    return map;
  }, [points]);

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    return cafes;
  }, [cities, withAll]);

  // Фильтрация кафе по поисковому запросу
  const filteredCafes = useMemo(() => {
    if (!searchQuery.trim()) return allCafes;

    const query = searchQuery.toLowerCase();
    return allCafes.filter(
      (cafe) =>
        cafe.name.toLowerCase().includes(query) ||
        cafe.cityName?.toLowerCase().includes(query) ||
        cafe.organization?.toLowerCase().includes(query),
    );
  }, [allCafes, searchQuery]);

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
      cleanNext = next.filter((o) => o.id !== ALL_OPTION.id);
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

  // Handle Select All checkbox
  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all
      setValueSafe([]);
    } else {
      // Select all
      if (withAll) {
        setValueSafe([ALL_OPTION]);
      } else {
        setValueSafe(allCafes);
      }
    }
  };

  // expanded state: key = cityId | orgName
  const [expanded, setExpanded] = useState(new Set());

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
    for (const cafe of filteredCafes) {
      if (!map.has(cafe.cityId)) map.set(cafe.cityId, []);
      map.get(cafe.cityId).push(cafe);
    }
    return map;
  }, [filteredCafes]);

  const cafesByOrganization = useMemo(() => {
    const map = new Map();
    for (const cafe of filteredCafes) {
      if (!cafe.organization) continue;
      const org = cafe.organization;
      if (!map.has(org)) map.set(org, []);
      map.get(org).push(cafe);
    }
    return map;
  }, [filteredCafes]);

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
    // Auto-expand groups that have matches when searching
    if (searchQuery.trim()) {
      const expandedKeys = new Set();

      if (groupMode === "city") {
        cafesByCity.forEach((cafes, cityId) => {
          if (cafes.length > 0) expandedKeys.add(cityId);
        });
      } else {
        cafesByOrganization.forEach((cafes, orgName) => {
          if (cafes.length > 0) expandedKeys.add(orgName);
        });
      }

      setExpanded(expandedKeys);
    } else {
      // Когда поиск очищен, раскрываем все группы
      const expandedKeys = new Set();
      if (groupMode === "city") {
        cafesByCity.forEach((cafes, cityId) => {
          if (cafes.length > 0) expandedKeys.add(cityId);
        });
      } else {
        cafesByOrganization.forEach((cafes, orgName) => {
          if (cafes.length > 0) expandedKeys.add(orgName);
        });
      }
      setExpanded(expandedKeys);
    }
  }, [searchQuery, groupMode, cafesByCity, cafesByOrganization]);

  useEffect(() => {
    withAll && withAllSelected && setValueSafe([ALL_OPTION]);
  }, [withAll, withAllSelected]);

  const groupBy = useCallback(
    (opt) => {
      if (opt.id === ALL_OPTION.id) return "GALL";
      return groupMode === "city" ? opt.cityName : opt.organization || "Без организации";
    },
    [groupMode],
  );

  // Обработчик клика вне компонента
  const handleClickAway = (event) => {
    if (
      paperRef.current &&
      !paperRef.current.contains(event.target) &&
      containerRef.current &&
      !containerRef.current.contains(event.target)
    ) {
      setOpen(false);
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box ref={containerRef}>
        <Autocomplete
          multiple
          options={filteredCafes}
          disableCloseOnSelect
          value={actualValue}
          onChange={(_, next) => setValueSafe(next)}
          getOptionLabel={(opt) => opt.name}
          open={open}
          onOpen={() => {
            if (!disabled) {
              setOpen(true);
            }
          }}
          renderTags={(value, getTagProps) => {
            const count = value.length;

            // Если нет выбранных — ничего не рендерим
            if (count === 0) return null;

            return (
              <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        label={option.name}
                        onDelete={() => {
                          const newValue = [...value];
                          newValue.splice(index, 1);
                          setValueSafe(newValue);
                        }}
                        deleteIcon={<CloseIcon />}
                        sx={{
                          backgroundColor: "#79747e",
                          color: "#ffffff",
                          borderRadius: "8px",
                          fontSize: "12px",
                          height: 24,
                          "& .MuiChip-label": {
                            fontSize: "12px",
                            px: 1,
                          },
                          "& .MuiChip-deleteIcon": {
                            color: "#ffffff",
                            fontSize: "16px",
                            "&:hover": {
                              color: "#e1dbdb",
                            },
                          },
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            );
          }}
          onClose={(event, reason) => {
            if (reason === "escape" || reason === "toggleInput") {
              setOpen(false);
            }
          }}
          groupBy={groupBy}
          disablePortal={true}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          disabled={disabled}
          autoFocus={autoFocus}
          filterOptions={(options) => options}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled && !open) {
                  setOpen(true);
                }
              }}
            />
          )}
          limitTags={6}
          getLimitTagsText={(more) => `+${more}`}
          size="small"
          renderOption={(props, option, { selected }) => {
            const isAll = option.id === ALL_OPTION.id;
            const { key, ...restProps } = props;
            return (
              <li
                key={key}
                {...restProps}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <Checkbox
                  size="small"
                  checked={allSelected || selected}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                />
                <ListItemText
                  sx={{ my: 0 }}
                  primary={<Typography noWrap>{option.name}</Typography>}
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
            const groupItems = isCityMode
              ? (cafesByCity.get(entityKey) ?? [])
              : (cafesByOrganization.get(entityName) ?? []);

            // Don't render empty groups
            if (groupItems.length === 0) return null;

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
                    e.preventDefault();
                    handleToggleGroup(entityKey, !isCityMode);
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <IconButton
                    size="small"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
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
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleToggleGroup(entityKey, !isCityMode);
                    }}
                  />
                  <ListItemText
                    primary={
                      <Typography fontWeight={600}>
                        {entityName}{" "}
                        <span className="group-items-label">
                          Выбрано{" "}
                          {
                            groupItems.filter((item1) =>
                              actualValue.some(
                                (item2) => item2.id === item1.id || item2.id === "__ALL__",
                              ),
                            ).length
                          }{" "}
                          адреса
                        </span>
                      </Typography>
                    }
                  />
                </div>

                <ul className={autocompleteClasses.groupUl}>{groupParams.children}</ul>
              </Box>
            );
          }}
          slots={{
            paper: (props) => (
              <CustomPaper
                {...props}
                ref={paperRef}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                groupMode={groupMode}
                setGroupMode={setGroupMode}
                cafesByOrganization={cafesByOrganization}
                allSelected={allSelected}
                handleSelectAll={handleSelectAll}
                expanded={expanded}
                setExpanded={setExpanded}
                cafesByCity={cafesByCity}
                cities={cities}
                groupSelectState={groupSelectState}
                handleToggleGroup={handleToggleGroup}
                toggleGroupExpanded={toggleGroupExpanded}
              />
            ),
            popper: TopPopper,
          }}
        />
      </Box>
    </ClickAwayListener>
  );
}
