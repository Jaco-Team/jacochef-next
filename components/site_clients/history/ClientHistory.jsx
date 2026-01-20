"use client";

import { MyAutocomplite, MyCheckBox, MyDatePickerNew, MyTextInput } from "@/ui/Forms";
import { Button, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import { useSiteClientsStore } from "../useSiteClientsStore";
import { useClientHistoryStore } from "./useClientHistoryStore";
import { Clear, Download } from "@mui/icons-material";
import dayjs from "dayjs";
import { memo, useEffect } from "react";

function ClientHistory({ getData, showAlert, canAccess }) {
  const {
    promo,
    promo_dr,
    addr,
    all_created,
    created,
    all_items,
    items,
    number,
    search_orders,
    date_start,
    date_end,
    orders_count,
    order_utm,
    update: updateMain,
  } = useSiteClientsStore();

  const { refresh, refreshToken } = useClientHistoryStore();

  const getClientHistory = async () => {
    if (!date_start || !date_end) {
      return;
    }
    // TODO more variants to skip

    const resData = await getData("get_client_history", {
      date_start: dayjs(date_start).format("YYYY-MM-DD"),
      date_end: dayjs(date_end).format("YYYY-MM-DD"),
      number,
      promo,
      promo_dr,
      addr,
      created: created.map((c) => c.id),
      items: items.map((i) => i.id),
      orders_count,
    });

    if (!resData?.st) {
      return showAlert(resData?.text || "За период нет данных", false);
    }
  };

  const applyRequest = () => {
    if (!date_start || !date_end) {
      return showAlert("Пожалуйста, выберите кафе и даты", false);
    }
    refresh();
  };

  useEffect(() => {
    getClientHistory();
  }, [refreshToken]);

  return (
    <Grid
      container
      spacing={3}
      maxWidth={"lg"}
    >
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <MyDatePickerNew
          label="Дата от"
          customActions={true}
          value={dayjs(date_start)}
          maxDate={dayjs(date_end) ?? dayjs()}
          func={(e) => updateMain({ date_start: e })}
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <MyDatePickerNew
          label="Дата до"
          customActions={true}
          value={dayjs(date_end)}
          minDate={dayjs(date_start)}
          maxDate={dayjs()}
          func={(e) => updateMain({ date_end: e })}
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 3,
        }}
      >
        <MyTextInput
          type="number"
          label="Заказов за период"
          value={orders_count}
          func={({ target }) => updateMain({ orders_count: target?.value })}
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 5,
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <MyTextInput
          type="text"
          className="input_promo"
          label="Промокод"
          value={promo}
          func={({ target }) => updateMain({ promo: target?.value })}
          inputAdornment={
            !promo ? null : (
              <IconButton>
                <Clear onClick={() => updateMain({ promo: "" })} />
              </IconButton>
            )
          }
          sx={{ width: "55%" }}
        />
        <MyCheckBox
          value={promo_dr}
          func={({ target }) => updateMain({ promo_dr: Number(target?.checked) })}
          label="Промик на ДР"
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <MyTextInput
          type="text"
          label="UTM метка"
          value={order_utm}
          func={({ target }) => updateMain({ order_utm: target?.value })}
          inputAdornment={
            !order_utm ? null : (
              <IconButton>
                <Clear onClick={() => updateMain({ order_utm: "" })} />
              </IconButton>
            )
          }
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <MyAutocomplite
          label="Кто оформил"
          multiple={true}
          data={all_created}
          value={created}
          func={(_, e) => updateMain({ created: e })}
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <MyAutocomplite
          label="Позиции в заказе"
          multiple={true}
          data={all_items}
          value={items}
          func={(_, v) => updateMain({ items: v })}
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 2,
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          justifyContent: { xs: "flex-end", sm: "space-evenly" },
        }}
      >
        <Button
          onClick={() => applyRequest()}
          variant="contained"
        >
          Показать
        </Button>

        {canAccess("download_file") && search_orders?.length > 0 && (
          <Tooltip title={<Typography>{"Скачать таблицу в Excel"}</Typography>}>
            <span>
              <Button
                variant="contained"
                sx={{ padding: 0, backgroundColor: "#3cb623ff" }}
                onClick={() => alert("Download")}
              >
                <Download />
              </Button>
            </span>
          </Tooltip>
        )}
      </Grid>
    </Grid>
  );
}
export default memo(ClientHistory);
