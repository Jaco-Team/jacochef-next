"use client";

import { Button, Grid, Typography } from "@mui/material";
import HistDropDownTable from "../HistDropDownTable";
import useCafeEditStore from "../useCafeEditStore";
import { MyAutocomplite, MyCheckBox, MyTextInput } from "@/ui/elements";
import useCafeEditModalsStore from "../useCafeEditModalsStore";

function CafeEditTabSettings({ saveSettings, canView, canEdit, openHistModal }) {
  const [point_info, point_sett_hist, upr_list] = useCafeEditStore((s) => [s.point_info, s.point_sett_hist, s.upr_list]);
  const changePointInfoData = useCafeEditStore((s) => s.changePointInfoData);
  const changeItemChecked = useCafeEditStore((s) => s.changeItemChecked);

  const changeActivePoint = async () => {
      const {point_info, } = useCafeEditStore.getState();
      const newValue = parseInt(point_info.cafe_handle_close) === 1 ? 0 : 1;
      changePointInfoData("cafe_handle_close", newValue);
      if (newValue === 1) {
        await saveSettings();
      } else {
        useCafeEditModalsStore.setState({modalDialog_close: true})
      }
    };

  return canView("settings_point") && (
    <Grid
      container
      spacing={3}
    >
      <Grid
        item
        xs={12}
      >
        <MyCheckBox
          label="Если в заказе только пицца, она выйдет на сборку после начала ее приготовления (напитки, допы и закуски не учитываются)"
          value={parseInt(point_info?.priority_pizza ?? 0) == 1 ? true : false}
          disabled={!canEdit("settings_point")}
          func={(e) => changeItemChecked("priority_pizza", e)}
        />
      </Grid>

      <Grid
        item
        xs={12}
      >
        <MyCheckBox
          label="Если заказ приготовить зарнее - он выйдет в приоритете на сборку, кроме предов (напитки, допы и закуски не учитываются)"
          value={parseInt(point_info?.priority_order ?? 0) == 1 ? true : false}
          disabled={!canEdit("settings_point")}
          func={(e) => changeItemChecked("priority_order", e)}
        />
      </Grid>

      <Grid
        item
        xs={12}
      >
        <MyCheckBox
          label="Пицца у повара будет отображаться, если более 50% роллов в заказе начнут готовить"
          value={parseInt(point_info?.rolls_pizza_dif ?? 0) == 1 ? true : false}
          disabled={!canEdit("settings_point")}
          func={(e) => changeItemChecked("rolls_pizza_dif", e)}
        />
      </Grid>

      <Grid
        item
        xs={12}
      >
        <MyCheckBox
          label="Общий стол"
          value={parseInt(point_info?.cook_common_stol ?? 0) == 1 ? true : false}
          disabled={!canEdit("settings_point")}
          func={(e) => changeItemChecked("cook_common_stol", e)}
        />
      </Grid>

      <Grid
        item
        xs={12}
      >
        {canEdit("settings_point") ? (
          <Button
            onClick={changeActivePoint}
            color={parseInt(point_info?.cafe_handle_close ?? 0) === 1 ? "success" : "primary"}
            variant="contained"
            style={{ whiteSpace: "nowrap" }}
          >
            {parseInt(point_info?.cafe_handle_close ?? 0) === 1
              ? "Поставить на стоп"
              : "Снять со стопа"}
          </Button>
        ) : (
          <Typography>
            {parseInt(point_info?.cafe_handle_close) === 1 ? "Не на стопе" : "На стопе"}
          </Typography>
        )}
      </Grid>

      <Grid
        item
        xs={12}
        sm={4}
      >
        <MyAutocomplite
          label="Управляющий"
          multiple={false}
          data={upr_list || []}
          value={point_info?.manager_id ?? ""}
          disabled={!canEdit("settings_point")}
          func={(_, val) => changePointInfoData("manager_id", val)}
        />
      </Grid>

      <Grid
        item
        xs={12}
        sm={4}
      >
        <MyTextInput
          label="Количество столов сборки"
          type="number"
          value={point_info?.count_tables ?? ""}
          disabled={!canEdit("settings_point")}
          func={(e) => changePointInfoData("count_tables", e)}
        />
      </Grid>
      {canEdit("settings_point") && (
        <Grid
          item
          xs={12}
          display="grid"
        >
          <Button
            onClick={async() => await saveSettings()}
            color="success"
            variant="contained"
            style={{ whiteSpace: "nowrap", justifySelf: "flex-end" }}
          >
            Сохранить изменения
          </Button>
        </Grid>
      )}

      {canView("settings_point") && point_sett_hist.length > 0 && (
        <Grid
          item
          xs={12}
          mb={5}
        >
          <HistDropDownTable
            histData={point_sett_hist}
            openHistModal={openHistModal}
          />
        </Grid>
      )}
    </Grid>
  );
}
export default CafeEditTabSettings;
