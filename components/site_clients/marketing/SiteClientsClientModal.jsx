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
import { MySelect, MyTextInput } from "@/ui/elements";
import dayjs from "dayjs";
import ExcelIcon from "@/ui/ExcelIcon";
import useXLSExport from "@/src/hooks/useXLSXExport";

dayjs.locale("ru");

function SiteClientsClientModal({ canAccess, showAlert, openOrder }) {
  const {
    clientLogin,
    clientModalOpened,
    setClientModalOpened,
    setClientInfoProp,
    setClientBd,
    setClientHistory,
  } = useMarketingClientStore();

  const [confirmDialog, setConfirmDialog] = useState(false);

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
      throw error;
    }
  };

  const sendCode = async () => {
    const { client, setClientLoginSms } = useMarketingClientStore.getState();
    try {
      const number = client.client_info.login;
      const user_id = client.client_info.id;

      const data = {
        number,
        user_id,
      };

      const res = await getData("get_code", data);

      if (res?.st) {
        showAlert(res.text || "Success", true);
        setClientLoginSms(res.client_login_sms);
      } else {
        throw new Error(res?.text || "Ошибка отправки кода");
      }
    } catch (e) {
      showAlert(e.message);
    }
  };

  const saveEdit = async () => {
    const { client, clientLogin } = useMarketingClientStore.getState();
    const clientInfo = client?.client_info;

    const [day, month] = clientInfo?.date_bir?.split("-")?.map(Number)?.slice(1) || [null, null];

    if (!day || !month || day > 31 || month > 12) {
      showAlert("Необходимо указать полную дату рождения, либо сбросить", false);
      return;
    }

    const data = {
      mail: clientInfo?.mail,
      login: clientLogin,
      date_bir: clientInfo?.date_bir,
    };

    try {
      // const res = await getData("save_edit_client", data);
      const res = null;
      if (!res?.st) {
        throw new Error(res?.text || "Error");
      }
      showAlert(res.text, res.st);
    } catch (error) {
      showAlert(`Error saving client data: ${error.message}`, false);
    }
  };

  const getClient = async () => {
    const { clientLogin, setClient, setClientLoading } = useMarketingClientStore.getState();
    try {
      setClientLoading(true);
      setClient(null);
      const res = await getData("get_one_client", { login: clientLogin });
      if (!res?.st) {
        throw new Error("Ошибка загрузки данных клиента");
      }
      // console.log(useMarketingClientStore.getState());
      setClient(res);
    } catch (error) {
      showAlert(`Error fetching client data: ${error.message}`, false);
    } finally {
      setClientLoading(false);
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
        sx={{
          "& .MuiDialog-paper": {
            width: "80%",
            maxHeight: 435,
          },
        }}
        maxWidth="sm"
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
      >
        <DialogTitle>Подтвердите действие</DialogTitle>
        <DialogContent
          align="center"
          sx={{ fontWeight: "bold" }}
        >
          <Typography>Точно выслать новый код ?</Typography>
          <Typography style={{ color: "#dd1a32" }}>Важно: код действуют 15 минут</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={() => setConfirmDialog(false)}
          >
            Отмена
          </Button>
          <Button onClick={sendCode}>Ok</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={clientModalOpened}
        onClose={() => setClientModalOpened(false)}
        fullScreen={fullScreen} // TODO: wire full screen mode
        fullWidth={true}
        maxWidth={"xl"}
      >
        <DialogTitle className="button">
          <Grid
            container
            spacing={1}
          >
            <Grid
              item
              xs={12}
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
                  <Typography variant="body2">Источник:</Typography>
                  <Typography variant="body1">{clientInfo?.source ?? "Не указан"}</Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={3}
                >
                  <Typography variant="body2">Сумма заказов:</Typography>
                  <Typography variant="h5">
                    {clientInfo.summ ?? 0} {"\u20bd"}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </DialogTitle>
        {clientLoading ? (
          <CircularProgress />
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
                  <Tab
                    label="Обращения"
                    {...a11yProps(4)}
                  />
                  <Tab
                    label="Авторизации"
                    {...a11yProps(5)}
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
                    sm={12}
                    style={{ display: "flex" }}
                    mb={3}
                  >
                    <Typography style={{ fontWeight: "bold" }}>Имя: &nbsp;</Typography>
                    <Typography>{clientInfo?.name || "Не указано"}</Typography>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={12}
                    style={{ display: "flex" }}
                    mb={3}
                  >
                    <Typography style={{ fontWeight: "bold" }}>Телефон: &nbsp;</Typography>
                    <Typography>
                      {clientLogin ? <a href={`tel:${clientLogin}`}>{clientLogin}</a> : "Не указан"}
                    </Typography>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={12}
                    mb={3}
                    className="mail_box"
                  >
                    <Typography style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                      Эл почта:
                    </Typography>
                    <MyTextInput
                      label="Электронная @ почта"
                      func={(val) => setClientInfoProp("mail", val)}
                      value={clientInfo?.mail ?? ""}
                      type="email"
                      disabled={!canAccess("edit_mail")}
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={12}
                    style={{ display: "flex" }}
                    mb={3}
                  >
                    <Typography style={{ fontWeight: "bold" }}>Регистрация: &nbsp;</Typography>
                    <Typography>{clientInfo?.date_reg ?? "Не указана"}</Typography>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={12}
                    mb={3}
                    className="select_box"
                  >
                    <Typography style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                      Дата рождения:
                    </Typography>
                    <MySelect
                      data={days}
                      value={+clientInfo?.date_bir?.split("-")[2] ?? ""}
                      disabled={!canAccess("edit_bir")}
                      func={(e) => {
                        setClientBd("day", e.target?.value);
                      }}
                      label="День"
                    />
                    <MySelect
                      data={months}
                      value={+clientInfo?.date_bir?.split("-")[1] ?? ""}
                      disabled={!canAccess("edit_bir")}
                      func={(e) => setClientBd("month", e.target?.value)}
                      label="Месяц"
                    />
                    <Button
                      variant="contained"
                      onClick={() => setClientBd(null)}
                    >
                      Сбросить
                    </Button>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={12}
                    style={{ display: "flex" }}
                    mb={3}
                  >
                    <Typography style={{ fontWeight: "bold" }}>Заказов: &nbsp;</Typography>
                    <Typography>
                      {`${clientInfo?.all_count_order} / ${clientInfo?.summ} р.`}
                    </Typography>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={12}
                    style={{ display: "flex" }}
                    mb={3}
                  >
                    <Typography style={{ fontWeight: "bold" }}>Доставок: &nbsp;</Typography>
                    <Typography>{`${clientInfo?.count_dev} / ${clientInfo?.summ_dev} р.`}</Typography>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={12}
                    style={{ display: "flex" }}
                    mb={3}
                  >
                    <Typography style={{ fontWeight: "bold" }}>Самовывозов: &nbsp;</Typography>
                    <Typography>{`${clientInfo?.count_pic} / ${clientInfo?.summ_pic} р.`}</Typography>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={12}
                  >
                    {!canAccess("edit_bir") && !canAccess("edit_mail") ? null : (
                      <Button
                        variant="contained"
                        color="success"
                        onClick={saveEdit}
                      >
                        Сохранить
                      </Button>
                    )}
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
                    style={{ cursor: "pointer", padding: 20 }}
                    onClick={() =>
                      exportXLSX(client?.history, historyColumns, "history-stats.xlsx")
                    }
                    title="Экспортировать в Excel"
                  >
                    <ExcelIcon />
                  </IconButton>
                </Box>
                <TableContainer style={{ maxHeight: "60dvh", position: "relative" }}>
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
                          <TableCell> n/a </TableCell>
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

            {/* Обращения */}
            {canAccess("view_comment") && (
              <Grid
                item
                xs={12}
                sm={12}
              >
                <TabPanel
                  value={activeTab}
                  index={4}
                  id="client"
                >
                  {client?.client_comments?.length > 0 && (
                    <Accordion style={{ marginBottom: 24 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography style={{ fontWeight: "bold" }}>Оформленные ошибки</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {client.client_comments.map((item, key) => (
                          <Paper
                            key={key}
                            style={{ padding: 15, marginBottom: 15 }}
                            elevation={3}
                          >
                            <b>{item?.description ? "Обращение:" : "Комментарий:"}</b>

                            {/* TODO: rehab this markup */}
                            <span dangerouslySetInnerHTML={{ __html: item.comment }} />

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                              }}
                            >
                              <div>
                                <span style={{ marginRight: 20 }}>{item.date_add}</span>
                                <span>{item.name}</span>
                              </div>
                            </div>

                            <hr />

                            <b>{item?.description ? "Действие:" : null}</b>

                            <p dangerouslySetInnerHTML={{ __html: item?.description }} />

                            <p>
                              <b>
                                {parseInt(item.raiting) > 0
                                  ? parseInt(item.raiting) === 1
                                    ? "Положительный отзыв"
                                    : parseInt(item.raiting) === 2
                                    ? "Средний отзыв"
                                    : "Отрицательный отзыв"
                                  : ""}
                              </b>
                              {(parseInt(item.raiting) > 0) & (parseInt(item.sale) > 0)
                                ? " / "
                                : ""}
                              <b>
                                {parseInt(item.sale) > 0
                                  ? "Выписана скидка " + item.sale + "%"
                                  : ""}
                              </b>
                            </p>

                            <div
                              style={{
                                display: "flex",
                                justifyContent: item?.description ? "flex-end" : "space-between",
                                alignItems: "center",
                              }}
                            >
                              {/* {item?.description ? null :
                                <>
                                  <Button color="primary" variant="contained" onClick={ openSaveAction.bind(this, item.id)}>Действие</Button>
                                </>
                              } */}
                              <div>
                                <span style={{ marginRight: 20 }}>{item.date_time}</span>
                                <span>{item.name_close}</span>
                              </div>
                            </div>
                          </Paper>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {/* <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography style={{ fontWeight: 'bold' }}>Новое обращение</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid item xs={12} sm={12} mb={3}>
                        <TextEditor22 id="EditorNew" value={''} refs_={this.myRef} toolbar={true} menubar={true} />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        {!parseInt(acces?.edit) ? null :
                          <Button variant="contained"  onClick={this.saveComment.bind(this)}>
                            Добавить новый комментарий
                          </Button>
                        }
                      </Grid>
                    </AccordionDetails>
                  </Accordion> */}
                </TabPanel>
              </Grid>
            )}
            {/* /Обращения */}

            {/* Авторизации */}
            {canAccess("view_auth") && (
              <Grid
                item
                xs={12}
                sm={12}
              >
                <TabPanel
                  value={activeTab}
                  index={5}
                  id="client"
                >
                  {canAccess("send_code") && (
                    <Grid
                      item
                      xs={12}
                      sm={12}
                    >
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => setConfirmDialog(true)}
                      >
                        Выслать новый код
                      </Button>
                    </Grid>
                  )}

                  <Grid className="client_auth">
                    {client?.client_login_sms?.length > 0 && (
                      <TableContainer
                        sx={{
                          maxHeight: { xs: "none", sm: 607 },
                          width: "48%",
                          height: "max-content",
                        }}
                        component={Paper}
                      >
                        <Table
                          size="small"
                          stickyHeader
                        >
                          <TableHead>
                            <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                              <TableCell colSpan={3}>Авторизации по смс</TableCell>
                            </TableRow>
                            <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                              <TableCell style={{ width: "15%" }}>#</TableCell>
                              <TableCell>Дата и время авторизации</TableCell>
                              <TableCell>Код для авторизации</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {client.client_login_sms.map((item, key) => (
                              <TableRow
                                hover
                                key={key}
                              >
                                <TableCell>{key + 1}</TableCell>
                                <TableCell>{item.date_time}</TableCell>
                                <TableCell>{item.code}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}

                    {client?.client_login_yandex?.length > 0 && (
                      <TableContainer
                        sx={{
                          maxHeight: {
                            xs: "none",
                            sm: 607,
                            width: "48%",
                            height: "max-content",
                          },
                        }}
                        component={Paper}
                      >
                        <Table
                          size="small"
                          stickyHeader
                        >
                          <TableHead>
                            <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                              <TableCell colSpan={2}>Авторизации через Яндекс</TableCell>
                            </TableRow>
                            <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                              <TableCell style={{ width: "15%" }}>#</TableCell>
                              <TableCell>Дата и время авторизации</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {client.client_login_yandex.map((item, key) => (
                              <TableRow
                                hover
                                key={key}
                              >
                                <TableCell>{key + 1}</TableCell>
                                <TableCell>{item.date_time}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Grid>
                </TabPanel>
              </Grid>
            )}
            {/* /Авторизации */}
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

const days = Array.from({ length: 31 }, (_, i) => ({ id: i + 1, name: i + 1 }));
const months = [
  { id: 1, name: "января" },
  { id: 2, name: "февраля" },
  { id: 3, name: "марта" },
  { id: 4, name: "апреля" },
  { id: 5, name: "мая" },
  { id: 6, name: "июня" },
  { id: 7, name: "июля" },
  { id: 8, name: "августа" },
  { id: 9, name: "сентября" },
  { id: 10, name: "октября" },
  { id: 11, name: "ноября" },
  { id: 12, name: "декабря" },
];

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
