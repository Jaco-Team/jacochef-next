"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import RemoveCircleRoundedIcon from "@mui/icons-material/RemoveCircleRounded";
import {
  Autocomplete,
  Box,
  ClickAwayListener,
  IconButton,
  InputAdornment,
  ListItemText,
  TextField,
  Tooltip,
  createFilterOptions,
} from "@mui/material";

function splitCsvLikeValue(value) {
  if (!value) {
    return [];
  }

  const result = [];
  let current = "";
  let roundDepth = 0;
  let squareDepth = 0;
  let curlyDepth = 0;

  for (const char of String(value)) {
    if (char === "(") {
      roundDepth += 1;
      current += char;
      continue;
    }

    if (char === ")") {
      roundDepth = Math.max(0, roundDepth - 1);
      current += char;
      continue;
    }

    if (char === "[") {
      squareDepth += 1;
      current += char;
      continue;
    }

    if (char === "]") {
      squareDepth = Math.max(0, squareDepth - 1);
      current += char;
      continue;
    }

    if (char === "{") {
      curlyDepth += 1;
      current += char;
      continue;
    }

    if (char === "}") {
      curlyDepth = Math.max(0, curlyDepth - 1);
      current += char;
      continue;
    }

    if (char === "," && roundDepth === 0 && squareDepth === 0 && curlyDepth === 0) {
      const token = current.trim();

      if (token) {
        result.push(token);
      }

      current = "";
      continue;
    }

    current += char;
  }

  const tail = current.trim();

  if (tail) {
    result.push(tail);
  }

  return result;
}

function joinCsvLikeValue(items) {
  return items
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .join(", ");
}

function normalizeOption(option) {
  if (typeof option === "string") {
    return {
      value: option,
      label: option,
    };
  }

  const rawValue = option?.value ?? option?.label ?? option?.name ?? "";
  const value = String(rawValue).trim();

  return {
    value,
    label: String(option?.label ?? option?.name ?? value).trim(),
  };
}

function normalizeOptions(options, selectedValues) {
  const seen = new Set();
  const normalized = [];

  [...(options || []), ...(selectedValues || [])].forEach((option) => {
    const normalizedOption = normalizeOption(option);
    const key = normalizedOption.value.toLocaleLowerCase("ru-RU");

    if (!normalizedOption.value || seen.has(key)) {
      return;
    }

    seen.add(key);
    normalized.push(normalizedOption);
  });

  return normalized;
}

function isSameValue(left, right) {
  return (
    String(left ?? "")
      .trim()
      .toLocaleLowerCase("ru-RU") ===
    String(right ?? "")
      .trim()
      .toLocaleLowerCase("ru-RU")
  );
}

const filter = createFilterOptions();

