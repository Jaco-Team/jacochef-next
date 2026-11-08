"use client";

import {
  ErrorOutline,
  LocalOfferOutlined,
  ReceiptLongOutlined,
  ScheduleOutlined,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { memo } from "react";

import { JacoResponsiveModalShell, JacoSurface } from "@/design-system/shared/ui";
import { formatRUR } from "@/src/helpers/utils/i18n";

function OrderDetailField({ label, value, fullWidth = false }) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <Box sx={fullWidth ? { gridColumn: "1 / -1" } : undefined}>
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={500}
      >
        {value}
      </Typography>
    </Box>
  );
}

function orderAmount(value) {
  return formatRUR(value, false);
}

const OrderDetailsModal = ({ open, onClose, order: orderObj, hideDeliveryDetails = false }) => {
  if (!orderObj) return null;

  const { order = {}, order_items: orderItems = [], err_order: errOrder = null } = orderObj;
  const isDelivery = Number(order.type_order_) === 1;
  const isPreorder = Number(order.is_preorder) === 1;
  const showIntercom = !hideDeliveryDetails && isDelivery;
  const orderType = hideDeliveryDetails
    ? ""
    : [order.type_order, order.type_order_addr_new].filter(Boolean).join(" · ");
  const expectedTime = ![0, "0", "00:00:00", null, undefined].includes(order.time_to_client)
    ? order.time_to_client
    : "";
  const remainingTime = ![0, "0", "00:00:00", null, undefined].includes(order.time)
    ? `${order.text_time || ""}${order.time}`.trim()
    : "";
  const promisedTime =
    !hideDeliveryDetails && !isPreorder
      ? [expectedTime, remainingTime].filter(Boolean).join(" · ")
      : "";

  return (
    <JacoResponsiveModalShell
      open={open}
      onClose={onClose}
      title={`Заказ №${order.order_id || "—"}`}
      maxWidth="md"
      contentSx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 }, pb: { xs: 2.5, sm: 3 } }}
      mobileContentSx={{ px: 2, pt: 2, pb: 2.5 }}
    >
      <Stack spacing={2}>
        <JacoSurface
          variant="outlined"
          sx={{ p: { xs: 1.5, sm: 2 } }}
        >
          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{
                justifyContent: orderType ? "space-between" : "flex-end",
                alignItems: { sm: "center" },
              }}
            >
              {orderType ? (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center", minWidth: 0 }}
                >
                  <ReceiptLongOutlined
                    color="action"
                    fontSize="small"
                  />
                  <Typography
                    variant="body2"
                    fontWeight={700}
                  >
                    {orderType}
                  </Typography>
                </Stack>
              ) : null}
              {order.sum_order !== null && order.sum_order !== undefined ? (
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                >
                  {orderAmount(order.sum_order)}
                </Typography>
              ) : null}
            </Stack>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                gap: 1.5,
              }}
            >
              <OrderDetailField
                label={order.time_order_name || "Время заказа"}
                value={order.time_order}
              />
              <OrderDetailField
                label="Ожидаемое время"
                value={promisedTime}
              />
              {!hideDeliveryDetails && order.number?.length > 1 ? (
                <OrderDetailField
                  label="Телефон"
                  value={order.number}
                />
              ) : null}
              <OrderDetailField
                label="Сдача"
                value={Number(order.sdacha) ? order.sdacha : null}
              />
              <OrderDetailField
                fullWidth
                label="Комментарий клиента"
                value={order.comment}
              />
            </Box>
            {showIntercom ? (
              <Chip
                size="small"
                color={Number.parseInt(order.fake_dom, 10) === 0 ? "error" : "success"}
                variant="outlined"
                label={
                  Number.parseInt(order.fake_dom, 10) === 0
                    ? "Домофон не работает"
                    : "Домофон работает"
                }
                sx={{ alignSelf: "flex-start" }}
              />
            ) : null}
            {order.delete_reason ? (
              <Box sx={{ borderLeft: 3, borderColor: "error.main", pl: 1.25 }}>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color="error.main"
                >
                  Заказ удалён {order.date_time_delete || ""}
                </Typography>
                <Typography variant="body2">{order.delete_reason}</Typography>
              </Box>
            ) : null}
            {order.check_pos_drive?.comment ? (
              <Box sx={{ borderLeft: 3, borderColor: "warning.main", pl: 1.25 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Довоз оформлен
                </Typography>
                <Typography variant="body2">{order.check_pos_drive.comment}</Typography>
              </Box>
            ) : null}
          </Stack>
        </JacoSurface>

        {order.promo_name ? (
          <JacoSurface
            variant="outlined"
            sx={{ p: 1.5 }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "flex-start" }}
            >
              <LocalOfferOutlined
                color="success"
                fontSize="small"
                sx={{ mt: 0.25 }}
              />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Промокод
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={700}
                >
                  {order.promo_name}
                </Typography>
                {order.promo_text ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.25 }}
                  >
                    {order.promo_text}
                  </Typography>
                ) : null}
              </Box>
            </Stack>
          </JacoSurface>
        ) : null}

        <Box>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ mb: 1 }}
          >
            Состав заказа
          </Typography>
          <JacoSurface
            variant="outlined"
            sx={{ overflow: "hidden" }}
          >
            <TableContainer>
              <Table
                size="small"
                aria-label="Состав заказа"
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Позиция</TableCell>
                    <TableCell align="right">Количество</TableCell>
                    <TableCell align="right">Сумма</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderItems.map((item, index) => (
                    <TableRow
                      key={`${item.id || item.name || "item"}-${index}`}
                      hover
                    >
                      <TableCell>{item.name || "—"}</TableCell>
                      <TableCell align="right">{item.count ? `${item.count} шт.` : "—"}</TableCell>
                      <TableCell align="right">
                        {item.price !== null && item.price !== undefined
                          ? orderAmount(item.price)
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {orderItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Позиции заказа не найдены.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      sx={{ fontWeight: 700 }}
                    >
                      Итого
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700 }}
                    >
                      {orderAmount(order.sum_order)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </JacoSurface>
        </Box>

        {errOrder ? (
          <Accordion
            disableGutters
            elevation={0}
            sx={{
              border: 1,
              borderColor: "error.light",
              borderRadius: "12px !important",
              overflow: "hidden",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ScheduleOutlined fontSize="small" />}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center" }}
              >
                <ErrorOutline
                  color="error"
                  fontSize="small"
                />
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                >
                  История ошибки заказа
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
                  gap: 1.5,
                }}
              >
                <OrderDetailField
                  label="Дата"
                  value={errOrder.date_time_desc}
                />
                <OrderDetailField
                  label="Проблема"
                  value={errOrder.order_desc}
                />
                <OrderDetailField
                  label="Решение"
                  value={errOrder.text_win}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        ) : null}
      </Stack>
    </JacoResponsiveModalShell>
  );
};

export default memo(OrderDetailsModal);
