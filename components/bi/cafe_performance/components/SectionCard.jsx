"use client";

import { Card, CardContent, CardHeader, Typography } from "@mui/material";

export default function SectionCard({ title, subtitle, action, children }) {
  return (
    <Card variant="outlined">
      {(title || subtitle || action) && (
        <CardHeader
          title={title ? <Typography variant="h6">{title}</Typography> : null}
          subheader={
            subtitle ? (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {subtitle}
              </Typography>
            ) : null
          }
          action={action}
        />
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}
