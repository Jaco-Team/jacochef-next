"use client";

import dayjs from "dayjs";
import { memo, useEffect, useRef, useState } from "react";
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
  Stack,
  TextField,
  Tooltip,
  Grid,
  TableBody,
  Table,
  TableRow,
  TableCell,
  Button,
  TableContainer,
  TableHead,
} from "@mui/material";
import { AddCommentOutlined, Close, EditOutlined, ExpandMore } from "@mui/icons-material";

import { ModalAccept } from "@/components/general/ModalAccept";
import { formatRUR } from "@/src/helpers/utils/i18n";
import formatDuration, { formatDurationRange } from "@/src/helpers/ui/formatDuration";
import { MyTextInput } from "@/ui/Forms";

const formatOrderDateTime = (value) => {
  const date = dayjs(value);
  return date.isValid() ? date.format("DD.MM.YYYY HH:mm") : "";
};

const feedbackToggleGroupSx = {
  display: "flex",
  "& .MuiToggleButton-root": {
    minWidth: 96,
    px: 2,
    py: 0.75,
    color: "text.primary",
    fontWeight: 600,
    textTransform: "none",
    borderColor: "divider",
  },
  "& .MuiToggleButton-root.Mui-selected": {
    backgroundColor: "primary.main",
    color: "primary.contrastText",
    "&:hover": { backgroundColor: "primary.dark" },
  },
};

