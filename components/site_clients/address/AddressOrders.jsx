"use client";

import {
  Box,
  Button,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tabs,
  TextareaAutosize,
  Tooltip,
  Typography,
} from "@mui/material";
import { useSiteClientsStore } from "../useSiteClientsStore";
import { Fragment, useState } from "react";
import { MyAutocomplite, MyDatePickerNew } from "@/ui/Forms";
import TabPanel from "@/ui/TabPanel/TabPanel";
import dayjs from "dayjs";
import a11yProps from "@/ui/TabPanel/a11yProps";
import { Download, ExpandMore } from "@mui/icons-material";
import * as XLSX from "xlsx";
import ExcelIcon from "@/ui/ExcelIcon";

export default function AddressOrders({ canAccess, getData, openClientOrder }) {
  const {
    update,
    cities,
    city_id_addr,
    date_start_addr,
    date_end_addr,
    address_list,
    orders_list,
    orders_list_addr,
  } = useSiteClientsStore();

  // tabs
  const [activeTab, setActiveTab] = useState(0);
  const changeTab = async (_, newValue) => {
    setActiveTab(newValue);
    await getData();
  };

  // dropdowns
  const openAccordionAddrress = (id) => {
    const next = [...orders_list_addr].map((item) => {
      if (parseInt(item.id) === parseInt(id)) {
        item.is_open = !item.is_open;
      } else {
        item.is_open = false;
      }
      return item;
    });

    update({
      orders_list_addr: next,
    });
  };

  // sorting
  const [orderBy, setOrderBy] = useState("id");
  const [order, setOrder] = useState("desc");

  const handleSort = (field) => {
    const isAsc = orderBy === field && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(field);
  };

  const sortedOrders = [...orders_list].sort((a, b) => {
    const aVal = a[orderBy];
    const bVal = b[orderBy];

    if (aVal == null) return 1;
    if (bVal == null) return -1;

    if (typeof aVal === "number") {
      return order === "asc" ? aVal - bVal : bVal - aVal;
    }

    return order === "asc"
      ? String(aVal).localeCompare(String(bVal), "ru")
      : String(bVal).localeCompare(String(aVal), "ru");
  });
  // export to excel
  const exportOrdersToExcel = () => {
    const orders = useSiteClientsStore.getState().orders_list;
    if (!orders?.length) return;

    const rows = orders.map((o) => ({
      "ИД заказа": o.id,
      Точка: o.point_addr,
      "Адрес доставки": o.addr,
      Телефон: o.number,
      "Сумма заказа": o.order_price,
      "Дата заказа": new Date(Number(o.unix_time) * 1000).toLocaleString("ru-RU"),
      "Новый клиент": o.is_new ? "Да" : "Нет",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Заказы");

    XLSX.writeFile(workbook, `orders_${Date.now()}.xlsx`);
  };

  return (
    <>
      <Grid
        container
        spacing={3}
        maxWidth="lg"
      >
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyAutocomplite
            label="Город"
            multiple={true}
            data={cities}
            value={city_id_addr}
            func={(_, e) => update({ city_id_addr: e })}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyDatePickerNew
            label="Дата от"
            customActions={true}
            value={dayjs(date_start_addr)}
            func={(v) => update({ date_start_addr: v })}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyDatePickerNew
            label="Дата до"
            customActions={true}
            value={dayjs(date_end_addr)}
            func={(v) => update({ date_end_addr: v })}
          />
        </Grid>

        <Grid
          style={{ paddingRight: "20px" }}
          size={{
            xs: 12,
            sm: 8,
          }}
        >
          <TextareaAutosize
            aria-label="empty textarea"
            placeholder=""
            minRows={4}
            value={address_list}
            onChange={(e) => update({ address_list: e.target.value })}
            label="Список адресов"
            style={{
              width: "100%",
              padding: "10px",
              fontFamily: "Arial, sans-serif",
              fontSize: "16px",
              borderRadius: "4px",
              borderColor: "#ccc",
              maxWidth: "100%",
              resize: "vertical",
            }}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 2,
          }}
          sx={{ display: "flex", alignItems: "flex-start" }}
        >
          <Button
            onClick={getData}
            variant="contained"
          >
            Показать
          </Button>
          {orders_list?.length > 0 && canAccess("orders_address_export") && (
            <Tooltip title="Экспортировать заказы в Excel">
              <Button
                variant="contained"
                sx={{ ml: 2, backgroundColor: "#3cb623ff" }}
                disabled={!orders_list?.length}
                onClick={exportOrdersToExcel}
              >
                <Download />
              </Button>
            </Tooltip>
          )}
        </Grid>
      </Grid>

      <Grid
        container
        sx={{ mt: 3 }}
      >
        <Grid size={12}>
          <Paper>
            <Tabs
              value={activeTab}
              onChange={changeTab}
              centered
              variant="fullWidth"
            >
              <Tab
                label="Список заказов"
                {...a11yProps(0)}
              />
              <Tab
                label="Список адресов"
                {...a11yProps(1)}
              />
            </Tabs>
          </Paper>
        </Grid>
      </Grid>

      {/* Список заказов */}
      <Grid container>
        <Grid
          style={{ paddingTop: 0 }}
          size={12}
        >
          <TabPanel
            value={activeTab}
            index={0}
            id="clients"
          >
            <Grid
              container
              spacing={3}
            >
              <Grid
                sx={{ mb: 5, mt: 3 }}
                size={12}
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
                        <TableCell sortDirection={orderBy === "id" ? order : false}>
                          <TableSortLabel
                            active={orderBy === "id"}
                            direction={orderBy === "id" ? order : "asc"}
                            onClick={() => handleSort("id")}
                          >
                            ИД заказа
                          </TableSortLabel>
                        </TableCell>

                        <TableCell sortDirection={orderBy === "point_addr" ? order : false}>
                          <TableSortLabel
                            active={orderBy === "point_addr"}
                            direction={orderBy === "point_addr" ? order : "asc"}
                            onClick={() => handleSort("point_addr")}
                          >
                            Кафе
                          </TableSortLabel>
                        </TableCell>

                        <TableCell sortDirection={orderBy === "number" ? order : false}>
                          <TableSortLabel
                            active={orderBy === "number"}
                            direction={orderBy === "number" ? order : "asc"}
                            onClick={() => handleSort("number")}
                          >
                            Номер клиента
                          </TableSortLabel>
                        </TableCell>

                        <TableCell sortDirection={orderBy === "addr" ? order : false}>
                          <TableSortLabel
                            active={orderBy === "addr"}
                            direction={orderBy === "addr" ? order : "asc"}
                            onClick={() => handleSort("addr")}
                          >
                            Адрес заказа
                          </TableSortLabel>
                        </TableCell>

                        <TableCell sortDirection={orderBy === "order_price" ? order : false}>
                          <TableSortLabel
                            active={orderBy === "order_price"}
                            direction={orderBy === "order_price" ? order : "asc"}
                            onClick={() => handleSort("order_price")}
                          >
                            Сумма заказа
                          </TableSortLabel>
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {sortedOrders.map((item, key) => (
                        <TableRow
                          hover
                          key={key}
                          sx={{
                            cursor: "pointer",
                            backgroundColor: item.is_new ? "#ffcc00" : "inherit",
                          }}
                          title={item.is_new ? "Новый клиент" : ""}
                          onClick={() => openClientOrder(item.id, item.point_id)}
                        >
                          <TableCell>{key + 1}</TableCell>
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.point_addr}</TableCell>
                          <TableCell>{item.number}</TableCell>
                          <TableCell>{item.addr}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat("ru-RU").format(item.order_price ?? 0)} ₽
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </TabPanel>
        </Grid>
        {/* Список заказов */}

        {/* Список адресов */}
        <Grid
          style={{ paddingTop: 0 }}
          size={12}
        >
          <TabPanel
            value={activeTab}
            index={1}
            id="addresses"
          >
            <Grid
              container
              spacing={3}
            >
              <Grid
                sx={{ mb: 5, mt: 3 }}
                size={12}
              >
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Адрес</TableCell>
                        <TableCell>Количество заказов</TableCell>
                        <TableCell>Сумма заказов</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {orders_list_addr?.map((item, key) => (
                        <Fragment key={item?.address}>
                          <TableRow
                            hover
                            onClick={() => openAccordionAddrress(item.id)}
                            style={{ cursor: "pointer" }}
                          >
                            <TableCell>{key + 1}</TableCell>
                            <TableCell>{item?.address || "No address?"}</TableCell>
                            <TableCell>{item?.orders_count}</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat("ru-RU").format(item?.total_amount ?? 0)} ₽
                            </TableCell>
                            <TableCell>
                              <Tooltip
                                title={
                                  <Typography color="inherit">
                                    Все заказы по этому адресу
                                  </Typography>
                                }
                              >
                                <ExpandMore
                                  style={{
                                    display: "flex",
                                    transform: item?.is_open ? "rotate(180deg)" : "rotate(0deg)",
                                  }}
                                />
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell
                              style={{ padding: 0 }}
                              colSpan={10}
                            >
                              <Collapse
                                in={item?.is_open}
                                timeout="auto"
                                unmountOnExit
                              >
                                <Box sx={{ margin: "8px 0" }}>
                                  <Table
                                    size={"small"}
                                    stickyHeader
                                  >
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>ИД заказа</TableCell>
                                        <TableCell>Точка</TableCell>
                                        <TableCell>Номер клиента</TableCell>
                                        <TableCell>Адрес заказа</TableCell>
                                        <TableCell>Сумма заказа</TableCell>
                                      </TableRow>
                                    </TableHead>

                                    <TableBody>
                                      {item?.orders?.map((it, k) => (
                                        <TableRow
                                          hover
                                          key={it.id}
                                          sx={{
                                            cursor: "pointer",
                                            backgroundColor: it.is_new ? "#ffcc00" : "inherit",
                                          }}
                                          onClick={() => openClientOrder(it.id, it.point_id)}
                                        >
                                          <TableCell>{k + 1}</TableCell>
                                          <TableCell>{it.id}</TableCell>
                                          <TableCell>{it.point_addr}</TableCell>
                                          <TableCell>{it.number}</TableCell>
                                          <TableCell>{it.addr}</TableCell>
                                          <TableCell>
                                            {new Intl.NumberFormat("ru-RU").format(
                                              it.order_price ?? 0,
                                            )}
                                            ₽
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </TabPanel>
        </Grid>
        {/* Список адресов */}
      </Grid>
    </>
  );
}
