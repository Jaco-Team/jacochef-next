"use client";

import {
  Box,
  Chip,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import MyModal from "@/ui/MyModal";
import SmallFont from "@/ui/SmallFont";

function formatActivationOrdersBucket(value, index) {
  const fallback = index === 4 ? "5+" : index + 1;
  const bucket = value ?? fallback;
  const normalizedBucket = String(bucket).toLowerCase();

  if (normalizedBucket === "5" || normalizedBucket.includes("5+")) {
    return "5+";
  }

  return bucket;
}

function getActivationDetailsRows(details) {
  if (Array.isArray(details)) {
    return details.map((item, index) => ({
      orders: formatActivationOrdersBucket(
        item?.orders ??
          item?.orders_count ??
          item?.activations ??
          item?.activation_count ??
          item?.name ??
          item?.label,
        index,
      ),
      clients:
        item?.clients ??
        item?.clients_count ??
        item?.client_count ??
        item?.amount ??
        item?.count ??
        item?.value ??
        0,
      users_count: item?.users_count,
    }));
  }

  if (details && typeof details === "object") {
    return Object.entries(details).map(([orders, value], index) => ({
      orders: formatActivationOrdersBucket(orders, index),
      clients:
        value && typeof value === "object"
          ? (value.clients ??
            value.clients_count ??
            value.client_count ??
            value.amount ??
            value.count ??
            0)
          : (value ?? 0),
      users_count: value && typeof value === "object" ? value.users_count : undefined,
    }));
  }

  return [];
}

export default function PromoItemsStatActivationsModal({ item, dateRange, onClose }) {
  const rows = getActivationDetailsRows(item?.activations_details);
  const title = `Промик ${item?.promo_name || "NA"} за ${dateRange}, заказы клиентов`;

  return (
    <MyModal
      open={Boolean(item)}
      onClose={onClose}
      title={title}
      maxWidth="sm"
    >
      <DialogContent>
        {rows.length ? (
          <TableContainer>
            <Table
              size="small"
              stickyHeader
            >
              <TableHead>
                <TableRow>
                  <TableCell>Заказов за период</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>Клиентов</TableCell>
                </TableRow>
              </TableHead>
              <TableBody hover="row">
                {rows.map((row, index) => (
                  <TableRow
                    key={String(row.orders) + "-" + index}
                    hover
                  >
                    <TableCell>{row.orders}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.5,
                        }}
                      >
                        <Typography
                          component="span"
                          variant="body2"
                        >
                          {row.clients}
                        </Typography>
                        {row.users_count !== undefined && row.users_count !== null ? (
                          <Tooltip
                            arrow
                            placement="top"
                            title="Зарегистрированных"
                          >
                            <Chip
                              size="small"
                              color="info"
                              variant="outlined"
                              sx={{ height: 22 }}
                              label={<SmallFont size="0.6rem">{row.users_count}</SmallFont>}
                            />
                          </Tooltip>
                        ) : null}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary">Нет данных</Typography>
        )}
      </DialogContent>
    </MyModal>
  );
}
