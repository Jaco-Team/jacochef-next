import { useSiteClientsStore } from "../useSiteClientsStore";
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Button,
  Tooltip,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import { MyAutocomplite, MyDatePickerNew, MyTextInput, MyCheckBox } from "@/ui/Forms";
import dayjs from "dayjs";
import { Clear, Download } from "@mui/icons-material";

export default function Orders({ getOrders, openClientOrder, downLoad, canAccess }) {
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

  const handleToggleChange = (_, newSelection) => {
    if (newSelection !== null) {
      update({
        select_toggle: newSelection,
      });

      if (newSelection === "city") {
        update({
          point_id: [],
        });
      }

      if (newSelection === "point") {
        update({
          city_id: [],
        });
      }
    }
  };

  return (
    <>
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
          <ToggleButtonGroup
            value={select_toggle}
            exclusive
            onChange={handleToggleChange}
            sx={{
              display: "flex",
              "& .MuiToggleButton-root": {
                fontSize: 16,
                textTransform: "none",
                borderRadius: 0,
                px: 3,
                py: 0.5,
              },
              "& .MuiToggleButton-root:first-of-type": {
                borderTopLeftRadius: 4,
                borderBottomLeftRadius: 4,
              },
              "& .MuiToggleButton-root:last-of-type": {
                borderTopRightRadius: 4,
                borderBottomRightRadius: 4,
              },
              "& .MuiToggleButton-root.Mui-selected": {
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
              },
            }}
          >
            <ToggleButton value="city">Город</ToggleButton>
            <ToggleButton value="point">Точка</ToggleButton>
          </ToggleButtonGroup>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 12,
          }}
        >
          {select_toggle === "city" ? (
            <MyAutocomplite
              label="Город"
              multiple={true}
              data={cities}
              value={city_id}
              func={(_, e) => update({ city_id: e })}
            />
          ) : (
            <MyAutocomplite
              label="Точка"
              multiple={true}
              data={points}
              value={point_id}
              func={(_, e) => update({ point_id: e })}
            />
          )}
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
            func={({ target }) => update({ promo_dr: +!!target.checked })}
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
                  onClick={downLoad}
                >
                  <Download />
                </Button>
              </span>
            </Tooltip>
          )}
        </Grid>
      </Grid>

      {search_orders.length > 0 && (
        <Grid
          container
          mt={5}
        >
          <TableContainer
            sx={{ maxHeight: { xs: "none", sm: 570 } }}
            component={Paper}
          >
            <Table
              size={"small"}
              stickyHeader
            >
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Заказ</TableCell>
                  <TableCell>Дата заказа</TableCell>
                  <TableCell>Точка</TableCell>
                  <TableCell>Оформил</TableCell>
                  <TableCell>Номер клиента</TableCell>
                  <TableCell>Адрес доставки</TableCell>
                  <TableCell>Время открытия заказа</TableCell>
                  <TableCell>Ко времени</TableCell>
                  <TableCell>Закрыт на кухне</TableCell>
                  <TableCell>Получен клиентом</TableCell>
                  <TableCell>Время обещ</TableCell>
                  <TableCell>Тип</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Сумма</TableCell>
                  <TableCell>Оплата</TableCell>
                  <TableCell>Водитель</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {search_orders.map((item, key) => (
                  <TableRow
                    hover
                    key={key}
                    style={
                      parseInt(item.is_delete) == 1
                        ? {
                            backgroundColor: "red",
                            color: "#fff",
                            fontWeight: "bold",
                          }
                        : {}
                    }
                    sx={{ cursor: "pointer" }}
                    onClick={() => openClientOrder(item.id, item.point_id)}
                  >
                    <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                      {key + 1}
                    </TableCell>
                    <TableCell
                      style={
                        parseInt(item.dist) >= 0
                          ? {
                              backgroundColor: "yellow",
                              color: "#000",
                              cursor: "pointer",
                              fontWeight: "inherit",
                            }
                          : { color: "inherit", cursor: "pointer", fontWeight: "inherit" }
                      }
                    >
                      {item.id}
                    </TableCell>
                    <TableCell>
                      <span
                        style={{
                          fontSize: "10px",
                          lineHeight: 1,
                          color: item.is_preorder ? "green" : "inherit",
                        }}
                      >
                        {dayjs(item.unix_time * 1000).format("D/M/YY hh:mm:ss")}
                      </span>
                    </TableCell>
                    <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                      {item.point_addr}
                    </TableCell>
                    <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                      {item.type_user}
                    </TableCell>
                    <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                      {item.number}
                    </TableCell>
                    <TableCell
                      style={{
                        color: "inherit",
                        fontWeight: "inherit",
                      }}
                    >
                      {item.street} {item.home}
                    </TableCell>
                    <TableCell
                      style={{
                        color: "inherit",
                        fontWeight: "inherit",
                      }}
                    >
                      {item.date_time_order}
                    </TableCell>
                    <TableCell
                      style={{
                        color: "inherit",
                        fontWeight: "inherit",
                        backgroundColor: parseInt(item.is_preorder) == 1 ? "#bababa" : "inherit",
                      }}
                    >
                      {item.need_time}
                    </TableCell>
                    <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                      {item.give_data_time == "00:00:00" ? "" : item.give_data_time}
                    </TableCell>
                    <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                      {item.close_order}
                    </TableCell>
                    <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                      {item.unix_time_to_client == "0" || parseInt(item.is_preorder) == 1
                        ? ""
                        : item.unix_time_to_client}
                    </TableCell>
                    <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                      {item.type_order}
                    </TableCell>
                    <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                      {item.status}
                    </TableCell>
                    <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                      {item.order_price}
                    </TableCell>
                    <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                      {item.type_pay}
                    </TableCell>
                    <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                      {item.driver}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {search_orders.length ? (
            <Box
              sx={{
                backgroundColor: "#f5f5f5",
                padding: "10px",
                borderTop: "1px solid #ddd",
                fontWeight: "bold",
                marginBottom: "1rem",
                textAlign: "center",
                position: "sticky",
                bottom: 0,
              }}
            >
              <span
                style={{
                  marginRight: "24px",
                  marginLeft: "10px",
                }}
              >
                Кол-во заказов: {search_orders.length}
              </span>
              {canAccess("count_complete_order") && (
                <>
                  <span style={{ color: "green", marginRight: "24px" }}>
                    Кол-во завершенных заказов:{" "}
                    {search_orders.filter((src) => src.status_order === 6)?.length}
                  </span>
                  <span style={{ color: "blue" }}>
                    Сумма завершенных заказов:{" "}
                    {search_orders
                      .filter((src) => src.status_order === 6)
                      .reduce((sum, order) => sum + (parseFloat(order.order_price) || 0), 0)
                      .toLocaleString("ru-RU", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                    руб.
                  </span>
                </>
              )}
            </Box>
          ) : null}
        </Grid>
      )}
    </>
  );
}
