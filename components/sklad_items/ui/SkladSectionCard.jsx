"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";

export default function SkladSectionCard({ icon = null, title, description, subtitle, children }) {
  const text = description ?? subtitle ?? "";

  return (
    <Paper sx={{ p: 2, borderRadius: 3 }}>
      <Stack spacing={1.5}>
        {icon ? (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            {icon}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700 }}
              >
                {title}
              </Typography>
              {text ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.25 }}
                >
                  {text}
                </Typography>
              ) : null}
            </Box>
          </Stack>
        ) : (
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700 }}
            >
              {title}
            </Typography>
            {text ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.25 }}
              >
                {text}
              </Typography>
            ) : null}
          </Box>
        )}
        {children}
      </Stack>
    </Paper>
  );
}
