"use client";

import Link from "next/link";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import SmallFont from "@/ui/SmallFont";
import { formatPlural } from "@/src/helpers/utils/i18n";
import { getCityNamesByIds } from "./vendorFormUtils";

export default function VendorCard({ vendor, cities, onClick }) {
  if (!vendor) {
    return null;
  }

  const cityNames = getCityNamesByIds(vendor.city_ids, cities);
  const items = Number(vendor.items_count || 0);
  const phone = (vendor.phone ?? "").trim();
  const email = (vendor.email ?? "").trim();
  const addr = (vendor.addr ?? "").trim();

  return (
    <Card
      variant="outlined"
      onClick={() => onClick?.(vendor)}
      sx={{
        height: "100%",
        cursor: "pointer",
        borderRadius: 3,
        transition: "border-color 0.2s ease",
      }}
    >
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Typography variant="subtitle1">{vendor.name || "Без названия"}</Typography>
        </Stack>

        {cityNames.length ? (
          <Box>
            {cityNames.map((cityName) => (
              <Chip
                key={`${vendor.id}-${cityName}`}
                label={cityName}
                size="small"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        ) : null}

        {phone ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <PhoneIcon sx={{ fontSize: 14 }} />
            <SmallFont>{phone}</SmallFont>
          </Typography>
        ) : null}
        {email ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <EmailIcon sx={{ fontSize: 14 }} />
            <SmallFont>{email}</SmallFont>
          </Typography>
        ) : null}
        {addr ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            <LocationOnIcon sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.5 }} />
            {addr}
          </Typography>
        ) : null}

        <Box sx={{ flexGrow: 1 }} />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          spacing={1}
        >
          <Chip
            label={formatPlural(items, ["продукт", "продукта", "продуктов"])}
            size="small"
            sx={{ color: "common.white", bgcolor: "primary.main" }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
