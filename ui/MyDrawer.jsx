"use client";

import { Box, SwipeableDrawer, Typography } from "@mui/material";

export default function MyDrawer({
  open = false,
  onClose,
  title,
  children,
  actions = null,
  paperSx,
  ...rest
}) {
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableDiscovery
      disableSwipeToOpen
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: "88vh",
          overflow: "hidden",
          ...paperSx,
        },
      }}
      {...rest}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateRows: actions ? "auto minmax(0, 1fr) auto" : "auto minmax(0, 1fr)",
          maxHeight: "88vh",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            gap: 1,
          }}
        >
          {typeof title === "string" ? (
            <Typography
              variant="h6"
              sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}
            >
              {title || ""}
            </Typography>
          ) : (
            title
          )}
        </Box>
        <Box
          sx={{
            overflowY: "auto",
            px: 2,
            pt: 2,
            pb: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
          }}
        >
          {children}
        </Box>
        {actions ? (
          <Box
            sx={{
              px: 2,
              pt: 1.5,
              pb: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
              borderTop: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
            }}
          >
            {actions}
          </Box>
        ) : null}
      </Box>
    </SwipeableDrawer>
  );
}
