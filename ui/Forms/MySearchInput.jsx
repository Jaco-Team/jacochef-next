"use client";

import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";

import { useDebounce } from "@/src/hooks/useDebounce";

import { MyTextInput } from "./MyTextInput";

export function MySearchInput({
  value,
  onValueChange,
  minLength = 2,
  debounceMs = 350,
  clearAriaLabel = "Очистить поиск",
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

  return (
    <MyTextInput
      {...props}
      value={localValue}
      func={(event) => {
        const nextValue = event.target.value;
        const trimmedValue = String(nextValue ?? "").trim();

        setLocalValue(nextValue);

        if (trimmedValue.length > 0 && trimmedValue.length < minLength) {
          commitValue.cancel?.();
          onValueChange?.("");
          return;
        }

        commitValue(nextValue);
      }}
      inputAdornment={{
        endAdornment: localValue ? (
          <IconButton
            size="small"
            aria-label={clearAriaLabel}
            onClick={() => {
              commitValue.cancel?.();
              setLocalValue("");
              onValueChange?.("");
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        ) : null,
      }}
    />
  );
}
