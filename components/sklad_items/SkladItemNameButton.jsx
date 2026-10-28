"use client";

import { ButtonBase } from "@mui/material";

export default function SkladItemNameButton({ name, onClick, disabled = false }) {
  const label = name || "Без названия";
  return (
    <ButtonBase
      disabled={disabled}
      onClick={onClick}
      aria-label={`Открыть карточку: ${label}`}
      sx={{
        display: "inline",
        maxWidth: "100%",
        textAlign: "left",
        fontWeight: 600,
        color: "primary.main",
        textDecoration: "underline",
        textUnderlineOffset: "3px",
        overflowWrap: "anywhere",
        "&:focus-visible": { outline: "2px solid", outlineOffset: "3px" },
        "&.Mui-disabled": { color: "text.secondary", textDecoration: "none" },
      }}
    >
      {label}
    </ButtonBase>
  );
}
