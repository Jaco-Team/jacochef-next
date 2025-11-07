import React, { useEffect, useState } from "react";
import { MyAutocomplite, MyDatePickerNew } from "@/ui/Forms";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import dayjs from "dayjs";
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
import { ModalEditDriversFeedback } from "@/components/admin_feedback_drivers/ModalEditDriversFeedback";

function SettingsPage() {
  const tabsData = {
    birth_promo: "Промокод на день рождения",
    order_adver: "Реклама в заказ",
  };

  const [isLoad, setIsLoad] = useState(false);
  const [module, setModule] = useState({});
  const [dateStart, setDateStart] = useState(null);
  const [dateEnd, setDateEnd] = useState(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [errStatus, setErrStatus] = useState(false);
  const [errText, setErrText] = useState("");
  const [access, setAccess] = useState({});
  const [item, setItem] = useState(0);
  const [data, setData] = useState([]);
  const [openUpdateAder, setOpenUpdateAder] = useState(false);

  useEffect(() => {
    getData("get_all").then((data) => {
      document.title = data.module_info.name;
      setModule(data.module_info);
      setAccess(data.acces);
    });
  }, []);

  const getTable = () => {
    getData("get_data", {
      date_start: dayjs(dateStart).format("YYYY-MM-DD"),
      date_end: dayjs(dateEnd).format("YYYY-MM-DD"),
    }).then((data) => {
      setData(data);
      if (!data.st) {
        setErrStatus(data.st);
        setErrText(data.text);
        setOpenAlert(true);
      }
    });
  };

  const onSave = (id, status, answer) => {
    getData("save_feed", {
      id,
      status,
      answer,
    }).then((data) => {
      if (!data.st) {
        setErrStatus(data.st);
        setErrText(data.text);
        setOpenAlert(true);
      }
      getTable();
    });
  };

  const getData = async (method, data = {}) => {
    setIsLoad(true);

    try {
      const result = await api_laravel("admin_feedback_drivers", method, data);
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
      <Grid
        container
        spacing={3}
        mb={3}
        className="container_first_child"
      >
        <Grid
          container
          spacing={2}
          style={{ marginBottom: 16 }}
        >
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <h1>{module.name}</h1>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 3,
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
              sm: 3,
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
              onClick={() => getTable()}
            >
              Показать отчет
            </Button>
          </Grid>
          {openUpdateAder ? (
            <ModalEditDriversFeedback
              item={item}
              save={onSave}
              open={openUpdateAder}
              onClose={() => setOpenUpdateAder(false)}
            />
          ) : null}
          {data?.length ? (
            <Grid
              style={{ marginBottom: "24px" }}
              size={{
                xs: 12,
              }}
            >
              <Card elevation={3}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell align="center">
                          <b>Кто создал</b>
                        </TableCell>
                        <TableCell align="center">
                          <b>Дата создания</b>
                        </TableCell>
                        <TableCell align="center">
                          <b>Статус</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map((row, index) => (
                        <TableRow
                          key={index}
                          sx={{ cursor: "pointer" }}
                          onClick={() => {
                            setItem(row);
                            setOpenUpdateAder(true);
                          }}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell align="center">{row.user_name}</TableCell>
                          <TableCell align="center">{row.date_time_create}</TableCell>
                          <TableCell align="center">{row.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          ) : null}
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
