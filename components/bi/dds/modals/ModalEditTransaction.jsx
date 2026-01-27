"use client";

import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useEffect, useState } from "react";
import useDDSStore from "../useDDSStore";
import MyModal from "@/ui/MyModal";
import { MyAutocomplite } from "@/ui/Forms";
import { formatRUR } from "@/src/helpers/utils/i18n";
import useApi from "@/src/hooks/useApi";

export default function ModalEditTransaction({ onClose, showAlert }) {
  const [articles, points, selectedTx, isModalEditTxOpen, module] = useDDSStore((s) => [
    s.articles,
    s.points,
    s.selectedTx,
    s.isModalEditTxOpen,
    s.module,
  ]);

  const tx = Array.isArray(selectedTx) && selectedTx.length ? selectedTx[0] : null;

  const originalArticleId = tx?.article_id ?? null;
  const originalPointId = tx?.point_id ?? null;

  const [article, setArticle] = useState(null);
  const [point, setPoint] = useState(null);

  const setState = useDDSStore.setState;
  const { api_laravel } = useApi(module);

  useEffect(() => {
    if (!tx) return;
    setArticle(articles?.find((x) => +x.id === +tx.article_id) || null);
    setPoint(points?.find((x) => +x.id === +tx.point_id) || null);
  }, [tx, articles, points]);

  const isDirty =
    (article?.id ?? null) !== originalArticleId || (point?.id ?? null) !== originalPointId;

  const close = () => {
    setState({ isModalEditTxOpen: false, selectedTx: null });
    onClose?.();
  };

  const save = async () => {
    try {
      setState({ is_load: true });

      const payload = {
        ids: [tx.id],
        data: {
          article_id: article?.id ?? null,
          point_id: point?.id ?? null,
        },
      };

      const res = await api_laravel("update_transactions", payload);
      if (!res?.st) throw new Error(res?.text || "Ошибка сервера");

      showAlert("Транзакция обновлена", true);

      setState({
        refreshToken: Date.now(),
        statsRefreshToken: Date.now(),
        selectedTx: null,
      });

      close();
    } catch (e) {
      showAlert(e.message || "Ошибка обновления транзакции");
    } finally {
      setState({ is_load: false });
    }
  };

  if (!tx) return null;

  const isIncome = tx.type === "income";
  const isExpense = tx.type === "expense";
  const amountFormatted = formatRUR(tx.amount);

  return (
    <MyModal
      open={isModalEditTxOpen}
      onClose={close}
      maxWidth="xl"
      title="Редактирование транзакции"
    >
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Grid
          container
          spacing={3}
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <MyAutocomplite
              label="Кафе"
              data={points}
              value={point}
              func={(_, v) => setPoint(v)}
              disableCloseOnSelect={false}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MyAutocomplite
              label="Статья ДДС"
              data={articles}
              value={article}
              func={(_, v) => setArticle(v)}
              disableCloseOnSelect={false}
            />
          </Grid>
        </Grid>

        <Box>
          <Typography
            fontWeight={600}
            sx={{ mb: 1 }}
          >
            Детали транзакции
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 2, maxHeight: 260 }}
          >
            <Table
              size="small"
              stickyHeader
            >
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
                <TableRow hover>
                  <TableCell>{tx.date || "—"}</TableCell>
                  <TableCell sx={{ color: "success.main", fontWeight: 500 }}>
                    {isIncome ? amountFormatted : "—"}
                  </TableCell>
                  <TableCell sx={{ color: "secondary.main", fontWeight: 500 }}>
                    {isExpense ? `-${amountFormatted}` : "—"}
                  </TableCell>
                  <TableCell>{tx.contractor}</TableCell>
                  <TableCell>{tx.purpose || tx.naznachenie_platezha || "—"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            mt: 1,
          }}
        >
          <Button
            variant="outlined"
            onClick={close}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={save}
            disabled={!isDirty}
          >
            Сохранить
          </Button>
        </Box>
      </Paper>
    </MyModal>
  );
}
