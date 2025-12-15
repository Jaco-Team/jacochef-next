"use client";

import { MyAutocomplite, MyCheckBox, MySelect, MyTextInput } from "@/ui/Forms";
import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { memo } from "react";
import useCafeEditStore from "../useCafeEditStore";
import HistDropDownTable from "../HistDropDownTable";
import SupplierUnloadingTimeInput from "@/ui/Forms/SupplierUnloadingTimeInput";

function CafeEditTabInfo({ saveData, openHistModal, canView, canEdit }) {
  const canEditAny =
    canEdit("telephone_point") || canEdit("active_point") || canEdit("organization_point");
  const [point_info, point_info_hist, cities] = useCafeEditStore((s) => [
    s.point_info,
    s.point_info_hist,
    s.cities,
  ]);
  const changePointInfoData = useCafeEditStore((s) => s.changePointInfoData);
  const changePointInfoDataText = useCafeEditStore((s) => s.changePointInfoDataText);
  const changeItemChecked = useCafeEditStore((s) => s.changeItemChecked);
  const dows = [
    { id: 1, name: "Понедельник" },
    { id: 2, name: "Вторник" },
    { id: 3, name: "Среда" },
    { id: 4, name: "Четверг" },
    { id: 5, name: "Пятница" },
    { id: 6, name: "Суббота" },
    { id: 7, name: "Воскресенье" },
  ];

  return (
    <Grid
      container
      spacing={3}
    >
      {canView("organization_point") && (
        <>
          <Grid size={{ xs: 12, sm: 3 }}>
            <MySelect
              disabled={!canEdit("organization_point")}
              label="Город"
              is_none={false}
              data={cities}
              value={point_info?.city_id ?? ""}
              func={(e) => changePointInfoData("city_id", e)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <MyTextInput
              disabled={!canEdit("organization_point")}
              label="Адрес"
              value={point_info?.addr ?? ""}
              func={(e) => changePointInfoData("addr", e)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <MyTextInput
              disabled={!canEdit("organization_point")}
              label="Район"
              value={point_info?.raion ?? ""}
              func={(e) => changePointInfoData("raion", e)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <MyTextInput
              disabled={!canEdit("organization_point")}
              label="Сортировка ( порядок точек во всех модулях и на сайте )"
              value={point_info?.sort ?? ""}
              func={(e) => changePointInfoData("sort", e)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <MyTextInput
              disabled={!canEdit("organization_point")}
              label="Организация"
              value={point_info?.organization ?? ""}
              func={(e) => changePointInfoData("organization", e)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <MyTextInput
              disabled={!canEdit("organization_point")}
              label="ИНН"
              value={point_info?.inn ?? ""}
              func={(e) => changePointInfoData("inn", e)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <MyTextInput
              disabled={!canEdit("organization_point")}
              label="ОГРН"
              value={point_info?.ogrn ?? ""}
              func={(e) => changePointInfoData("ogrn", e)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <MyTextInput
              disabled={!canEdit("organization_point")}
              label="КПП"
              value={point_info?.kpp ?? ""}
              func={(e) => changePointInfoData("kpp", e)}
            />
          </Grid>
          {canView("point_unload") ? (
            <>
              <Grid size={{ xs: 12, sm: 3 }}>
                <SupplierUnloadingTimeInput
                  handleChange={(e) => changePointInfoDataText("point_unload_time", e)}
                  value={point_info?.point_unload_time}
                  disabled={!canEdit("point_unload")}
                  label={"Время разгрузки товара поставщика"}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <MyAutocomplite
                  multiple={true}
                  label="Дни недели"
                  data={dows}
                  disabled={!canEdit("point_unload")}
                  value={point_info?.point_unload_week_day ?? []}
                  func={(event, value) => {
                    changePointInfoData("point_unload_week_day", value);
                  }}
                />
              </Grid>
            </>
          ) : null}

          <Grid size={12}>
            <MyTextInput
              disabled={!canEdit("organization_point")}
              label="Полный адрес"
              value={point_info?.full_addr ?? ""}
              func={(e) => changePointInfoData("full_addr", e)}
            />
          </Grid>
        </>
      )}

      {canView("active_point") && (
        <Grid size={12}>
          <MyCheckBox
            label="Активность"
            disabled={!canEdit("active_point")}
            value={parseInt(point_info?.is_active ?? 0) == 1 ? true : false}
            func={(e) => changeItemChecked("is_active", e)}
          />
        </Grid>
      )}

      {canView("telephone_point") && (
        <>
          <Grid size={{ xs: 12, sm: 4 }}>
            <MyTextInput
              disabled={!canEdit("telephone_point")}
              label="Телефон управляющего"
              value={point_info?.phone_upr ?? ""}
              func={(e) => changePointInfoData("phone_upr", e)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <MyTextInput
              disabled={!canEdit("telephone_point")}
              label="Почта управляющего"
              value={point_info?.mail ?? ""}
              func={(e) => changePointInfoData("mail", e)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <MyTextInput
              disabled={!canEdit("telephone_point")}
              label="Телефон менеджера"
              value={point_info?.phone_man ?? ""}
              func={(e) => changePointInfoData("phone_man", e)}
            />
          </Grid>
        </>
      )}

      {canEditAny && (
        <Grid
          size={12}
          display="grid"
        >
          <Button
            onClick={async () => await saveData()}
            color="success"
            variant="contained"
            style={{ whiteSpace: "nowrap", justifySelf: "flex-end" }}
          >
            Сохранить изменения
          </Button>
        </Grid>
      )}

      {point_info_hist?.length > 0 && (
        <Grid
          size={12}
          mb={5}
        >
          <HistDropDownTable
            histData={point_info_hist}
            openHistModal={openHistModal}
          />
        </Grid>
      )}
    </Grid>
  );
}
export default memo(CafeEditTabInfo);