const ModalOrderWithFeedback = ({
  open,
  onClose,
  order: orderObj,
  getData,
  showAlert,
  openOrder,
}) => {
  const { order_items, err_order, feedback_forms, order, other_orders } = orderObj;
  const [values, setValues] = useState([]);
  const [discountValue, setDiscountValue] = useState(0);
  const [answerValue, setAnswerValue] = useState(0);
  const [userActive, setUserActive] = useState("");
  const [editingCommentIndex, setEditingCommentIndex] = useState(null);
  const commentInputRef = useRef(null);
  const initialDiscountValue = order?.feedback_data?.discount_id
    ? Number(order.feedback_data.count_promo)
    : 0;
  const initialUserActive =
    order?.feedback_data?.user_active != null ? Number(order.feedback_data.user_active) : 0;
  const hasFeedbackForm = order_items?.some((item) => item.form_data.length);
  const isDirty =
    values.length > 0 ||
    discountValue !== initialDiscountValue ||
    answerValue !== 0 ||
    userActive !== initialUserActive;

  const resetFeedbackDraft = () => {
    setValues([]);
    setDiscountValue(initialDiscountValue);
    setAnswerValue(0);
    setUserActive(initialUserActive);
    setEditingCommentIndex(null);
  };

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
    resetFeedbackDraft();
  }, [open]);

  useEffect(() => {
    if (editingCommentIndex === null) return undefined;

    const frameId = window.requestAnimationFrame(() => commentInputRef.current?.focus());
    return () => window.cancelAnimationFrame(frameId);
  }, [editingCommentIndex]);

  const updateFeedbackValue = (key, type, value) => {
    setValues((current) => {
      const next = [...current];
      next[key] = {
        ...(next[key] || {}),
        [type]: { value, type },
      };
      return next;
    });
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

  const renderCompactFeedback = (item, key) => {
    const elements = item.form_feed?.length ? item.form_feed : item.form_data;
    const ratingElement = elements.find((element) => element.type === "rating");
    const commentElement = elements.find(
      (element) => element.type === "textarea" || element.type === "input",
    );
    const editable = !item.form_feed?.length;
    const commentType = commentElement?.type || "textarea";
    const ratingValue = editable
      ? (values[key]?.rating?.value ?? (Number(ratingElement?.data?.value) || null))
      : Number(ratingElement?.data?.value) || null;
    const commentValue = editable
      ? (values[key]?.[commentType]?.value ??
        values[key]?.textarea?.value ??
        commentElement?.data?.value ??
        "")
      : commentElement?.data?.value || "";
    const isEditing = editingCommentIndex === key;
    const extraElements = elements.filter(
      (element) => element !== ratingElement && element !== commentElement,
    );

    return (
      <Stack
        spacing={1.25}
        alignItems="center"
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
        >
          {ratingElement ? (
            <Tooltip
              title="Рейтинг"
              placement="top"
            >
              <Rating
                id={ratingElement.id}
                value={ratingValue}
                readOnly={!editable}
                onChange={(_, value) => updateFeedbackValue(key, "rating", value)}
                size="large"
                sx={{
                  fontSize: "1.67rem !important",
                  "& .MuiRating-iconEmpty": { color: "rgba(0, 0, 0, 0.28)" },
                  "& .MuiRating-icon": { fontSize: "1.67rem !important" },
                  "& .MuiSvgIcon-root": { fontSize: "inherit" },
                }}
              />
            </Tooltip>
          ) : null}

          {!isEditing && editable ? (
            <Tooltip title={commentValue ? "Редактировать комментарий" : "Добавить комментарий"}>
              <IconButton
                size="small"
                aria-label={commentValue ? "Редактировать комментарий" : "Добавить комментарий"}
                onClick={() => setEditingCommentIndex(key)}
              >
                {commentValue ? (
                  <EditOutlined fontSize="small" />
                ) : (
                  <AddCommentOutlined fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>

        {commentValue && !isEditing ? (
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", opacity: 0.72, fontStyle: "italic" }}
          >
            {commentValue}
          </Typography>
        ) : null}

        {isEditing ? (
          <Box
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setEditingCommentIndex(null);
              }
            }}
          >
            <MyTextInput
              inputRef={commentInputRef}
              fullWidth
              multiline
              minRows={3}
              label="Комментарий"
              value={commentValue}
              func={(event) => updateFeedbackValue(key, commentType, event.target.value)}
            />
          </Box>
        ) : null}

        {extraElements.map((element) => (
          <div key={element.id}>{renderElement(element, key, item)}</div>
        ))}
      </Stack>
    );
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
      <DialogTitle
        sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            Заказ №{order?.order_id}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {formatOrderDateTime(order?.time_order)}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          aria-label="Закрыть"
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
        <Stack spacing={0}>
          <TableContainer sx={{ width: "100%", mb: 1 }}>
            <Table
              size="small"
              sx={{
                borderCollapse: "separate",
                borderSpacing: "0 3px",
                "& .MuiTableCell-root": { border: 0, px: 0, py: 0, textAlign: "left" },
                "& .MuiTableCell-root + .MuiTableCell-root": { pl: 2 },
              }}
            >
              <TableBody>
                <TableRow>
                  <TableCell sx={{ width: "1px", whiteSpace: "nowrap", fontWeight: 600 }}>
                    {order?.type_order}
                  </TableCell>
                  <TableCell>{order?.type_order_addr_new}</TableCell>
                </TableRow>
                {parseInt(order?.type_order_) === 1 && (
                  <TableRow>
                    <TableCell sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>Домофон</TableCell>
                    <TableCell
                      sx={{
                        color: parseInt(order?.fake_dom) === 0 ? "error.main" : "success.main",
                        fontWeight: 700,
                      }}
                    >
                      {parseInt(order?.fake_dom) === 0 ? "Не работает" : "Работает"}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                    {order?.time_order_name}
                  </TableCell>
                  <TableCell>{order?.time_order}</TableCell>
                </TableRow>
                {order?.number?.length > 1 && (
                  <TableRow>
                    <TableCell sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>Телефон</TableCell>
                    <TableCell>{order?.number}</TableCell>
                  </TableRow>
                )}
                {order?.delete_reason?.length > 0 && (
                  <>
                    <TableRow>
                      <TableCell
                        sx={{ whiteSpace: "nowrap", fontWeight: 600, color: "error.main" }}
                      >
                        Удален
                      </TableCell>
                      <TableCell sx={{ color: "error.main" }}>{order?.date_time_delete}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell />
                      <TableCell sx={{ color: "error.main" }}>{order?.delete_reason}</TableCell>
                    </TableRow>
                  </>
                )}
                {parseInt(order?.is_preorder) !== 1 && order?.time_to_client && (
                  <TableRow>
                    <TableCell sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>Обещали</TableCell>
                    <TableCell>{formatDurationRange(order?.time_to_client)}</TableCell>
                  </TableRow>
                )}
                {parseInt(order?.is_preorder) !== 1 && order?.time && (
                  <TableRow>
                    <TableCell sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                      Приготовили
                    </TableCell>
                    <TableCell>{formatDuration(order?.time)}</TableCell>
                  </TableRow>
                )}
                {order?.promo_name?.length > 0 && (
                  <>
                    <TableRow>
                      <TableCell sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>Промокод</TableCell>
                      <TableCell>{order?.promo_name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell />
                      <TableCell>{order?.promo_text}</TableCell>
                    </TableRow>
                  </>
                )}
                {order?.comment?.length > 0 && (
                  <TableRow>
                    <TableCell sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                      Комментарий
                    </TableCell>
                    <TableCell>{order?.comment}</TableCell>
                  </TableRow>
                )}
                {order?.sdacha != null && parseInt(order?.sdacha) !== 0 && (
                  <TableRow>
                    <TableCell sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>Сдача</TableCell>
                    <TableCell>{formatRUR(order?.sdacha)}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>Сумма заказа</TableCell>
                  <TableCell>{formatRUR(order?.sum_order)}</TableCell>
                </TableRow>
                {order?.check_pos_drive && (
                  <TableRow>
                    <TableCell sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                      Довоз оформлен
                    </TableCell>
                    <TableCell>{order?.check_pos_drive?.comment}</TableCell>
                  </TableRow>
                )}
                {order?.ready_answer && (
                  <TableRow>
                    <TableCell sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                      Готов давать обратную связь
                    </TableCell>
                    <TableCell
                      sx={{
                        color:
                          order.ready_answer === "Да"
                            ? "success.main"
                            : order.ready_answer === "Нет"
                              ? "error.main"
                              : "warning.main",
                      }}
                    >
                      {order.ready_answer}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {other_orders?.length > 0 && (
            <Accordion sx={{ width: "100%", mt: 2, cursor: "pointer" }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography style={{ fontWeight: "bold" }}>Все заказы</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer sx={{ maxHeight: "60dvh" }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>ID</TableCell>
                        <TableCell>Дата заказа</TableCell>
                        <TableCell>Кафе</TableCell>
                        <TableCell>Сумма</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {other_orders.map((o, i) => (
                        <TableRow
                          key={`${o.point_id}-${o.order_id}-${i}`}
                          hover
                          onClick={async () => await openOrder(o.point_id, o.order_id)}
                        >
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{o.order_id}</TableCell>
                          <TableCell>{formatOrderDateTime(o.time_order)}</TableCell>
                          <TableCell>{o.addr}</TableCell>
                          <TableCell>{formatRUR(o.summ)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          )}
          {hasFeedbackForm ? (
            <TableContainer
              sx={{
                mt: 2,
                mb: 1,
                width: "fit-content",
                maxWidth: "100%",
              }}
            >
              <Table
                size="small"
                sx={{
                  width: "auto",
                  borderCollapse: "separate",
                  borderSpacing: "0 4px",
                  "& .MuiTableCell-root": { border: 0, px: 0, py: 0, textAlign: "left" },
                  "& .MuiTableCell-root + .MuiTableCell-root": { pl: 2 },
                }}
              >
                <TableBody>
                  {[
                    ["Заказов", order?.stat_order?.all_count],
                    ["Доставок", order?.stat_order?.count_dev],
                    ["Самовывозов", order?.stat_order?.count_pic],
                  ].map(([label, value]) => (
                    <TableRow key={label}>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{label}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap", fontWeight: 700 }}>
                        {value} шт
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
          <TableContainer sx={{ mt: 3, borderTop: 1, borderColor: "divider" }}>
            <Table
              size="small"
              sx={{
                "& .MuiTableCell-root": { py: 1, verticalAlign: "baseline" },
                "& .MuiTableCell-root + .MuiTableCell-root": { pl: 1.5 },
              }}
            >
              <TableBody>
                {order_items
                  ? order_items.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell
                          sx={{
                            width: { xs: "auto", sm: "42%" },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.name}
                        </TableCell>
                        <TableCell sx={{ width: { xs: "auto", sm: "10%" }, whiteSpace: "nowrap" }}>
                          {item.count ? `${item.count} шт` : ""}
                        </TableCell>
                        <TableCell sx={{ width: { xs: "auto", sm: "12%" }, whiteSpace: "nowrap" }}>
                          {item.price ? formatRUR(item.price) : ""}
                        </TableCell>
                        <TableCell sx={{ py: 1, verticalAlign: "baseline", textAlign: "center" }}>
                          {item.form_feed?.length || item.form_data.length
                            ? renderCompactFeedback(item, key)
                            : null}
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
              <TableFooter>
                {hasFeedbackForm && (
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
                      <ToggleButtonGroup
                        value={userActive}
                        exclusive
                        size="small"
                        disabled={order.feedback_data?.user_active != null}
                        onChange={(event, data) => setUserActive(data ?? userActive)}
                        sx={feedbackToggleGroupSx}
                      >
                        <ToggleButton value={0}>Текущий</ToggleButton>
                        <ToggleButton value={1}>Новый</ToggleButton>
                        <ToggleButton value={2}>Ушедший</ToggleButton>
                      </ToggleButtonGroup>
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
                      <ToggleButtonGroup
                        value={discountValue}
                        exclusive
                        size="small"
                        disabled={Boolean(order.feedback_data?.discount_id)}
                        onChange={(event, data) => setDiscountValue(data ?? discountValue)}
                        sx={feedbackToggleGroupSx}
                      >
                        {[10, 20].map((discount) => (
                          <ToggleButton
                            key={discount}
                            value={discount}
                          >
                            Скидка {discount}%
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </TableCell>
                  </TableRow>
                )}
                {hasFeedbackForm && !order?.ready_answer && (
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
                      <ToggleButtonGroup
                        value={answerValue}
                        exclusive
                        size="small"
                        onChange={(event, data) => setAnswerValue(data ?? answerValue)}
                        sx={feedbackToggleGroupSx}
                      >
                        {["Да", "Нет", "Редко"].map((answer) => (
                          <ToggleButton
                            key={answer}
                            value={answer}
                          >
                            {answer}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
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
                    {formatRUR(order?.sum_order)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
          {hasFeedbackForm ? (
            <Stack
              direction="row"
              justifyContent="center"
              spacing={1.5}
              sx={{ mt: 2 }}
            >
              <Button
                variant="contained"
                onClick={() => setOpenAccept(true)}
              >
                Сохранить отзывы
              </Button>
              {isDirty ? (
                <Button
                  variant="outlined"
                  onClick={resetFeedbackDraft}
                >
                  Отменить
                </Button>
              ) : null}
            </Stack>
          ) : null}

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
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default memo(ModalOrderWithFeedback);
