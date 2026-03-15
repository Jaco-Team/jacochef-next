"use client";

import {
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Stack,
  Typography,
} from "@mui/material";
import { useVendorDetails } from "../VendorDetailsContext";

export default function TabLocations() {
  const { allCities, vendorCities, toggleCity, isEditing, mails } = useVendorDetails();
  const selectedIds = new Set((vendorCities || []).map((city) => Number(city.id)));

  return (
    <Stack spacing={2}>
      <Card
        variant="outlined"
        sx={{ borderRadius: 3 }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              Локации
            </Typography>
            <FormGroup>
              {(allCities || []).map((city) => (
                <FormControlLabel
                  key={city.id}
                  control={
                    <Checkbox
                      checked={selectedIds.has(Number(city.id))}
                      onChange={() => toggleCity(city)}
                      disabled={!isEditing}
                    />
                  }
                  label={city.name || "Без названия"}
                />
              ))}
            </FormGroup>
          </Stack>
        </CardContent>
      </Card>

      <Card
        variant="outlined"
        sx={{ borderRadius: 3 }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              Email по точкам
            </Typography>
            {mails.length ? (
              mails.map((mail, index) => (
                <Stack
                  key={`${mail.point_id?.id ?? "mail"}-${index}`}
                  spacing={0.5}
                >
                  <Typography sx={{ fontWeight: 600 }}>
                    {mail.point_id?.name ? mail.point_id.name : "Без точки"}
                  </Typography>
                  <Typography>{mail.mail || "Не указан"}</Typography>
                  {mail.comment ? (
                    <Typography color="text.secondary">{mail.comment}</Typography>
                  ) : null}
                  {index < mails.length - 1 ? <Divider sx={{ mt: 2 }} /> : null}
                </Stack>
              ))
            ) : (
              <Typography color="text.secondary">Email по точкам не настроены.</Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
