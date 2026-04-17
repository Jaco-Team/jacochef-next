"use client";

import { Avatar } from "@mui/material";

const getInitials = (name) => {
  if (!name || typeof name !== "string") return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
};

const COLORS = [
  { bg: "#E8F1FC", fg: "#1565C0" },
  { bg: "#E8F5EA", fg: "#2E7D32" },
  { bg: "#FEF0E6", fg: "#EF6C00" },
  { bg: "#F4E8F7", fg: "#8E24AA" },
  { bg: "#E5F4F5", fg: "#00838F" },
  { bg: "#EFE8E3", fg: "#6D4C41" },
];

const pickColor = (seed) => {
  if (!seed) return COLORS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  }
  return COLORS[hash % COLORS.length];
};

export default function EmployeeAvatar({ name, size = 32 }) {
  const initials = getInitials(name);
  const color = pickColor(name || "");

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        fontWeight: 700,
        bgcolor: color.bg,
        color: color.fg,
      }}
    >
      {initials || "?"}
    </Avatar>
  );
}
