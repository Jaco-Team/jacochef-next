"use client";

import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment } from "@mui/material";
import { JacoTextInput } from "@/design-system/shared/ui";

export default function JacoSearch({ inputAdornment, onValueChange, onChange, ...props }) {
  return (
    <JacoTextInput
      {...props}
      onChange={(event) => {
        onChange?.(event);
        onValueChange?.(event.target.value);
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
