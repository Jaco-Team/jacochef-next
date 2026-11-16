export function interactiveRowProps(name, onOpen, enabled = true) {
  if (!enabled) return {};
  return {
    hover: true,
    tabIndex: 0,
    "aria-label": `Открыть: ${name || "Без названия"}`,
    onClick: onOpen,
    onKeyDown: (event) => {
      if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        onOpen();
      }
    },
    sx: {
      cursor: "pointer",
      "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: -2 },
    },
  };
}
