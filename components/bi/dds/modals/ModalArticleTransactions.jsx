"use client";

import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import useDDSStore from "../useDDSStore";
import MyModal from "@/ui/MyModal";
import { useConfirm } from "@/src/hooks/useConfirm";
import { MyAutocomplite } from "@/ui/Forms";
import { formatNumber } from "@/src/helpers/utils/i18n";

export default function ModalArticleTransactions({ onClose }) {
  const [transactions, articles, selectedTx, isModalArticleTxOpen] = useDDSStore((s) => [
    s.transactions,
    s.articles,
    s.selectedTx,
    s.isModalArticleTxOpen,
  ]);
  const setState = useDDSStore.setState;
  const [selectedArticle, setSelectedArticle] = useState(null);
  const { withConfirm, ConfirmDialog } = useConfirm();

  const filtered = useMemo(() => {
    if (!Array.isArray(selectedTx) || !selectedTx.length) return [];
    return transactions.filter((t) => selectedTx.includes(t.number));
  }, [transactions, selectedTx]);

  const assignArticleToTransactions = () => {
    const updated = transactions.map((t) =>
      selectedTx.includes(t.number) ? { ...t, article_id: selectedArticle.id } : t,
    );
    setState({ transactions: updated });
  };

  const close = () => {
    setState({ isModalArticleTxOpen: false, selectedTx: null });
    onClose?.();
  };

  return (
    <>
      <MyModal
        open={isModalArticleTxOpen}
        onClose={close}
        maxWidth="md"
        title="Присвоить статью ДДС"
      >
        <Paper variant="outlined">
          <Box
            p={2}
            display="flex"
            flexDirection="column"
            gap={2}
          >
            <Box>
              <Typography fontWeight={500}>Назначить статью:</Typography>
              <MyAutocomplite
                data={articles}
                value={selectedArticle}
                func={(_, v) => setSelectedArticle(v)}
              />
            </Box>

            <Typography fontWeight={500}>Для транзакций:</Typography>
            <TableContainer
              component={Paper}
              variant="outlined"
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Дата</TableCell>
                    <TableCell>Поступление</TableCell>
                    <TableCell>Списание</TableCell>
                    <TableCell>Контрагент</TableCell>
                    <TableCell>Назначение</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((tx) => {
                    const counterparty =
                      (tx.income || 0) > 0 ? tx.payer || "—" : tx.receiver || "—";
                    return (
                      <TableRow
                        key={tx.id}
                        hover
                      >
                        <TableCell>{tx.date || "—"}</TableCell>
                        <TableCell sx={{ color: "success.main" }}>
                          {tx.income ? `${formatNumber(tx.income, 2, 2)} ₽` : "—"}
                        </TableCell>
                        <TableCell sx={{ color: "secondary.main" }}>
                          {tx.expense ? `-${formatNumber(tx.expense, 2, 2)} ₽` : "—"}
                        </TableCell>
                        <TableCell>{counterparty}</TableCell>
                        <TableCell>{tx.naznachenie_platezha || "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              variant="contained"
              disabled={!selectedArticle}
              onClick={withConfirm(
                () => {
                  console.log(selectedArticle);
                  if (selectedArticle?.id) {
                    assignArticleToTransactions(selectedArticle.id);
                    close();
                  }
                },
                `Подтвердите назначение статьи «${selectedArticle?.name ?? "—"}» для ${filtered.length} транзакций`,
                5,
              )}
            >
              Назначить
            </Button>
          </Box>
        </Paper>
      </MyModal>
      <ConfirmDialog />
    </>
  );
}
