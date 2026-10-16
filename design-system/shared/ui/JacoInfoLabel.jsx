import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Stack, Tooltip, Typography } from "@mui/material";

export default function JacoInfoLabel({ children, tooltip, sx, ...typographyProps }) {
  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{ alignItems: "center", minWidth: 0, ...sx }}
    >
      <Typography {...typographyProps}>{children}</Typography>
      {tooltip ? (
        <Tooltip
          title={tooltip}
          arrow
          placement="top"
          enterTouchDelay={0}
          leaveTouchDelay={3500}
          slotProps={{ tooltip: { sx: { maxWidth: 280, fontSize: 12, lineHeight: 1.45 } } }}
        >
          <Box
            component="span"
            tabIndex={0}
            aria-label={`Описание: ${children}`}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              color: "text.disabled",
              cursor: "help",
              flexShrink: 0,
              "&:focus-visible": {
                outline: "2px solid",
                outlineColor: "primary.main",
                outlineOffset: 2,
              },
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 15 }} />
          </Box>
        </Tooltip>
      ) : null}
    </Stack>
  );
}
