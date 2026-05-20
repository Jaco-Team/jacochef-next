"use client";

import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";

export default function PromoItemsStatHeaderCell({ column }) {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
      <Typography
        component="span"
        variant="inherit"
      >
        {column.label}
      </Typography>
      <Tooltip
        arrow
        placement="top"
        title={
          <Box sx={{ maxWidth: 360 }}>
            <Typography
              component="div"
              variant="subtitle2"
              sx={{ mb: 0.5 }}
            >
              {column.helpTitle}
            </Typography>
            <Typography
              component="div"
              variant="body2"
            >
              {column.helpText}
            </Typography>
            {column.chipHelpText ? (
              <Typography
                component="div"
                variant="caption"
                sx={{ mt: 0.75, display: "block" }}
              >
                {column.chipHelpText}
              </Typography>
            ) : null}
          </Box>
        }
      >
        <IconButton
          aria-label={column.helpTitle}
          size="small"
          sx={{ p: 0, color: "text.secondary" }}
        >
          <HelpOutlineOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
