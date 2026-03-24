"use client";

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import ErrCats from "@/components/option_to_win/ErrCats";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  styled,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import { MyCheckBox, MyDatePickerNew } from "@/ui/Forms";
import { ModalProblems } from "@/components/errors_management/ModalProblems";
import dayjs from "dayjs";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CatsModal from "@/components/option_to_win/CatsModal";

const moduleName = "errors_management";

const DEFAULT_ORDER_TYPES = [
  { id: 0, name: "Любой" },
  { id: 1, name: "Доставка" },
  { id: 2, name: "Самовывоз" },
  { id: 3, name: "Зал" },
];

const INITIAL_FILTERS = {
  cityId: "",
  pointId: "",
  orderType: 0,
  orderNumber: "",
  amountFrom: "",
  amountTo: "",
  dateFrom: dayjs().format("YYYY-MM-DD"),
  dateTo: dayjs().format("YYYY-MM-DD"),
  phone: "",
  timeFrom: "00:00",
  timeTo: "23:59",
};

const brandRed = "#DD1A32";
const blockBackground = "#F3F3F3";
const blockBorder = "#E5E5E5";
const textPrimary = "#3C3B3B";
const textSecondary = "#5E5E5E";

const searchFieldSx = {
  "&.MuiFormControl-root": {
    backgroundColor: "#fff",
    borderRadius: "12px",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#FFFFFF",
    color: textPrimary,
    minHeight: 44,
    "& fieldset": {
      borderColor: blockBorder,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: blockBorder,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: brandRed,
    },
  },
  "& .MuiOutlinedInput-input": {
    padding: "10px 12px",
    color: textPrimary,
    WebkitTextFillColor: textPrimary,
    "&::placeholder": {
      color: "#BABABA",
      opacity: 1,
    },
  },
  "& .MuiSelect-select": {
    padding: "10px 32px 10px 12px !important",
    minHeight: "unset",
    display: "flex",
    alignItems: "center",
  },
  "& .MuiInputLabel-root": {
    color: textSecondary,
    "&.Mui-focused": {
      color: textSecondary,
    },
  },
  "& .MuiSvgIcon-root": {
    color: "#A6A6A6",
  },
};

const filterPanelSx = {
  backgroundColor: "#FFFFFF",
  border: `1px solid ${blockBorder}`,
  borderRadius: "14px",
  p: { xs: 2, md: 2.5 },
};

const filterSectionTitleSx = {
  fontSize: 14,
  lineHeight: "20px",
  color: textSecondary,
  fontWeight: 400,
};

function normalizeSelectOptions(items = []) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => ({
    id: String(item?.id ?? item?.value ?? ""),
    name: item?.name || item?.title || item?.label || String(item?.id ?? item?.value ?? ""),
  }));
}

function buildOrdersRequest(filters) {
  return {
    city_id: filters.cityId || "",
    point_id: filters.pointId || 0,
    type_order: filters.orderType || 0,
    order_id: filters.orderNumber || "",
    number_order: filters.orderNumber || "",
    sum_from: filters.amountFrom || "",
    sum_to: filters.amountTo || "",
    date_from: filters.dateFrom || "",
    date_to: filters.dateTo || "",
    phone: filters.phone || "",
    number: filters.phone || "",
    time_from: filters.timeFrom || "",
    time_to: filters.timeTo || "",
  };
}

function getRowOrderId(item) {
  return String(item?.order_id ?? item?.id ?? "");
}

function getRowPointId(item) {
  return String(item?.point_id ?? item?.pointId ?? "");
}

function hasAccessValue(flag) {
  return flag === "1" || flag === 1 || flag === true;
}

const IOSSwitch = styled(Switch)(() => ({
  width: 42,
  height: 26,
  marginRight: 5,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#e82d2d",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#ec1919",
      border: "6px solid #fff",
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 13,
    backgroundColor: "#E9E9EA",
    opacity: 1,
    transition: "background-color 500ms",
  },
}));

