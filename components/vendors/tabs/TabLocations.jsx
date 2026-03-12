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
import useVendorLocationsView from "../useVendorLocationsView";

export default function TabLocations({ canEdit, onToggleCity }) {
  const { allCities, mails, selectedCities, selectedCityIds } = useVendorLocationsView();

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
            {canEdit ? (
              <FormGroup>
                {(allCities || []).map((city) => (
                  <FormControlLabel
                    key={city.id}
                    control={
                      <Checkbox
                        checked={selectedCityIds.has(Number(city.id))}
                        onChange={() => onToggleCity(city)}
                      />
                    }
                    label={city.name || "Без названия"}
                  />
                ))}
              </FormGroup>
            ) : selectedCities.length ? (
              <Stack spacing={1}>
                {selectedCities.map((city) => (
                  <Stack
                    key={city.id}
                    spacing={0.5}
                  >
                    <Typography sx={{ fontWeight: 600 }}>{city.name || "Без названия"}</Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {city.addr || "Адрес не указан"}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">Локации не назначены.</Typography>
            )}
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
