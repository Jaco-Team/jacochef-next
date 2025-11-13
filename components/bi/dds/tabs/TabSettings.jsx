"use client";

import {
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import { UploadFile, Add, Edit, Delete } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { useConfirm } from "@/src/hooks/useConfirm";
import useDDSStore from "../useDDSStore";
import ModalAddArticle from "../modals/ModalAddArticle";

export default function TabSettings() {
  const { withConfirm, ConfirmDialog } = useConfirm();
  const [articles, transactions] = useDDSStore((s) => [s.articles, s.transactions]);
  const setState = useDDSStore.setState;

  const [openAdd, setOpenAdd] = useState(false);

  // Compute usage counts per article
  const data = useMemo(() => {
    return (
      articles?.map((a) => ({
        ...a,
        uses: transactions?.filter((t) => t.article_id === a.id).length || 0,
      })) || []
    );
  }, [articles, transactions]);

  // Handle deletion
  const handleDelete = (id) => {
    setState((state) => ({
      articles: state.articles.filter((a) => a.id !== id),
      transactions: state.transactions.map((t) =>
        t.article_id === id ? { ...t, article_id: null } : t,
      ),
    }));
  };

  return (
    <Paper sx={{ p: 3 }}>
      <ConfirmDialog />
      <ModalAddArticle
        open={openAdd}
        onClose={() => setOpenAdd(false)}
      />
      <Paper
        variant="outlined"
        sx={{ p: 3, mb: 3 }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ mb: 2 }}
        >
          Загрузка справочника статей
        </Typography>

        <Grid
          container
          spacing={2}
          alignItems="center"
        >
          <Grid size={{ xs: 12, sm: "auto" }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFile />}
              sx={{ justifyContent: "flex-start", height: 40 }}
            >
              Выбрать файл
              <input
                type="file"
                hidden
                onChange={(e) => console.log(e.target.files)}
              />
            </Button>
          </Grid>

          <Grid size={{ xs: 12, sm: "auto" }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ height: 40, whiteSpace: "nowrap" }}
              onClick={() => setOpenAdd(true)}
            >
              Добавить статью
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper
        variant="outlined"
        sx={{ p: 2 }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ mb: 2 }}
        >
          Справочник статей ДДС
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Наименование</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Группа</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Тип показателя</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Вид операции</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Использований</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Обновлено</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Действия</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((r) => {
                const isIncome = r.flow === 1;
                const color = isIncome ? "success.main" : "primary.main";

                return (
                  <TableRow
                    key={r.id}
                    hover
                  >
                    <TableCell>{r.name}</TableCell>
                    <TableCell sx={{ color }}>{r.group}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.operation}</TableCell>
                    <TableCell>{r.uses}</TableCell>
                    <TableCell>{r.updated}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        sx={{ color: "text.secondary" }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={withConfirm(
                          () => handleDelete(r.id),
                          `Точно удалить статью "${r.name}"?`,
                          3,
                        )}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Paper>
  );
}
