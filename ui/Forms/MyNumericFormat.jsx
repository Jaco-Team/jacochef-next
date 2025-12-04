import { NumericFormat } from "react-number-format";
import TextField from "@mui/material/TextField";

export const NumericTextField = (props) => {
  const handleValueChange = (values) => {
    const { floatValue, formattedValue } = values;

    if (props.onChange) {
      const event = {
        target: {
          value: floatValue !== undefined ? String(floatValue) : "",
          name: props.name,
        },
      };
      props.onChange(event);
    }
  };

  return (
    <NumericFormat
      customInput={TextField}
      thousandSeparator=" "
      decimalSeparator=","
      decimalScale={props.decimalScale || 2}
      fixedDecimalScale={props.fixedDecimalScale || false}
      allowNegative={props.allowNegative || false}
      value={props.value || ""}
      onValueChange={handleValueChange}
      id={props.id}
      label={props.label}
      onBlur={props.onBlur}
      disabled={props.disabled}
      variant="outlined"
      size="small"
      placeholder={props.placeholder}
      sx={{ width: "100%" }}
      style={props.style}
      className={props.className}
      slotProps={{
        input: {
          tabIndex: props.tabindex,
          ...(props.inputProps || {}),
        },
      }}
    />
  );
};
