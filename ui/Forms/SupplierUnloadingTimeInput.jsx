import React, { useState } from "react";
import { TextField, Box } from "@mui/material";
import { IMaskInput } from "react-imask";

// Кастомный компонент маски для времени периода
const TimePeriodMask = React.forwardRef(function TimePeriodMask(props, ref) {
  const { onChange, ...other } = props;

  return (
    <IMaskInput
      {...other}
      mask="с 00:00 до 00:00"
      definitions={{
        0: /[0-9]/,
      }}
      inputRef={ref}
      onAccept={(value) => {
        if (onChange) {
          onChange({
            target: {
              name: props.name,
              value: value,
            },
          });
        }
      }}
      overwrite
    />
  );
});

const SupplierUnloadingTimeInput = ({ handleChange, value, label }) => {
  return (
    <Box sx={{ width: "100%" }}>
      <TextField
        fullWidth
        size="small"
        label={label}
        value={value}
        onChange={handleChange}
        placeholder="с 09:00 до 18:00"
        InputProps={{
          inputComponent: TimePeriodMask,
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 1,
          },
        }}
      />
    </Box>
  );
};

export default SupplierUnloadingTimeInput;
