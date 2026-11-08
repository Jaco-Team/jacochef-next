"use client";

import { Grid } from "@mui/material";
import { JacoSelect, JacoSurface } from "@/design-system/shared/ui";
import ComplaintOptionsSettings from "./ComplaintOptionsSettings";
import { filterSx } from "../constants";

export default function ComplaintSettingsSection({ model }) {
  const { access, api, cafes, cities, filters, update, withLoading } = model;
  return (
    <>
      <JacoSurface sx={filterSx}>
        <Grid
          container
          spacing={1.5}
          sx={{ alignItems: "center" }}
        >
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <JacoSelect
              label="Город"
              options={cities}
              value={filters.cityId}
              multiple={false}
              allowNone={false}
              onChange={(event) => update("cityId", event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <JacoSelect
              label="Кафе"
              options={cafes}
              value={filters.pointId}
              multiple={false}
              allowNone={false}
              onChange={(event) => update("pointId", event.target.value)}
            />
          </Grid>
        </Grid>
      </JacoSurface>
      <ComplaintOptionsSettings
        key={filters.pointId || "all"}
        api={api}
        pointId={filters.pointId}
        canEdit={Number(access.errors_management_settings_edit) === 1}
        withLoading={withLoading}
      />
    </>
  );
}
