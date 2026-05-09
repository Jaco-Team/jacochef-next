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
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import { MyCheckBox, MyDatePickerNew, MySelect } from "@/ui/Forms";
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
const blockBackground = "#FFFFFF";
const blockBorder = "#E3E3E3";
const textPrimary = "#3C3B3B";
const textSecondary = "#4F4F4F";

const commonFieldLabelSx = {
  color: textSecondary,
  "&.Mui-focused": {
    color: textSecondary,
  },
  "&.MuiInputLabel-shrink": {
    transform: "translate(12px, -8px) scale(0.75)",
    transformOrigin: "top left",
    backgroundColor: "#FFFFFF",
    paddingInline: "6px",
    borderRadius: "8px",
    lineHeight: 1.1,
  },
};

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
    minHeight: 24,
    lineHeight: "24px",
    padding: "9px 12px",
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
    ...commonFieldLabelSx,
  },
  "& .MuiSvgIcon-root": {
    color: "#A6A6A6",
  },
};

const selectFieldSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 44,
    border: `1px solid ${blockBorder} !important`,
    borderColor: `${blockBorder} !important`,
    boxShadow: "none !important",
  },
  "& .MuiOutlinedInput-root.Mui-focused": {
    borderColor: `${blockBorder} !important`,
    boxShadow: "none !important",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "0 !important",
    display: "none !important",
  },
  "& .MuiAutocomplete-inputRoot.MuiOutlinedInput-root": {
    minHeight: "44px !important",
    paddingTop: "0 !important",
    paddingBottom: "0 !important",
    paddingLeft: "12px !important",
    paddingRight: "38px !important",
    alignItems: "center",
  },
  "& .MuiAutocomplete-input": {
    minHeight: "24px !important",
    lineHeight: "24px !important",
    alignSelf: "center",
  },
  "& .MuiAutocomplete-inputRoot.MuiOutlinedInput-root.Mui-focused": {
    borderColor: `${blockBorder} !important`,
    boxShadow: "none !important",
  },
  "& .MuiInputLabel-root": {
    ...commonFieldLabelSx,
    "&.MuiInputLabel-shrink": {
      ...commonFieldLabelSx["&.MuiInputLabel-shrink"],
      backgroundColor: "#FFFFFF",
    },
  },
};

const selectAutocompleteSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
  "&.Mui-expanded .MuiOutlinedInput-root": {
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    borderBottomLeftRadius: "0 !important",
    borderBottomRightRadius: "0 !important",
  },
  "&.Mui-expanded .MuiInputLabel-root": {
    backgroundColor: "#FFFFFF",
  },
};

const unifiedSelectSlotProps = {
  popper: {
    allowAdaptivePlacement: true,
    sx: {
      boxSizing: "border-box",
      "& .MuiAutocomplete-paper": {
        boxSizing: "border-box",
      },
    },
  },
  paper: {
    sx: {
      boxSizing: "border-box",
      width: "100%",
      borderBottomLeftRadius: "12px",
      borderBottomRightRadius: "12px",
    },
  },
  listbox: {
    sx: {
      maxHeight: 320,
      "& .MuiAutocomplete-option": {
        minHeight: 46,
        padding: "10px 16px",
      },
    },
  },
};

const dateFieldSx = {
  "&.MuiFormControl-root": {
    backgroundColor: "#fff !important",
    borderRadius: "12px",
    border: `1px solid ${blockBorder}`,
  },
  "& .MuiPickersOutlinedInput-root": {
    minHeight: "44px !important",
    borderRadius: "12px !important",
    boxShadow: "none !important",
    "& fieldset": {
      display: "none",
    },
  },
  "& .MuiPickersInputBase-sectionsContainer": {
    minHeight: 24,
    lineHeight: "24px",
    paddingTop: "9px !important",
    paddingBottom: "9px !important",
    paddingLeft: "12px !important",
    alignItems: "center",
  },
  "& .MuiPickersInputBase-sectionContent, & .MuiPickersInputBase-sectionSeparator": {
    color: textPrimary,
    lineHeight: "24px",
  },
  "& .MuiInputLabel-root": {
    ...commonFieldLabelSx,
    "&.MuiInputLabel-shrink": {
      ...commonFieldLabelSx["&.MuiInputLabel-shrink"],
      backgroundColor: "#FFFFFF",
    },
  },
  "& .MuiIconButton-root": {
    color: "#A6A6A6",
  },
};

