"use client";

import {
  Button,
  Grid,
} from "@mui/material";
import useCafeEditStore from "../useCafeEditStore";
import { MyTextInput } from "@/ui/elements";
import HistDropDownTable from "../HistDropDownTable";
import useCafeEditModalsStore from "../useCafeEditModalsStore";

function CafeEditTabRates({ openHistModal, canView, canEdit }) {
  const [point_info, point_rate_hist] = useCafeEditStore((s) => [s.point_info, s.point_rate_hist]);
  const changePointInfoData = useCafeEditStore((s) => s.changePointInfoData);
  const openEditModal = () => {
    useCafeEditModalsStore.setState({
      modalDialog_edit: true,
      mark: "rate",
    });
  }
  return (
    canView("rate_point") && (
      <Grid
        container
        spacing={3}
      >
        <Grid
          item
          xs={12}
          sm={4}
        >
          <MyTextInput
            disabled={!canEdit("rate_point")}
            label="Коэффициент количества пиццы в час"
            value={point_info?.k_pizza ?? ""}
            type="number"
            inputProps={{
              min: 0,
              max: 999,
              step: 0.1
            }}
            func={(e) => changePointInfoData("k_pizza", e)}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={4}
        >
          <MyTextInput
            disabled={!canEdit("rate_point")}
            label="Коэффициент мойки посуды для пиццы (кух раб)"
            value={point_info?.k_pizza_kux ?? ""}
            type="number"
            inputProps={{
              min: 0,
              max: 999,
              step: 0.01
            }}
            func={(e) => changePointInfoData("k_pizza_kux", e)}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={4}
        >
          <MyTextInput
            disabled={!canEdit("rate_point")}
            label="Коэффициент мойки посуды для роллов (кух раб)"
            value={point_info?.k_rolls_kux ?? ""}
            type="number"
            inputProps={{
              min: 0,
              max: 999,
              step: 0.01
            }}
            func={(e) => changePointInfoData("k_rolls_kux", e)}
          />
        </Grid>

        {canEdit("rate_point") && (
          <Grid
            item
            xs={12}
            display="grid"
          >
            <Button
              onClick={() => openEditModal()}
              color="success"
              variant="contained"
              style={{ whiteSpace: "nowrap", justifySelf: "flex-end" }}
            >
              Выбрать дату применения
            </Button>
          </Grid>
        )}

        {canEdit("rate_point") && point_rate_hist.length > 0 && (
          <Grid
            item
            xs={12}
            mb={5}
          >
            <HistDropDownTable
              histData={point_rate_hist}
              openHistModal={openHistModal}
            />
          </Grid>
        )}
      </Grid>
    )
  );
}
export default CafeEditTabRates;
