"use client";

import { MyTextInput } from "@/ui/elements";
import { Grid } from "@mui/material";
import { memo, useState } from "react";

const AppointmentModalInput = ({data, type, label, changeItem}) => {

  const [item, setItem] = useState(data);

  const save_data_input = () => {
    changeItem(type, item);
  };

  return (
    <Grid item xs={12} md={6}>
      <MyTextInput
        label={label}
        value={item}
        func={({target: {value}}) => setItem(value)}
        onBlur={save_data_input}
      />
    </Grid>
  );
};

export default memo(AppointmentModalInput)
