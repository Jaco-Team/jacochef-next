"use client";

import { MyTextInput } from "./MyTextInput";

function getMaxDigits(format) {
  return format === "hh:mm:ss" ? 6 : 4;
}

function getMaxLength(format) {
  return format === "hh:mm:ss" ? 8 : 5;
}

function formatTimeValue(rawValue, format) {
  const digits = String(rawValue ?? "")
    .replace(/\D/g, "")
    .slice(0, getMaxDigits(format));

  if (!digits) {
    return "";
  }

  if (format === "hh:mm:ss") {
    if (digits.length <= 2) {
      return digits;
    }

    if (digits.length <= 4) {
      return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    }

    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4)}`;
  }

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function MyTimeInput({ value, func, format = "mm:ss", inputProps, ...rest }) {
  const handleChange = (event) => {
    const nextValue = formatTimeValue(event.target.value, format);

    if (func) {
      func({
        ...event,
        target: {
          ...event.target,
          value: nextValue,
        },
      });
    }
  };

  return (
    <MyTextInput
      {...rest}
      value={formatTimeValue(value, format)}
      func={handleChange}
      inputProps={{
        inputMode: "numeric",
        pattern: format === "hh:mm:ss" ? "[0-9:]*" : "[0-9:]*",
        maxLength: getMaxLength(format),
        ...inputProps,
      }}
    />
  );
}
