"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { api_laravel } from "@/src/api_new";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Clear, Close } from "@mui/icons-material";
import a11yProps from "@/ui/TabPanel/a11yProps";
import TabPanel from "@/ui/TabPanel/TabPanel";
import { useDebounce } from "@/src/hooks/useDebounce";
import dayjs from "dayjs";
import ExcelIcon from "@/ui/ExcelIcon";
import useXLSExport from "@/src/hooks/useXLSXExport";
import formatPrice from "@/src/helpers/ui/formatPrice";
import { useLoading } from "../useClientsLoadingContext";
import { useClientHistoryStore } from "./useClientHistoryStore";
import { delivery_types, order_types_all } from "../config";
import { formatYMD } from "@/src/helpers/ui/formatDate";
import { MyTextInput } from "@/ui/Forms";

dayjs.locale("ru");

function HistoryClientModal({ canAccess, showAlert, openOrder, open, onClose }) {
  const { client, clientLogin, clientLoading, setClientModalOpened } = useClientHistoryStore();
  const clientInfo = client?.client_info;

  // global isLoading
  const { isLoading, setIsLoading } = useLoading();

  const exportXLSX = useXLSExport();

  // sorting & filtering
  const [sortBy, setSortBy] = useState("date_time");
  const [sortDir, setSortDir] = useState("desc");
  const [searchPromo, setSearchPromo] = useState("");
  const [searchUTM, setSearchUTM] = useState("");
  const [searchItem, setSearchItem] = useState("");

  const sortedFilteredOrders = useMemo(() => {
    if (!client?.client_orders) return [];

    let rows = [...client.client_orders];

    if (searchPromo?.length > 0) {
      rows = rows.filter((item) => {
        return String(item.promo_name).toLowerCase().includes(searchPromo.toLowerCase());
      });
    }
    if (searchUTM?.length > 0) {
      rows = rows.filter((item) => {
        return String(item.utm).toLowerCase().includes(searchUTM.toLowerCase());
      });
    }
    if (searchItem?.length > 0) {
      rows = rows.filter((item) => {
        return item.items.some((it) =>
          String(it.name).toLowerCase().includes(searchItem.toLowerCase()),
        );
      });
    }

    rows.sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];

      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }

      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return rows;
  }, [client?.client_orders, sortBy, sortDir, searchPromo, searchUTM, searchItem]);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDir((v) => (v === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  // tabs
  const [activeTab, setActiveTab] = useState(0);

  const getData = async (method, data = {}, dop_type = {}) => {
    try {
      const res = await api_laravel("site_clients", method, data, dop_type);
      if (!res) {
        throw new Error("Ошибка при получении данных");
      }
      const result = res.data || null;
      return result;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getClient = async () => {
    const { clientLogin, setClient, setClientLoading } = useClientHistoryStore.getState();
    try {
      setClientLoading(true);
      setIsLoading(true);
      setClient(null);
      const res = await getData("get_one_client_history", { login: clientLogin });
      if (!res?.st) {
        throw new Error(res?.text || "Ошибка загрузки данных клиента");
      }
      setClient(res);
    } catch (error) {
      showAlert(`Error fetching client data: ${error.message}`, false);
    } finally {
      setClientLoading(false);
      setIsLoading(false);
    }
  };

  const debouncedGetClient = useDebounce(getClient, 300);
  useEffect(() => {
    debouncedGetClient();
  }, [clientLogin]);

  // fullscreen hook
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        fullWidth={true}
        maxWidth={"xl"}
        sx={{ opacity: isLoading ? 0 : 1 }}
      >
        <DialogTitle>
          <Grid
            container
            spacing={0}
            mb={3}
          >
            <Grid
              mb={2}
              size={12}
            >
              Информация о клиенте с номером телефона
              {!!clientLogin && `: ${clientLogin}`}
              <IconButton
                onClick={() => setClientModalOpened(false)}
                style={{
                  cursor: "pointer",
                  position: "absolute",
                  top: 0,
                  right: 0,
                  padding: 20,
                }}
              >
                <Close />
              </IconButton>
            </Grid>
            {!!client && (
              <>
                <Grid
                  size={{
                    xs: 12,
                    sm: 3,
                  }}
                >
                  <Typography variant="body2">Имя:</Typography>
                  <Typography variant="h5">{clientInfo?.name ?? "Не указано"}</Typography>
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 3,
                  }}
                >
                  <Typography variant="body2">Зарегистрировался:</Typography>
                  <Typography variant="body1">
                    {dayjs(clientInfo?.date_reg)?.format("DD MMMM YYYY в HH:mm") ?? "Неизвестно"}
                  </Typography>
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 3,
                  }}
                >
                  <Typography variant="body2">Источник (первого заказа):</Typography>
                  <Typography variant="body1">
                    {clientInfo?.source || clientInfo?.medium
                      ? `${clientInfo?.source || "n/a"}: ${clientInfo?.medium || "n/a"}`
                      : "Не указан"}
                  </Typography>
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 3,
                  }}
                >
                  <Typography variant="body2">Сумма заказов:</Typography>
                  <Typography variant="h5">
                    {formatPrice(clientInfo?.summ) ?? 0} {"\u20bd"}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </DialogTitle>
        <Divider />
        {clientLoading ? (
          <CircularProgress sx={{ padding: 20 }} />
        ) : (
          <DialogContent style={{ paddingBottom: 10 }}>
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <Paper>
                <Tabs
                  value={activeTab}
                  onChange={(_, newValue) => setActiveTab(newValue)}
                  centered
                  variant="fullWidth"
                >
                  <Tab
                    label="Профиль"
                    {...a11yProps(0)}
                  />
                  <Tab
                    label="История заказов"
                    {...a11yProps(1)}
                  />
                </Tabs>
              </Paper>
            </Grid>

            {/* О клиенте */}
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <TabPanel
                value={activeTab}
                index={0}
                id="client"
              >
                <Paper style={{ padding: 24 }}>
                  <Grid
                    style={{ display: "flex" }}
                    mb={3}
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography style={{ fontWeight: "bold", paddingRight: 10 }}>Имя:</Typography>
                    <Typography>{clientInfo?.name || "Не указано"}</Typography>
                  </Grid>

                  <Grid
                    style={{ display: "flex" }}
                    mb={3}
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography style={{ fontWeight: "bold", paddingRight: 10 }}>
                      Телефон:
                    </Typography>
                    <Typography>
                      {clientLogin ? <a href={`tel:${clientLogin}`}>{clientLogin}</a> : "Не указан"}
                    </Typography>
                  </Grid>

                  <Grid
                    mb={3}
                    className="mail_box"
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography
                      style={{ fontWeight: "bold", paddingRight: 10, whiteSpace: "nowrap" }}
                    >
                      Эл почта:
                    </Typography>
                    <Typography>{clientInfo?.mail ?? "Не указана"}</Typography>
                  </Grid>

                  <Grid
                    style={{ display: "flex" }}
                    mb={3}
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography style={{ fontWeight: "bold", paddingRight: 10 }}>
                      Зарегистрирован:
                    </Typography>
                    <Typography>
                      {(clientInfo?.date_reg &&
                        dayjs(clientInfo?.date_reg).format("DD MMMM YYYY")) ??
                        "Не указано"}
                    </Typography>
                  </Grid>

                  <Grid
                    mb={3}
                    className="select_box"
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography
                      style={{ fontWeight: "bold", paddingRight: 10, whiteSpace: "nowrap" }}
                    >
                      Дата рождения:
                    </Typography>
                    <Typography>
                      {(clientInfo?.date_bir && dayjs(clientInfo?.date_bir).format("DD MMMM")) ??
                        "Не указана"}
                    </Typography>
                  </Grid>

                  <Grid
                    style={{ display: "flex" }}
                    mb={3}
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography style={{ fontWeight: "bold", paddingRight: 10 }}>
                      Заказов:
                    </Typography>
                    <Typography>
                      {`${clientInfo?.all_count_order} / ${formatPrice(clientInfo?.summ, true)}`}
                    </Typography>
                  </Grid>

                  <Grid
                    style={{ display: "flex" }}
                    mb={3}
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography style={{ fontWeight: "bold", paddingRight: 10 }}>
                      Доставок:
                    </Typography>
                    <Typography>{`${clientInfo?.count_dev} / ${formatPrice(
                      clientInfo?.summ_dev,
                      true,
                    )}`}</Typography>
                  </Grid>

                  <Grid
                    style={{ display: "flex" }}
                    mb={3}
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography style={{ fontWeight: "bold", paddingRight: 10 }}>
                      Самовывозов:
                    </Typography>
                    <Typography>{`${clientInfo?.count_pic} / ${formatPrice(
                      clientInfo?.summ_pic,
                      true,
                    )}`}</Typography>
                  </Grid>
                </Paper>
              </TabPanel>
            </Grid>
            {/* /О клиенте */}

            {/* История */}
            {canAccess("view_orders") && (
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <TabPanel
                  value={activeTab}
                  index={1}
                  id="history"
                >
                  <Stack
                    direction={"row"}
                    gap={2}
                    sx={{ mt: 2 }}
                  >
                    <MyTextInput
                      label="Поиск по промокоду..."
                      value={searchPromo}
                      func={({ target }) => setSearchPromo(target.value)}
                      inputAdornment={
                        !searchPromo ? null : (
                          <IconButton>
                            <Clear onClick={() => setSearchPromo("")} />
                          </IconButton>
                        )
                      }
                    />
                    <MyTextInput
                      label="Поиск по UTM..."
                      value={searchUTM}
                      func={({ target }) => setSearchUTM(target.value)}
                      inputAdornment={
                        !searchUTM ? null : (
                          <IconButton>
                            <Clear onClick={() => setSearchUTM("")} />
                          </IconButton>
                        )
                      }
                    />
                    <MyTextInput
                      label="Поиск по Позиции..."
                      value={searchItem}
                      func={({ target }) => setSearchItem(target.value)}
                      inputAdornment={
                        !searchItem ? null : (
                          <IconButton>
                            <Clear onClick={() => setSearchItem("")} />
                          </IconButton>
                        )
                      }
                    />
                    {canAccess("export_items") && (
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <IconButton
                          style={{ cursor: "pointer", padding: 10 }}
                          onClick={() =>
                            exportXLSX(
                              sortedFilteredOrders,
                              ordersColumns,
                              `client-orders-history-${clientLogin}.xlsx`,
                            )
                          }
                          title="Экспортировать в Excel"
                        >
                          <ExcelIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Stack>
                  <TableContainer
                    sx={{ maxHeight: { xs: "none", sm: 607 } }}
                    component={Paper}
                  >
                    <Table
                      size="small"
                      stickyHeader
                    >
                      <TableHead>
                        <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                          <TableCell>#</TableCell>

                          {ordersColumns.map((col) => (
                            <TableCell
                              key={col.key}
                              align={col.numeric ? "right" : "left"}
                            >
                              <TableSortLabel
                                active={sortBy === col.key}
                                direction={sortBy === col.key ? sortDir : "asc"}
                                onClick={() => handleSort(col.key)}
                              >
                                {col.label}
                              </TableSortLabel>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedFilteredOrders.map((item, idx) => (
                          <TableRow
                            hover
                            key={item.order_id || idx}
                            onClick={() => openOrder(item.point_id, item.order_id)}
                            sx={{
                              cursor: "pointer",
                              backgroundColor: Number(item.is_delete)
                                ? "rgb(204, 0, 51)"
                                : undefined,
                              "& td": { color: Number(item.is_delete) ? "#fff" : "#000" },
                            }}
                          >
                            <TableCell>{idx + 1}</TableCell>

                            {ordersColumns.map((col) => (
                              <TableCell
                                key={col.key}
                                align={col.numeric ? "right" : "left"}
                              >
                                {col.format ? col.format(item[col.key]) : (item[col.key] ?? "-")}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TabPanel>
              </Grid>
            )}
            {/* /История */}
          </DialogContent>
        )}
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => setClientModalOpened(false)}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default memo(HistoryClientModal);

const ordersColumns = [
  {
    label: "Дата заказа",
    key: "date_time",
    format: (v) => formatYMD(v),
  },
  {
    label: "ID заказа",
    key: "order_id",
    format: (v) => `#${v}`,
  },
  {
    label: "Кафе",
    key: "point_addr",
  },
  {
    label: "Тип заказа",
    key: "new_type_order",
    format: (v) => delivery_types.find((t) => t.id === Number(v))?.name || "Неизвестно",
  },
  {
    label: "Источник",
    key: "is_client",
    format: (v) => order_types_all.find((t) => t.id === Number(v))?.name || "Неизвестно",
  },
  {
    label: "UTM",
    key: "utm",
  },
  {
    label: "Прокод",
    key: "promo_name",
  },
  {
    label: "Позиции",
    key: "items",
    format: (v) =>
      (
        <div style={{ fontSize: ".7rem" }}>
          {v.reduce((acc, item) => `${acc} ${item.name}: ${item.count};`, "")}
        </div>
      ) || "",
    formatRaw: (v) => v.reduce((acc, item) => `${acc} ${item.name}: ${item.count};`, "") || "",
  },

  {
    label: "Сумма",
    key: "summ",
    numeric: true,
    format: (v) => `${v} р.`,
  },
];
