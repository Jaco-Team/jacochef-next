"use client";

import { Grid } from "@mui/material";
import { JacoSelect, JacoSurface } from "@/design-system/shared/ui";
import ComplaintOptionsSettings from "./ComplaintOptionsSettings";
import { GLOBAL_SCOPE_LABEL, filterSx } from "../constants";
import { scopePointId } from "./settings/catalogModel.mjs";

export default function ComplaintSettingsSection({ model }) {
  const { api, canEdit, cafes, cities, points, scope, siteCategories, updateScope, withLoading } =
    model;
  const pointId = scopePointId(scope.pointId);
  const point = points.find((item) => Number(item.id) === pointId);
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
              value={scope.cityId}
              multiple={false}
              allowNone={false}
              onChange={(event) => updateScope("cityId", event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <JacoSelect
              label="Область настроек"
              options={cafes}
              value={scope.pointId}
              multiple={false}
              allowNone
              noneLabel={GLOBAL_SCOPE_LABEL}
              onChange={(event) =>
                updateScope("pointId", event.target.value === "none" ? "" : event.target.value)
              }
            />
          </Grid>
        </Grid>
      </JacoSurface>
      <ComplaintOptionsSettings
        key={pointId || "global"}
        api={api}
        pointId={pointId}
        scopeLabel={point?.addr || point?.name || GLOBAL_SCOPE_LABEL}
        canEdit={canEdit}
        siteCategories={siteCategories}
        withLoading={withLoading}
      />
    </>
  );
}
