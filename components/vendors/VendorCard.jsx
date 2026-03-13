"use client";
import { Card, CardContent, Typography, Chip, Box, Stack, IconButton } from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import useVendorsStore from "./useVendorsStore";
import SmallFont from "@/ui/SmallFont";
import { formatPlural } from "@/src/helpers/utils/i18n";

export default function VendorCard({ vendor, onClick, onToggleActive }) {
  if (!vendor) return null;

  const name = vendor.name ?? "NoName";
  const addr = vendor.addr;
  const items = Number(vendor.items_count);
  const phone = vendor.phone ?? "-";
  const email = vendor.email ?? "-";
  const vendorCities = vendor.city_ids ?? [];

  const storeCities = useVendorsStore((s) => s.cities) || [];

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "all .3s",
        "&:hover": { backgroundColor: "#eee" },
      }}
      onClick={() => onClick && onClick(vendor)}
    >
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Typography variant="subtitle1">{name}</Typography>
        </Stack>

        {/* city tag line */}
        {vendorCities ? (
          <Box>
            {vendorCities?.map((c) => (
              <Chip
                label={storeCities.find((sc) => sc.id === c)?.name}
                size="small"
              />
            ))}
          </Box>
        ) : null}

        {/* small contact stack */}
        {(phone || email) && (
          <Stack
            direction="column"
            spacing={0.5}
            sx={{ mt: 0.5 }}
          >
            {phone ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <PhoneIcon sx={{ fontSize: 14 }} />
                <SmallFont> {phone}</SmallFont>
              </Typography>
            ) : null}
            {email ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <EmailIcon sx={{ fontSize: 14 }} />
                <SmallFont> {email}</SmallFont>
              </Typography>
            ) : null}
          </Stack>
        )}

        {addr ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            <LocationOnIcon sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.5 }} /> {addr}
          </Typography>
        ) : null}

        <Box sx={{ flexGrow: 1 }} />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          spacing={1}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive && onToggleActive(vendor.id);
            }}
            title="Toggle active"
          >
            <Inventory2Icon />
          </IconButton>
          <Chip
            label={formatPlural(items, ["продукт", "продукта", "продуктов"])}
            size="small"
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
