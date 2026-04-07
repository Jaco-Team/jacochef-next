"use client";

import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import { Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import SmallFont from "@/ui/SmallFont";
import { formatPlural } from "@/src/helpers/utils/i18n";
import { getCityNamesByIds } from "./vendorFormUtils";

export default function VendorCard({ vendor, cities, onClick, action = null }) {
  if (!vendor) {
    return null;
  }

  const cityNames = getCityNamesByIds(vendor.cities, cities);
  const items = Number(vendor.items_count || 0);
  const phone = (vendor.phone ?? "").trim();
  const email = (vendor.email ?? "").trim();
  const addr = (vendor.addr ?? "").trim();

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        position: "relative",
      }}
    >
      {action ? (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 1,
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          {action}
        </Box>
      ) : null}

      <CardActionArea
        sx={{ height: "100%" }}
        onClick={() => onClick?.(vendor)}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            flex: 1,
            justifyContent: "space-between",
            pr: action ? 7 : 2,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Typography variant="h6">{vendor.name || "Без названия"}</Typography>
            {vendor.inn && (
              <Typography variant="subtitle2">{vendor.inn ? ` ИНН: ${vendor.inn}` : ""}</Typography>
            )}
          </Stack>

          {cityNames.length ? (
            <Box sx={{ mt: "auto" }}>
              {cityNames.map((cityName) => (
                <Chip
                  key={`${vendor.id}-${cityName}`}
                  label={cityName}
                  size="small"
                  sx={{ mr: 0.5, mb: 0.5, fontSize: 12 }}
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
            sx={{ mt: "auto" }}
          >
            <InventoryOutlinedIcon fontSize="small" />
            <Chip
              label={formatPlural(items, ["продукт", "продукта", "продуктов"])}
              size="small"
            />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
