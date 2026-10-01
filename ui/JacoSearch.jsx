"use client";

import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useRef, useState } from "react";
import { InputAdornment } from "@mui/material";
import { JacoTextInput } from "@/design-system/shared/ui";

export default function JacoSearch({
  inputAdornment,
  onValueChange,
  onChange,
  debounceMs = 0,
  value,
  ...props
}) {
  const timerRef = useRef(null);
  const [draftValue, setDraftValue] = useState(value ?? "");

  useEffect(() => () => window.clearTimeout(timerRef.current), []);
  useEffect(() => setDraftValue(value ?? ""), [value]);

  return (
    <JacoTextInput
      {...props}
      value={draftValue}
      onChange={(event) => {
        const nextValue = event.target.value;
        setDraftValue(nextValue);
        onChange?.(event);
        window.clearTimeout(timerRef.current);
        if (debounceMs > 0) {
          timerRef.current = window.setTimeout(() => onValueChange?.(nextValue), debounceMs);
        } else {
          onValueChange?.(nextValue);
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
