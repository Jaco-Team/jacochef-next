"use client";

import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import { useEffect, useState } from "react";

import { useDebounce } from "@/src/hooks/useDebounce";

import { uiColors } from "../tokens";
import JacoTextInput from "./JacoTextInput";

/**
 * A text search control that keeps typing responsive while committing filter
 * changes after a short pause. Consumers receive an empty value immediately
 * when the query is cleared or is shorter than the requested minimum length.
 */
export default function JacoSearchField({
  value,
  onValueChange,
  minLength = 2,
  debounceMs = 350,
  clearAriaLabel = "Очистить поиск",
  sx,
  ...props
}) {
  const [localValue, setLocalValue] = useState(value ?? "");

  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  const commitValue = useDebounce((nextValue) => {
    const normalizedValue = String(nextValue ?? "");
    const trimmedValue = normalizedValue.trim();

    onValueChange?.(trimmedValue.length >= minLength ? trimmedValue : "");
  }, debounceMs);

  const handleChange = (event) => {
    const nextValue = event.target.value;
    const trimmedValue = String(nextValue ?? "").trim();

    setLocalValue(nextValue);

    if (trimmedValue.length > 0 && trimmedValue.length < minLength) {
      commitValue.cancel?.();
      onValueChange?.("");
      return;
    }

    commitValue(nextValue);
  };

  const handleClear = () => {
    commitValue.cancel?.();
    setLocalValue("");
    onValueChange?.("");
  };

  return (
    <JacoTextInput
      {...props}
      label={props.label}
      value={localValue}
      onChange={handleChange}
      inputAdornment={{
        endAdornment: localValue ? (
          <IconButton
            size="small"
            aria-label={clearAriaLabel}
            onClick={handleClear}
            sx={{ mr: -0.5, color: uiColors.textMuted }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        ) : null,
      }}
      sx={sx}
    />
  );
}
