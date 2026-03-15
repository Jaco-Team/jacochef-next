"use client";

import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useVendorDetails } from "../VendorDetailsContext";

function FieldCard({ title, rows }) {
  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 3 }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, textTransform: "uppercase" }}
          >
            {title}
          </Typography>
          {rows.map((row) => (
            <Stack
              key={row.label}
              spacing={0.5}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {row.label}
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>{row.value || "Не указано"}</Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function TabInfo() {
  const { overviewCards } = useVendorDetails();

  return (
    <Stack spacing={2}>
      {overviewCards.map((card) => (
        <FieldCard
          key={card.title}
          title={card.title}
          rows={card.rows}
        />
      ))}
    </Stack>
  );
}
