import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import {
  MyAutocomplite,
  MyCheckBox,
  MyDatePicker,
  MyDatePickerNew,
  MySelect,
  MyTextInput,
} from "@/ui/Forms";
import Button from "@mui/material/Button";
import Cookies from "js-cookie";
import MyAlert from "@/ui/MyAlert";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import dayjs from "dayjs";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import AccordionDetails from "@mui/material/AccordionDetails";
import TableContainer from "@mui/material/TableContainer";
import Accordion from "@mui/material/Accordion";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import { Close, QueryStats } from "@mui/icons-material";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import PriceChart from "@/components/stat_cost_goods/PriceChart";
import TabContext from "@mui/lab/TabContext";
import Box from "@mui/material/Box";
import TabList from "@mui/lab/TabList";
import Tab from "@mui/material/Tab";
import TabPanel from "@mui/lab/TabPanel";
import CloseIcon from "@mui/icons-material/Close";
import DehazeIcon from "@mui/icons-material/Dehaze";
import AddIcon from "@mui/icons-material/Add";
import PercentChangeChart from "@/components/stat_cost_goods/PercentChangeChart";

const ModalGraph = ({ open, onClose, data, title = "Графики" }) => {
  const [tab, setTab] = useState("1");
  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "100%" } }}
      maxWidth="xl"
      open={open}
      onClose={onClose}
    >
      <DialogTitle className="button">
        {title}
        <IconButton
          onClick={onClose}
          style={{ cursor: "pointer" }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent
        align="center"
        sx={{ fontWeight: "bold" }}
        style={{ paddingBottom: 10, paddingTop: 10 }}
      >
        <Grid
          size={{
            xs: 12,
          }}
        >
          <TabContext value={tab}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                onChange={(event, value) => setTab(value)}
                variant="fullWidth"
              >
                <Tab
                  label="График цены за единицу"
                  value="1"
                />
                <Tab
                  label="График процентного изменения цены"
                  value="2"
                />
              </TabList>
              <TabPanel value="1">
                <PriceChart data={data} />
              </TabPanel>
              <TabPanel value="2">
                <PercentChangeChart data={data} />
              </TabPanel>
            </Box>
          </TabContext>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={onClose}
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};
function LkPage() {
  const [isLoad, setIsLoad] = useState(false);
  const [module, setModule] = useState({});
  const [point, setPoint] = useState([]);
  const [points, setPoints] = useState([]);
  const [openAlert, setOpenAlert] = useState(false);
  const [errStatus, setErrStatus] = useState(false);
  const [errText, setErrText] = useState("");
  const [dateStart, setDateStart] = useState(dayjs().startOf("month"));
  const [dateEnd, setDateEnd] = useState(dayjs().endOf("month"));
  const [goods, setGoods] = useState([]);
  const [good, setGood] = useState([]);
  const [data, setData] = useState([]);
  const [modalGraph, setModalGraph] = useState(false);
  const [dataGraph, setDataGraph] = useState({});

  useEffect(() => {
    getData("get_all").then((data) => {
      document.title = data.module_info.name;
      setModule(data.module_info);
      setPoints(data.points);
      setPoint(data.point);
      setGoods(data.goods);
    });
  }, []);

  const save = (auth_code) => {
    getData("save_acc", { auth_code }).then((data) => {
      if (data.st) {
        setData(data.items);
      } else {
        showAlert(data.st, data.text);
      }
    });
  };

  const get_data = () => {
    getData("get_data", {
      point,
      good,
      date_start: dayjs(dateStart).format("YYYY-MM-DD"),
      date_end: dayjs(dateEnd).format("YYYY-MM-DD"),
    }).then((data) => {
      if (data.st) {
        showAlert(data.st, data.text);
        setData(data.items);
      } else {
        setData([]);
        showAlert(data.st, data.text);
      }
    });
  };

  const getData = async (method, data = {}) => {
    setIsLoad(true);

    try {
      const result = await api_laravel("stat_cost_goods", method, data);
      return result.data;
    } finally {
      setIsLoad(false);
    }
  };

  const showAlert = (status, message) => {
    setErrStatus(status);
    setErrText(message);
    setOpenAlert(true);
  };

  const openModalGrap = (data) => {
    console.log(data);
    setDataGraph(data);
    setModalGraph(true);
  };

  return (
    <Grid
      container
      spacing={3}
      className="container_first_child"
      size={{
        xs: 12,
        sm: 12,
      }}
      sx={{
        mb: 3,
      }}
    >
      <Backdrop
        style={{ zIndex: 99 }}
        open={isLoad}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {modalGraph ? (
        <ModalGraph
          open={modalGraph}
          onClose={() => setModalGraph(false)}
          data={dataGraph}
        />
      ) : null}
      <MyAlert
        isOpen={openAlert}
        onClose={() => setOpenAlert(false)}
        status={errStatus}
        text={errText}
      />
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
          sm: 6,
        }}
      >
        <CityCafeAutocomplete2
          label="Кафе"
          points={points}
          value={point}
          onChange={(v) => {
            setPoint(v);
          }}
          withAll
          withAllSelected
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 3,
        }}
      >
        <MyDatePickerNew
          label="Дата от"
          value={dateStart}
          func={(e) => setDateStart(e)}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 3,
        }}
      >
        <MyDatePickerNew
          label="Дата до"
          value={dateEnd}
          func={(e) => setDateEnd(e)}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 3,
        }}
      >
        <MyAutocomplite
          label="Товары"
          value={good}
          multiple={true}
          data={goods}
          func={(e, value) => setGood(value)}
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
          onClick={get_data}
        >
          Получить данные
        </Button>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        {data.length ? (
          <>
            {data.map((it, k) => (
              <Accordion key={k}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{it.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {it.data.map((it2, k2) => (
                    <TableContainer>
                      <Table style={{ border: "1px solid #e0e0e0", marginBottom: "24px" }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell
                              sx={{
                                borderLeft: "none",
                                minWidth: 250,
                                width: 250,
                              }}
                            >
                              Товар
                            </TableCell>
                            {it2.data.map((it3) => (
                              <TableCell
                                sx={{
                                  textAlign: "center",
                                  borderLeft: "none",
                                  minWidth: 100,
                                  width: 400,
                                }}
                              >
                                {it3.date_create}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableCell>{k2 + 1}</TableCell>
                          <TableCell
                            sx={{
                              borderLeft: "none",
                              minWidth: 250,
                              width: 250,
                            }}
                          >
                            {it2.name}{" "}
                            <IconButton onClick={() => openModalGrap(it2.data)}>
                              <QueryStats />
                            </IconButton>
                          </TableCell>
                          {it2.data.map((it3, k) => (
                            <TableCell
                              sx={{
                                borderLeft: "none",
                                minWidth: 100,
                                width: 400,
                                backgroundColor:
                                  it2.data[k - 1]?.percent > 0
                                    ? "#BDECB6"
                                    : it2.data[k - 1]?.percent !== 0 &&
                                        it2.data[k - 1]?.percent !== undefined
                                      ? "#CD5C5C"
                                      : "#fbf3f3",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                {it2.data[k - 1]?.percent ? (
                                  <h5
                                    style={{
                                      backgroundColor: "white",
                                      fontColor: "bold",
                                      padding: "4px",
                                      textAlign: "center",
                                      borderRadius: "12px",
                                      marginBottom: "8px !important",
                                    }}
                                  >
                                    {it2.data[k - 1]?.percent > 0
                                      ? `↓ ${Math.abs(it2.data[k - 1]?.percent)}%`
                                      : `↑ ${Math.abs(it2.data[k - 1]?.percent)}%`}
                                  </h5>
                                ) : null}
                                <h3>{it3.one_price}</h3>
                              </div>
                            </TableCell>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </>
        ) : null}
      </Grid>
    </Grid>
  );
}

export default function FeedBack() {
  return <LkPage />;
}

export async function getServerSideProps({ req, res, query }) {
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
