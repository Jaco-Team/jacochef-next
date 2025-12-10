"use client";

import { memo, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  Box,
  TableFooter,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Checkbox,
  Chip,
  FormControlLabel,
  Rating,
  TextField,
  Grid,
  TableBody,
  Table,
  TableRow,
  TableCell,
  Button,
} from "@mui/material";
import { Close, ExpandMore } from "@mui/icons-material";

import { ModalAccept } from "@/components/general/ModalAccept";

const ModalOrderWithFeedback = ({
  open,
  onClose,
  order: orderObj,
  getData,
  showAlert,
  openOrder,
}) => {
  const { order_items, err_order, feedback_forms, order } = orderObj;
  const [values, setValues] = useState([]);
  const [discountValue, setDiscountValue] = useState(0);
  const [answerValue, setAnswerValue] = useState(0);
  const [userActive, setUserActive] = useState("");
  const saveFeedback = async () => {
    try {
      const feedbacks = [];
      order_items.map((value, index) => {
        feedbacks.push({ ...values[index], item: { ...value } });
      });
      const anyPercent = {
        sale: discountValue,
        phone: order.number,
      };
      const anyAnswer = {
        answer: answerValue,
        phone: order.number,
      };
      const res = await getData("save_feedbacks", {
        feedbacks,
        order_id: order.order_id,
        point_id: order.point_id,
        anyAnswer,
        anyPercent,
        userActive,
      });
      if (!res) throw new Error("Заказ не получен");
      await openOrder(order.point_id, order.order_id);
    } catch (e) {
      showAlert(e.message || "Ошибка получения заказа");
    }
  };

  useEffect(() => {
    setValues([]);
    setDiscountValue(0);
    setUserActive(0);
    if (order?.feedback_data?.discount_id) {
      setDiscountValue(order.feedback_data?.count_promo);
    }
    if (order?.feedback_data?.user_active) {
      setUserActive(order.feedback_data?.user_active);
    }
  }, [open]);

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
                element.data.conditions.stars.find(
                  (value) =>
                    value ===
                    parseInt(item.form_feed.find((el) => el.type === "rating")?.data?.value),
                ) ||
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

  const renderElement = (element, key, item) => {
    const handleChanges = (e, type, id) => {
      const valuesCopy = JSON.parse(JSON.stringify(values));

      if (!valuesCopy[key]) {
        valuesCopy[key] = {};
      }
      if (type === "checkbox" || type === "checkboxGroup") {
        valuesCopy[key][id] = {
          value: e.target.checked,
          type,
        };
      } else if (type === "tagCloud") {
        let arr = valuesCopy[key][type]?.value ? [...valuesCopy[key][type]?.value] : [];
        const existEl = arr.find((el) => el === e);
        if (existEl) {
          arr = arr.filter((el) => el !== e);
        } else {
          arr.push(e);
        }
        valuesCopy[key][type] = {
          value: arr,
          type,
        };
      } else {
        valuesCopy[key][type] = {
          value: e.target.value,
          type,
        };
      }

      setValues(valuesCopy);
    };

    switch (element.type) {
      case "rating":
        return (
          <div style={{ marginBottom: 10 }}>
            <Typography variant="h6">Рейтинг</Typography>
            <Rating
              id={element.id}
              value={values[key]?.[element.type]?.value}
              onChange={(e) => handleChanges(e, element.type, element.id)}
              size="large"
              sx={{ span: { fontSize: "2rem !important" } }}
            />
          </div>
        );
      case "input":
        return (
          <div style={{ marginBottom: 10 }}>
            <Typography variant="h6">{element.data.title}</Typography>
            <TextField
              fullWidth
              id={element.id}
              value={values[key]?.[element.type]?.value}
              onChange={(e) => handleChanges(e, element.type, element.id)}
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
              id={element.id}
              value={values[key]?.[element.type]?.value}
              onChange={(e) => handleChanges(e, element.type, element.id)}
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
              control={
                <Checkbox
                  id={element.data.param}
                  value={values[key]?.[element.type]?.value}
                  onChange={(e) => handleChanges(e, element.type, element.data.param)}
                />
              }
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
              display:
                element.data.conditions.stars.find(
                  (value) => value === parseInt(values[key]?.["rating"]?.value),
                ) ||
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
                  value={values[key]?.[element.type]?.value}
                  control={
                    <Checkbox onChange={(e) => handleChanges(e, element.type, checkbox.param)} />
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
                  key={tag}
                  label={tag}
                  value={values[key]?.[element.type]?.value}
                  onClick={(e) => handleChanges(tag, element.type, element.id)}
                  color={values[key]?.[element.type]?.value.includes(tag) ? "primary" : "default"}
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
  const [openAccept, setOpenAccept] = useState(false);
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
          Заказ #{order?.order_id} (feedback)
        </Typography>
        <IconButton
          onClick={onClose}
          style={{ cursor: "pointer" }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      {openAccept && (
        <ModalAccept
          open={openAccept}
          onClose={() => setOpenAccept(false)}
          save={() => {
            saveFeedback();
            setOpenAccept(false);
          }}
        />
      )}
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

          {!order?.ready_answer ? null : (
            <Grid
              size={{
                xs: 12,
              }}
            >
              <b>Готов давать обратную связь: </b>
              {order?.ready_answer === "Да" ? (
                <span style={{ color: "green" }}>{order?.ready_answer}</span>
              ) : null}
              {order?.ready_answer === "Нет" ? (
                <span style={{ color: "red" }}>{order?.ready_answer}</span>
              ) : null}
              {order?.ready_answer === "Редко" ? (
                <span style={{ color: "yellow" }}>{order?.ready_answer}</span>
              ) : null}
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
                {order_items?.some((item) => item.form_data.length) ? (
                  <>
                    <TableRow>
                      <TableCell>Заказов</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell>
                        <b>{order?.stat_order?.all_count} шт</b>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Доставок</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell>
                        <b>{order?.stat_order?.count_dev} шт</b>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Самовывозов</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell>
                        <b>{order?.stat_order?.count_pic} шт</b>
                      </TableCell>
                    </TableRow>
                  </>
                ) : null}
                {order_items
                  ? order_items.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.count ? `${item.count} шт` : ""}</TableCell>
                        <TableCell>{item.price ? `${item.price} р` : ""}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              p: 1,
                              bgcolor: item.form_feed?.length ? "grey.100" : "",
                              display:
                                item.form_feed?.length || item.form_data.length ? "" : "none",
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor: "grey.300",
                            }}
                          >
                            {item.form_feed?.length
                              ? Object.entries(item.form_feed).map((data) =>
                                  data.map((element) => (
                                    <div key={element.id}>{renderElementFeed(element, item)}</div>
                                  )),
                                )
                              : Object.entries(item.form_data).map((data) =>
                                  data.map((element) => (
                                    <div key={element.id}>{renderElement(element, key, item)}</div>
                                  )),
                                )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
              <TableFooter>
                {order_items?.some((item) => item.form_data.length) && (
                  <TableRow>
                    <TableCell style={{ fontWeight: "bold", color: "#000" }}>Тип клиента</TableCell>
                    <TableCell></TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        color: "#000",
                      }}
                    ></TableCell>
                    <TableCell>
                      <div
                        className="form-element"
                        style={
                          order.feedback_data?.user_active || order.feedback_data?.user_active === 0
                            ? { pointerEvents: "none", opacity: 0.4 }
                            : {}
                        }
                      >
                        <ToggleButtonGroup
                          value={userActive}
                          exclusive
                          size="small"
                          onChange={(event, data) => setUserActive(data)}
                        >
                          <ToggleButton
                            value={0}
                            style={{
                              backgroundColor: parseInt(userActive) == 0 ? "#dd1a32" : "#fff",
                              borderRightWidth: 2,
                            }}
                          >
                            <span
                              style={{
                                color: parseInt(userActive) == 0 ? "#fff" : "#333",
                                padding: "0 20px",
                              }}
                            >
                              Текущий
                            </span>
                          </ToggleButton>
                          <ToggleButton
                            value={1}
                            style={{
                              backgroundColor: parseInt(userActive) == 1 ? "#dd1a32" : "#fff",
                            }}
                          >
                            <span
                              style={{
                                color: parseInt(userActive) == 1 ? "#fff" : "#333",
                                padding: "0 20px",
                              }}
                            >
                              Новый
                            </span>
                          </ToggleButton>
                          <ToggleButton
                            value={2}
                            style={{
                              backgroundColor: parseInt(userActive) == 2 ? "#dd1a32" : "#fff",
                            }}
                          >
                            <span
                              style={{
                                color: parseInt(userActive) == 2 ? "#fff" : "#333",
                                padding: "0 20px",
                              }}
                            >
                              Ушедший
                            </span>
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {order_items?.some(
                  (item) =>
                    item.form_data.length &&
                    item.form_data.some((data) => data.type === "discount"),
                ) && (
                  <TableRow>
                    <TableCell style={{ fontWeight: "bold", color: "#000" }}>
                      Выписать скидку
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        color: "#000",
                      }}
                    ></TableCell>
                    <TableCell>
                      <div
                        className="form-element"
                        style={
                          order.feedback_data?.discount_id
                            ? { pointerEvents: "none", opacity: 0.4 }
                            : {}
                        }
                      >
                        <ToggleButtonGroup
                          value={discountValue}
                          exclusive
                          size="small"
                          onChange={(event, data) => {
                            setDiscountValue(data);
                          }}
                        >
                          {[10, 20].map((discount) => {
                            return (
                              <ToggleButton
                                value={discount}
                                style={{
                                  backgroundColor:
                                    parseInt(discountValue) == discount ? "#dd1a32" : "#fff",
                                }}
                              >
                                <span
                                  style={{
                                    color: parseInt(discountValue) == discount ? "#fff" : "#333",
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
                    </TableCell>
                  </TableRow>
                )}
                {order_items?.some((item) => item.form_data.length) && !order?.ready_answer && (
                  <TableRow>
                    <TableCell style={{ fontWeight: "bold", color: "#000" }}>
                      Готов давать обратную связь
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        color: "#000",
                      }}
                    ></TableCell>
                    <TableCell>
                      <div
                        className="form-element"
                        style={
                          order.feedback_data?.discount_id
                            ? { pointerEvents: "none", opacity: 0.4 }
                            : {}
                        }
                      >
                        <ToggleButtonGroup
                          value={answerValue}
                          exclusive
                          size="small"
                          onChange={(event, data) => {
                            console.log(data);
                            setAnswerValue(data);
                          }}
                        >
                          {["Да", "Нет", "Редко"].map((answer) => {
                            return (
                              <ToggleButton
                                value={answer}
                                style={{
                                  backgroundColor: answerValue === answer ? "#dd1a32" : "#fff",
                                }}
                              >
                                <span
                                  style={{
                                    color: answerValue === answer ? "#fff" : "#333",
                                    padding: "0 20px",
                                  }}
                                >
                                  {answer}
                                </span>
                              </ToggleButton>
                            );
                          })}
                        </ToggleButtonGroup>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell style={{ fontWeight: "bold", color: "#000" }}>Сумма заказа</TableCell>
                  <TableCell></TableCell>
                  <TableCell
                    style={{
                      fontWeight: "bold",
                      color: "#000",
                    }}
                  >
                    {`${order?.sum_order}`} р
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      onClick={() => setOpenAccept(true)}
                      sx={{
                        display: order_items?.some((item) => item.form_data.length) ? "" : "none",
                      }}
                    >
                      Сохранить отзывы
                    </Button>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Grid>

          {!err_order ? null : (
            <Grid
              mt={3}
              size={{
                xs: 12,
              }}
            >
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography style={{ fontWeight: "bold" }}>Ошибка</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: "20%" }}>Дата создания</TableCell>
                        <TableCell style={{ width: "30%" }}>Проблема</TableCell>
                        <TableCell style={{ width: "30%" }}>Решение</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover>
                        <TableCell>{err_order?.date_time_desc}</TableCell>
                        <TableCell>{err_order?.order_desc}</TableCell>
                        <TableCell>{err_order?.text_win}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default memo(ModalOrderWithFeedback);
