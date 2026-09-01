import { Box, Paper, Switch, Typography } from "@mui/material";

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
        <Switch
          checked={isActive}
          disabled={disabled}
          onChange={(event) => onToggle?.(event.target.checked ? 1 : 0)}
          sx={{
            width: 58,
            height: 34,
            p: 0,
            "& .MuiSwitch-switchBase": {
              p: "3px",
              color: "#FFFFFF",
              "&.Mui-checked": {
                transform: "translateX(24px)",
                color: "#FFFFFF",
                "& + .MuiSwitch-track": {
                  bgcolor: "#CC0033",
                  borderColor: "#CC0033",
                  opacity: 1,
                },
              },
              "&.Mui-disabled": {
                color: "#FFFFFF",
                "& + .MuiSwitch-track": { opacity: 0.55 },
              },
            },
            "& .MuiSwitch-thumb": {
              width: 28,
              height: 28,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.18)",
            },
            "& .MuiSwitch-track": {
              border: "1px solid #D9D9D9",
              borderRadius: "17px",
              bgcolor: "#F1F1F1",
              opacity: 1,
            },
          }}
          slotProps={{
            input: { "aria-label": `${isActive ? "Закрыть" : "Открыть"} ${item.name}` },
          }}
        />
      </Box>
    </Paper>
  );
}
