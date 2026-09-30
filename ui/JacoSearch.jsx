"use client";

import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useRef } from "react";
import { InputAdornment } from "@mui/material";
import { JacoTextInput } from "@/design-system/shared/ui";

export default function JacoSearch({
  inputAdornment,
  onValueChange,
  onChange,
  debounceMs = 0,
  ...props
}) {
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);
  return (
    <JacoTextInput
      {...props}
      onChange={(event) => {
        onChange?.(event);
        window.clearTimeout(timerRef.current);
        if (debounceMs > 0) {
          timerRef.current = window.setTimeout(
            () => onValueChange?.(event.target.value),
            debounceMs,
          );
        } else {
          onValueChange?.(event.target.value);
        }
      }}
      inputAdornment={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
        ...inputAdornment,
      }}
    />
  );
}
