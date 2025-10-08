"use client";

import { MyTextInput } from "@/components/shared/Forms";
import { Grid } from "@mui/material";
import { memo, useState } from "react";

const AppointmentModalInput = ({data, type, label, changeItem, ...restArgs}) => {

  const [item, setItem] = useState(data);

  const save_data_input = () => {
    changeItem(type, item);
  };

  return (
    <Grid
      size={{
        xs: 12,
        md: 6
      }}>
      <MyTextInput
        label={label}
        value={item}
        func={({target: {value}}) => setItem(value)}
        onBlur={save_data_input}
        {...restArgs}
      />
    </Grid>
  );
};

export default memo(AppointmentModalInput)
