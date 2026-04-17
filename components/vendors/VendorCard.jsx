"use client";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import { Box, Card, CardActionArea, CardContent, Divider, Stack, Typography } from "@mui/material";
import formatPhone from "@/src/helpers/ui/formatPhone";
import { formatPlural } from "@/src/helpers/utils/i18n";
import { getCityNamesByIds } from "./vendorFormUtils";

export default function VendorCard({ vendor, cities, onClick, action = null }) {
  if (!vendor) {
    return null;
  }

  const cityNames = getCityNamesByIds(vendor.cities, cities);
  const items = Number(vendor.items_count || 0);
  const expiringDeclarations = vendor.expiring_declarations;
  const phone = formatPhone(vendor.phone);
  const addr = (vendor.addr ?? "").trim();
  const cityText = cityNames.length ? cityNames.join(", ") : "—";
  const productsText = formatPlural(items, ["продукт", "продукта", "продуктов"]);

  const rows = [
    { label: "Город", value: cityText },
    { label: "Телефон", value: phone || "—" },
    { label: "Адрес", value: addr || "—", multiline: true },
    { label: "Продукты", value: productsText },
  ];

  return (
    <Card
      sx={{
        borderRadius: 3,
        position: "relative",
      }}
    >
      {action ? (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
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
        sx={{ display: "flex", alignItems: "stretch" }}
        onClick={() => onClick?.(vendor)}
      >
        <CardContent
          sx={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            gap: 1,
            py: 1.5,
            px: 1.75,
            pr: action ? 6 : 1.75,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={0.5}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              {vendor.name || "Без названия"}
            </Typography>
            {vendor.inn && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                {vendor.inn ? `ИНН: ${vendor.inn}` : ""}
              </Typography>
            )}
          </Stack>

          <Divider sx={{ my: 0.25 }} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "120px minmax(0, 1fr)",
              rowGap: 0.5,
              columnGap: 1,
              alignItems: "start",
            }}
          >
            {rows.map((row) => (
              <Box
                key={row.label}
                sx={{ display: "contents" }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  {row.label}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.primary"
                  sx={
                    row.multiline
                      ? {
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }
                      : undefined
                  }
                >
                  {row.value}
                </Typography>
              </Box>
            ))}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              Декларации
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
            >
              <DescriptionOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography
                variant="caption"
                sx={{
                  color: expiringDeclarations ? "error.main" : "text.primary",
                  fontWeight: 600,
                }}
              >
                {expiringDeclarations ? `${expiringDeclarations} истекают` : "Нет критичных"}
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              Номенклатура
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
            >
              <InventoryOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="caption">{productsText}</Typography>
            </Stack>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
