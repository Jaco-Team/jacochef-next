import { useState } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { TableCell, Box, Popover, TextField } from "@mui/material";

export function ColorPickerCell({ value, onChange }) {
  const [color, setColor] = useState(value || "#ffffff");
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleChange = (newColor) => {
    setColor(newColor);
    if (onChange) onChange(newColor);
  };

  const open = Boolean(anchorEl);

  return (
    <TableCell sx={{ minWidth: "200px" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          onClick={handleOpen}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: color,
            border: "1px solid grey.300",
            borderRadius: 1,
            cursor: "pointer",
            "&:hover": { borderColor: "primary.main" },
          }}
        />
        <TextField
          size="small"
          value={color}
          onChange={(e) => handleChange(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box sx={{ p: 2 }}>
          <HexColorPicker
            color={color}
            onChange={handleChange}
          />
          <Box sx={{ mt: 1 }}>
            <HexColorInput
              color={color}
              onChange={handleChange}
              prefixed
            />
          </Box>
        </Box>
      </Popover>
    </TableCell>
  );
}
