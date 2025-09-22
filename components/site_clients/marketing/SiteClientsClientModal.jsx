"use client";

import { memo, useEffect, useState } from "react";
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
import { Close } from "@mui/icons-material";
import a11yProps from "@/components/shared/TabPanel/a11yProps";
import TabPanel from "@/components/shared/TabPanel/TabPanel";
import useMarketingClientStore from "./useMarketingClientStore";
import { useDebounce } from "@/src/hooks/useDebounce";
import dayjs from "dayjs";
import ExcelIcon from "@/ui/ExcelIcon";
import useXLSExport from "@/src/hooks/useXLSXExport";
import formatPrice from "@/src/helpers/ui/formatPrice";
import vocabulary from "./vocabulary";
import { useLoading } from "./useClientsLoadingContext";

dayjs.locale("ru");

function SiteClientsClientModal({ canAccess, showAlert, openOrder }) {
  const { clientLogin, clientModalOpened, setClientModalOpened, setClientHistory } =
    useMarketingClientStore();

  // global isLoading
  const { isLoading, setIsLoading } = useLoading();

  const exportXLSX = useXLSExport();

  // sorting
  const [sortBy, setSortBy] = useState("event_date"); // by historyColumns.key
  const [sortDir, setSortDir] = useState("asc");
  const sortHistory = (data, sortBy, sortDir) => {
    return data.slice().sort((a, b) => {
      const valA = (a[sortBy] || "").toString().toLowerCase();
      const valB = (b[sortBy] || "").toString().toLowerCase();
      if (valA === valB) return 0;
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      return sortDir === "asc" ? 1 : -1;
    });
  };

  function handleSortClick(columnKey) {
    const isAsc = sortBy === columnKey && sortDir === "asc";
    const newOrder = isAsc ? "desc" : "asc";

    setSortBy(columnKey);
    setSortDir(newOrder);

    const sorted = sortHistory(client.history, columnKey, newOrder);
    setClientHistory(sorted);
  }

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
    const { clientLogin, setClient, setClientLoading } = useMarketingClientStore.getState();
    try {
      setClientLoading(true);
      setIsLoading(true);
      setClient(null);
      const res = await getData("get_one_client", { login: clientLogin });
      if (!res?.st) {
        throw new Error(res?.text || "Ошибка загрузки данных клиента");
      }
      // console.log(useMarketingClientStore.getState());
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

  // rendering subscriptions
  const client = useMarketingClientStore((state) => state.client);
  const clientInfo = useMarketingClientStore((state) => state.client?.client_info);
  const clientLoading = useMarketingClientStore((state) => state.clientLoading);

  return (
    <>
      <Dialog
        open={clientModalOpened}
        onClose={() => setClientModalOpened(false)}
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
              item
              xs={12}
              mb={2}
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
                  item
                  xs={12}
                  sm={3}
                >
                  <Typography variant="body2">Имя:</Typography>
                  <Typography variant="h5">{clientInfo?.name ?? "Не указано"}</Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={3}
                >
                  <Typography variant="body2">Зарегистрировался:</Typography>
                  <Typography variant="body1">
                    {dayjs(clientInfo?.date_reg)?.format("DD MMMM YYYY в HH:mm") ?? "Неизвестно"}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={3}
                >
                  <Typography variant="body2">Источник (первого заказа):</Typography>
                  <Typography variant="body1">
                    {clientInfo?.source || clientInfo?.medium
                      ? `${vocabulary(clientInfo?.source || "n/a")}: ${vocabulary(
                          clientInfo?.medium || "n/a"
                        )}`
                      : "Не указан"}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={3}
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
              item
              xs={12}
              sm={12}
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
                    label="История"
                    {...a11yProps(1)}
                  />
                  <Tab
                    label="Заказы"
                    {...a11yProps(2)}
                  />
                  <Tab
                    label="Оформленные ошибки"
                    {...a11yProps(3)}
                  />
                </Tabs>
              </Paper>
            </Grid>

            {/* О клиенте */}
            <Grid
              item
              xs={12}
              sm={12}
            >
              <TabPanel
                value={activeTab}
                index={0}
                id="client"
              >
                <Paper style={{ padding: 24 }}>
                  <Grid
                    item
                    xs={12}
                    style={{ display: "flex" }}
                    mb={3}
                  >
                    <Typography style={{ fontWeight: "bold", paddingRight: 10 }}>Имя:</Typography>
                    <Typography>{clientInfo?.name || "Не указано"}</Typography>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    style={{ display: "flex" }}
                    mb={3}
                  >
                    <Typography style={{ fontWeight: "bold", paddingRight: 10 }}>
                      Телефон:
                    </Typography>
                    <Typography>
                      {clientLogin ? <a href={`tel:${clientLogin}`}>{clientLogin}</a> : "Не указан"}
                    </Typography>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    mb={3}
                    className="mail_box"
                  >
                    <Typography
                      style={{ fontWeight: "bold", paddingRight: 10, whiteSpace: "nowrap" }}
                    >
                      Эл почта:
                    </Typography>
                    <Typography>{clientInfo?.mail ?? "Не указана"}</Typography>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    style={{ display: "flex" }}
                    mb={3}
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
                    item
                    xs={12}
                    mb={3}
                    className="select_box"
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
                    item
                    xs={12}
                    style={{ display: "flex" }}
                    mb={3}
                  >
                    <Typography style={{ fontWeight: "bold", paddingRight: 10 }}>
                      Заказов:
                    </Typography>
                    <Typography>
                      {`${clientInfo?.all_count_order} / ${formatPrice(clientInfo?.summ, true)}`}
                    </Typography>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    style={{ display: "flex" }}
                    mb={3}
                  >
                    <Typography style={{ fontWeight: "bold", paddingRight: 10 }}>
                      Доставок:
                    </Typography>
                    <Typography>{`${clientInfo?.count_dev} / ${formatPrice(
                      clientInfo?.summ_dev,
                      true
                    )}`}</Typography>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    style={{ display: "flex" }}
                    mb={3}
                  >
                    <Typography style={{ fontWeight: "bold", paddingRight: 10 }}>
                      Самовывозов:
                    </Typography>
                    <Typography>{`${clientInfo?.count_pic} / ${formatPrice(
                      clientInfo?.summ_pic,
                      true
                    )}`}</Typography>
                  </Grid>
                </Paper>
              </TabPanel>
            </Grid>
            {/* /О клиенте */}

            {/* История */}
            <Grid
              item
              xs={12}
              sm={12}
            >
              <TabPanel
                value={activeTab}
                index={1}
                id="history"
              >
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <IconButton
                    style={{ cursor: "pointer", padding: 10 }}
                    onClick={() =>
                      exportXLSX(client?.history, historyColumns, "history-stats.xlsx")
                    }
                    title="Экспортировать в Excel"
                  >
                    <ExcelIcon />
                  </IconButton>
                </Box>
                <TableContainer style={{ maxHeight: "55dvh", position: "relative" }}>
                  <Table
                    size="small"
                    stickyHeader
                  >
                    <TableHead>
                      <TableRow>
                        {historyColumns.map((col) => (
                          <TableCell key={col.key}>
                            <TableSortLabel
                              active={sortBy === col.key}
                              direction={sortBy === col.key ? sortDir : "asc"}
                              onClick={() => handleSortClick(col.key)}
                            >
                              {col.label}
                            </TableSortLabel>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {client?.history?.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{row.event_date}</TableCell>
                          <TableCell>
                            {row.event === "order" ? (
                              <>
                                <Button
                                  variant="text"
                                  onClick={() => openOrder(row.point_id, row.order_id)}
                                >
                                  Заказ #{row.order_id}
                                  <br />
                                </Button>
                                <Typography
                                  variant="body2"
                                  sx={{ marginLeft: 1 }}
                                >
                                  ({row.type_order === 1 ? "Доставка" : "Самовывоз"})
                                </Typography>
                              </>
                            ) : (
                              row.event
                            )}
                          </TableCell>
                          <TableCell>
                            {" "}
                            {row.source || row.medium
                              ? `${vocabulary(row.source || "n/a")}: ${vocabulary(
                                  row.medium || "n/a"
                                )}`
                              : "n/a"}{" "}
                          </TableCell>
                          <TableCell>
                            {row.details ? (
                              <Box sx={{ display: "flex", flexDirection: "column" }}>
                                {row.details.split("\n").map((line, i) => (
                                  <Typography
                                    key={i}
                                    variant="body2"
                                  >
                                    {line}
                                  </Typography>
                                ))}
                              </Box>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </Grid>
            {/* /История */}

            {/* Заказы */}
            {canAccess("view_orders") && (
              <Grid
                item
                xs={12}
                sm={12}
              >
                <TabPanel
                  value={activeTab}
                  index={2}
                  id="client"
                >
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
                          <TableCell style={{ width: "5%" }}>#</TableCell>
                          <TableCell style={{ width: "20%" }}>Точка</TableCell>
                          <TableCell style={{ width: "20%" }}>Тип заказа</TableCell>
                          <TableCell style={{ width: "20%" }}>Дата заказа</TableCell>
                          <TableCell style={{ width: "15%" }}>ID заказа</TableCell>
                          <TableCell style={{ width: "20%" }}>Сумма заказа</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {client?.client_orders?.map((item, key) => (
                          <TableRow
                            hover
                            key={key}
                            onClick={() => openOrder(item.point_id, item.order_id)}
                            style={{
                              cursor: "pointer",
                              backgroundColor: parseInt(item.is_delete) ? "rgb(204, 0, 51)" : null,
                            }}
                            sx={{ "& td": { color: parseInt(item.is_delete) ? "#fff" : "#000" } }}
                          >
                            <TableCell>{key + 1}</TableCell>
                            <TableCell>{item.point}</TableCell>
                            <TableCell>{item.new_type_order}</TableCell>
                            <TableCell>{item.date_time}</TableCell>
                            <TableCell>{`#${item.order_id}`}</TableCell>
                            <TableCell>{`${item.summ} р.`}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TabPanel>
              </Grid>
            )}
            {/* /Заказы */}

            {/* Оформленные ошибки */}
            {canAccess("view_err") && (
              <Grid
                item
                xs={12}
                sm={12}
              >
                <TabPanel
                  value={activeTab}
                  index={3}
                  id="client"
                >
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
                          <TableCell style={{ width: "5%" }}>#</TableCell>
                          <TableCell style={{ width: "15%" }}>Точка</TableCell>
                          <TableCell style={{ width: "10%" }}>ID заказа</TableCell>
                          <TableCell style={{ width: "20%" }}>Дата</TableCell>
                          <TableCell style={{ width: "25%" }}>Описание</TableCell>
                          <TableCell style={{ width: "25%" }}>Действия</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {client?.err_orders?.map((item, key) => (
                          <TableRow
                            hover
                            key={key}
                          >
                            <TableCell>{key + 1}</TableCell>
                            <TableCell>{item.point}</TableCell>
                            <TableCell>{`#${item.order_id}`}</TableCell>
                            <TableCell>{item.date_time_desc}</TableCell>
                            <TableCell>{item.order_desc}</TableCell>
                            <TableCell>{item.text_win}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TabPanel>
              </Grid>
            )}
            {/* /Оформленные ошибки */}
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

export default memo(SiteClientsClientModal);

const historyColumns = [
  { label: "Дата", key: "event_date" },
  {
    label: "Событие",
    key: "event",
    format: (row) => {
      return row.event === "order"
        ? `#${row.order_id} (${row.type_order === 1 ? "Доставка" : 2 ? "Самовывоз" : "Зал"})`
        : row.event;
    },
  },
  { label: "Источник", key: "source" },
  { label: "Детали", key: "details" },
];
