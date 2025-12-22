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
import { useState } from "react";
import useDDSStore from "../useDDSStore";
import MyModal from "@/ui/MyModal";
import { useConfirm } from "@/src/hooks/useConfirm";
import { MyAutocomplite } from "@/ui/Forms";
import { formatNumber } from "@/src/helpers/utils/i18n";
import useApi from "@/src/hooks/useApi";

// confirmation timer for mass change, seconds
const MASS_DELAY = 3;

export default function ModalArticleTransactions({ onClose, showAlert }) {
  const [articles, selectedTx = [], isModalArticleTxOpen, module] = useDDSStore((s) => [
    s.articles,
    s.selectedTx,
    s.isModalArticleTxOpen,
    s.module,
  ]);
  const setState = useDDSStore.setState;
  const { api_laravel } = useApi(module);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const { withConfirm, ConfirmDialog } = useConfirm();

  const updateTransactions = async (payload) => {
    try {
      setState({ is_load: true });
      const res = await api_laravel("update_transactions", payload);
      if (!res?.st) {
        throw new Error(res?.text || "Ошибка сервера");
      }
      showAlert(
        // res?.text ||
        `Успешно обновлено: ${selectedTx.length}`,
        true,
      );
    } catch (e) {
      showAlert(e?.message || "Ошибка обновления транзакций");
    } finally {
      setState({ is_load: false });
    }
  };

  const assignArticleToTransactions = async () => {
    const payload = {
      ids: selectedTx
        // .filter((t) => !t.is_order)
        .map((t) => t.id),
      data: { article_id: selectedArticle.id },
    };
    await updateTransactions(payload);
    setState({
      refreshToken: Date.now(),
      statsRefreshToken: Date.now(),
      page: 1,
      selectedTx: null,
    });
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
                disableCloseOnSelect={false}
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
                  {selectedTx
                    // ?.filter((t) => !t.is_order)
                    ?.map((tx) => (
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
                        <TableCell>{tx.contractor}</TableCell>
                        <TableCell>{tx.naznachenie_platezha || "—"}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              variant="contained"
              disabled={!selectedArticle}
              onClick={withConfirm(
                () => {
                  // console.log(selectedArticle);
                  if (selectedArticle?.id) {
                    assignArticleToTransactions(selectedArticle.id);
                    close();
                  }
                },
                `Подтвердите назначение статьи «${selectedArticle?.name ?? "—"}» для ${selectedTx?.length} транзакций`,
                selectedTx?.length > 1 ? MASS_DELAY : null,
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
