"use client";

import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment } from "@mui/material";
import { MySearchInput } from "@/ui/Forms";

export default function JacoSearch({ inputAdornment, ...props }) {
  return (
    <MySearchInput
      {...props}
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