export default function SkladCsvAutocompleteField({
  label,
  value,
  onChange,
  options = [],
  disabled = false,
  placeholder = "Введите значение",
  noOptionsText = "Нет совпадений",
}) {
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const selectedValues = useMemo(() => splitCsvLikeValue(value), [value]);
  const normalizedOptions = useMemo(
    () => normalizeOptions(options, selectedValues),
    [options, selectedValues],
  );

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    } else {
      setInputValue("");
    }
  }, [isEditing]);

  const hasExactInputMatch = useMemo(
    () =>
      !inputValue.trim()
        ? false
        : normalizedOptions.some((option) => isSameValue(option.value, inputValue)),
    [inputValue, normalizedOptions],
  );

  const canAddInput = inputValue.trim() && !hasExactInputMatch;

  const filteredOptions = useMemo(() => {
    const baseOptions = filter(normalizedOptions, {
      inputValue,
      getOptionLabel: (option) => option.label,
    });

    if (canAddInput) {
      return [{ value: inputValue.trim(), label: inputValue.trim(), isNew: true }].concat(
        baseOptions,
      );
    }

    return baseOptions;
  }, [canAddInput, inputValue, normalizedOptions]);

  const summaryValue = selectedValues.join(", ");

  const commitValues = (nextItems) => {
    const unique = [];

    nextItems.forEach((item) => {
      const candidate = String(item ?? "").trim();

      if (!candidate || unique.some((existing) => isSameValue(existing, candidate))) {
        return;
      }

      unique.push(candidate);
    });

    onChange?.(joinCsvLikeValue(unique));
  };

  const addValue = (rawValue) => {
    const candidate = String(rawValue ?? "").trim();

    if (!candidate) {
      return;
    }

    commitValues(selectedValues.concat(candidate));
    setInputValue("");
  };

  const removeValue = (rawValue) => {
    commitValues(selectedValues.filter((item) => !isSameValue(item, rawValue)));
  };

  const handleSelect = (_, nextValue, reason) => {
    if (reason === "clear") {
      onChange?.("");
      return;
    }

    if (reason === "removeOption") {
      commitValues(
        (Array.isArray(nextValue) ? nextValue : []).map((item) =>
          typeof item === "string" ? item : item?.value,
        ),
      );
      return;
    }

    const lastItem = Array.isArray(nextValue) ? nextValue[nextValue.length - 1] : null;
    const candidate = typeof lastItem === "string" ? lastItem : lastItem?.value;

    if (candidate) {
      addValue(candidate);
    }
  };

  const handleContainerBlur = (event) => {
    const nextTarget = event.relatedTarget;

    if (rootRef.current?.contains(nextTarget)) {
      return;
    }

    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <Tooltip
        title={summaryValue || ""}
        disableFocusListener={!summaryValue}
        disableHoverListener={!summaryValue}
        disableTouchListener={!summaryValue}
        placement="top-start"
      >
        <TextField
          fullWidth
          size="small"
          label={label}
          value={summaryValue}
          placeholder={placeholder}
          disabled={disabled}
          inputProps={{
            readOnly: true,
            "aria-label": label,
          }}
          onClick={() => {
            if (!disabled) {
              setIsEditing(true);
            }
          }}
          onFocus={() => {
            if (!disabled) {
              setIsEditing(true);
            }
          }}
          sx={{
            "& .MuiInputBase-input": {
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },
          }}
        />
      </Tooltip>
    );
  }

  return (
    <ClickAwayListener onClickAway={() => setIsEditing(false)}>
      <Box
        ref={rootRef}
        onBlur={handleContainerBlur}
      >
        <Autocomplete
          multiple
          freeSolo
          disableCloseOnSelect
          filterSelectedOptions={false}
          options={filteredOptions}
          value={selectedValues}
          inputValue={inputValue}
          noOptionsText={noOptionsText}
          onInputChange={(_, nextInputValue, reason) => {
            if (reason === "reset") {
              return;
            }

            setInputValue(nextInputValue);
          }}
          onChange={handleSelect}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : String(option?.label ?? option?.value ?? "")
          }
          isOptionEqualToValue={(option, selected) => {
            const selectedValue = typeof selected === "string" ? selected : selected?.value;
            return isSameValue(option?.value, selectedValue);
          }}
          renderValue={() => null}
          renderOption={(props, option) => {
            const isSelected = selectedValues.some((item) => isSameValue(item, option.value));
            const { key, ...optionProps } = props;

            return (
              <Box
                component="li"
                {...optionProps}
                key={key ?? option.value}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <ListItemText
                  primary={option.label}
                  secondary={option.isNew ? "Добавить в значение" : null}
                />
                <IconButton
                  size="small"
                  color={isSelected ? "error" : "success"}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    if (isSelected) {
                      removeValue(option.value);
                    } else {
                      addValue(option.value);
                    }
                  }}
                >
                  {isSelected ? (
                    <RemoveCircleRoundedIcon fontSize="small" />
                  ) : (
                    <AddCircleRoundedIcon fontSize="small" />
                  )}
                </IconButton>
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              size="small"
              label={label}
              placeholder={selectedValues.length ? "Фильтр или новое значение" : placeholder}
              inputRef={inputRef}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {canAddInput ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          color="success"
                          aria-label="Добавить значение"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => addValue(inputValue)}
                        >
                          <AddCircleRoundedIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Box>
    </ClickAwayListener>
  );
}
