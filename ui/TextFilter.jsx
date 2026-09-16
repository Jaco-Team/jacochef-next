import { useState } from "react";
import { IconButton, Popover, TextField, InputAdornment } from "@mui/material";
import { FilterList, Clear, FilterAlt } from "@mui/icons-material";

export default function TextFilter({ value, onChange }) {
  const [anchor, setAnchor] = useState(null);

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ ml: 1, color: value ? "primary.main" : "inherit" }}
      >
        {/* <FilterList fontSize="small" /> */}
        <FilterAlt fontSize="small" />
      </IconButton>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <TextField
          size="small"
          autoFocus
          placeholder="includes…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{ m: 0, width: 200 }}
          slotProps={{
            input: {
              endAdornment: value && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => onChange("")}
                  >
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Popover>
    </>
  );
}
