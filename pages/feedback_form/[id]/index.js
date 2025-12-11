import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { useRouter } from "next/router";
import {
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  FormControlLabel,
  Rating,
  TextField,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import { MyAutocomplite, MyDatePicker, MyDatePickerNew } from "@/ui/Forms";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import TableFooter from "@mui/material/TableFooter";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionDetails from "@mui/material/AccordionDetails";
import dayjs from "dayjs";
import TableContainer from "@mui/material/TableContainer";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { formatDate } from "@/src/helpers/ui/formatDate";
import MyAlert from "@/ui/MyAlert";

const ModalOrder = ({ open, onClose, getData, pointId, orderId }) => {
  const [order, setOrder] = useState({});
  const [order_items, setOrderItems] = useState([]);
  useEffect(() => {
    getData("get_order", { order_id: orderId, point_id: pointId }).then((data) => {
      setOrder(data.order);
      setOrderItems(data.order_items);
    });
  }, []);

  const renderElementFeed = (element, item) => {
    switch (element.type) {
      case "rating":
        return (
          <div style={{ marginBottom: 10 }}>
            <Typography variant="h6">Рейтинг</Typography>
            <Rating
              value={element.data?.value}
              size="large"
              sx={{ pointerEvents: "none", opacity: 0.5, span: { fontSize: "2rem !important" } }}
            />
          </div>
        );
      case "input":
        return (
          <div style={{ marginBottom: 10 }}>
            <Typography variant="h6">{element.data.title}</Typography>
            <TextField
              fullWidth
              sx={{ pointerEvents: "none", opacity: 0.75 }}
              placeholder={element.data.placeholder}
              size="small"
            />
          </div>
        );
      case "textarea":
        return (
          <div style={{ marginBottom: 10 }}>
            <Typography variant="h6">{element.data.title}</Typography>
            <TextField
              fullWidth
              multiline
              size="small"
              rows={4}
              sx={{ pointerEvents: "none", opacity: 0.75 }}
              value={element.data?.value}
              placeholder={element.data.placeholder}
            />
          </div>
        );
      case "heading":
        return (
          <div style={{ marginBottom: 10 }}>
            <Typography variant="h4">{element.data.text}</Typography>
          </div>
        );
      case "checkbox":
        return (
          <div style={{ marginBottom: 10 }}>
            <FormControlLabel
              control={<Checkbox checked={element.data?.value} />}
              label={element.data.label}
              sx={{ pointerEvents: "none", opacity: 0.75 }}
              id={element.data.param}
              size="small"
            />
          </div>
        );
      case "checkboxGroup":
        return (
          <div
            style={{
              marginBottom: 10,
              display:
                element.data.conditions.stars.find((value) => value === 1) ||
                element.data.conditions.products.find((value) => value === item.name) ||
                element.data.conditions.categories.find((value) => value === item.cat_name)
                  ? "initial"
                  : "none",
            }}
          >
            <Typography variant="h6">{element.data.title}</Typography>
            {element.data.checkboxes.map((checkbox) => (
              <div
                key={checkbox.id}
                style={{ display: "flex", alignItems: "center" }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checkbox.value}
                      value={checkbox.value}
                      sx={{
                        pointerEvents: "none",
                        opacity: 0.75,
                      }}
                    />
                  }
                  label={checkbox.label}
                />
              </div>
            ))}
          </div>
        );
      case "tagCloud":
        return (
          <div style={{ marginBottom: 10 }}>
            <Typography variant="h6">Облако тегов</Typography>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {element.data.selectedTags.map((tag) => (
                <Chip
                  sx={{
                    pointerEvents: "none",
                    opacity: 0.85,
                  }}
                  key={tag}
                  label={tag}
                  color={element.data?.value.includes(tag) ? "primary" : "default"}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth={true}
      maxWidth={"md"}
      fullScreen={false}
    >
      <DialogTitle className="button">
        <Typography
          style={{
            fontWeight: "bold",
            alignSelf: "center",
          }}
        >
          Заказ #{order?.order_id}
        </Typography>
        <IconButton
          onClick={onClose}
          style={{ cursor: "pointer" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid
          container
          spacing={0}
        >
          <Grid
            size={{
              xs: 12,
            }}
          >
            <span>
              {order?.type_order}: {order?.type_order_addr_new}
            </span>
          </Grid>

          {parseInt(order?.type_order_) == 1 ? (
            parseInt(order?.fake_dom) == 0 ? (
              <Grid
                size={{
                  xs: 12,
                }}
              >
                <b style={{ color: "red", fontWeight: 900 }}>Домофон не работает</b>
              </Grid>
            ) : (
              <Grid
                size={{
                  xs: 12,
                }}
              >
                <b style={{ color: "green", fontWeight: 900 }}>Домофон работает</b>
              </Grid>
            )
          ) : null}
          <Grid
            size={{
              xs: 12,
            }}
          >
            <span>
              {order?.time_order_name}: {order?.time_order}
            </span>
          </Grid>

          {order?.number?.length > 1 ? (
            <Grid
              size={{
                xs: 12,
              }}
            >
              <b>Телефон: </b>
              <span>{order?.number}</span>
            </Grid>
          ) : null}

          {order?.delete_reason?.length > 0 ? (
            <Grid
              size={{
                xs: 12,
              }}
            >
              <span style={{ color: "red" }}>Удален: {order?.date_time_delete}</span>
            </Grid>
          ) : null}
          {order?.delete_reason?.length > 0 ? (
            <Grid
              size={{
                xs: 12,
              }}
            >
              <span style={{ color: "red" }}>{order?.delete_reason}</span>
            </Grid>
          ) : null}

          {parseInt(order?.is_preorder) == 1 ? null : (
            <Grid
              size={{
                xs: 12,
              }}
            >
              <span>
                {"Обещали: " + order?.time_to_client + " / "}
                {order?.text_time}
                {order?.time}
              </span>
            </Grid>
          )}

          {order?.promo_name == null || order?.promo_name?.length == 0 ? null : (
            <>
              <Grid
                size={{
                  xs: 12,
                }}
              >
                <b>Промокод: </b>
                <span>{order?.promo_name}</span>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                }}
              >
                <span className="noSpace">{order?.promo_text}</span>
              </Grid>
            </>
          )}

          {order?.comment == null || order?.comment.length == 0 ? null : (
            <Grid
              size={{
                xs: 12,
              }}
            >
              <b>Комментарий: </b>
              <span>{order?.comment}</span>
            </Grid>
          )}

          {order?.sdacha == null || parseInt(order?.sdacha) == 0 ? null : (
            <Grid
              size={{
                xs: 12,
              }}
            >
              <b>Сдача: </b>
              <span>{order?.sdacha}</span>
            </Grid>
          )}

          <Grid
            size={{
              xs: 12,
            }}
          >
            <b>Сумма заказа: </b>
            <span>{order?.sum_order} р</span>
          </Grid>

          {order?.check_pos_drive == null || !order?.check_pos_drive ? null : (
            <Grid
              size={{
                xs: 12,
              }}
            >
              <b>Довоз оформлен: </b>
              <span>{order?.check_pos_drive?.comment}</span>
            </Grid>
          )}

          <Grid
            size={{
              xs: 12,
            }}
          >
            <Table
              size={"small"}
              style={{ marginTop: 15 }}
            >
              <TableBody>
                {order_items
                  ? order_items.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.count} шт</TableCell>
                        <TableCell>{item.price} р</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              p: 1,
                              bgcolor: item.form_feed?.length ? "grey.100" : "",
                              display: item.form_feed?.length ? "" : "none",
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor: "grey.300",
                            }}
                          >
                            {Object.entries(item.form_feed).map((data) =>
                              data.map((element) => (
                                <div key={element.id}>{renderElementFeed(element, item)}</div>
                              )),
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell style={{ fontWeight: "bold", color: "#000" }}>Сумма заказа</TableCell>
                  <TableCell></TableCell>
                  <TableCell
                    style={{
                      fontWeight: "bold",
                      color: "#000",
                    }}
                  >
                    {order?.sum_order} р
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

const ModalItem = ({ open, onClose, params }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth={true}
      maxWidth={"md"}
      fullScreen={false}
    >
      <DialogTitle className="button">
        <Typography
          style={{
            fontWeight: "bold",
            alignSelf: "center",
          }}
        ></Typography>
        <IconButton
          onClick={onClose}
          style={{ cursor: "pointer" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {params.length ? (
          <Grid
            style={{ marginBottom: "24px" }}
            size={{
              xs: 12,
            }}
          >
            <Card elevation={3}>
              <CardHeader
                title="Список параметров"
                slotProps={{
                  title: { variant: "h6", fontWeight: "bold" },
                }}
              />
              <Divider />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <b>#</b>
                      </TableCell>
                      <TableCell align="left">
                        <b>Параметр</b>
                      </TableCell>
                      <TableCell align="center">
                        <b>Кол-во</b>
                      </TableCell>
                      <TableCell align="center">
                        <b>Процент использований</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {params.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <b>{index + 1}</b>
                        </TableCell>
                        <TableCell align="left">{row.label}</TableCell>
                        <TableCell align="center">{row.total_count}</TableCell>
                        <TableCell align="center">{row.percentage} %</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

function FeedbackPage() {
  const router = useRouter();
  const { id } = router.query;
  const [openModalItem, setOpenModalItem] = useState(false);
  const [params, setParams] = useState([]);
  const [isLoad, setIsLoad] = useState(false);
  const [title, setTitle] = useState("");
  const [formData, setFormData] = useState([]);
  const [rating, setRating] = useState(1);
  const [selectedTags, setSelectedTags] = useState([]);
  const [active, setActive] = useState(false);
  const [value, setValue] = useState("view_form");
  const [points, setPoints] = useState([]);
  const [items, setItems] = useState([]);
  const [point, setPoint] = useState([]);
  const [item, setItem] = useState([]);
  const [rows, setRows] = useState([]);
  const [leaderLow, setLeaderLow] = useState([]);
  const [leaderUp, setLeaderUp] = useState([]);
  const [dateStart, setDateStart] = useState(null);
  const [dateEnd, setDateEnd] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [openOrder, setOpenOrder] = useState(false);
  const [pointId, setPointId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [errStatus, setErrStatus] = useState(false);
  const [errText, setErrText] = useState("");
  const [typeSale, setTypeSale] = useState(0);
  const tabsData = {
    view_form: "Просомотр формы",
    view_feed: "Отчеты",
  };
  const [access, setAccess] = useState({});

  useEffect(() => {
    getData("get_form", { id }).then((data) => {
      document.title = data.item?.name;
      setTitle(data.item.name);
      setFormData(JSON.parse(data.item.form_data));
      setActive(data.item.active);
      const tabsCheck = Object.entries(tabsData).filter(
        ([key]) => parseInt(data.acces?.[key + "_access"]) === 1 || key === "view_form",
      );
      setAccess(Object.fromEntries(tabsCheck));
      setPoints(data.points);
      setItems(data.items);
    });
  }, []);

  const openItem = (item_id) => {
    getData("get_item_params", { item_id }).then((data) => {
      setParams(data.params);
      setOpenModalItem(true);
    });
  };

  const openOrderModal = (pointId, orderId) => {
    setPointId(pointId);
    setOrderId(orderId);
    setOpenOrder(true);
  };

  const changeActive = (e) => {
    setActive(e.target.checked);
    getData("set_active", { check: e.target.checked, id });
  };

  const getFeedbacks = () => {
    getData("get_feedback", {
      dateStart: dayjs(dateStart).format("YYYY-MM-DD"),
      dateEnd: dayjs(dateEnd).format("YYYY-MM-DD"),
      point,
      item,
      form_id: id,
    }).then((data) => {
      if (!data.st) {
        setErrStatus(data.st);
        setErrText(data.text);
        setOpenAlert(true);
      } else {
        setFeedbacks(data.feedback);
        setRows(data.rows);
        setLeaderLow(data.leaderLow);
        setLeaderUp(data.leaderUp);
      }
    });
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const getData = async (method, data = {}) => {
    setIsLoad(true);

    try {
      const result = await api_laravel("feedback_form", method, data);
      return result.data;
    } finally {
      setIsLoad(false);
    }
  };
  const getConditionText = (condition) => {
    switch (condition.type) {
      case "products":
        return `Отображается если выбран товар: ${condition.values.join(", ")}`;
      case "categories":
        return `Отображается если выбрана категория: ${condition.values.join(", ")}`;
      case "orderType":
        return `Отображается если тип заказа: ${condition.values.join(", ")}`;
      default:
        return "Отображается всегда";
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const renderElement = (element) => {
    switch (element.type) {
      case "block":
        return (
          <div
            className="form-element"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.05)",
              border: "1px solid rgba(0, 0, 0, 0.15)",
              opacity: 0.8,
              borderRadius: "4px",
              padding: "16px",
              marginBottom: "8px",
            }}
          >
            <Typography variant="h6">{element.data.title}</Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mb: 2 }}
            >
              {getConditionText(element.data.condition)}
            </Typography>
            {element.data.elements.map((el) => (
              <div key={el.id}>{renderElement(el)}</div>
            ))}
          </div>
        );
      case "rating":
        return (
          <div style={{ marginBottom: 10 }}>
            <Typography variant="h6">Рейтинг</Typography>
            <Rating
              value={rating}
              size="large"
              sx={{ span: { fontSize: "2rem !important" } }}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
            />
          </div>
        );
      case "discount":
        return (
          <div className="form-element">
            <Typography variant="h6">Выписать скидку</Typography>
            <ToggleButtonGroup
              value={typeSale}
              exclusive
              size="small"
              onChange={(event, data) => setTypeSale(data)}
            >
              {element.data.availableDiscount.map((discount) => {
                return (
                  <ToggleButton
                    value={discount}
                    style={{ backgroundColor: parseInt(typeSale) == discount ? "#dd1a32" : "#fff" }}
                  >
                    <span
                      style={{
                        color: parseInt(typeSale) == discount ? "#fff" : "#333",
                        padding: "0 20px",
                      }}
                    >
                      Скидка {discount}%
                    </span>
                  </ToggleButton>
                );
              })}
            </ToggleButtonGroup>
          </div>
        );
      case "input":
        return (
          <div style={{ marginBottom: 10 }}>
            <Typography variant="h6">{element.data.title}</Typography>
            <TextField
              fullWidth
              placeholder={element.data.placeholder}
              size="small"
            />
          </div>
        );
      case "textarea":
        return (
          <div style={{ marginBottom: 10 }}>
            <Typography variant="h6">{element.data.title}</Typography>
            <TextField
              fullWidth
              multiline
              size="small"
              rows={4}
              placeholder={element.data.placeholder}
            />
          </div>
        );
      case "heading":
        return (
          <div style={{ marginBottom: 10 }}>
            <Typography variant="h4">{element.data.text}</Typography>
          </div>
        );
      case "checkbox":
        return (
          <div style={{ marginBottom: 10 }}>
            <FormControlLabel
              control={<Checkbox />}
              label={element.data.label}
              id={element.data.param}
              size="small"
            />
          </div>
        );
      case "checkboxGroup":
        return (
          <div
            style={{
              marginBottom: 10,
              display: element.data.conditions.stars.find((value) => value === rating)
                ? "initial"
                : "none",
            }}
          >
            <Typography variant="h6">{element.data.title}</Typography>
            {element.data.checkboxes.map((checkbox) => (
              <div
                key={checkbox.id}
                style={{ display: "flex", alignItems: "center" }}
              >
                <FormControlLabel
                  control={<Checkbox />}
                  label={checkbox.label}
                  id={checkbox.param}
                />
              </div>
            ))}
          </div>
        );
      case "tagCloud":
        return (
          <div style={{ marginBottom: 10 }}>
            <Typography variant="h6">Облако тегов</Typography>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {element.data.selectedTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onClick={() => toggleTag(tag)}
                  color={selectedTags.includes(tag) ? "primary" : "default"}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Grid
      container
      spacing={3}
      mb={3}
      className="container_first_child"
      size={{
        xs: 12,
        sm: 12,
      }}
    >
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
      {openOrder ? (
        <ModalOrder
          open={openOrder}
          onClose={() => setOpenOrder(false)}
          getData={getData}
          orderId={orderId}
          pointId={pointId}
        />
      ) : null}
      {openModalItem ? (
        <ModalItem
          open={openModalItem}
          onClose={() => setOpenModalItem(false)}
          params={params}
        />
      ) : null}
      <Grid
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <h1>{title}</h1>
      </Grid>
      <Grid
        style={{ paddingBottom: 24 }}
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <Paper>
          <TabContext value={value}>
            <Tabs
              value={value}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons={false}
            >
              {Object.entries(access).map(([key, value]) => (
                <Tab
                  label={value}
                  value={key}
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
          <TabPanel value="view_feed">
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
                  sm: 3,
                }}
              >
                <MyAutocomplite
                  label="Позиции"
                  data={items}
                  multiple={true}
                  value={item}
                  func={(event, data) => {
                    setItem(data);
                  }}
                />
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
                  sm: 12,
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={getFeedbacks}
                >
                  Показать отчет
                </Button>
              </Grid>
            </Grid>
            {rows.length ? (
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <Grid
                  container
                  spacing={3}
                  sx={{ marginBottom: "12px" }}
                >
                  {rows.map((item, index) => (
                    <Grid
                      key={item.order_id}
                      size={{
                        xs: 12,
                        sm: 6,
                        md: 4,
                      }}
                    >
                      <Card
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            boxShadow: 3,
                            transform: "translateY(-2px)",
                          },
                          transition: "all 0.2s ease-in-out",
                        }}
                        onClick={() => openItem(item.item_id)}
                      >
                        <CardContent>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={2}
                          >
                            <Typography
                              variant="h6"
                              component="div"
                            >
                              #{index + 1} {item.name}
                            </Typography>
                            <Chip
                              label={`Рейтинг: ${item.rating}`}
                              color={
                                item.rating >= 4
                                  ? "success"
                                  : item.rating >= 3
                                    ? "warning"
                                    : "error"
                              }
                            />
                          </Box>

                          <Divider sx={{ my: 1 }} />

                          <Grid
                            container
                            spacing={2}
                          >
                            <Grid
                              size={{
                                xs: 6,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Всего отзывов:
                              </Typography>
                              <Typography variant="body1">{item.total_count}</Typography>
                            </Grid>
                            <Grid
                              size={{
                                xs: 6,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Высоких оценок:
                              </Typography>
                              <Typography
                                variant="body1"
                                color="success"
                              >
                                {item.positive_percentage}%
                              </Typography>
                            </Grid>
                            <Grid
                              size={{
                                xs: 6,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Низких оценок:
                              </Typography>
                              <Typography
                                variant="body1"
                                color="error"
                              >
                                {item.negative_percentage}%
                              </Typography>
                            </Grid>
                          </Grid>

                          <Divider sx={{ my: 2 }} />
                          <Box mt={2}>
                            <Typography
                              variant="subtitle2"
                              gutterBottom
                            >
                              Основные достоинства:
                            </Typography>
                            <Box
                              display="flex"
                              flexWrap="wrap"
                              gap={1}
                            >
                              {item.r_up.split(",").map((advantage, i) => (
                                <Chip
                                  key={i}
                                  label={advantage.trim()}
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              gutterBottom
                            >
                              Основные проблемы:
                            </Typography>
                            <Box
                              display="flex"
                              flexWrap="wrap"
                              gap={1}
                            >
                              {item.r_low.split(",").map((problem, i) => (
                                <Chip
                                  key={i}
                                  label={problem.trim()}
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            ) : null}
            {leaderLow.length ? (
              <Grid
                style={{ marginBottom: "24px" }}
                size={{
                  xs: 12,
                }}
              >
                <Card elevation={3}>
                  <CardHeader
                    title="Лидеры проблем"
                    subheader={`За период ${dayjs(dateStart).format("DD.MM.YYYY")} - ${dayjs(dateEnd).format("DD.MM.YYYY")}`}
                    slotProps={{
                      title: { variant: "h6", fontWeight: "bold" },
                    }}
                  />
                  <Divider />
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <b>Товар</b>
                          </TableCell>
                          <TableCell align="center">
                            <b>Основная проблема</b>
                          </TableCell>
                          <TableCell align="center">
                            <b>Кол-во жалоб</b>
                          </TableCell>
                          <TableCell align="center">
                            <b>Всего отзывов</b>
                          </TableCell>
                          <TableCell align="center">
                            <b>Доля проблем</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {leaderLow.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <b>{row.name}</b>
                            </TableCell>
                            <TableCell align="center">{row.label}</TableCell>
                            <TableCell align="center">{row.occurrences}</TableCell>
                            <TableCell align="center">{row.total_parameters_count}</TableCell>
                            <TableCell align="center">
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                {row.percentage}%
                                <Box
                                  width="8px"
                                  height="8px"
                                  bgcolor={
                                    parseFloat(row.percentage) > 35
                                      ? "#f44336"
                                      : parseFloat(row.percentage) > 25
                                        ? "#ff9800"
                                        : "#4caf50"
                                  }
                                  borderRadius="50%"
                                  ml={1}
                                />
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
            ) : null}
            {leaderUp.length ? (
              <Grid
                style={{ marginBottom: "24px" }}
                size={{
                  xs: 12,
                }}
              >
                <Card elevation={3}>
                  <CardHeader
                    title="Топ положительных оценок"
                    subheader={`За период ${dayjs(dateStart).format("DD.MM.YYYY")} - ${dayjs(dateEnd).format("DD.MM.YYYY")}`}
                    slotProps={{
                      title: { variant: "h6", fontWeight: "bold" },
                    }}
                  />
                  <Divider />
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <b>Товар</b>
                          </TableCell>
                          <TableCell align="center">
                            <b>Параметр</b>
                          </TableCell>
                          <TableCell align="center">
                            <b>Кол-во оценок</b>
                          </TableCell>
                          <TableCell align="center">
                            <b>Всего отзывов</b>
                          </TableCell>
                          <TableCell align="center">
                            <b>Доля положительных</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {leaderUp.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <b>{row.name}</b>
                            </TableCell>
                            <TableCell align="center">{row.label}</TableCell>
                            <TableCell align="center">{row.occurrences}</TableCell>
                            <TableCell align="center">{row.total_parameters_count}</TableCell>
                            <TableCell align="center">
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                {row.percentage}%
                                <Box
                                  width="8px"
                                  height="8px"
                                  bgcolor={
                                    parseFloat(row.percentage) > 35
                                      ? "#5a8b33"
                                      : parseFloat(row.percentage) > 25
                                        ? "#6fe821"
                                        : "#29ff33"
                                  }
                                  borderRadius="50%"
                                  ml={1}
                                />
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
            ) : null}
            {feedbacks.length ? (
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                  >
                    <Typography
                      style={{
                        whiteSpace: "nowrap",
                        fontWeight: "bold ",
                      }}
                    >
                      {" "}
                      Отзывы ({feedbacks.length}){" "}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Accordion>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>#</TableCell>
                              <TableCell>Номер заказа</TableCell>
                              <TableCell>Точка</TableCell>
                              <TableCell>Отзывов по товару</TableCell>
                              <TableCell>Отзывов по категории</TableCell>
                              <TableCell>Отзывов по типу заказа</TableCell>
                              <TableCell>Дата отзыва</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {feedbacks.map((it, k) => (
                              <TableRow
                                style={{ cursor: "pointer" }}
                                hover
                                key={it.order_id}
                                onClick={() => openOrderModal(it.point_id, it.order_id)}
                              >
                                <TableCell>{k + 1}</TableCell>
                                <TableCell>{it.order_id}</TableCell>
                                <TableCell>{it.point_name}</TableCell>
                                <TableCell>{it.count_things}</TableCell>
                                <TableCell>{it.count_cat}</TableCell>
                                <TableCell>{it.count_order}</TableCell>
                                <TableCell>{it.date}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Accordion>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ) : null}
          </TabPanel>
          <TabPanel value="view_form">
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <FormControlLabel
                sx={{ pt: 0 }}
                control={
                  <Checkbox
                    checked={active}
                    onChange={changeActive}
                  />
                }
                label={"Активность"}
                id={"active"}
                size="small"
              />
            </Grid>
            <Grid
              display="flex"
              flexDirection="column"
              alignItems="center"
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <div
                style={{
                  width: 500,
                  boxShadow: "0 2px 12px 0 rgba(0, 0, 0, .10)",
                  padding: 20,
                  borderRadius: 10,
                }}
              >
                {formData.map((element) => (
                  <div key={element.id}>{renderElement(element)}</div>
                ))}
                <Button
                  variant="contained"
                  style={{ float: "right" }}
                >
                  Отправить
                </Button>
              </div>
            </Grid>
          </TabPanel>
        </TabContext>
      </Grid>
    </Grid>
  );
}

export default function SettingsId() {
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
