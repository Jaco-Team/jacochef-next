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

  // Стили для journal варианта
  const customStyles =
    props.customRI === "journal"
      ? {
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            border: "1px solid #E5E5E5",
            color: "#BABABA",
            backgroundColor: props.disabled ? "#F5F5F5" : "#FFFFFF",
            "&:hover": {
              backgroundColor: props.disabled ? "#F5F5F5" : "#FFFFFF",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E5E5E5",
              },
            },
            "&.Mui-focused": {
              color: "#666666",
              backgroundColor: "#FFFFFF",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E5E5E5",
                borderWidth: "2px",
              },
            },
            "&.Mui-disabled": {
              backgroundColor: "#F5F5F5",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(0, 0, 0, 0.12)",
              },
            },
          },
          "& .MuiInputLabel-root": {
            color: "#666666",
            backgroundColor: "#fff",
            paddingInline: "12px",
            borderRadius: "4px 4px 0 0",
            "&.Mui-focused": {
              color: "#A6A6A6",
            },
            "&.Mui-disabled": {
              color: "rgba(0, 0, 0, 0.38)",
            },
          },
          "& .MuiOutlinedInput-notchedOutline": {
            display: "none",
          },
        }
      : {};

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
      sx={{
        width: "100%",
        ...customStyles,
        ...(props.sx || {}),
      }}
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
