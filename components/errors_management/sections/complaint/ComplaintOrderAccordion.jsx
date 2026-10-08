"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { amountLabel } from "../../errorsManagementViewModel.mjs";
import DetailField from "./DetailField";

const accordionSx = {
  border: 1,
  borderColor: "divider",
  borderRadius: "12px !important",
  overflow: "hidden",
  backgroundColor: "background.paper",
  "&:before": { display: "none" },
};

export default function ComplaintOrderAccordion({ detail, onOpenOrder }) {
  if (!detail.order || !Object.keys(detail.order).length) return null;
  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={accordionSx}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack
          direction="row"
          spacing={1.25}
          sx={{ minWidth: 0, alignItems: "center" }}
        >
          <ReceiptLongOutlinedIcon
            color="action"
            fontSize="small"
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
            >
              Заказ №{detail.order_id}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {detail.order.order_type_name || "Заказ"} · {amountLabel(detail.order.order_amount)}
            </Typography>
          </Box>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        <Stack spacing={1.5}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 1.5,
            }}
          >
            <DetailField
              label="Оформил"
              value={detail.order.placed_by}
            />
            <DetailField
              label="Сотрудник"
              value={detail.order.employee_name}
            />
            <DetailField
              label="Оплата"
              value={detail.order.payment_method}
            />
            <DetailField
              label="Клиент"
              value={detail.order.client_name}
            />
            {detail.order.delivery_address ? (
              <DetailField
                fullWidth
                label="Адрес доставки"
                value={detail.order.delivery_address}
              />
            ) : null}
            {detail.order.customer_comment ? (
              <DetailField
                fullWidth
                label="Комментарий клиента"
                value={detail.order.customer_comment}
              />
            ) : null}
          </Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ReceiptLongOutlinedIcon />}
            onClick={() => onOpenOrder?.(detail)}
            sx={{ alignSelf: "flex-start" }}
          >
            Открыть состав заказа
          </Button>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