const filterPanelSx = {
  backgroundColor: "#FFFFFF",
  border: `1px solid #E3E3E3`,
  borderRadius: "14px",
  p: { xs: 2, md: 2.5 },
};

const filterSectionTitleSx = {
  fontSize: 16,
  lineHeight: "22px",
  color: textPrimary,
  fontWeight: 600,
};

const tableHeadCellSx = {
  whiteSpace: "nowrap",
  fontWeight: 700,
  color: textPrimary,
  backgroundColor: "#FAFAFA",
  borderBottom: `1px solid ${blockBorder}`,
};

const stickyHeadCellSx = {
  ...tableHeadCellSx,
  position: "sticky",
  left: 0,
  zIndex: 4,
  boxShadow: "2px 0 0 0 #EFEFEF",
};

const stickyBodyCellSx = {
  position: "sticky",
  left: 0,
  zIndex: 2,
  backgroundColor: "#FFFFFF",
  boxShadow: "2px 0 0 0 #F3F3F3",
  whiteSpace: "nowrap",
};

const deletedRowBg = "#FFF2F4";

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

function OrderDetailsDialog({ detail, onClose, access, errCats, solutionsCatalog }) {
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
    (problemData) => {
      setProblemArr((prev) => {
        const next = [...prev];

        positions.forEach((pos) => {
          const existingIndex = next.findIndex((item) => item.id === pos.id);
          const mergedFields = {
            problem_cat_id: problemData?.problem_cat_id ?? null,
            problem_path: problemData?.problem_path || "",
            problem_name: problemData?.problem_name || problemData?.value || "",
            problem_comment: problemData?.problem_comment ?? problemData?.comment ?? "",
            problem_solution: problemData?.problem_solution ?? problemData?.solution ?? null,
            previewUrl: problemData?.previewUrl || "",
            need_img: problemData?.need_img ?? 0,
            site_cats: problemData?.site_cats || [],
            stage_1: problemData?.stage_1 || [],
            stage_2: problemData?.stage_2 || [],
            stage_3: problemData?.stage_3 || [],
          };

          if (existingIndex !== -1) {
            next[existingIndex] = {
              ...next[existingIndex],
              ...mergedFields,
            };
          } else {
            next.push({
              ...pos,
              ...mergedFields,
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
      PaperProps={{
        sx: {
          maxHeight: "92vh",
          height: { xs: "auto", md: "92vh" },
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
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

      <DialogContent
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Grid
          container
          spacing={3}
          sx={{ height: "100%", minHeight: 0 }}
        >
          <Grid
            size={{ xs: 12, md: 5 }}
            sx={{
              minHeight: 0,
              overflowY: { xs: "visible", md: "auto" },
              pr: { md: 0.5 },
            }}
          >
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
            errCats={errCats}
            solutionCatalog={solutionsCatalog}
            open={isProblemsOpen}
            current_name={currentName}
            onClose={() => setIsProblemsOpen(false)}
            title={`Проблема с ${selectedProblemsCount || positions.length} позициями`}
            save={saveProblems}
          />

          <Grid
            size={{ xs: 12, md: 7 }}
            sx={{
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
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

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                pr: 0.5,
              }}
            >
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
                        <TableCell sx={{ borderRadius: "0 10px 10px 0" }}>
                          {item?.price} р
                        </TableCell>
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
            </Box>
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

  const pointSelectOptions = useMemo(
    () => [{ id: 0, name: "Все точки в городе" }, ...pointOptions],
    [pointOptions],
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
        errCats={errCats}
        solutionsCatalog={solutions}
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
            mt: 1,
            mb: 2,
            backgroundColor: "#FFFFFF",
            border: `1px solid ${blockBorder}`,
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "none",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="fullWidth"
            scrollButtons={false}
            sx={{
              minHeight: 56,
              "& .MuiTabs-indicator": {
                backgroundColor: brandRed,
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            <Tab
              label="Ошибки по отзывам"
              sx={{
                minWidth: "fit-content",
                flex: 1,
                minHeight: 56,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 15,
                color: "#6A6A6A",
                "&.Mui-selected": {
                  color: brandRed,
                },
              }}
            />
            <Tab
              label="Варианты решения жалоб"
              sx={{
                minWidth: "fit-content",
                flex: 1,
                minHeight: 56,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 15,
                color: "#6A6A6A",
                "&.Mui-selected": {
                  color: brandRed,
                },
              }}
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
            p: { xs: 2, md: 2.5 },
          }}
        >
          <Stack spacing={2.25}>
            <Box sx={filterPanelSx}>
              <Stack spacing={1.5}>
                <Typography sx={filterSectionTitleSx}>Основные параметры</Typography>

                <Grid
                  container
                  spacing={2}
                >
                  <Grid size={{ xs: 12, md: 3 }}>
                    <MySelect
                      label="Город"
                      data={cities}
                      value={draftFilters.cityId}
                      multiple={false}
                      is_none={false}
                      unifiedPopup
                      slotProps={unifiedSelectSlotProps}
                      autocompleteSx={selectAutocompleteSx}
                      InputLabelProps={{ shrink: true }}
                      func={handleDraftChange("cityId")}
                      sx={selectFieldSx}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <MySelect
                      label="Точка"
                      data={pointSelectOptions}
                      value={draftFilters.pointId}
                      multiple={false}
                      is_none={false}
                      unifiedPopup
                      slotProps={unifiedSelectSlotProps}
                      autocompleteSx={selectAutocompleteSx}
                      InputLabelProps={{ shrink: true }}
                      func={handleDraftChange("pointId")}
                      sx={selectFieldSx}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <MySelect
                      label="Тип заказа"
                      data={orderTypes}
                      value={draftFilters.orderType}
                      multiple={false}
                      is_none={false}
                      unifiedPopup
                      slotProps={unifiedSelectSlotProps}
                      autocompleteSx={selectAutocompleteSx}
                      InputLabelProps={{ shrink: true }}
                      func={handleDraftChange("orderType")}
                      sx={selectFieldSx}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="№ заказа"
                      value={draftFilters.orderNumber}
                      onChange={handleDraftChange("orderNumber")}
                      InputLabelProps={{ shrink: true }}
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
                      InputLabelProps={{ shrink: true }}
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
                      InputLabelProps={{ shrink: true }}
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
                      InputLabelProps={{ shrink: true }}
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
                      label="Дата оформления заказа от"
                      value={draftFilters.dateFrom}
                      func={handleDateChange("dateFrom")}
                      customRI="journal"
                      InputLabelProps={{ shrink: true }}
                      sx={dateFieldSx}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <MyDatePickerNew
                      label="Дата оформления заказа до"
                      value={draftFilters.dateTo}
                      func={handleDateChange("dateTo")}
                      customRI="journal"
                      InputLabelProps={{ shrink: true }}
                      sx={dateFieldSx}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="time"
                      label="Время оформления заказа от"
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
                      label="Время оформления заказа до"
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
                pt: 0.5,
              }}
            >
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{
                  minWidth: { xs: "100%", sm: 188, md: 164 },
                  height: 48,
                  borderRadius: "12px",
                  backgroundColor: brandRed,
                  color: "#fff",
                  boxShadow: "none",
                  textTransform: "none",
                  fontSize: 16,
                  fontWeight: 700,
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
            backgroundColor: "#FFFFFF",
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
            <Box
              sx={{
                px: 2,
                pt: 1.5,
                pb: 0.5,
                borderBottom: `1px solid ${blockBorder}`,
                backgroundColor: "#FCFCFC",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: textSecondary, fontWeight: 500 }}
              >
                Прокрутите таблицу вправо, чтобы увидеть все колонки
              </Typography>
            </Box>
            <TableContainer sx={{ maxHeight: "70vh", overflowX: "auto" }}>
              <Table
                size="small"
                stickyHeader
                sx={{ minWidth: 2200 }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={stickyHeadCellSx}>Заказ</TableCell>
                    <TableCell sx={tableHeadCellSx}>Оформил</TableCell>
                    <TableCell sx={tableHeadCellSx}>Клиент</TableCell>
                    <TableCell sx={tableHeadCellSx}>Адрес</TableCell>
                    <TableCell sx={tableHeadCellSx}>
                      <Tooltip
                        title="Время открытия заказа"
                        arrow
                      >
                        <Box component="span">Открыт</Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={tableHeadCellSx}>
                      <Tooltip
                        title="Время выхода на стол"
                        arrow
                      >
                        <Box component="span">Выход на стол</Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={tableHeadCellSx}>Ко времени</TableCell>
                    <TableCell sx={tableHeadCellSx}>
                      <Tooltip
                        title="Время закрытия заказа на кухне"
                        arrow
                      >
                        <Box component="span">Закрыт кухней</Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={tableHeadCellSx}>
                      <Tooltip
                        title="Время на готовку"
                        arrow
                      >
                        <Box component="span">На готовку</Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={tableHeadCellSx}>
                      <Tooltip
                        title="Время получения клиентом"
                        arrow
                      >
                        <Box component="span">Получен</Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={tableHeadCellSx}>До просрочки</TableCell>
                    <TableCell sx={tableHeadCellSx}>Разница</TableCell>
                    <TableCell sx={tableHeadCellSx}>Готовка</TableCell>
                    <TableCell sx={tableHeadCellSx}>
                      <Tooltip
                        title="Обещанное время"
                        arrow
                      >
                        <Box component="span">Обещ. время</Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={tableHeadCellSx}>
                      <Tooltip
                        title="Время по программе / реальное время доставки"
                        arrow
                      >
                        <Box component="span">Доставка: план/факт</Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={tableHeadCellSx}>Тип</TableCell>
                    <TableCell sx={tableHeadCellSx}>Статус</TableCell>
                    <TableCell sx={tableHeadCellSx}>Сумма</TableCell>
                    <TableCell sx={tableHeadCellSx}>Оплата</TableCell>
                    <TableCell sx={tableHeadCellSx}>Водитель</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {orders.map((item, index) => {
                    const isDeleted = Number(item?.is_delete) === 1;

                    return (
                      <TableRow
                        key={`${getRowOrderId(item)}-${index}`}
                        hover
                        sx={{
                          backgroundColor: isDeleted ? deletedRowBg : "#FFFFFF",
                          "&:hover": {
                            backgroundColor: isDeleted ? "#FFE9EE" : "#FAFAFA",
                          },
                          "& td": {
                            borderBottom: `1px solid ${blockBorder}`,
                            whiteSpace: "nowrap",
                            backgroundColor: "inherit",
                          },
                        }}
                      >
                        <TableCell
                          onClick={() => openOrder(item)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              openOrder(item);
                            }
                          }}
                          aria-label={`Открыть заказ ${getRowOrderId(item)}`}
                          sx={{
                            ...stickyBodyCellSx,
                            backgroundColor: isDeleted ? deletedRowBg : "#FFFFFF",
                            cursor: "pointer",
                            color: "primary.main",
                            textDecoration: "underline",
                            textUnderlineOffset: "3px",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <span>{getRowOrderId(item)}</span>
                            {isDeleted ? (
                              <Box
                                component="span"
                                sx={{
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: "10px",
                                  border: "1px solid #F29AA8",
                                  backgroundColor: "#FCE2E7",
                                  color: "#A32A3C",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  textDecoration: "none",
                                }}
                              >
                                Удален
                              </Box>
                            ) : null}
                          </Box>
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
                    );
                  })}
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
              border: `1px solid ${blockBorder}`,
              borderRadius: "16px",
              backgroundColor: "#FCFCFC",
              textAlign: "center",
            }}
          >
            <Typography sx={{ color: textSecondary, fontWeight: 600 }}>
              Заказы по выбранным фильтрам не найдены
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#777", mt: 0.75 }}
            >
              Измените параметры поиска и повторите попытку
            </Typography>
          </Paper>
        )}
      </Box>
    </>
  );
}

export default memo(ErrorsManagement);
