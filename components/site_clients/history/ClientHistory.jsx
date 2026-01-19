"use client";

import { MyAutocomplite2 } from "@/ui/Forms";
import { Grid } from "@mui/material";
import { useSiteClientsStore } from "../useSiteClientsStore";

function ClientHistory() {
  const {
    order,
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
    select_toggle,
    cities,
    city_id,
    points,
    point_id,
    update,
  } = useSiteClientsStore();
  return (
    <Grid
      container
      spacing={3}
      maxWidth={"lg"}
    >
      <Grid
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <MyAutocomplite2
          label="Кафе"
          multiple={true}
          data={points}
          value={point_id}
          func={(_, e) => update({ point_id: e })}
        />
      </Grid>

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
          func={(e) => update({ date_start: e })}
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
          func={(e) => update({ date_end: e })}
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <MyTextInput
          type="number"
          className="input_login"
          label="Номер заказа"
          value={order}
          func={({ target }) => update({ order: target?.value })}
          inputAdornment={
            !order ? null : (
              <IconButton>
                <Clear onClick={() => update({ order: "" })} />
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
        <MyTextInput
          type="number"
          className="input_login"
          label="Номер телефона"
          value={number}
          func={({ target }) => update({ number: target?.value })}
          inputAdornment={
            !number ? null : (
              <IconButton>
                <Clear onClick={() => update({ number: "" })} />
              </IconButton>
            )
          }
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 2,
        }}
      >
        <MyTextInput
          type="text"
          className="input_promo"
          label="Промокод"
          value={promo}
          func={({ target }) => update({ promo: target?.value })}
          inputAdornment={
            !promo ? null : (
              <IconButton>
                <Clear onClick={() => update({ promo: "" })} />
              </IconButton>
            )
          }
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 2,
        }}
      >
        <MyCheckBox
          value={promo_dr}
          func={(e) => changeDataCheck("promo_dr", e)}
          label="Промик на ДР"
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
        }}
      >
        <MyTextInput
          className="input_login"
          label="Адрес клиента"
          value={addr}
          func={({ target }) => update({ addr: target?.value })}
          inputAdornment={
            !addr ? null : (
              <IconButton>
                <Clear onClick={() => update({ addr: "" })} />
              </IconButton>
            )
          }
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 3,
        }}
      >
        <MyAutocomplite
          label="Кто оформил"
          multiple={true}
          data={all_created}
          value={created}
          func={(_, e) => update({ created: e })}
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 5,
        }}
      >
        <MyAutocomplite
          label="Товары в заказе"
          multiple={true}
          data={all_items}
          value={items}
          func={(_, e) => update({ items: e })}
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 2,
        }}
        sx={{
          display: "flex",
          gap: 1,
        }}
      >
        <Button
          onClick={getOrders}
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
                onClick={alert("Download")}
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
export default ClientHistory;
