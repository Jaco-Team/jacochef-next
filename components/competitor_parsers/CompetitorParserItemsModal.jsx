"use client";

import Link from "next/link";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import MyModal from "@/ui/MyModal";
import { formatValue, getStatusLabel } from "./utils";

export default function CompetitorParserItemsModal({ modal, onClose }) {
  return (
    <MyModal
      open={modal.open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      title={
        <Stack spacing={0.5}>
          <Typography variant="h6">{modal.source?.name || "Товары"}</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {[
              modal.source?.competitor,
              modal.source?.city,
              modal.source?.parser,
              getStatusLabel(modal.run?.status),
              modal.run?.snapshot_date,
            ]
              .filter(Boolean)
              .join(" • ")}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Товаров: {modal.run?.item_count ?? "—"} | Ошибок: {modal.run?.error_count ?? "—"}
          </Typography>
        </Stack>
      }
    >
      <DialogContent sx={{ pt: 1 }}>
        {modal.loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer
            sx={{
              overflowX: "auto",
              maxHeight: "55dvh",
            }}
          >
            <Table
              stickyHeader
              size="small"
            >
              <TableHead>
                <TableRow>
                  <TableCell>Блюдо</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Итоговая цена</TableCell>
                  <TableCell>Цена</TableCell>
                  <TableCell>Цена без скидки</TableCell>
                  <TableCell>Скидка</TableCell>
                  <TableCell>Вес</TableCell>
                  <TableCell>Состав</TableCell>
                  <TableCell>Ссылка</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {modal.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Typography variant="body2">Нет данных</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  modal.items.map((item) => (
                    <TableRow
                      key={item.id || item.source_item_id}
                      hover
                    >
                      <TableCell>{formatValue(item.dish_name)}</TableCell>
                      <TableCell>{formatValue(item.category)}</TableCell>
                      <TableCell>{formatValue(item.final_price)}</TableCell>
                      <TableCell>{formatValue(item.price)}</TableCell>
                      <TableCell>{formatValue(item.list_price)}</TableCell>
                      <TableCell>{formatValue(item.discount)}</TableCell>
                      <TableCell>{formatValue(item.weight)}</TableCell>
                      <TableCell sx={{ minWidth: 260 }}>{formatValue(item.composition)}</TableCell>
                      <TableCell>
                        {item.product_url ? (
                          <IconButton
                            component={Link}
                            href={item.product_url}
                            target="_blank"
                            color="primary"
                            size="small"
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </MyModal>
  );
}
