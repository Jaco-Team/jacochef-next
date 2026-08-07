import { FormControlLabel, Paper, Stack, Switch, Typography } from "@mui/material";

import { getItemStatusLabel } from "./closeBuyUtils";

export default function ItemRow({ item, disabled, onToggle }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: "16px",
        borderColor: "#ECECEC",
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack
          spacing={0.5}
          sx={{ minWidth: 0 }}
        >
          <Typography sx={{ fontWeight: 600, color: "#2B2B2B" }}>{item.name}</Typography>
          <Typography
            variant="body2"
            sx={{ color: "#757575" }}
          >
            ID: {item.item_id}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#757575" }}
          >
            {getItemStatusLabel(item.is_active)}
          </Typography>
        </Stack>

        <FormControlLabel
          sx={{ mr: 0 }}
          control={
            <Switch
              checked={item.is_active === 1}
              disabled={disabled}
              onChange={(event) => onToggle?.(event.target.checked ? 1 : 0)}
              color="error"
            />
          }
          label=""
        />
      </Stack>
    </Paper>
  );
}