function OrderDetailsDialog({ detail, onClose, access }) {
  const order = detail?.order;
  const orderItems = Array.isArray(detail?.order_items) ? detail.order_items : [];
  const orderItemsFor = Array.isArray(detail?.order_items_for)
    ? detail.order_items_for
    : orderItems;
  const [checkedError, setCheckedError] = useState(false);
  const [checkedDiffOrder, setCheckedDiffOrder] = useState(false);
  const [orderDiff, setOrderDiff] = useState("");
  const [checkedKey, setCheckedKey] = useState({});
  const [currentName, setCurrentName] = useState("");
  const [problemArr, setProblemArr] = useState([]);
  const [positions, setPositions] = useState([]);
  const [isProblemsOpen, setIsProblemsOpen] = useState(false);

  const hasOrderErrorAccess =
    access?.err_order_mod_access === undefined || access?.err_order_mod_access === null
      ? true
      : hasAccessValue(access?.err_order_mod_access);
  const hasTelAccess =
    access?.tel_access === undefined || access?.tel_access === null
      ? true
      : hasAccessValue(access?.tel_access);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedValue = localStorage.getItem("checkedError");
    setCheckedError(storedValue === "1");
  }, []);

  useEffect(() => {
    setCheckedDiffOrder(false);
    setOrderDiff("");
    setCheckedKey({});
    setCurrentName("");
    setProblemArr([]);
    setPositions([]);
    setIsProblemsOpen(false);
  }, [detail?.order?.order_id]);

  const selectedProblemsCount = useMemo(
    () => Object.values(checkedKey).filter(Boolean).length,
    [checkedKey],
  );

  const toggleErrorMode = () => {
    const nextValue = !checkedError;

    if (typeof window !== "undefined") {
      localStorage.setItem("checkedError", nextValue ? "1" : "0");
    }

    setCheckedError(nextValue);
    setCheckedDiffOrder(false);
    setOrderDiff("");
    setCheckedKey({});
    setCurrentName("");
  };

  const openProblems = useCallback(() => {
    const nextPositions = orderItemsFor.filter((item, index) => checkedKey[index]);

    if (!nextPositions.length) {
      return;
    }

    setPositions(nextPositions);
    setIsProblemsOpen(true);
  }, [checkedKey, orderItemsFor]);

  const saveProblems = useCallback(
    (solutions) => {
      setProblemArr((prev) => {
        const next = [...prev];

        positions.forEach((pos) => {
          const existingIndex = next.findIndex((item) => item.id === pos.id);

          if (existingIndex !== -1) {
            next[existingIndex] = {
              ...next[existingIndex],
              problem_name: solutions.value,
              problem_comment: solutions.comment,
              problem_solution: solutions.solution,
              previewUrl: solutions.previewUrl,
            };
          } else {
            next.push({
              ...pos,
              problem_name: solutions.value,
              problem_comment: solutions.comment,
              problem_solution: solutions.solution,
              previewUrl: solutions.previewUrl,
            });
          }
        });

        return next;
      });

      setIsProblemsOpen(false);
      setCheckedKey({});
      setCurrentName("");
      setPositions([]);
    },
    [positions],
  );

  if (!order) {
    return null;
  }

  return (
    <Dialog
      open={Boolean(detail?.order)}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle sx={{ textAlign: "center", position: "relative", py: 2 }}>
        <Box
          component="span"
          sx={{
            backgroundColor: "#f5f5f5",
            px: 2,
            py: 1,
            borderRadius: 2,
            fontWeight: 700,
          }}
        >
          Заказ #{order.order_id}
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "text.secondary",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {hasOrderErrorAccess ? (
        <Box
          sx={{
            backgroundColor: "#f5f5f8",
            mx: 1.5,
            mb: 1,
            display: "flex",
            borderRadius: "12px",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1.25,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <ReportProblemOutlinedIcon sx={{ ml: 1.25, mr: 1.25, color: "error.main" }} />
            <span>Режим описания ошибок</span>
          </Box>
          <FormControlLabel
            control={
              <IOSSwitch
                onClick={toggleErrorMode}
                checked={checkedError}
                color="secondary"
                size="medium"
              />
            }
            labelPlacement="right"
            sx={{ ml: "auto", mr: 0 }}
          />
        </Box>
      ) : null}

      {checkedError && hasOrderErrorAccess ? (
        <Grid
          container
          spacing={0}
          sx={{ p: 1.5 }}
        >
          <Grid size={{ xs: 12 }}>
            <MyCheckBox
              label="Привезли другой заказ"
              value={checkedDiffOrder}
              func={() => setCheckedDiffOrder((prev) => !prev)}
            />
            {checkedDiffOrder ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Введите номер привезенного заказа"
                  value={orderDiff}
                  onChange={(event) => setOrderDiff(event.target.value)}
                />
                <Button
                  variant="contained"
                  sx={{ ml: 1.5, whiteSpace: "nowrap" }}
                >
                  Сохранить
                </Button>
              </Box>
            ) : null}
          </Grid>
        </Grid>
      ) : null}

      <DialogContent>
        <Grid
          container
          spacing={3}
        >
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={1.5}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{order.type_order}</Typography>
                <Typography color="text.secondary">{order.type_order_addr_new}</Typography>
              </Box>

              {parseInt(order.type_order_) === 1 ? (
                <Typography
                  sx={{
                    color: parseInt(order.fake_dom) === 0 ? "error.main" : "success.main",
                    fontWeight: 700,
                  }}
                >
                  {parseInt(order.fake_dom) === 0 ? "Домофон не работает" : "Домофон работает"}
                </Typography>
              ) : null}

              {order.time_order_name || order.time_order ? (
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{order.time_order_name}</Typography>
                  <Typography color="text.secondary">{order.time_order}</Typography>
                </Box>
              ) : null}

              {order.number && hasTelAccess ? (
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Телефон</Typography>
                  <Typography color="text.secondary">{order.number}</Typography>
                </Box>
              ) : null}

              {order.delete_reason ? (
                <>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: "error.main" }}>Удалён</Typography>
                    <Typography color="error.main">{order.date_time_delete}</Typography>
                  </Box>
                  <Typography color="error.main">{order.delete_reason}</Typography>
                </>
              ) : null}

              {parseInt(order.is_preorder) === 1 ? null : order.text_time ||
                order.time_to_client ? (
                <Typography color="text.secondary">
                  {order.text_time}
                  {order.time_to_client}
                </Typography>
              ) : null}

              {order.textTime ? (
                <Typography color="text.secondary">{order.textTime}</Typography>
              ) : null}

              {order.promo_name ? (
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Промокод</Typography>
                  <Typography color="text.secondary">{order.promo_name}</Typography>
                  {order.promo_text ? (
                    <Typography color="text.secondary">{order.promo_text}</Typography>
                  ) : null}
                </Box>
              ) : null}

              {order.comment ? (
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Комментарий</Typography>
                  <Typography color="text.secondary">{order.comment}</Typography>
                </Box>
              ) : null}

              {parseInt(order.sdacha || 0) > 0 ? (
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Сдача</Typography>
                  <Typography color="text.secondary">{order.sdacha}</Typography>
                </Box>
              ) : null}

              {order.client_name ? (
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Клиент</Typography>
                  <Typography color="text.secondary">{order.client_name}</Typography>
                </Box>
              ) : null}

              {order.driver_name ? (
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Курьер</Typography>
                  <Typography color="text.secondary">{order.driver_name}</Typography>
                </Box>
              ) : null}

              {order.type_pay ? (
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Тип оплаты</Typography>
                  <Typography color="text.secondary">{order.type_pay}</Typography>
                </Box>
              ) : null}

              <Box>
                <Typography sx={{ fontWeight: 700 }}>Сумма заказа</Typography>
                <Typography color="text.secondary">
                  {order.sum_order || order.order_price} р
                </Typography>
              </Box>

              {order.check_pos_drive ? (
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Довоз оформлен</Typography>
                  <Typography color="text.secondary">{order.check_pos_drive.comment}</Typography>
                </Box>
              ) : null}
            </Stack>
          </Grid>

          <ModalProblems
            positions={positions}
            problem_arr={problemArr}
            open={isProblemsOpen}
            current_name={currentName}
            onClose={() => setIsProblemsOpen(false)}
            title={`Проблема с ${selectedProblemsCount || positions.length} позициями`}
            save={saveProblems}
          />

          <Grid size={{ xs: 12, md: 7 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="h6">Состав заказа</Typography>
              {checkedError && selectedProblemsCount ? (
                <Button
                  variant="contained"
                  onClick={openProblems}
                >
                  Проблема для {selectedProblemsCount} позиций
                </Button>
              ) : null}
            </Box>

            {!checkedError ? (
              <Table
                size="small"
                sx={{
                  borderSpacing: "0 6px",
                  borderCollapse: "separate",
                }}
              >
                <TableBody>
                  {orderItems.map((item, index) => (
                    <TableRow
                      key={`${item?.id || item?.name || "item"}-${index}`}
                      sx={{
                        backgroundColor: "#f6f6f6",
                        "& td": {
                          border: "none",
                        },
                      }}
                    >
                      <TableCell sx={{ borderRadius: "10px 0 0 10px" }}>
                        <Typography>{item?.name}</Typography>
                      </TableCell>
                      <TableCell>{item?.count}</TableCell>
                      <TableCell sx={{ borderRadius: "0 10px 10px 0" }}>{item?.price} р</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      sx={{ border: "none", textAlign: "right", fontWeight: 700 }}
                    >
                      Сумма заказа
                    </TableCell>
                    <TableCell sx={{ border: "none" }}>
                      {order.sum_order || order.order_price} р
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            ) : (
              <Table
                size="small"
                sx={{
                  borderSpacing: "0 6px",
                  borderCollapse: "separate",
                }}
              >
                <TableBody>
                  {orderItemsFor.map((item, index) => {
                    const problem = problemArr.find((it) => it?.id === item.id);

                    return (
                      <TableRow
                        key={`${item?.id || item?.name || "item"}-${index}`}
                        sx={{
                          backgroundColor: "#f6f6f6",
                          cursor: "pointer",
                          "& td": {
                            border: "none",
                          },
                        }}
                        onClick={(event) => {
                          const target = event.target;

                          if (
                            target?.type === "checkbox" ||
                            (typeof target?.closest === "function" &&
                              target.closest('input[type="checkbox"]'))
                          ) {
                            return;
                          }

                          setCheckedKey({ [index]: true });
                          setCurrentName(item.id);
                          setPositions([item]);
                          setIsProblemsOpen(true);
                        }}
                      >
                        <TableCell sx={{ borderRadius: "10px 0 0 10px" }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <span>
                              <MyCheckBox
                                value={checkedKey[index] === true}
                                func={(event) =>
                                  setCheckedKey((prev) => ({
                                    ...prev,
                                    [index]: event.target.checked,
                                  }))
                                }
                              />
                            </span>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-start",
                              }}
                            >
                              <Typography>{item?.name}</Typography>
                              {problem?.problem_name ? (
                                <Box
                                  component="span"
                                  className="special-badge"
                                  sx={{
                                    color: "#fff",
                                    border: "1px solid red",
                                    borderRadius: "12px",
                                    backgroundColor: "#e12a58",
                                    px: 1.25,
                                    py: 0.25,
                                    width: "max-content",
                                    fontSize: 13,
                                  }}
                                >
                                  {problem.problem_name}
                                </Box>
                              ) : null}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderRadius: "0 10px 10px 0" }}>
                          {item?.price} р.
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

function ErrorsManagement() {
  const [isLoad, setIsLoad] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [pageTitle, setPageTitle] = useState("Регистрация ошибок");
  const [access, setAccess] = useState({});
  const [cities, setCities] = useState([]);
  const [points, setPoints] = useState([]);
  const [orderTypes, setOrderTypes] = useState(DEFAULT_ORDER_TYPES);
  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [errCats, setErrCats] = useState([]);
  const [siteCats, setSiteCats] = useState([]);

  const getData = useCallback(async (method, data = {}) => {
    setIsLoad(true);

    try {
      return await api_laravel(moduleName, method, data);
    } finally {
      setIsLoad(false);
    }
  }, []);

  const loadOrders = useCallback(
    async (activeFilters) => {
      setErrorText("");

      const res = await getData("get_orders", buildOrdersRequest(activeFilters));
      const payload = res?.data ?? res;

      if (!res?.st && res?.text) {
        setErrorText(res.text);
        setOrders([]);
        return;
      }

      setOrders(Array.isArray(payload?.orders) ? payload.orders : []);
    },
    [getData],
  );

  const [mark, setMark] = useState("");
  const [modalCats, setModalCats] = useState(false);
  const [parentValue, setParentValue] = useState(false);
  const [modalCatsTitle, setModalCatsTitle] = useState("");
  const [itemName, setItemName] = useState("");
  const [catItem, setCatItem] = useState({});
  const [solutions, setSolutions] = useState([]);
  const [allStages, setAllStages] = useState([]);
  const openCatsModal = (title, mark, id = null, parentValue = false) => {
    let catItem = errCats?.find((c) => +c.id === +id) || null;
    const itemName = catItem?.name || "";
    if (parentValue) {
      catItem = { ...catItem, name: "" };
    }
    setMark(mark);
    setModalCats(true);
    setParentValue(parentValue);
    setModalCatsTitle(title);
    setItemName(itemName);
    setCatItem(catItem);
  };

  const changeCatActive = async (cat) => {
    // const alterCat = { ...cat, is_active: !cat.is_active };
    // await this.save(alterCat);
    await saveActiveCat(cat.id, !cat.is_active);
  };

  const saveActiveCat = async (id, is_active) => {
    try {
      const data = {
        id,
        is_active,
      };
      await getData("set_active_cat", data);
    } catch (e) {
      console.error(e.message || "Ошибка");
    } finally {
      update();
    }
  };

  const update = async () => {
    const res = await getData("get_all");
    console.log(res.data);
    setErrCats(res.data.err_cats);
    setSiteCats(res.data.site_cats);
  };

  const loadInitialData = useCallback(async () => {
    setErrorText("");

    const res = await getData("get_all");
    const payload = res?.data ?? res;

    if (!res?.st && res?.text) {
      setErrorText(res.text);
      return;
    }

    const nextCities = normalizeSelectOptions(payload?.cities);
    const nextPoints = normalizeSelectOptions(payload?.points).map((item) => {
      const source = Array.isArray(payload?.points)
        ? payload.points.find((point) => String(point?.id) === item.id)
        : null;

      return {
        ...item,
        city_id: String(source?.city_id ?? ""),
      };
    });
    const nextOrderTypes = Array.isArray(payload?.order_types)
      ? [...DEFAULT_ORDER_TYPES, ...normalizeSelectOptions(payload.order_types)]
      : DEFAULT_ORDER_TYPES;
    const initialCityId = String(payload?.city_id || nextCities?.[0]?.id || "");
    const nextFilters = {
      ...INITIAL_FILTERS,
      cityId: initialCityId,
    };

    setPageTitle(payload?.module_info?.name || "Регистрация ошибок");
    setAccess(Array.isArray(payload?.acces) ? {} : payload?.acces || {});
    setCities(nextCities);
    setPoints(nextPoints);
    setOrderTypes(nextOrderTypes);
    setDraftFilters(nextFilters);
    setErrCats(res.data?.err_cats);
    setSiteCats(res.data?.site_cats);
    setAllStages(res.data?.all_stages);
    setSolutions(res.data?.solutions);

    await loadOrders(nextFilters);
  }, [getData, loadOrders]);

  const toCsv = (v) =>
    !v
      ? ""
      : Array.isArray(v)
        ? v
            .map((x) => (typeof x === "object" ? x.id : x))
            .filter(Boolean)
            .join(",")
        : String(v)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .join(",");

  const save = async (item) => {
    try {
      if (mark === "newItem") {
        await getData("save_new", item);
        return;
      }

      if (mark === "editItem") {
        const data = {
          id: item.err.id,
          name: item.err.name,
          is_active: item.err.is_active,
          need_photo: item.err.need_photo,
          id_win: item.this_wins,
          stage_err_1: item.this_stages_1,
          stage_err_2: item.this_stages_2,
          stage_err_3: item.this_stages_3,
        };

        await getData("save_edit", data);
        return;
      }
      // CATS
      const type = item.id && !parentValue ? "editCat" : "addCat";
      const properSiteCats = Array.isArray(item?.site_cats)
        ? item?.site_cats?.map((c) => c.id).join(",") || null
        : item?.site_cats;
      const request = {
        cat: {
          ...item,
          site_cats: properSiteCats,
          stage_1: toCsv(item.stage_1),
          stage_2: toCsv(item.stage_2),
          stage_3: toCsv(item.stage_3),
          solutions: toCsv(item.solutions),
        },
      };
      if (type === "editCat") {
        const res = await getData("update_cat", request);
        /*if (!res?.st) {
          this.setState({
            openAlert: true,
            err_status: res.st,
            err_text: res.text,
          });
        }*/
      }
      if (type === "addCat") {
        const res = await getData("add_cat", request);
        if (!res?.st) {
          /*this.setState({
            openAlert: true,
            err_status: res.st,
            err_text: res.text,
          });*/
        }
      }
    } catch (e) {
      console.error(e?.message || "ERROOORRR");
    } finally {
      setCatItem(null);
      await update();
    }
  };

  const removeErrCat = async (id) => {
    if (!id) return;
    try {
      const res = await getData("delete_cat", { id });
      await update();
    } catch (e) {
      console.error(e.message || "Ошибка");
    } finally {
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  const pointOptions = useMemo(
    () => points.filter((point) => String(point.city_id) === String(draftFilters.cityId)),
    [points, draftFilters.cityId],
  );

  const handleDraftChange = (field) => (event) => {
    const value = event.target.value;

    setDraftFilters((prev) => {
      if (field === "cityId") {
        return {
          ...prev,
          cityId: value,
          pointId: "",
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleDateChange = (field) => (value) => {
    setDraftFilters((prev) => ({
      ...prev,
      [field]: typeof value?.format === "function" ? value.format("YYYY-MM-DD") : "",
    }));
  };

  const handleSearch = async () => {
    await loadOrders(draftFilters);
  };

  const openOrder = async (row) => {
    const orderId = getRowOrderId(row);

    if (!orderId) {
      return;
    }

    setErrorText("");

    const res = await getData("get_order_new", {
      order_id: orderId,
      point_id: getRowPointId(row),
    });
    const payload = res?.data ?? res;

    if (!res?.st && res?.text) {
      setErrorText(res.text);
      return;
    }

    setSelectedOrder(payload);
  };

  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <Backdrop
        open={isLoad}
        sx={{ zIndex: 99 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <OrderDetailsDialog
        detail={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        access={access}
      />

      <CatsModal
        open={modalCats}
        title={modalCatsTitle}
        catName={""}
        errCats={errCats}
        siteCats={siteCats}
        parentValue={parentValue}
        solutions={solutions}
        allStages={allStages}
        item={catItem}
        onClose={() => setModalCats(false)}
        save={save}
        remove={removeErrCat}
      />

      <Box
        className="container_first_child"
        sx={{ pb: 3 }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 2.5,
            fontSize: { xs: 28, md: 40 },
            lineHeight: 1.1,
            fontWeight: 500,
            color: textPrimary,
          }}
        >
          {pageTitle}
        </Typography>

        {errorText ? (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
          >
            {errorText}
          </Alert>
        ) : null}
        <Paper
          sx={{
            marginBottom: "24px",
            marginTop: "24px",
            backgroundColor: "#f3f3f3",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="fullWidth"
            scrollButtons={false}
          >
            <Tab
              label="Ошибки по отзывам"
              sx={{ minWidth: "fit-content", flex: 1 }}
            />
            <Tab
              label="Варианты решения жалоб"
              sx={{ minWidth: "fit-content", flex: 1 }}
            />
          </Tabs>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            backgroundColor: blockBackground,
            border: `1px solid ${blockBorder}`,
            borderRadius: "16px",
            display: activeTab === 0 ? "block" : "none",
            p: { xs: 2, md: 3 },
          }}
        >
          <Stack spacing={2}>
            <Box sx={filterPanelSx}>
              <Stack spacing={1.5}>
                <Typography sx={filterSectionTitleSx}>Основные параметры</Typography>

                <Grid
                  container
                  spacing={2}
                >
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Город"
                      value={draftFilters.cityId}
                      onChange={handleDraftChange("cityId")}
                      sx={searchFieldSx}
                    >
                      {cities.map((city) => (
                        <MenuItem
                          key={city.id}
                          value={city.id}
                        >
                          {city.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Точка"
                      value={draftFilters.pointId}
                      onChange={handleDraftChange("pointId")}
                      sx={searchFieldSx}
                    >
                      <MenuItem
                        key={0}
                        value={0}
                      >
                        Все точки в городе
                      </MenuItem>
                      {pointOptions.map((point) => (
                        <MenuItem
                          key={point.id}
                          value={point.id}
                        >
                          {point.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Тип заказа"
                      value={draftFilters.orderType}
                      onChange={handleDraftChange("orderType")}
                      sx={searchFieldSx}
                    >
                      {orderTypes.map((type) => (
                        <MenuItem
                          key={type.id}
                          value={type.id}
                        >
                          {type.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="№ заказа"
                      value={draftFilters.orderNumber}
                      onChange={handleDraftChange("orderNumber")}
                      sx={searchFieldSx}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Номер телефона"
                      value={draftFilters.phone}
                      onChange={handleDraftChange("phone")}
                      sx={searchFieldSx}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Сумма от"
                      value={draftFilters.amountFrom}
                      onChange={handleDraftChange("amountFrom")}
                      sx={searchFieldSx}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Сумма до"
                      value={draftFilters.amountTo}
                      onChange={handleDraftChange("amountTo")}
                      sx={searchFieldSx}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Box>

            <Box sx={filterPanelSx}>
              <Stack spacing={1.5}>
                <Typography sx={filterSectionTitleSx}>Дата и время оформления</Typography>

                <Grid
                  container
                  spacing={2}
                >
                  <Grid size={{ xs: 12, md: 3 }}>
                    <MyDatePickerNew
                      label="Дата забития заказа от"
                      value={draftFilters.dateFrom}
                      func={handleDateChange("dateFrom")}
                      customRI="journal"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <MyDatePickerNew
                      label="Дата забития заказа до"
                      value={draftFilters.dateTo}
                      func={handleDateChange("dateTo")}
                      customRI="journal"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="time"
                      label="Время забития заказа от"
                      value={draftFilters.timeFrom}
                      onChange={handleDraftChange("timeFrom")}
                      InputLabelProps={{ shrink: true }}
                      sx={searchFieldSx}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="time"
                      label="Время забития заказа до"
                      value={draftFilters.timeTo}
                      onChange={handleDraftChange("timeTo")}
                      InputLabelProps={{ shrink: true }}
                      sx={searchFieldSx}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{
                  minWidth: { xs: "100%", md: 156 },
                  height: 48,
                  borderRadius: "12px",
                  backgroundColor: brandRed,
                  color: "#fff",
                  boxShadow: "none",
                  textTransform: "none",
                  fontSize: 16,
                  "&:hover": {
                    backgroundColor: "#c6152b",
                    boxShadow: "none",
                  },
                }}
              >
                Найти
              </Button>
            </Box>
          </Stack>
        </Paper>
        <Paper
          sx={{
            backgroundColor: "transparent",
            border: `1px solid ${blockBorder}`,
            borderRadius: "16px",
            display: activeTab === 1 ? "block" : "none",
            p: { xs: 2, md: 3 },
          }}
        >
          <Button
            onClick={() => openCatsModal("Новая категория", "addCat")}
            variant="contained"
            sx={{ height: "42px", marginLeft: "auto" }}
          >
            Добавить категорию
          </Button>
          <ErrCats
            errCats={errCats}
            siteCats={siteCats}
            openModal={(id) => openCatsModal("Редактировать", "editCat", id)}
            openNewModalCats={(id, p) => openCatsModal("Новая категория", "addCat", id, p)}
            changeActive={changeCatActive}
          />
        </Paper>

        <Divider sx={{ my: 3, display: activeTab === 0 ? "block" : "none" }} />

        {orders.length ? (
          <Paper
            sx={{ width: "100%", overflow: "hidden", display: activeTab === 0 ? "block" : "none" }}
          >
            <TableContainer sx={{ maxHeight: "70vh" }}>
              <Table
                size="small"
                stickyHeader
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Заказ</TableCell>
                    <TableCell>Оформил</TableCell>
                    <TableCell>Номер клиента</TableCell>
                    <TableCell>Адрес доставки</TableCell>
                    <TableCell>Время открытия заказа</TableCell>
                    <TableCell>Время выхода на стол</TableCell>
                    <TableCell>Ко времени</TableCell>
                    <TableCell>Закрыт на кухне</TableCell>
                    <TableCell>Время на готовку</TableCell>
                    <TableCell>Получен клиентом</TableCell>
                    <TableCell>До просрочки</TableCell>
                    <TableCell>Разница</TableCell>
                    <TableCell>Готовки</TableCell>
                    <TableCell>Время обещ</TableCell>
                    <TableCell>Время по проге/Реал время ДОСТАВКИ</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Сумма</TableCell>
                    <TableCell>Оплата</TableCell>
                    <TableCell>Водитель</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {orders.map((item, index) => (
                    <TableRow
                      key={`${getRowOrderId(item)}-${index}`}
                      style={
                        parseInt(item.is_delete) == 1
                          ? {
                              backgroundColor: "red",
                              color: "#fff !important",
                              fontWeight: "bold",
                            }
                          : {}
                      }
                      hover
                    >
                      <TableCell
                        onClick={() => openOrder(item)}
                        sx={{
                          cursor: "pointer",
                          color: "primary.main",
                          textDecoration: "underline",
                          textUnderlineOffset: "3px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {getRowOrderId(item)}
                      </TableCell>
                      <TableCell>{item?.type_user}</TableCell>
                      <TableCell>{item?.number}</TableCell>
                      <TableCell>
                        {parseInt(item?.type_order_) === 1
                          ? `${item?.street || ""} ${item?.home || ""}`.trim()
                          : item?.type_order_addr_new}
                      </TableCell>
                      <TableCell>{item?.date_time_order}</TableCell>
                      <TableCell>
                        {item?.start_stol === "04:00:00" ? "" : item?.start_stol}
                      </TableCell>
                      <TableCell>
                        {parseInt(item?.is_preorder) === 1 ? item?.need_time : ""}
                      </TableCell>
                      <TableCell>
                        {item?.give_data_time === "00:00:00" ? "" : item?.give_data_time}
                      </TableCell>
                      <TableCell>{item?.cook_time}</TableCell>
                      <TableCell>{item?.close_order}</TableCell>
                      <TableCell>{item?.to_time}</TableCell>
                      <TableCell>{item?.dif}</TableCell>
                      <TableCell>{item?.diff2}</TableCell>
                      <TableCell>{item?.unix_time_to_client}</TableCell>
                      <TableCell>{item?.time_dev_text}</TableCell>
                      <TableCell>{item?.type_order}</TableCell>
                      <TableCell>{item?.status}</TableCell>
                      <TableCell>{item?.order_price}</TableCell>
                      <TableCell>{item?.type_pay}</TableCell>
                      <TableCell>{item?.driver}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              display: activeTab === 0 ? "block" : "none",
              border: "1px solid #E5E5E5",
              textAlign: "center",
            }}
          >
            <Typography color="text.secondary">Заказы по выбранным фильтрам не найдены.</Typography>
          </Paper>
        )}
      </Box>
    </>
  );
}

export default memo(ErrorsManagement);
