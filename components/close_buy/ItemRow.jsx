import { Box, Paper, Typography } from "@mui/material";

import { JacoSwitch } from "@/design-system/shared/ui";

export default function ItemRow({ item, disabled, onToggle }) {
  const isActive = item.is_active === 1;

  return (
    <Paper
      variant="outlined"
      sx={{
        px: { xs: 2, sm: 2.5 },
        py: 1.25,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        alignItems: "center",
        columnGap: 2,
        borderRadius: "18px",
        borderColor: "#DEDEDE",
        boxShadow: "none",
      }}
    >
      <Typography
        sx={{
          minWidth: 0,
          fontSize: { xs: 16, sm: 17 },
          lineHeight: 1.25,
          fontWeight: 700,
          color: "#292929",
          overflowWrap: "anywhere",
        }}
      >
        {item.name}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <JacoSwitch
          checked={isActive}
          disabled={disabled}
          onChange={(event) => onToggle?.(event.target.checked ? 1 : 0)}
          slotProps={{
            input: { "aria-label": `${isActive ? "Закрыть" : "Открыть"} ${item.name}` },
          }}
        />
      </Box>
    </Paper>
  );
}
