"use client";

import { MyCheckBox, MyTextInput } from "@/components/shared/Forms";
import { Button, Grid } from "@mui/material";
import useCafeEditStore from "../useCafeEditStore";
import HistDropDownTable from "../HistDropDownTable";

function CafeEditTabDrivers({ canView, canEdit, saveSettings, openHistModal }) {
  const [point_info, point_sett_driver_hist] = useCafeEditStore((s) => [s.point_info, s.point_sett_driver_hist]);
  const changePointInfoData = useCafeEditStore((s) => s.changePointInfoData);
  const changeItemChecked = useCafeEditStore((s) => s.changeItemChecked);
  return (
    <Grid
      container
      spacing={3}
    >
      <Grid
        size={{ xs: 12, sm: 4 }}
      >
        <MyTextInput
          label="Количество заказов на руках (0 - без ограничений)"
          disabled={!canEdit("settings_driver")}
          value={point_info?.count_driver ?? ""}
          func={(e) => changePointInfoData("count_driver", e)}
          type="number"
        />
      </Grid>

      <Grid
        size={{ xs: 12, sm: 4 }}
      >
        <MyTextInput
          value={point_info?.summ_driver ?? ""}
          disabled={!canEdit("settings_driver")}
          func={(e) => changePointInfoData("summ_driver", e)}
          label="Максимальная сумма нала для курьера"
          type="number"
        />
      </Grid>

      <Grid
        size={{ xs: 12, sm: 4 }}
      >
        <MyTextInput
          value={point_info?.summ_driver_min ?? ""}
          disabled={!canEdit("settings_driver")}
          func={(e) => changePointInfoData("summ_driver_min", e)}
          label="Максимальная сумма нала для курьера стажера"
          type="number"
        />
      </Grid>
      <Grid
        size={{ xs: 12, sm: 6 }}
      >
        <MyCheckBox
          label="Необходима геолокация для завершения заказа"
          disabled={!canEdit("settings_driver")}
          value={parseInt(point_info?.driver_need_gps)}
          func={(e) => changeItemChecked("driver_need_gps", e)}
        />
      </Grid>
      {canEdit("settings_driver") && (
        <Grid
          size={{ xs: 12, sm: 6 }}
          display="grid"
        >
          <Button
            onClick={saveSettings}
            color="success"
            variant="contained"
            style={{ whiteSpace: "nowrap", justifySelf: "flex-end" }}
          >
            Сохранить изменения
          </Button>
        </Grid>
      )}

      {point_sett_driver_hist.length > 0 && canView("settings_driver") && (
        <Grid
          size={12}
          mb={5}
        >
          <HistDropDownTable
            histData={point_sett_driver_hist}
            openHistModal={openHistModal}
          />
        </Grid>
      )}
    </Grid>
  );
}

export default CafeEditTabDrivers;
