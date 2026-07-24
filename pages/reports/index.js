import React, { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import Paper from "@mui/material/Paper";
import TabContext from "@mui/lab/TabContext";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TabPanel from "@mui/lab/TabPanel";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import { formatDate } from "@/src/helpers/ui/formatDate";
import { MyAutocomplite, MyDatePickerNew } from "@/ui/Forms";
import ReportSalesResult from "@/components/reports/ReportSalesResult";
import ReportDishesResult from "@/components/reports/ReportDishesResult";
import dayjs from "dayjs";
import MyAlert from "@/ui/MyAlert";

function getItemCategoryId(item) {
  return item?.cat_id ?? item?.category_id ?? null;
}

function createEmptyForms() {
  return {
    points: [],
    dateStart: null,
    dateEnd: null,
    categories: [],
    positions: [],
  };
}

function FeedbackPage() {
  const [isLoad, setIsLoad] = useState(false);
  const [module, setModule] = useState({});
  const [value, setValue] = useState("things");
  const [openAlert, setOpenAlert] = useState(false);
  const [errStatus, setErrStatus] = useState(false);
  const [errText, setErrText] = useState("");

  const [points, setPoints] = useState([]);
  const [cats, setCats] = useState([]);
  const [pos, setPos] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [forms, setForms] = useState(createEmptyForms);

  const [dishesPoints, setDishesPoints] = useState([]);
  const [dishesCats, setDishesCats] = useState([]);
  const [dishesPos, setDishesPos] = useState([]);
  const [dishesReportData, setDishesReportData] = useState(null);
  const [dishesForms, setDishesForms] = useState(createEmptyForms);
  const [dishesAllLoaded, setDishesAllLoaded] = useState(false);

  const filteredPositions = useMemo(() => {
    if (!forms.categories?.length) {
      return pos;
    }

    const selectedCategoryIds = new Set(forms.categories.map((category) => String(category?.id)));

    return pos.filter((item) => selectedCategoryIds.has(String(getItemCategoryId(item))));
  }, [forms.categories, pos]);

  const filteredDishesPositions = useMemo(() => {
    if (!dishesForms.categories?.length) {
      return dishesPos;
    }

    const selectedCategoryIds = new Set(
      dishesForms.categories.map((category) => String(category?.id)),
    );

    return dishesPos.filter((item) => selectedCategoryIds.has(String(getItemCategoryId(item))));
  }, [dishesForms.categories, dishesPos]);

  const handleChangeForms = (name, nextValue) => {
    setForms((prev) => {
      if (name !== "categories") {
        return {
          ...prev,
          [name]: nextValue,
        };
      }

      const selectedCategoryIds = new Set(
        (nextValue || []).map((category) => String(category?.id)),
      );

      const nextPositions = !selectedCategoryIds.size
        ? prev.positions
        : (prev.positions || []).filter((item) =>
            selectedCategoryIds.has(String(getItemCategoryId(item))),
          );

      return {
        ...prev,
        categories: nextValue,
        positions: nextPositions,
      };
    });
  };

  const handleChangeDishesForms = (name, nextValue) => {
    setDishesForms((prev) => {
      if (name !== "categories") {
        return {
          ...prev,
          [name]: nextValue,
        };
      }

      const selectedCategoryIds = new Set(
        (nextValue || []).map((category) => String(category?.id)),
      );

      const nextPositions = !selectedCategoryIds.size
        ? prev.positions
        : (prev.positions || []).filter((item) =>
            selectedCategoryIds.has(String(getItemCategoryId(item))),
          );

      return {
        ...prev,
        categories: nextValue,
        positions: nextPositions,
      };
    });
  };

  useEffect(() => {
    getData("get_all").then((salesData) => {
      if (!salesData) {
        return;
      }

      setPoints(salesData.points || []);
      setPos(salesData.items || []);
      setCats(salesData.cats || []);
      if (salesData.module_info) {
        document.title = salesData.module_info.name;
        setModule(salesData.module_info);
      }
    });
  }, []);

  useEffect(() => {
    if (value !== "sells" || dishesAllLoaded) {
      return;
    }

    getData("get_all_dishes").then((dishesData) => {
      if (!dishesData) {
        return;
      }

      setDishesPoints(dishesData.points || []);
      setDishesPos(dishesData.items || []);
      setDishesCats(dishesData.cats || []);
      setDishesAllLoaded(true);

      if (!module?.name && dishesData.module_info) {
        document.title = dishesData.module_info.name;
        setModule(dishesData.module_info);
      }
    });
  }, [value, dishesAllLoaded, module?.name]);

  const getDataTable = () => {
    getData("get_data", {
      ...forms,
      dateStart: dayjs(forms.dateStart).format("YYYY-MM-DD"),
      dateEnd: dayjs(forms.dateEnd).format("YYYY-MM-DD"),
    }).then((data) => {
      if (data?.st) {
        setReportData(data);
      } else {
        setReportData(null);
      }
    });
  };

  const getDishesDataTable = () => {
    getData("get_data_dishes", {
      ...dishesForms,
      dateStart: dayjs(dishesForms.dateStart).format("YYYY-MM-DD"),
      dateEnd: dayjs(dishesForms.dateEnd).format("YYYY-MM-DD"),
    }).then((data) => {
      if (data?.st) {
        setDishesReportData(data);
      } else {
        setDishesReportData(null);
      }
    });
  };

  const getCostDetail = async (payload) => {
    const result = await api_laravel_local("reports", "get_cost_detail", payload);
    return result.data;
  };

  const getDishesCostDetail = async (payload) => {
    const result = await api_laravel_local("reports", "get_cost_detail_dishes", payload);
    return result.data;
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getData = async (method, data = {}) => {
    setIsLoad(true);

    try {
      const result = await api_laravel("reports", method, data);
      if (result?.data?.text) {
        setErrStatus(result.data?.st);
        setErrText(result.data?.text);
        setOpenAlert(true);
      }
      return result.data;
    } finally {
      setIsLoad(false);
    }
  };

  const reportFilters = {
    points: forms.points,
    dateStart: forms.dateStart ? dayjs(forms.dateStart).format("YYYY-MM-DD") : null,
    dateEnd: forms.dateEnd ? dayjs(forms.dateEnd).format("YYYY-MM-DD") : null,
  };

  const dishesReportFilters = {
    points: dishesForms.points,
    dateStart: dishesForms.dateStart ? dayjs(dishesForms.dateStart).format("YYYY-MM-DD") : null,
    dateEnd: dishesForms.dateEnd ? dayjs(dishesForms.dateEnd).format("YYYY-MM-DD") : null,
  };

  const filterButtonSx = {
    backgroundColor: "#d50032",
    color: "#fff",
    textTransform: "none",
    fontWeight: 600,
    px: 2.5,
    whiteSpace: "nowrap",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "#b8002b",
      boxShadow: "none",
    },
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
      <MyAlert
        isOpen={openAlert}
        onClose={() => setOpenAlert(false)}
        status={false}
        text={errText}
      />
      <Backdrop
        style={{ zIndex: 99 }}
        open={isLoad}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <h1>{module.name}</h1>
      </Grid>
      <Grid
        style={{ paddingBottom: 24 }}
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #e5e7eb",
            borderRadius: 1.5,
            backgroundColor: "#fff",
          }}
        >
          <TabContext value={value}>
            <Tabs
              value={value}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons={false}
              sx={{
                minHeight: 48,
                px: 1,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: 14,
                  minHeight: 48,
                  color: "#6b7280",
                },
                "& .Mui-selected": {
                  color: "#111827 !important",
                  fontWeight: 600,
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#d50032",
                  height: 3,
                },
              }}
            >
              <Tab
                label={"Продажи товаров"}
                value={"things"}
              />
              <Tab
                label={"Производство и продажи блюд"}
                value={"sells"}
              />
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
          <TabPanel
            value="things"
            sx={{ px: 0 }}
          >
            <Paper
              elevation={0}
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 1.5,
                p: 2,
                mb: 2,
                backgroundColor: "#fff",
              }}
            >
              <Grid
                container
                spacing={2}
                alignItems="flex-end"
              >
                <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                  <CityCafeAutocomplete2
                    label="Кафе"
                    points={points}
                    value={forms.points}
                    onChange={(v) => handleChangeForms("points", v)}
                    withAll
                    withAllSelected
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                  <MyAutocomplite
                    label="Категории"
                    data={cats}
                    multiple={true}
                    value={forms.categories}
                    func={(event, data) => {
                      handleChangeForms("categories", data);
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                  <MyAutocomplite
                    label="Позиции"
                    data={filteredPositions}
                    multiple={true}
                    value={forms.positions}
                    func={(event, data) => {
                      handleChangeForms("positions", data);
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <MyDatePickerNew
                    label="Дата с"
                    value={forms.dateStart}
                    func={(e) => handleChangeForms("dateStart", formatDate(e))}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <MyDatePickerNew
                    label="Дата до"
                    value={forms.dateEnd}
                    func={(e) => handleChangeForms("dateEnd", formatDate(e))}
                  />
                </Grid>
                <Grid
                  size={{ xs: 12, md: 12 }}
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={() => getDataTable()}
                    sx={filterButtonSx}
                  >
                    Построить отчет
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            <ReportSalesResult
              data={reportData}
              filters={reportFilters}
              onFetchCostDetail={getCostDetail}
            />
          </TabPanel>

          <TabPanel
            value="sells"
            sx={{ px: 0 }}
          >
            <Paper
              elevation={0}
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 1.5,
                p: 2,
                mb: 2,
                backgroundColor: "#fff",
              }}
            >
              <Grid
                container
                spacing={2}
                alignItems="flex-end"
              >
                <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                  <CityCafeAutocomplete2
                    label="Кафе"
                    points={dishesPoints}
                    value={dishesForms.points}
                    onChange={(v) => handleChangeDishesForms("points", v)}
                    withAll
                    withAllSelected
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                  <MyAutocomplite
                    label="Категории"
                    data={dishesCats}
                    multiple={true}
                    value={dishesForms.categories}
                    func={(event, data) => {
                      handleChangeDishesForms("categories", data);
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                  <MyAutocomplite
                    label="Позиции"
                    data={filteredDishesPositions}
                    multiple={true}
                    value={dishesForms.positions}
                    func={(event, data) => {
                      handleChangeDishesForms("positions", data);
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <MyDatePickerNew
                    label="Дата с"
                    value={dishesForms.dateStart}
                    func={(e) => handleChangeDishesForms("dateStart", formatDate(e))}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <MyDatePickerNew
                    label="Дата до"
                    value={dishesForms.dateEnd}
                    func={(e) => handleChangeDishesForms("dateEnd", formatDate(e))}
                  />
                </Grid>
                <Grid
                  size={{ xs: 12, md: 12 }}
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={() => getDishesDataTable()}
                    sx={filterButtonSx}
                  >
                    Построить отчет
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            <ReportDishesResult
              data={dishesReportData}
              filters={dishesReportFilters}
              onFetchCostDetail={getDishesCostDetail}
            />
          </TabPanel>
        </TabContext>
      </Grid>
    </Grid>
  );
}

export default function FeedBack() {
  return <FeedbackPage />;
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
