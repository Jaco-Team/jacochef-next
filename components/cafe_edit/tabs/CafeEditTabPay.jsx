"use client";

import { Button, Grid } from "@mui/material";
import { MyTextInput } from "@/components/shared/Forms";
import HistDropDownTable from "../HistDropDownTable";
import useCafeEditStore from "../useCafeEditStore";

const { default: useCafeEditModalsStore } = require("../useCafeEditModalsStore");

function CafeEditTabPay({ canView, canEdit, openHistModal }) {
  const openEditPoint = () => {
    useCafeEditModalsStore.setState({
      modalDialog_edit: true,
      mark: "pay",
    });
  };
  const [point_info, point_pay_hist] = useCafeEditStore((s) => [s.point_info, s.point_pay_hist]);
  return (
    <Grid
      container
      spacing={3}
    >
      <Grid
        size={{ xs: 12, sm: 4 }}
      >
        <MyTextInput
          label="Оклад директора на 2 недели"
          value={point_info?.dir_price ?? ""}
          disabled={!canEdit("pay_point")}
          func={(e) => changePointInfoData("dir_price", e)}
        />
      </Grid>

      <Grid
        size={{ xs: 12, sm: 4 }}
      >
        <MyTextInput
          label="Бонус от уровня директору"
          value={point_info?.price_per_lv ?? ""}
          disabled={!canEdit("pay_point")}
          func={(e) => changePointInfoData("price_per_lv", e)}
        />
      </Grid>

      <Grid
        size={{ xs: 12, sm: 4 }}
      >
        <MyTextInput
          label="Часовая ставка курьера"
          value={point_info?.driver_price ?? ""}
          disabled={!canEdit("pay_point")}
          func={(e) => changePointInfoData("driver_price", e)}
        />
      </Grid>
      {canEdit("pay_point") && (
        <Grid
          size={12}
          display="grid"
        >
          <Button
            onClick={() => openEditPoint()}
            color="success"
            variant="contained"
            style={{ whiteSpace: "nowrap", justifySelf: "flex-end" }}
          >
            Выбрать дату применения
          </Button>
        </Grid>
      )}
      {point_pay_hist.length > 0 && (
        <Grid
          size={12}
          mb={5}
        >
          <HistDropDownTable
            histData={point_pay_hist}
            openHistModal={openHistModal}
          />
        </Grid>
      )}
    </Grid>
  );
}
export default CafeEditTabPay;
