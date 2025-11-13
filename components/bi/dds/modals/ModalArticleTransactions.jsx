"use client";
import {
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  Typography,
} from "@mui/material";
import useDDSStore from "../useDDSStore";
import MyModal from "@/ui/MyModal";

export default function ModalArticleTransactions({ open, onClose, article }) {
  const { transactions } = useDDSStore();

  const filtered = transactions?.filter((t) => t.article_id === article?.id) || [];

  return (
    <MyModal
      open={open}
      onClose={onClose}
      title={<Typography fontWeight={600}>Расшифровка: {article?.name || "—"}</Typography>}
    >
      <DialogContent>
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 1.5 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Дата</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>№</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Сумма</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Контрагент</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Назначение</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{ py: 3, color: "text.secondary" }}
                  >
                    Нет операций
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => {
                  const amount = t.income ?? -t.expense ?? 0;
                  const color =
                    amount > 0 ? "success.main" : amount < 0 ? "error.main" : "text.primary";
                  return (
                    <TableRow
                      key={t.id}
                      hover
                    >
                      <TableCell>{t.date}</TableCell>
                      <TableCell>{t.number}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color }}>
                        {amount > 0
                          ? `+${amount.toLocaleString()} ₽`
                          : `${amount.toLocaleString()} ₽`}
                      </TableCell>
                      <TableCell>{t.contractor}</TableCell>
                      <TableCell>{t.purpose}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      {/* <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions> */}
    </MyModal>
  );
}
