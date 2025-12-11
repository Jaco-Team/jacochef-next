import React, { useEffect, useState } from "react";
import { MyAutocomplite, MyDatePickerNew } from "@/ui/Forms";
// import {api_laravel_local as api_laravel} from "@/src/api_new";
import { api_laravel } from "@/src/api_new";
import dayjs from "dayjs";

import ModalAder from "@/components/settings/ModalAder";
import ModalUpdateAder from "@/components/settings/ModalUpdateAder";
import PromoCodeForm from "@/components/settings/PromoCodeForm";
import {
  Backdrop,
  Button,
  Card,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
} from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import { formatDate } from "@/src/helpers/ui/formatDate";
import MyAlert from "@/ui/MyAlert";

function SettingsPage() {
  const tabsData = {
    birth_promo: "Промокод на день рождения",
    order_adver: "Реклама в заказ",
  };

  const [isLoad, setIsLoad] = useState(false);
  const [value, setValue] = useState("birth_promo");
  const [mockItems, setMockItems] = useState([]);
  const [points, setPoints] = useState([]);
  const [point, setPoint] = useState([]);
  const [module, setModule] = useState({});
  const [dateStart, setDateStart] = useState(null);
  const [dateEnd, setDateEnd] = useState(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [errStatus, setErrStatus] = useState(false);
  const [errText, setErrText] = useState("");
  const [tabs, setTabs] = useState(tabsData);
  const [openAder, setOpenAder] = useState(false);
  const [itemId, setItemId] = useState(0);
  const [openUpdateAder, setOpenUpdateAder] = useState(false);
  const [activeAder, setActiveAder] = useState([]);
  const [disableAder, setDisableAder] = useState([]);
  const [access, setAccess] = useState({});

  useEffect(() => {
    getData("get_all").then((data) => {
      document.title = data.module_info.name;
      setModule(data.module_info);
      setPoints(data.points);
      setMockItems(data.items);
      const tabsCheck = Object.entries(tabsData).filter(
        ([key]) => parseInt(data.acces[key + "_access"]) === 1,
      );
      setAccess(data.acces);
      setTabs(Object.fromEntries(tabsCheck));
    });
  }, []);

  const handleChange = (_, newValue) => {
    setValue(newValue);
  };

  const getAders = () => {
    const data = {
      dateStart: dayjs(dateStart).format("YYYY-MM-DD"),
      dateEnd: dayjs(dateEnd).format("YYYY-MM-DD"),
      points: point,
    };

    getData("get_aders", data).then((data) => {
      if (!data.st) {
        setErrStatus(data.st);
        setErrText(data.text);
        setOpenAlert(true);
      } else {
        setActiveAder(data.activeOrders);
        setDisableAder(data.inactiveOrders);
      }
    });
  };
  const getData = async (method, data = {}) => {
    setIsLoad(true);

    try {
      const result = await api_laravel("settings", method, data);
      return result.data;
    } finally {
      setIsLoad(false);
    }
  };

  return (
    <>
      <Backdrop
        style={{ zIndex: 99 }}
        open={isLoad}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <MyAlert
        isOpen={openAlert}
        onClose={() => setOpenAlert(false)}
        status={errStatus}
        text={errText}
      />
      {openAder ? (
        <ModalAder
          open={openAder}
          onClose={() => setOpenAder(false)}
          getData={getData}
          setIsLoad={setIsLoad}
          setErrStatus={setErrStatus}
          setErrText={setErrText}
          setOpenAlert={setOpenAlert}
        />
      ) : null}
      {openUpdateAder ? (
        <ModalUpdateAder
          open={openUpdateAder}
          onClose={() => setOpenUpdateAder(false)}
          getData={getData}
          id={itemId}
          setIsLoad={setIsLoad}
          setErrStatus={setErrStatus}
          setErrText={setErrText}
          setOpenAlert={setOpenAlert}
        />
      ) : null}
      <Grid
        container
        spacing={3}
        className="container_first_child"
        sx={{
          mb: 3,
        }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 12,
          }}
        >
          <h1>{module.name}</h1>
        </Grid>
        <Grid size={12}>
          <Paper>
            <TabContext value={value}>
              <Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons={false}
              >
                {Object.entries(tabs).map(([key, value]) => (
                  <Tab
                    label={value}
                    value={key}
                    key={key}
                  />
                ))}
              </Tabs>
            </TabContext>
          </Paper>
        </Grid>
        <Grid
          style={{ paddingTop: 0 }}
          size={{
            xs: 12,
            sm: 12,
          }}
        >
          <TabContext value={value}>
            {parseInt(access.birth_promo_access) == 1 && (
              <TabPanel value="birth_promo">
                <PromoCodeForm
                  mockItems={mockItems}
                  getData={getData}
                  setIsLoad={setIsLoad}
                  setErrStatus={setErrStatus}
                  setErrText={setErrText}
                  setOpenAlert={setOpenAlert}
                />
              </TabPanel>
            )}
            {parseInt(access.order_adver_access) == 1 && (
              <TabPanel value="order_adver">
                <Grid
                  container
                  spacing={2}
                  style={{ marginBottom: 16 }}
                >
                  <Grid
                    size={{
                      xs: 12,
                      sm: 3,
                    }}
                  >
                    <MyAutocomplite
                      label="Точки"
                      data={points}
                      multiple={true}
                      value={point}
                      func={(event, data) => {
                        setPoint(data);
                      }}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <MyDatePickerNew
                      label="Дата начала"
                      value={dateStart}
                      func={(e) => setDateStart(formatDate(e))}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <MyDatePickerNew
                      label="Дата окончания"
                      value={dateEnd}
                      func={(e) => setDateEnd(formatDate(e))}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 3,
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => getAders()}
                    >
                      Показать отчет
                    </Button>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setOpenAder(true)}
                    >
                      Добавить рекламу
                    </Button>
                  </Grid>
                </Grid>
                {activeAder.length ? (
                  <Grid
                    style={{ marginBottom: "24px" }}
                    size={{
                      xs: 12,
                    }}
                  >
                    <Card elevation={3}>
                      <CardHeader
                        title="Активные"
                        slotProps={{
                          title: { variant: "h6", fontWeight: "bold" },
                        }}
                      />
                      <Divider />
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>#</TableCell>
                              <TableCell align="left">
                                <b>Название</b>
                              </TableCell>
                              <TableCell align="center">
                                <b>Дата начала</b>
                              </TableCell>
                              <TableCell align="center">
                                <b>Дата окончания</b>
                              </TableCell>
                              <TableCell align="center">
                                <b>Где активно</b>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {activeAder.map((row, index) => (
                              <TableRow
                                key={index}
                                sx={{ cursor: "pointer" }}
                                onClick={() => {
                                  setItemId(row.id);
                                  setOpenUpdateAder(true);
                                }}
                              >
                                <TableCell>{index + 1}</TableCell>
                                <TableCell align="left">{row.name}</TableCell>
                                <TableCell align="center">{row.date_start}</TableCell>
                                <TableCell align="center">{row.date_end}</TableCell>
                                <TableCell align="center">{row.where_active}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Card>
                  </Grid>
                ) : null}

                {disableAder.length ? (
                  <Grid
                    style={{ marginBottom: "24px" }}
                    size={{
                      xs: 12,
                    }}
                  >
                    <Card elevation={3}>
                      <CardHeader
                        title="Не активные"
                        slotProps={{
                          title: { variant: "h6", fontWeight: "bold" },
                        }}
                      />
                      <Divider />
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>#</TableCell>
                              <TableCell align="left">
                                <b>Название</b>
                              </TableCell>
                              <TableCell align="center">
                                <b>Дата начала</b>
                              </TableCell>
                              <TableCell align="center">
                                <b>Дата окончания</b>
                              </TableCell>
                              <TableCell align="center">
                                <b>Где активно</b>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {disableAder.map((row, index) => (
                              <TableRow
                                key={index}
                                sx={{ cursor: "pointer" }}
                                onClick={() => {
                                  setItemId(row.id);
                                  setOpenUpdateAder(true);
                                }}
                              >
                                <TableCell>{index + 1}</TableCell>
                                <TableCell align="left">{row.name}</TableCell>
                                <TableCell align="center">{row.date_start}</TableCell>
                                <TableCell align="center">{row.date_end}</TableCell>
                                <TableCell align="center">{row.where_active}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Card>
                  </Grid>
                ) : null}
              </TabPanel>
            )}
          </TabContext>
        </Grid>
      </Grid>
    </>
  );
}

export default function Settings() {
  return <SettingsPage />;
}

export async function getServerSideProps({ res }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");

  return {
    props: {},
  };
}
