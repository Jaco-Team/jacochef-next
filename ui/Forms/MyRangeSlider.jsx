"use client";

import { Box, FormLabel, Slider } from "@mui/material";

export function MyRangeSlider(props) {
  const { label, value, func, onChange, min = 0, max = 100, size = "small", sx, ...rest } = props;
  const safeMin = Number.isFinite(Number(min)) ? Number(min) : 0;
  const safeMax = Number.isFinite(Number(max)) ? Number(max) : safeMin;
  const rangeValue = Array.isArray(value) ? value : [safeMin, safeMax];
  const nextValue = [
    Number.isFinite(Number(rangeValue[0])) ? Number(rangeValue[0]) : safeMin,
    Number.isFinite(Number(rangeValue[1])) ? Number(rangeValue[1]) : safeMax,
  ];

  const handleChange = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    onChange?.(event, newValue, activeThumb);
    func?.(newValue, event, activeThumb);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {label ? (
        <FormLabel
          component="div"
          sx={{ mb: 0.5 }}
        >
          {label}
        </FormLabel>
      ) : null}
      <Slider
        {...rest}
        size={size}
        value={nextValue}
        min={safeMin}
        max={safeMax}
        onChange={handleChange}
        sx={{
          "& .MuiSlider-rail": { height: 6, color: "grey.500" },
          "& .MuiSlider-track": { height: 6 },
          ...sx,
        }}
      />
    </Box>
  );
}
